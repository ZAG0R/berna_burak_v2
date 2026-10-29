import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Icon } from "../components/Icons";
import { KEPT_LETTERS, type KeptLetter } from "../data/content";
import { burstHearts, useReveal, useStoredState } from "../hooks/useAppState";

/* ============================================================
   "Aç bunu ne zaman..." mektupları

   Her zarf bir ana ait. Kapalıyken yalnızca koşul görünür; başlık ve
   metin gizli kalır. Açılınca yazı harf harf belirir, açıldığı
   localStorage'da tutulur ki sonradan "hangilerini açtım" görünsün.
   ============================================================ */

const CHAR_MS = 12;

export default function KeptLetters() {
  const [opened, setOpened] = useStoredState<Record<string, boolean>>("kept:opened", {});
  const [activeId, setActiveId] = useState<string | null>(null);
  const gridRef = useReveal<HTMLDivElement>(80);

  const active = KEPT_LETTERS.find((l) => l.id === activeId) ?? null;
  const openedCount = KEPT_LETTERS.filter((l) => opened[l.id]).length;

  const open = (id: string) => {
    setActiveId(id);
    setOpened((m) => (m[id] ? m : { ...m, [id]: true }));
    window.setTimeout(
      () => burstHearts(window.innerWidth / 2, window.innerHeight * 0.42, 10),
      260,
    );
  };

  return (
    <section className="section section--scrim" aria-label="Sakladığım mektuplar">
      <header className="section__head">
        <div>
          <p className="section__eyebrow">
            Her an için bir tane · {openedCount}/{KEPT_LETTERS.length} açıldı
          </p>
          <h2 className="section__title">
            Aç bunu <em>ne zaman</em>
          </h2>
          <p className="section__lead">
            Bunlar günlük mektuplar değil. İhtiyacın olduğu güne sakladım — o gün hangisi olduğunu sen
            bilirsin. İstersen hepsini birden açabilirsin, ben karışmam.
          </p>
        </div>
      </header>

      <div className="kept" ref={gridRef}>
        {KEPT_LETTERS.map((letter) => {
          const isOpened = Boolean(opened[letter.id]);
          return (
            <button
              key={letter.id}
              type="button"
              className={`kept__zarf ${isOpened ? "kept__zarf--opened" : ""}`}
              onClick={() => open(letter.id)}
            >
              <span className="kept__seal" aria-hidden>
                {isOpened ? letter.emoji : "✉"}
              </span>
              <span className="kept__when">{letter.when}</span>
              <span className="kept__hint">{isOpened ? letter.title : letter.hint}</span>
              {isOpened ? null : <span className="kept__wax" aria-hidden />}
            </button>
          );
        })}
      </div>

      {active
        ? createPortal(
            <LetterReader
              letter={active}
              onClose={() => setActiveId(null)}
              onNext={() => {
                const i = KEPT_LETTERS.findIndex((l) => l.id === active.id);
                const next = KEPT_LETTERS[(i + 1) % KEPT_LETTERS.length];
                open(next.id);
              }}
            />,
            document.body,
          )
        : null}
    </section>
  );
}

/* ---------- Okuma katmanı ---------- */

function LetterReader({
  letter,
  onClose,
  onNext,
}: {
  letter: KeptLetter;
  onClose: () => void;
  onNext: () => void;
}) {
  const [len, setLen] = useState(0);
  const [skipped, setSkipped] = useState(false);
  const bodyRef = useRef<HTMLDivElement | null>(null);

  const full = letter.paragraphs.join("\n\n");

  /* Mektup değişince yazı baştan yazılsın. */
  useEffect(() => {
    setLen(0);
    setSkipped(false);
  }, [letter.id]);

  useEffect(() => {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (skipped || reduced) {
      setLen(full.length);
      return;
    }

    let raf = 0;
    let last = performance.now();
    let i = 0;
    const tick = (t: number) => {
      const dt = t - last;
      if (dt > CHAR_MS) {
        last = t;
        i += Math.max(1, Math.round(dt / CHAR_MS));
        setLen(Math.min(full.length, i));
      }
      if (i < full.length) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [full, skipped, letter.id]);

  /* Esc ile kapat. */
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  /* Katman açıkken arka plan kaymasın. */
  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, []);

  const done = len >= full.length;
  const shown = full.slice(0, len).split("\n\n");

  return (
    <div className="reader" role="dialog" aria-modal="true" aria-label={letter.when}>
      <button
        type="button"
        className="reader__scrim"
        onClick={onClose}
        aria-label="Kapat"
        tabIndex={-1}
      />

      <article className="reader__paper">
        <span className="reader__tape" aria-hidden />

        <header className="reader__head">
          <p className="reader__when">
            {letter.emoji} {letter.when}
          </p>
          <h3 className="reader__title">{letter.title}</h3>
        </header>

        <div
          className="reader__body"
          ref={bodyRef}
          onClick={() => setSkipped(true)}
          aria-live="polite"
        >
          {shown.map((p, i) => (
            <p key={i}>{p}</p>
          ))}
          {!done ? <span className="reader__caret" aria-hidden /> : null}
        </div>

        <p className="reader__sign">
          Seni çok seven,
          <span>Burak ♡</span>
        </p>

        <div className="reader__row">
          {!done ? (
            <button type="button" className="btn btn--sm" onClick={() => setSkipped(true)}>
              <Icon name="chevronRight" />
              Hepsini göster
            </button>
          ) : (
            <button type="button" className="btn btn--sm" onClick={onNext}>
              <Icon name="mail" />
              Başka bir zarf
            </button>
          )}
          <button type="button" className="btn btn--sm btn--accent" onClick={onClose}>
            <Icon name="check" />
            Kapatalım
          </button>
        </div>
      </article>
    </div>
  );
}
