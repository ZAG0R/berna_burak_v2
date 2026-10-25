import type { Condition, Slot } from "./scenes";

/* ============================================================
   Minik dostun replikleri

   - SLOT_LINES: saat dilimi değişince bir kez söylenir.
   - COND_LINES: hava durumu varsa onu tercih eder (öncelikli).
   - CLICK_LINES: tıklanınca.
   - IDLE_LINES: ara ara kendi kendine konuşur.
   ============================================================ */

export const SLOT_LINES: Record<Slot, string[]> = {
  morning: [
    "Günaydın! Perdeyi aç, güneş girdi ☀",
    "Kahve hazır mı? Ben bekliyorum...",
    "Bugün güzel geçecek, biliyorum ♡",
  ],
  work: [
    "Kolay gelsin! Mola da hakkın ♡",
    "Bilgisayar da senin gibi ısındı",
    "Bir dakika ara? Almayayım 😅",
  ],
  evening: [
    "Hoş geldin! Terlikleri çıkar ♡",
    "Ben hâlâ buradayım, bekledim",
    "Yemek kokusu geldi mi?",
  ],
  night: [
    "İyi geceler... gözlerimi kapatıyorum",
    "Horultu sesi benden değil",
    "Tatlı rüyalar, rüyanda bana yer aç ♡",
  ],
};

export const COND_LINES: Record<Condition, string[]> = {
  rain: ["Şemsiyeni al! Ben su geçirmezim 🌂", "Yağmur yağıyor, balkon hasreti"],
  snow: ["Sarı sar beni, üşüdüm ☃", "Kardan adam olmam lazım"],
  cold: ["Brrr! Önce terlik, sonra konuşma", "Soğuk... sen içeri geç ♡"],
};

export const CLICK_LINES: string[] = [
  "Beni mi tıkladın? Tekrar 😜",
  "Hop! Kalplerim dağıldı ♡",
  "Güldüm, bir daha!",
  "Sevgiden yapıldım, dokununca coşarım",
  "Berna, ben buradayım ♡",
];

export const IDLE_LINES: string[] = [
  "Buradayım, sıkılırsan konuş ♡",
  "Bir nefes almayı unutma 🌬",
  "Bakışlarımı takip etme, utanırım 👀",
  "Zaman geçiyor, sen hep güzelsin",
  "...ben sadece dekor değilim",
];

export function pick(list: string[]): string {
  return list[Math.floor(Math.random() * list.length)];
}
