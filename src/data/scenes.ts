import arkaplan from "../assets/arkaplan.webp";
import calisma from "../assets/calisma.webp";
import film from "../assets/film.webp";
import gunBatimi from "../assets/gun-batimi.webp";
import gunBatimi2 from "../assets/gun-batimi2.webp";
import gunaydinYazi from "../assets/gunaydin_yazi.webp";
import gunesli from "../assets/gunesli.webp";
import gunesli2 from "../assets/gunesli2.webp";
import hedef from "../assets/hedef.webp";
import iyigecelerYazi from "../assets/iyigeceler_yazi.webp";
import kolaygelsinYazi from "../assets/kolaygelsin_yazi.webp";
import oyun from "../assets/oyun.webp";
import oyun2 from "../assets/oyun2.webp";
import sevgilimYazi from "../assets/normal.webp";
import sogukhavaYazi from "../assets/sogukhava_yazi.webp";
import uyku from "../assets/uyku.webp";
import yagmurlu from "../assets/yagmurlu.webp";
import yagmurlu2 from "../assets/yagmurlu2.webp";
import yagmurluYazi from "../assets/yagmurlu_yazi.webp";
import yemek from "../assets/yemek.webp";

/* Mobil (dikey) karşılıklar — aynı isimler, 941x1672 */
import arkaplanM from "../assets/mobile/arkaplan.webp";
import calismaM from "../assets/mobile/calisma.webp";
import filmM from "../assets/mobile/film.webp";
import gunBatimiM from "../assets/mobile/gun-batimi.webp";
import gunBatimi2M from "../assets/mobile/gun-batimi2.webp";
import gunesliM from "../assets/mobile/gunesli.webp";
import gunesli2M from "../assets/mobile/gunesli2.webp";
import oyunM from "../assets/mobile/oyun.webp";
import oyun2M from "../assets/mobile/oyun2.webp";
import uykuM from "../assets/mobile/uyku.webp";
import yagmurluM from "../assets/mobile/yagmurlu.webp";
import yagmurlu2M from "../assets/mobile/yagmurlu2.webp";
import yemekM from "../assets/mobile/yemek.webp";

/* ============================================================
   Sahne seçimi — saat dilimi + hava durumu

   Kural:
   - "yazi" ile biten görseller yalnızca sağ üstteki başlıkta kullanılır.
   - Diğerleri (çalışma, film, gün batımı, güneşli...) arka plan olur.
   - Hava durumu yağmur/kar/soğuk ise önce o bildirilir, sonra saat
     diliminin selamı gösterilir.
   - Arka plan saatle birlikte yalnızca dilim değişince değişir; kendi
     kendine dönmez. Yağmur/kar varsa hava durumu görseli önceliklidir.
   ============================================================ */

export type Slot = "morning" | "work" | "evening" | "night";
export type Condition = "rain" | "snow" | "cold";

export type Scene = {
  slot: Slot;
  condition: Condition | null;
  /** Sağ üst başlıkta gösterilecek yazı görselleri (önce hava durumu). */
  greet: { src: string; label: string }[];
  /** Arka plandaki tek görsel (masaüstü). */
  background: string;
  /** Mobil/dikey ekranlar için aynı sahnenin dikey görseli. */
  backgroundMobile: string;
};

const GREET = {
  morning: { src: gunaydinYazi, label: "Günaydın Berna" },
  work: { src: kolaygelsinYazi, label: "Kolay gelsin Berna" },
  evening: { src: sevgilimYazi, label: "Berna'ya akşam selamı" },
  night: { src: iyigecelerYazi, label: "İyi geceler Berna" },
  rain: { src: yagmurluYazi, label: "Yağmurlu hava" },
  snow: { src: sogukhavaYazi, label: "Kar yağışlı, sıkı giyin" },
  cold: { src: sogukhavaYazi, label: "Soğuk hava" },
} as const;

/* Selam metinleri — preloader ve sol sidebar aynı kaynaktan okur. */
export type SlotText = { line1: string; line2: string; sub: string };

export const SLOT_TEXT: Record<Slot, SlotText> = {
  morning: { line1: "Günaydın", line2: "Berna", sub: "bugün de seninle güzel" },
  work: { line1: "Allah sabır", line2: "versin Berna", sub: "kolay gelsin, sen yaparsın" },
  evening: { line1: "Evine hoşgeldin", line2: "Berna", sub: "bugün de seni bekledim" },
  night: { line1: "İyi geceler", line2: "Berna", sub: "tatlı rüyalar, yarın görüşürüz" },
};

export function textForHour(hour: number) {
  return SLOT_TEXT[slotForHour(hour)];
}

/* Sekme başlığı — saate göre değişir. */
const TAB_TITLE: Record<Slot, string> = {
  morning: "Günaydın Berna ♡",
  work: "Kolay gelsin Berna ♡",
  evening: "İyi akşamlar Berna ♡",
  night: "İyi geceler Berna ♡",
};

export function titleForHour(hour: number) {
  return TAB_TITLE[slotForHour(hour)];
}

type Slice = { from: number; to: number; image: string; mobile: string };

/* Gün içi dilimler: her dilim saatin ilerleyişine göre kendi görseline
   geçer (06-07, 07-08 gibi). Sıra sabittir, rastgele dönme yoktur. */
const DAY_PLAN: Slice[] = [
  { from: 6, to: 7, image: gunesli, mobile: gunesliM },
  { from: 7, to: 8, image: gunesli2, mobile: gunesli2M },
  { from: 8, to: 12, image: calisma, mobile: calismaM },
  { from: 12, to: 14, image: yemek, mobile: yemekM },
  /* Bu saat için ayrı dikey görsel yok; masaüstü görseli kullanılır. */
  { from: 14, to: 17, image: hedef, mobile: hedef },
  { from: 17, to: 18, image: oyun2, mobile: oyun2M },
  { from: 18, to: 19, image: gunBatimi, mobile: gunBatimiM },
  { from: 19, to: 20, image: gunBatimi2, mobile: gunBatimi2M },
  { from: 20, to: 21, image: film, mobile: filmM },
  { from: 21, to: 22, image: oyun, mobile: oyunM },
  { from: 22, to: 24, image: uyku, mobile: uykuM },
  { from: 0, to: 2, image: uyku, mobile: uykuM },
  { from: 2, to: 5, image: uyku, mobile: uykuM },
  /* Gün doğumuna uyanış: şafak vakti yatak odası. */
  { from: 5, to: 6, image: arkaplan, mobile: arkaplanM },
];

/* "2"li görseller aynı sahnenin varyantı: gündüz/gece ayrımıyla kullanılır. */
function conditionSlice(condition: Condition, hour: number): { image: string; mobile: string } {
  const isDay = hour >= 6 && hour < 18;
  if (condition === "rain") return isDay ? { image: yagmurlu, mobile: yagmurluM } : { image: yagmurlu2, mobile: yagmurlu2M };
  if (condition === "snow") return isDay ? { image: yagmurlu2, mobile: yagmurlu2M } : { image: yagmurlu, mobile: yagmurluM };
  /* "soğuk hava" yalnızca bir hava notu; arkaplan yine saate göre seçilir
     (gece yarısı gün batımı görseli çıkmasın). */
  const slice = sliceForHour(hour);
  return { image: slice.image, mobile: slice.mobile };
}

export function slotForHour(hour: number): Slot {
  if (hour >= 6 && hour < 8) return "morning";
  if (hour >= 8 && hour < 18) return "work";
  if (hour >= 18 && hour < 22) return "evening";
  return "night";
}

function sliceForHour(hour: number): Slice {
  return (
    DAY_PLAN.find((p) => hour >= p.from && hour < p.to) ??
    DAY_PLAN[DAY_PLAN.length - 1]
  );
}

const RAIN_CODES = [51, 53, 55, 61, 63, 65, 80, 81, 82, 95, 96, 99];
const SNOW_CODES = [71, 73, 75, 77, 85, 86];

export function conditionFor(code: number, temp: number): Condition | null {
  if (RAIN_CODES.includes(code)) return "rain";
  if (SNOW_CODES.includes(code)) return "snow";
  if (temp <= 7) return "cold";
  return null;
}

export function buildScene(hour: number, code: number, temp: number): Scene {
  const slot = slotForHour(hour);
  const condition = conditionFor(code, temp);
  const greet = condition ? [GREET[condition], GREET[slot]] : [GREET[slot]];
  const bg = condition ? conditionSlice(condition, hour) : sliceForHour(hour);

  return {
    slot,
    condition,
    greet,
    background: bg.image,
    backgroundMobile: bg.mobile,
  };
}
