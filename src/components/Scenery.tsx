import { useEffect, useState } from "react";
import type { Scene } from "../data/scenes";

/* ============================================================
   Yumuşak geçiş yardımcıları
   ============================================================ */

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
   Sağ üst başlık — yalnızca hava durumu yazısı, sabit durur
   ============================================================ */

export function SceneGreeting({ scene }: { scene: Scene }) {
  // Selamlar sol kenar çubuğunda; burada yalnızca hava durumu yazısı kalır.
  // Durum tutulmaz, doğrudan sahneden çizilir: hava verisi ne zaman gelirse
  // gelsin yazı hemen yerleşir ve kaybolmaz.
  const item = scene.greet[0] ?? null;

  if (!item) {
    return <div className="home__aside-header home__aside-header--empty" aria-hidden />;
  }

  return (
    <div className="home__aside-header">
      <img
        key={item.src}
        src={item.src}
        alt={item.label}
        className="home__aside-logo is-in"
        draggable={false}
      />
    </div>
  );
}
