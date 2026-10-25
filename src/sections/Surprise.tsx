import { useEffect, useMemo, useState } from "react";
import { Icon } from "../components/Icons";
import GiftBox from "../three/GiftBox";
import { COUNTDOWN_LABEL, SURPRISE, SURPRISE_IDEAS } from "../data/content";
import { burstHearts, daysUntil, useReveal, useStoredState } from "../hooks/useAppState";

export default function Surprise() {
  const [open, setOpen] = useState(false);
  const [revealed, setRevealed] = useState(false);
  const [picked, setPicked] = useStoredState<string | null>("surprise:picked", null);
  const sideRef = useReveal<HTMLDivElement>(110);

  // bir sonraki ayın 1'i — örnek bir geri sayım hedefi
  const target = useMemo(() => {
    const d = new Date();
    return new Date(d.getFullYear(), d.getMonth() + 1, 1);
  }, []);
  const [days, setDays] = useState(() => daysUntil(target));

  useEffect(() => {
    const id = window.setInterval(() => setDays(daysUntil(target)), 60_000);
    return () => window.clearInterval(id);
  }, [target]);

  const toggle = () => {
    setOpen((v) => {
      const next = !v;
      if (next) {
        window.setTimeout(() => setRevealed(true), 620);
        window.setTimeout(() => burstHearts(window.innerWidth / 2, window.innerHeight * 0.45, 12), 520);
      } else {
        setRevealed(false);
      }
      return next;
    });
  };

  return (
    <section className="section" aria-label="Sürprizler">
      <header className="section__head">
        <div>
          <p className="section__eyebrow">Bugüne özel</p>
          <h2 className="section__title">
            Küçük bir <em>sürpriz</em>
          </h2>
          <p className="section__lead">
            Kutuyu açmak için dokun. İçinden çıkanı okuyunca belki gülümsersin.
          </p>
        </div>
      </header>

      <div className="surprise">
        <div className="gift">
          <GiftBox open={open} onToggle={toggle} />

          <div className={`gift__reveal ${revealed ? "gift__reveal--on" : ""}`}>
            <div className="gift__reveal-inner">
              <h3>{SURPRISE.title}</h3>
              <p>{SURPRISE.text}</p>
              <button type="button" className="btn" onClick={toggle}>
                <Icon name="close" />
                {SURPRISE.cta}
              </button>
            </div>
          </div>

          {!revealed ? (
            <div className="gift__overlay">
              <p className="gift__hint">
                {SURPRISE.hint} <span>♡</span>
              </p>
              <p className="gift__sub">{SURPRISE.sub}</p>
            </div>
          ) : null}
        </div>

        <aside className="surprise__side" ref={sideRef}>
          <article className="card countdown">
            <div className="cdunit">
              <b>{days}</b>
              <span>gün</span>
            </div>
            <div className="cdunit">
              <b>{String(target.getMonth() + 1).padStart(2, "0")}</b>
              <span>ay</span>
            </div>
            <div className="cdunit">
              <b>{String(target.getDate()).padStart(2, "0")}</b>
              <span>gün</span>
            </div>
            <p className="card__sub" style={{ gridColumn: "1 / -1", textAlign: "center", marginTop: 4 }}>
              {COUNTDOWN_LABEL}
            </p>
          </article>

          <article className="card" style={{ padding: 18 }}>
            <header className="card__head">
              <span className="card__icon card__icon--rose" aria-hidden>
                <Icon name="sparkles" />
              </span>
              <div>
                <h3 className="card__title">Yapabileceklerimiz</h3>
                <p className="card__sub">birine dokun, birlikte planlayalım</p>
              </div>
            </header>

            <div className="stack gap-10">
              {SURPRISE_IDEAS.map((idea) => (
                <button
                  key={idea.title}
                  type="button"
                  className={`idea ${picked === idea.title ? "idea--on" : ""}`}
                  onClick={() => setPicked(picked === idea.title ? null : idea.title)}
                  aria-pressed={picked === idea.title}
                >
                  <span className="idea__emoji" aria-hidden>
                    {idea.emoji}
                  </span>
                  <span>
                    <span className="idea__title">{idea.title}</span>
                    <span className="idea__text">{idea.text}</span>
                  </span>
                </button>
              ))}
            </div>

            {picked ? (
              <p className="note__text" style={{ marginTop: 14 }}>
                Seçtiğin: <strong style={{ color: "var(--accent)" }}>{picked}</strong> — not aldım. ♡
              </p>
            ) : null}
          </article>
        </aside>
      </div>
    </section>
  );
}
