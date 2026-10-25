import { useEffect, useMemo, useRef, useState } from "react";
import { Icon } from "../components/Icons";
import { LETTER_PARAGRAPHS, LETTER_SIGNOFF, NOTE_CARDS, REASONS } from "../data/content";
import { useReveal } from "../hooks/useAppState";

/* Harf harf yazılan mektup + nedenler listesi */

function useTypewriter(paragraphs: string[], speed = 26) {
  const full = useMemo(() => paragraphs.join("\n"), [paragraphs]);
  const [len, setLen] = useState(0);
  const [skipped, setSkipped] = useState(false);
  const raf = useRef(0);

  useEffect(() => {
    if (skipped) {
      setLen(full.length);
      return;
    }
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setLen(full.length);
      return;
    }
    let i = 0;
    let last = performance.now();
    const tick = (t: number) => {
      const dt = t - last;
      if (dt > speed) {
        last = t;
        i += Math.max(1, Math.round(dt / speed));
        setLen(Math.min(full.length, i));
      }
      if (i < full.length) raf.current = requestAnimationFrame(tick);
    };
    raf.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf.current);
  }, [full, speed, skipped]);

  return { text: full.slice(0, len), done: len >= full.length, skip: () => setSkipped(true) };
}

export default function Letter() {
  const { text, done, skip } = useTypewriter(LETTER_PARAGRAPHS);
  const sideRef = useReveal<HTMLDivElement>(120);

  const rendered = text.split("\n").map((p, i) => <p key={i}>{p}</p>);

  return (
    <section className="section" aria-label="Mesajım">
      <header className="section__head">
        <div>
          <p className="section__eyebrow">Sana özel</p>
          <h2 className="section__title">
            Bir <em>mektup</em> yazdım
          </h2>
          <p className="section__lead">
            Sabah okuduğunda iyi hissetmen için. Acele etme, kelimeler seni bekler.
          </p>
        </div>
        {!done ? (
          <button type="button" className="btn btn--sm" onClick={skip}>
            <Icon name="chevronRight" />
            Hepsini göster
          </button>
        ) : null}
      </header>

      <div className="letter">
        <article className="letter__paper" onClick={skip}>
          <span className="letter__tape" aria-hidden />
          <p className="letter__greet">Sevgili Berna,</p>
          <div className="letter__body">
            {rendered}
            {!done ? <span className="letter__caret" aria-hidden /> : null}
          </div>
          <p className="letter__sign">
            {LETTER_SIGNOFF.split("\n").map((l, i) => (
              <span key={i}>
                {l}
                {i === 0 ? <br /> : null}
              </span>
            ))}
          </p>
        </article>

        <aside className="letter__side" ref={sideRef}>
          {NOTE_CARDS.map((n) => (
            <article key={n.label} className="card note">
              <p className="note__label">{n.label}</p>
              <p className="note__text">{n.text}</p>
            </article>
          ))}

          <article className="card" style={{ padding: 18 }}>
            <header className="card__head" style={{ marginBottom: 14 }}>
              <span className="card__icon card__icon--rose" aria-hidden>
                <Icon name="heartfilled" />
              </span>
              <div>
                <h3 className="card__title">Seni sevmemin nedenleri</h3>
                <p className="card__sub">kısa bir liste, uzun bir his</p>
              </div>
            </header>
            <ul className="stack gap-6">
              {REASONS.map((r, i) => (
                <li key={r} className="reason">
                  <span className="reason__n tnum">{i + 1}</span>
                  <span>{r}</span>
                </li>
              ))}
            </ul>
          </article>
        </aside>
      </div>
    </section>
  );
}
