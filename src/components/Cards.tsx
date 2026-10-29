import { useEffect, useMemo, useRef, useState } from "react";
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

export function WeatherCard({ w, live, id }: { w: Weather; live: boolean; id?: string }) {
  const WeatherArt = WEATHER_ICONS[w.icon];
  return (
    <article className="card card--hover" id={id}>
      <div className="weather">
        <div className="weather__art weather__art--float" aria-hidden>
          <WeatherArt />
        </div>
        <div className="weather__body">
          <p className="weather__city">{DEFAULT_CITY}</p>
          <p className="weather__temp">
            {w.temp}
            <span className="weather__deg">°C</span>
          </p>
          <p className="weather__desc">{w.desc}</p>
        </div>
        <div className="weather__extra">
          <span>
            Rüzgâr <b>{w.wind} km/s</b>
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
          <Icon name="quote" />
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
          <h3 className="card__title">Bugünün Planı</h3>
          <span className="card__count">{total} görev</span>
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
                  <span className="planitem__time muted">{item.time}</span>
                  <span className="planitem__label">{item.label}</span>
                </button>
              </li>
            );
          })}
        </ul>

        <div className="plan__foot">
          {/* Yuzde isaretinin egik cizgileri kucuk puntoda sifira karisiyor;
              isaret ayrilip soluk gosterilir. */}
          <span className="plan__pct tnum">
            <span className="plan__pct-sign">%</span>
            {pct}
          </span>
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
  kind: "coffee" | "gift" | "memory" | "cat";
  image: string;
  tag: string;
  title: string;
  text: string;
};

const BOTTOM_ICON: Record<BottomCard["kind"], string> = {
  coffee: "coffee",
  gift: "gift",
  memory: "camera",
  cat: "paw",
};

/* Her kartta gorsel var; ikon yuvarlagi yalnizca tur belirtir. */
const ICON_CARD: BottomCard["kind"] | null = null;

export function BottomCards({
  cards,
  onOpen,
}: {
  cards: readonly BottomCard[];
  onOpen: (kind: BottomCard["kind"]) => void;
}) {
  return (
    <>
      {cards.map((c, i) => (
        <article key={c.id} className="card card--hover">
          <button type="button" className="bottomcard" onClick={() => onOpen(c.kind)}>
            <span
              className={`bottomcard__thumb ${i === 1 ? "polaroid-mini" : ""} ${
                c.kind === ICON_CARD ? "bottomcard__thumb--icon" : ""
              }`}
            >
              {c.kind === ICON_CARD ? (
                <Icon name={BOTTOM_ICON[c.kind]} />
              ) : (
                <img src={c.image} alt="" loading="lazy" decoding="async" />
              )}
            </span>
            {/* Hedef: kalin baslik (etiket metni) + soluk aciklama. */}
            <span className="bottomcard__body">
              <span className="bottomcard__title">{c.tag}</span>
              <span className="bottomcard__text">{c.text}</span>
            </span>
            {/* Referans: sag ustte ture gore ikon, sag altta yuvarlak ok. */}
            <span className="bottomcard__like" aria-hidden>
              <Icon name={BOTTOM_ICON[c.kind]} />
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
   Müzik çubuğu — ana sayfanın en altında tam genişlikte.
   Sol: kapak + parça adı, orta: kontroller + ilerleme, sağ: ses.
   ============================================================ */

/** Parça süresi. Gerçek mp3 varsa onun süresi kullanılır; yoksa
 *  sentez parçasının varsayılan uzunluğu gösterilir. */
const FALLBACK_DURATION = 222; // 3:42

function clock(total: number) {
  const s = Math.max(0, Math.floor(total));
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;
}

export function MusicBar({
  song,
  playing,
  elapsed,
  duration,
  volume,
  onVolume,
  onToggle,
  onNext,
  onPrev,
  onSeek,
  id,
}: {
  song: Song;
  playing: boolean;
  elapsed: number;
  duration: number;
  volume: number;
  onVolume: (v: number) => void;
  onToggle: () => void;
  onNext: () => void;
  onPrev: () => void;
  onSeek: (ratio: number) => void;
  id?: string;
}) {
  const total = duration > 0 ? duration : FALLBACK_DURATION;
  const safeElapsed = Math.min(elapsed, total);
  const progress = total > 0 ? safeElapsed / total : 0;
  const trackRef = useRef<HTMLSpanElement | null>(null);

  /* Cubuga tiklayarak veya surukleyerek parcalarda ileri/geri sarma. */
  const seekFromEvent = (e: PointerEvent | React.PointerEvent) => {
    const box = trackRef.current?.getBoundingClientRect();
    if (!box || box.width <= 0) return;
    onSeek(Math.max(0, Math.min(1, (e.clientX - box.left) / box.width)));
  };

  const onPointerDown = (e: React.PointerEvent<HTMLSpanElement>) => {
    e.preventDefault();
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
    seekFromEvent(e);
  };

  const onPointerMove = (e: React.PointerEvent<HTMLSpanElement>) => {
    if (!(e.currentTarget as HTMLElement).hasPointerCapture(e.pointerId)) return;
    seekFromEvent(e);
  };

  return (
    <article className={`card musicbar ${playing ? "musicbar--playing" : ""}`} id={id}>
      <div className="musicbar__left">
        <span className="musicbar__thumb">
          <img src={song.cover} alt="" loading="lazy" decoding="async" />
          <span className="musicbar__veil" aria-hidden>
            <Icon name="music" />
          </span>
        </span>
        <span className="musicbar__meta">
          <span className="musicbar__title">{song.title}</span>
          <span className="musicbar__artist">{song.artist}</span>
        </span>
        <span className="musicbar__like" aria-hidden>
          <Icon name="heartfilled" />
        </span>
      </div>

      {/* Referanstaki sira: once sure, sonra cubuk, sonra toplam sure. */}
      <div className="musicbar__timeline">
        <span className="musicbar__time tnum">{clock(safeElapsed)}</span>
        <span
          className="musicbar__track"
          ref={trackRef}
          role="slider"
          tabIndex={0}
          aria-label="Parcada ilerleme"
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={Math.round(progress * 100)}
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onKeyDown={(e) => {
            if (e.key === "ArrowRight") onSeek(Math.min(1, progress + 0.02));
            if (e.key === "ArrowLeft") onSeek(Math.max(0, progress - 0.02));
          }}
        >
          <i style={{ width: `${Math.round(progress * 100)}%` }} />
          <b style={{ left: `${Math.round(progress * 100)}%` }} />
        </span>
        <span className="musicbar__time tnum">{clock(total - safeElapsed)}</span>
      </div>

      <div className="musicbar__controls">
        <button type="button" className="mbtn" aria-label="Karıştır" title="Karıştır">
          <Icon name="shuffle" />
        </button>
        <button type="button" className="mbtn" onClick={onPrev} aria-label="Önceki parça">
          <Icon name="skipBack" />
        </button>
        <button
          type="button"
          className="mbtn mbtn--main"
          onClick={onToggle}
          aria-label={playing ? "Duraklat" : "Çal"}
        >
          <Icon name={playing ? "pause" : "play"} />
        </button>
        <button type="button" className="mbtn" onClick={onNext} aria-label="Sonraki parça">
          <Icon name="skipForward" />
        </button>
        <button type="button" className="mbtn" aria-label="Tekrar" title="Tekrar">
          <Icon name="refresh" />
        </button>
      </div>

      <label className="musicbar__volume">
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
   Birlikte geçen zaman

   Başlangıç tarihinden bu yana geçen süre; gün, saat ve dakika.
   Sayaç canlı: her 30 saniyede tazelenir, sekmeye dönünce de güncellenir.
   Gece yarısı geçince gün kendiliğinden artar.
   ============================================================ */

function parseDay(value: string) {
  const [y, m, d] = value.split("-").map(Number);
  return new Date(y, (m || 1) - 1, d || 1, 0, 0, 0, 0);
}

function diffParts(since: Date, now: Date) {
  if (now.getTime() <= since.getTime()) return { days: 0, hours: 0, minutes: 0 };
  let ms = now.getTime() - since.getTime();
  const days = Math.floor(ms / 86_400_000);
  ms -= days * 86_400_000;
  const hours = Math.floor(ms / 3_600_000);
  ms -= hours * 3_600_000;
  const minutes = Math.floor(ms / 60_000);
  return { days, hours, minutes };
}

export function TogetherCard({
  since,
  label,
  hint,
}: {
  since: string;
  label: string;
  hint: string;
}) {
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    const tick = () => setNow(new Date());
    const id = window.setInterval(tick, 30_000);
    window.addEventListener("focus", tick);
    document.addEventListener("visibilitychange", tick);
    return () => {
      window.clearInterval(id);
      window.removeEventListener("focus", tick);
      document.removeEventListener("visibilitychange", tick);
    };
  }, []);

  const start = useMemo(() => parseDay(since), [since]);
  const { days, hours, minutes } = useMemo(() => diffParts(start, now), [start, now]);

  /* Yıldönümü: her yıl aynı gün. */
  const nextAnniversary = useMemo(() => {
    const d = new Date(now.getFullYear(), start.getMonth(), start.getDate());
    const midnight = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    if (d.getTime() < midnight.getTime()) d.setFullYear(d.getFullYear() + 1);
    return d;
  }, [now, start]);

  const daysToAnniversary = useMemo(() => {
    const midnight = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    return Math.max(
      0,
      Math.round((nextAnniversary.getTime() - midnight.getTime()) / 86_400_000),
    );
  }, [now, nextAnniversary]);

  const isAnniversary = daysToAnniversary === 0;

  return (
    <article className={`card together${isAnniversary ? " together--anniv" : ""}`}>
      {isAnniversary && (
        <span className="together__confetti" aria-hidden>
          {Array.from({ length: 10 }, (_, i) => (
            <i key={i} style={{ "--i": i } as React.CSSProperties} />
          ))}
        </span>
      )}
      <div className="together__body">
        <p className="together__label">
          <Icon name="heartfilled" />
          {label}
        </p>
        <Icon name="sparkles" className="together__spark" />

        {/* Sol: buyuk gun sayisi. Sag: yil donumu ve gecen sure. */}
        <p className="together__days tnum">
          <b>{days.toLocaleString("tr-TR")}</b>
          <Icon name="heart" className="together__days-heart" />
          <span>gün</span>
        </p>

        <div className="together__right">
          <p className="together__anniv">
            <Icon name="heartspair" />
            <span>
              {daysToAnniversary === 0
                ? "Bugün yıl dönümümüz ♡"
                : `Yıl dönümüne ${daysToAnniversary} gün`}
            </span>
          </p>
          <p className="together__sub tnum">
            <Icon name="clock" />
            <span>
              {hours} saat {minutes} dakika
            </span>
          </p>
        </div>
      </div>
      <span className="together__hint" title={hint} aria-hidden>
        <Icon name="calendar" />
      </span>
      <span className="together__leaf together__leaf--1" aria-hidden />
      <span className="together__leaf together__leaf--2" aria-hidden />
    </article>
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
