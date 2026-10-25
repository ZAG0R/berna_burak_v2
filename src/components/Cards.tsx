import { useEffect, useRef, useState } from "react";
import { Icon } from "./Icons";
import {
  AMBIENCES,
  DEFAULT_CITY,
  type AmbienceId,
  type PlanItem,
  type Song,
} from "../data/content";
import type { Weather } from "../hooks/useWeather";
import { WEATHER_ICONS } from "./WeatherIcons";

/* ============================================================
   Hava durumu kartı — veri App'te tek yerden çekilir
   ============================================================ */

export function WeatherCard({ w, live }: { w: Weather; live: boolean }) {
  const WeatherArt = WEATHER_ICONS[w.icon];
  return (
    <article className="card card--hover">
      <div className="weather">
        <div className="weather__art weather__art--float" aria-hidden>
          <WeatherArt />
        </div>
        <div className="weather__body">
          <p className="weather__city">{DEFAULT_CITY}</p>
          <p className="weather__temp tnum">{w.temp}°C</p>
          <p className="weather__desc">{w.desc}</p>
        </div>
        <div className="weather__extra">
          <span>
            Rüzgâr <b>{w.wind}</b>
          </span>
          <span>
            Nem <b>%{w.humidity}</b>
          </span>
          <span className="muted">{live ? "canlı" : "tahmin"}</span>
        </div>
        <span className="card__arrow" aria-hidden>
          <Icon name="chevronRight" />
        </span>
      </div>
    </article>
  );
}

/* ============================================================
   Alıntı
   ============================================================ */

export function QuoteCard({ text, by }: { text: string; by: string }) {
  return (
    <article className="card card--hover">
      <div className="quote">
        <span className="quote__mark" aria-hidden>
          <Icon name="heartfilled" />
        </span>
        <div>
          <p className="quote__text">“{text}”</p>
          <p className="quote__by">{by}</p>
        </div>
      </div>
    </article>
  );
}

/* ============================================================
   Günün planı kartı
   ============================================================ */

export function PlanCard({
  items,
  done,
  onToggle,
}: {
  items: PlanItem[];
  done: Record<string, boolean>;
  onToggle: (id: string) => void;
}) {
  const total = items.length;
  const count = items.filter((i) => done[i.id]).length;
  const pct = total === 0 ? 0 : Math.round((count / total) * 100);

  return (
    <article className="card">
      <div className="plan">
        <header className="card__head">
          <span className="card__icon" aria-hidden>
            <Icon name="calendar" />
          </span>
          <div>
            <h3 className="card__title">Bugünün Planı</h3>
            <p className="card__sub">küçük adımlar, güzel bir gün</p>
          </div>
        </header>

        <ul className="plan__list">
          {items.map((item) => {
            const isDone = Boolean(done[item.id]);
            return (
              <li key={item.id}>
                <button
                  type="button"
                  className={`planitem ${isDone ? "planitem--done" : ""}`}
                  onClick={() => onToggle(item.id)}
                  aria-pressed={isDone}
                >
                  <span className="planitem__box" aria-hidden>
                    <Icon name="check" />
                  </span>
                  <span className="planitem__label">{item.label}</span>
                  <span className="planitem__time muted">{item.time}</span>
                </button>
              </li>
            );
          })}
        </ul>

        <div className="plan__foot">
          <span className="plan__pct tnum">%{pct}</span>
          <span className="plan__note">
            {count} / {total} tamamlandı
          </span>
          <span className="plan__bar" aria-hidden>
            <i style={{ width: `${pct}%` }} />
          </span>
        </div>
      </div>
    </article>
  );
}

/* ============================================================
   Alt kart şeridi
   ============================================================ */

type BottomCard = {
  id: string;
  kind: "coffee" | "gift" | "memory";
  image: string;
  tag: string;
  title: string;
  text: string;
};

export function BottomCards({
  cards,
  onOpen,
}: {
  cards: readonly BottomCard[];
  onOpen: (kind: "coffee" | "gift" | "memory") => void;
}) {
  return (
    <>
      {cards.map((c, i) => (
        <article key={c.id} className="card card--hover">
          <button type="button" className="bottomcard" onClick={() => onOpen(c.kind)}>
            <span className={`bottomcard__thumb ${i === 1 ? "polaroid-mini" : ""}`}>
              <img src={c.image} alt="" loading="lazy" decoding="async" />
            </span>
            <span className="bottomcard__body">
              <span className="bottomcard__tag">
                <Icon
                  name={c.kind === "coffee" ? "coffee" : c.kind === "gift" ? "gift" : "camera"}
                />
                {c.tag}
              </span>
              <span className="bottomcard__title bottomcard__title--hand">{c.title}</span>
              <span className="bottomcard__text">{c.text}</span>
            </span>
            <span className="card__arrow" aria-hidden>
              <Icon name="chevronRight" />
            </span>
          </button>
        </article>
      ))}
    </>
  );
}

/* ============================================================
   Müzik oynatıcı
   ============================================================ */

export function PlayerCard({
  song,
  playing,
  progress,
  onToggle,
  onNext,
  onPrev,
}: {
  song: Song;
  playing: boolean;
  progress: number;
  onToggle: () => void;
  onNext: () => void;
  onPrev: () => void;
}) {
  return (
    <article className={`card ${playing ? "player--playing" : ""}`}>
      <div className="player">
        <div className="player__top">
          <span className="player__thumb player__thumb--spin">
            <img src={song.cover} alt="" loading="lazy" decoding="async" />
          </span>
          <div className="player__meta">
            <p className="player__title">{song.title}</p>
            <p className="player__artist">
              {song.artist} · {song.mood}
            </p>
          </div>
          <span className="player__eq" aria-hidden>
            <i />
            <i />
            <i />
            <i />
          </span>
        </div>

        <div className="player__bar" aria-hidden>
          <i style={{ width: `${Math.round(progress * 100)}%` }} />
        </div>

        <div className="player__controls">
          <button type="button" className="pbtn" onClick={onPrev} aria-label="Önceki parça">
            <Icon name="skipBack" />
          </button>
          <button
            type="button"
            className="pbtn pbtn--main"
            onClick={onToggle}
            aria-label={playing ? "Duraklat" : "Çal"}
          >
            <Icon name={playing ? "pause" : "play"} />
          </button>
          <button type="button" className="pbtn" onClick={onNext} aria-label="Sonraki parça">
            <Icon name="skipForward" />
          </button>
        </div>
      </div>
    </article>
  );
}

/* ============================================================
   Ambiyans çubuğu
   ============================================================ */

export function AmbienceBar({
  active,
  onToggle,
  volume,
  onVolume,
}: {
  active: Record<string, boolean>;
  onToggle: (id: AmbienceId) => void;
  volume: number;
  onVolume: (v: number) => void;
}) {
  return (
    <div className="ambience" role="group" aria-label="Ortam sesleri">
      {AMBIENCES.map((a) => (
        <button
          key={a.id}
          type="button"
          className={`ambchip ${active[a.id] ? "ambchip--on" : ""}`}
          onClick={() => onToggle(a.id)}
          aria-pressed={Boolean(active[a.id])}
          title={a.hint}
        >
          <Icon name={a.icon} />
          {a.label}
        </button>
      ))}
      <label className="ambience__vol">
        <Icon name="volume" />
        <span className="sr-only">Ses seviyesi</span>
        <input
          type="range"
          min={0}
          max={100}
          value={Math.round(volume * 100)}
          onChange={(e) => onVolume(Number(e.target.value) / 100)}
        />
      </label>
    </div>
  );
}

/* ============================================================
   İlerleme halkası
   ============================================================ */

export function Ring({ value, size = 136, cap }: { value: number; size?: number; cap?: string }) {
  const r = size / 2 - 9;
  const circ = 2 * Math.PI * r;
  const clamped = Math.max(0, Math.min(100, value));
  const offset = circ - (clamped / 100) * circ;

  return (
    <div className="ring" style={{ width: size, height: size }}>
      <svg width={size} height={size} aria-hidden>
        <circle
          className="ring__track"
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          strokeWidth={9}
        />
        <circle
          className="ring__fill"
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          strokeWidth={9}
          strokeDasharray={circ}
          strokeDashoffset={offset}
        />
      </svg>
      <div className="ring__label">
        <p className="ring__num tnum">%{Math.round(clamped)}</p>
        {cap ? <p className="ring__cap">{cap}</p> : null}
      </div>
    </div>
  );
}

/* ============================================================
   Sayaç
   ============================================================ */

export function Counter({
  to,
  suffix = "",
  duration = 1400,
}: {
  to: number;
  suffix?: string;
  duration?: number;
}) {
  const [n, setN] = useState(0);
  const ref = useRef<HTMLSpanElement | null>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setN(to);
      return;
    }
    let raf = 0;
    const io = new IntersectionObserver((entries) => {
      for (const e of entries) {
        if (!e.isIntersecting) continue;
        io.unobserve(el);
        const start = performance.now();
        const tick = (t: number) => {
          const p = Math.min(1, (t - start) / duration);
          const eased = 1 - (1 - p) ** 3;
          setN(Math.round(to * eased));
          if (p < 1) raf = requestAnimationFrame(tick);
        };
        raf = requestAnimationFrame(tick);
      }
    });
    io.observe(el);
    return () => {
      io.disconnect();
      cancelAnimationFrame(raf);
    };
  }, [to, duration]);

  return (
    <span ref={ref} className="tnum">
      {n}
      {suffix}
    </span>
  );
}
