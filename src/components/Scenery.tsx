import { useEffect, useMemo, useRef, useState } from "react";
import type { Scene } from "../data/scenes";

/* ============================================================
   Yumuşak geçiş yardımcıları
   ============================================================ */

function useReducedMotion() {
  const [reduced, setReduced] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setReduced(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);

  return reduced;
}

/**
 * İki katmanlı çapraz geçiş. Yeni görsel arkadaki katmana yazılır,
 * sonra katmanlar yer değiştirir; CSS opacity geçişi yumuşak silme yapar.
 */
function useCrossfade(src: string) {
  const [layers, setLayers] = useState<{ a: string; b: string; top: 0 | 1 }>({
    a: src,
    b: src,
    top: 0,
  });

  useEffect(() => {
    setLayers((prev) => {
      const current = prev.top === 0 ? prev.a : prev.b;
      if (current === src) return prev;
      return prev.top === 0 ? { ...prev, b: src, top: 1 } : { ...prev, a: src, top: 0 };
    });
  }, [src]);

  return layers;
}

/** Dikey ekranlar (telefon/portre) mobil görsel setini kullanır. */
function usePortrait() {
  const [portrait, setPortrait] = useState(
    () => typeof window !== "undefined" && window.matchMedia("(max-width: 900px)").matches,
  );

  useEffect(() => {
    const mq = window.matchMedia("(max-width: 900px)");
    const update = () => setPortrait(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);

  return portrait;
}

/* ============================================================
   Arka plan — saat dilimine ve hava durumuna sabit bağlı
   ============================================================ */

export function SceneBackground({ scene }: { scene: Scene }) {
  const portrait = usePortrait();
  const src = portrait ? scene.backgroundMobile : scene.background;
  const { a, b, top } = useCrossfade(src);

  const photo = `url(${a})`;
  const photoAlt = `url(${b})`;

  return (
    <div className="app__bg" aria-hidden>
      <div
        className="app__bg-blur"
        style={{
          backgroundImage: photo,
          opacity: top === 0 ? 1 : 0,
        }}
      />
      <div
        className="app__bg-blur"
        style={{
          backgroundImage: photoAlt,
          opacity: top === 1 ? 1 : 0,
        }}
      />
      <div
        className="app__bg-photo"
        style={{
          backgroundImage: photo,
          opacity: top === 0 ? 1 : 0,
        }}
      />
      <div
        className="app__bg-photo"
        style={{
          backgroundImage: photoAlt,
          opacity: top === 1 ? 1 : 0,
        }}
      />
      <div className="app__bg-scrim" />
      <div className="app__bg-grain" />
    </div>
  );
}

/* ============================================================
   Sağ üst başlık — hava durumu yazısı önce, sonra selam
   ============================================================ */

export function SceneGreeting({ scene }: { scene: Scene }) {
  const reduced = useReducedMotion();
  const list = scene.greet;
  const [index, setIndex] = useState(0);
  const active = list[Math.min(index, list.length - 1)];

  const [shown, setShown] = useState(active);
  const [visible, setVisible] = useState(true);
  const timer = useRef<number | undefined>(undefined);

  // Sahne değişince yeniden başla: önce hava durumu, sonra selam.
  useEffect(() => {
    setIndex(0);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [list.map((g) => g.src).join("|"), reduced]);

  // Hava durumu ile selam arasında sırayla gidip gelir; hiçbiri kaybolmaz.
  useEffect(() => {
    if (list.length < 2) return;
    // Hava durumu kısa, selam daha uzun görünür.
    const hold = index === 0 ? (reduced ? 4_000 : 6_000) : reduced ? 7_000 : 12_000;
    const id = window.setTimeout(() => setIndex((i) => (i + 1) % list.length), hold);
    return () => window.clearTimeout(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [index, list.map((g) => g.src).join("|"), reduced]);

  useEffect(() => {
    if (active.src === shown.src) return;

    if (reduced) {
      setShown(active);
      return;
    }

    // Önce yazı yumuşakça kaybolur, sonra yenisi belirir.
    setVisible(false);
    window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => {
      setShown(active);
      setVisible(true);
    }, 620);

    return () => window.clearTimeout(timer.current);
  }, [active, shown.src, reduced]);

  const alt = useMemo(() => shown.label, [shown.label]);

  return (
    <div className="home__aside-header">
      <img
        src={shown.src}
        alt={alt}
        className={`home__aside-logo ${visible ? "is-in" : "is-out"}`}
        draggable={false}
      />
    </div>
  );
}
