import { useEffect, useMemo, useState } from "react";
import { Icon } from "../components/Icons";
import GiftBox from "../three/GiftBox";
import { COUNTDOWN_LABEL, SURPRISES, SURPRISE_HINT, SURPRISE_SUB } from "../data/content";
import { burstHearts, daysUntil, useReveal, useStoredState } from "../hooks/useAppState";

/* ============================================================
   Sürprizler

   - Bugünün sürprizi güne göre sabittir: aynı gün hep aynı sürpriz,
     ertesi gün bir sonraki. Yani gerçekten "bugüne özel".
   - Her sürprizin somut bir yapılacak işi ve süresi vardır; süs
     cümlesinden ibaret değildir.
   - "Başka sürpriz" ile listede ilerlenir, "yaptım" işaretlenir ve
     ilerleme kaydedilir. Tek bir sürprize bağlı kalmaz.
   ============================================================ */

export default function Surprise() {
  const [open, setOpen] = useState(false);
  const [revealed, setRevealed] = useState(false);
  const [offset, setOffset] = useStoredState<number>("surprise:offset", 0);
  const [doneMap, setDoneMap] = useStoredState<Record<string, boolean>>("surprise:done", {});
  const sideRef = useReveal<HTMLDivElement>(110);

  /* Gün numarası: sürpriz gün içinde değişmez, ertesi gün değişir. */
  const dayIndex = Math.floor(Date.now() / 86_400_000);
  const surprise = SURPRISES[(dayIndex + offset) % SURPRISES.length];
  const done = Boolean(doneMap[surprise.id]);
  const doneCount = SURPRISES.filter((s) => doneMap[s.id]).length;

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

  const reveal = () => {
    window.setTimeout(() => setRevealed(true), 620);
    window.setTimeout(() => burstHearts(window.innerWidth / 2, window.innerHeight * 0.45, 12), 520);
  };

  const toggle = () => {
    setOpen((v) => {
      const next = !v;
      if (next) reveal();
      else setRevealed(false);
      return next;
    });
  };

  /* Listedeki sıradaki sürprize geç ve kutuyu yeniden aç. */
  const another = () => {
    setOffset((o) => o + 1);
    setRevealed(false);
    setOpen(true);
    reveal();
  };

  const toggleDone = () =>
    setDoneMap((m) => {
      const next = { ...m };
      if (next[surprise.id]) delete next[surprise.id];
      else next[surprise.id] = true;
      return next;
    });

  return (
    <section className="section" aria-label="Sürprizler">
      <header className="section__head">
        <div>
          <p className="section__eyebrow">
            Bugüne özel · {doneCount}/{SURPRISES.length} tamamlandı
          </p>
          <h2 className="section__title">
            Bugünün <em>sürprizi</em>
          </h2>
          <p className="section__lead">
            Her gün bir tane. Kutuyu aç, içindeki işi yap, işaretle. Yarına başka bir sürpriz var.
          </p>
        </div>
      </header>

      <div className="surprise">
        <div className="gift">
          <GiftBox open={open} onToggle={toggle} />

          <div className={`gift__reveal ${revealed ? "gift__reveal--on" : ""}`}>
            <div className="gift__reveal-inner">
              <p className="gift__tag">
                <span aria-hidden>{surprise.emoji}</span> {surprise.tag} · {surprise.minutes} dk
              </p>
              <h3>{surprise.title}</h3>
              <p>{surprise.text}</p>
              <p className="gift__action">
                <b>Yapılacak:</b> {surprise.action}
              </p>

              <div className="gift__row">
                <button
                  type="button"
                  className={`btn btn--sm ${done ? "btn--done" : "btn--accent"}`}
                  onClick={toggleDone}
                  aria-pressed={done}
                >
                  <Icon name="check" />
                  {done ? "Yaptım" : "Yaptım olarak işaretle"}
                </button>
                <button type="button" className="btn btn--sm" onClick={another}>
                  <Icon name="refresh" />
                  Başka sürpriz
                </button>
                <button type="button" className="btn btn--sm" onClick={toggle}>
                  <Icon name="close" />
                  Kapat
                </button>
              </div>
            </div>
          </div>

          {!revealed ? (
            <div className="gift__overlay">
              <p className="gift__hint">
                {SURPRISE_HINT} <span>♡</span>
              </p>
              <p className="gift__sub">{SURPRISE_SUB}</p>
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
                <h3 className="card__title">Sürpriz defteri</h3>
                <p className="card__sub">sıradakine geçmek için dokun</p>
              </div>
            </header>

            <div className="stack gap-10">
              {SURPRISES.map((s) => {
                const isOn = surprise.id === s.id;
                const isDone = Boolean(doneMap[s.id]);
                return (
                  <button
                    key={s.id}
                    type="button"
                    className={`sitem ${isOn ? "sitem--on" : ""} ${isDone ? "sitem--done" : ""}`}
                    onClick={() => {
                      setOffset(SURPRISES.findIndex((x) => x.id === s.id) - (dayIndex % SURPRISES.length) + SURPRISES.length * 4);
                      setOpen(true);
                      setRevealed(true);
                      burstHearts(window.innerWidth / 2, window.innerHeight * 0.4, 6);
                    }}
                    aria-pressed={isOn}
                  >
                    <span className="sitem__emoji" aria-hidden>
                      {isDone ? "✓" : s.emoji}
                    </span>
                    <span>
                      <span className="sitem__title">{s.title}</span>
                      <span className="sitem__meta">
                        {s.tag} · {s.minutes} dk
                      </span>
                    </span>
                  </button>
                );
              })}
            </div>
          </article>
        </aside>
      </div>
    </section>
  );
}
