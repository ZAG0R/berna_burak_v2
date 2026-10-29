import { useEffect, useMemo, useState } from "react";
import { Icon } from "../components/Icons";
import GiftBox from "../three/GiftBox";
import { COUNTDOWN_LABEL, SURPRISES, SURPRISE_HINT, SURPRISE_SUB } from "../data/content";
import { burstHearts, dayNumber, useLocalDay, useReveal, useStoredState } from "../hooks/useAppState";

/* ============================================================
   Sürprizler

   - Günde bir sürpriz açılır; aynı gün hep aynı sürpriz gelir.
   - Defterdeki diğer kartlar KAPALIDIR. Başlıkları görünmez, sadece
     kaçıncı gün olduğu yazar. Böylece ileriden bakıp sürprizi bozmak
     mümkün olmaz.
   - Bir sürpriz yalnızca açıldığı gün "açıldı" olarak işaretlenir ve
     sonra başlığı görünür.
   - Geri sayım bir sonraki buluşma saatine (09:00 / 21:00) kadar;
     yani her zaman 12 saatten kısa.
   ============================================================ */

/* Günde iki buluşma anı: hangisi önceyse ona sayılır. */
const MEETING_HOURS = [9, 21];

function nextMeeting(now: Date) {
  const next = MEETING_HOURS.map((h) => {
    const d = new Date(now);
    d.setHours(h, 0, 0, 0);
    if (d.getTime() <= now.getTime()) d.setDate(d.getDate() + 1);
    return d;
  }).sort((a, b) => a.getTime() - b.getTime());
  return next[0];
}

const pad = (n: number) => String(n).padStart(2, "0");

export default function Surprise() {
  const [open, setOpen] = useState(false);
  const [revealed, setRevealed] = useState(false);
  const [opened, setOpened] = useStoredState<Record<string, boolean>>("surprise:opened", {});
  const [doneMap, setDoneMap] = useStoredState<Record<string, boolean>>("surprise:done", {});
  const sideRef = useReveal<HTMLDivElement>(110);

  /* Gün numarası: sürpriz gün içinde değişmez, gece yarısı değişir.
     Yerel saate göre sayılır (Date.now()/86_400_000 UTC kullanır ve
     Türkiye'de günü 03:00'te döndürüyordu). */
  const today = useLocalDay();
  const dayIndex = useMemo(() => dayNumber(), [today]);
  const todayIdx = ((dayIndex % SURPRISES.length) + SURPRISES.length) % SURPRISES.length;
  const surprise = SURPRISES[todayIdx];
  const done = Boolean(doneMap[surprise.id]);
  const doneCount = SURPRISES.filter((s) => doneMap[s.id]).length;

  /* Bugünden başlayan sıra: bugününki ilk kart. */
  const ordered = SURPRISES.map((_, i) => SURPRISES[(todayIdx + i) % SURPRISES.length]);

  /* ---------- geri sayım ---------- */
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    const id = window.setInterval(() => setNow(new Date()), 1000);
    return () => window.clearInterval(id);
  }, []);

  const target = nextMeeting(now);
  const diff = Math.max(0, target.getTime() - now.getTime());
  const hours = Math.floor(diff / 3_600_000);
  const minutes = Math.floor((diff % 3_600_000) / 60_000);
  const seconds = Math.floor((diff % 60_000) / 1000);

  const reveal = () => {
    window.setTimeout(() => setRevealed(true), 620);
    window.setTimeout(() => burstHearts(window.innerWidth / 2, window.innerHeight * 0.45, 12), 520);
  };

  /* Kutuyu aç: bugünün sürprizi açılmış olarak işaretlenir. */
  const toggle = () => {
    setOpen((v) => {
      const next = !v;
      if (next) {
        setOpened((m) => (m[surprise.id] ? m : { ...m, [surprise.id]: true }));
        reveal();
      } else {
        setRevealed(false);
      }
      return next;
    });
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
            Her gün bir tane açılır. Kutuyu aç, içindeki işi yap, işaretle. Yarına başka bir sürpriz var.
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
          <article className="card countdown countdown--row">
            <div className="cdunit">
              <b>{pad(hours)}</b>
              <span>saat</span>
            </div>
            <div className="cdunit">
              <b>{pad(minutes)}</b>
              <span>dakika</span>
            </div>
            <div className="cdunit">
              <b>{pad(seconds)}</b>
              <span>saniye</span>
            </div>
            <p className="card__sub countdown__label">
              {COUNTDOWN_LABEL} · {pad(target.getHours())}:00
            </p>
          </article>

          <article className="card surprise__board">
            <header className="card__head">
              <span className="card__icon card__icon--rose" aria-hidden>
                <Icon name="sparkles" />
              </span>
              <div>
                <h3 className="card__title">Sürpriz defteri</h3>
                <p className="card__sub">açılan günler görünür, gerisi mühürlü</p>
              </div>
            </header>

            <div className="sgrid">
              {ordered.map((s, i) => {
                const isToday = i === 0;
                const isOpened = Boolean(opened[s.id]);
                const isDone = Boolean(doneMap[s.id]);
                const sealed = !isOpened && !isToday;

                return (
                  <button
                    key={s.id}
                    type="button"
                    className={`sitem ${isToday && !isOpened ? "sitem--on" : ""} ${isDone ? "sitem--done" : ""} ${
                      sealed ? "sitem--sealed" : ""
                    }`}
                    onClick={() => {
                      if (sealed) return;
                      if (isToday) {
                        setOpen(true);
                        setRevealed(true);
                        setOpened((m) => (m[s.id] ? m : { ...m, [s.id]: true }));
                        burstHearts(window.innerWidth / 2, window.innerHeight * 0.4, 6);
                      }
                    }}
                    disabled={sealed}
                    aria-label={
                      sealed
                        ? `${i + 1}. günün sürprizi — henüz açılmadı`
                        : `${s.title}${isDone ? " (yapıldı)" : ""}`
                    }
                  >
                    <span className="sitem__emoji" aria-hidden>
                      {sealed ? "🔒" : isDone ? "✓" : s.emoji}
                    </span>
                    <span className="sitem__body">
                      <span className="sitem__title">
                        {sealed ? "Gizli sürpriz" : s.title}
                      </span>
                      <span className="sitem__meta">
                        {isToday && !isOpened
                          ? "bugün · açmak için dokun"
                          : sealed
                            ? `${i + 1}. gün — mühürlü`
                            : `${s.tag} · ${s.minutes} dk`}
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
