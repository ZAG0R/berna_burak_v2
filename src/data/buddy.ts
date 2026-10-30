import type { Condition, Slot } from "./scenes";

/* ============================================================
   Minik dostların replikleri

   Sol taraf HER (Berna), sağ taraf HIM (Burak).

   İki tür replik var:

   1) Tek replikler (SOLO) - yalnızca bir karakterin tek başına
      söylediği sözler: selamlama, tıklanma, yalnız bekleme, çıkış.
      Bunların cevabı yok, çünkü karşısında kimse yok.

   2) Diyaloglar (DIALOGUES) - iki karakter yan yanayken oynayan,
      baştan sona yazılmış konuşmalar. Her repliğin cevabı belli,
      böylece "saçların güzel olmuş" deyip "molada kaçtım geldim"
      cevabını almak gibi kopukluk olmuyor.
   ============================================================ */

export type BuddyScene = { slot: Slot; condition: Condition | null };

export type Who = 0 | 1;

/* Tek başına söylenen replik türleri. */
export type SoloKind = "greet" | "click" | "idle" | "wait" | "leave";

export type Beat = { who: Who; text: string };

type Voice = {
  base: string[];
  slot?: Partial<Record<Slot, string[]>>;
  cond?: Partial<Record<Condition, string[]>>;
};

const SOLO: Record<SoloKind, Record<"her" | "him", Voice>> = {
  /* ---------- sahne açılırken, ikisi de sahnedeyken ---------- */
  greet: {
    her: {
      base: [
        "Buradayım, kaçmadım ya ♡",
        "Geldim. Sen de fark ettin mi?",
      ],
      slot: {
        morning: [
          "Günaydın! Perdeyi aç, güneş girdi ☀",
          "Kahve hazır mı? Ben bekliyorum...",
        ],
        work: [
          "Kolay gelsin, ben yanındayım ♡",
          "Su iç. Evet, şimdi. Ben beklerim 💧",
        ],
        evening: [
          "Hoş geldin, terlikleri çıkar ♡",
          "Gün bitti sayılır, artık yavaşla",
        ],
        night: [
          "İyi geceler... gözlerimi kapatıyorum",
          "Bu saatte ayaktaysan sebebi güzeldir umarım",
        ],
      },
      cond: {
        rain: ["Şemsiyeni al! Ben su geçirmezim 🌂"],
        snow: ["Sarıl bana, üşüdüm ☃"],
        cold: ["Brrr! Önce terlik, sonra konuşma"],
      },
    },
    him: {
      base: ["Buradayım, sen devam et ♡"],
      slot: {
        morning: ["Günaydın Berna 🌞"],
        work: ["Kolay gelsin, bir şey lazımsa söyle"],
        evening: ["Hoş geldin, bugün nasıl geçti?"],
        night: ["İyi geceler Berna 🌙"],
      },
    },
  },

  /* ---------- tıklanınca ---------- */
  click: {
    her: {
      base: [
        "Beni mi tıkladın? Tekrar 😜",
        "Hop! Kalplerim dağıldı ♡",
        "Güldüm, bir daha!",
      ],
    },
    him: {
      base: [
        "Hey! Dikkat et, düşeceğim 😄",
        "Bak, kalpler saçıldı ♡",
        "Yine mi sen? Hoşuma gitti ♡",
      ],
    },
  },

  /* ---------- biri yokken, kalan kendi kendine ---------- */
  wait: {
    him: {
      base: [
        "Nerede kaldı bu kız?",
        "Hâlâ gelmedi... merak ettim",
        "Bekliyorum ama söylemesi benden ♡",
      ],
      slot: {
        morning: ["Sabah sabah nerede kaldı bu?"],
        work: ["Mola bitti mi, gelmedi daha"],
        evening: ["Yemekten önce gelir umarım"],
        night: ["Bu saatte gelen olur mu ki?"],
      },
      cond: {
        rain: ["Yağmur var, belki sıkıştı 🌧"],
        snow: ["Bu soğukta yolu uzatmıştır ☃"],
        cold: ["Üşümeye başladım, hadi ama"],
      },
    },
    her: {
      base: ["Bekliyorum, acelem yok", "Gelir birazdan..."],
    },
  },

  /* ---------- yan yana, konuşma başlamamışken ---------- */
  idle: {
    her: {
      base: [
        "Bakışlarımı takip etme, utanırım 👀",
        "Bir nefes almayı unutma 🌬",
      ],
      slot: {
        morning: ["Sabah ışığı perdeden giriyor ☀"],
        work: ["Ekrana çok yaklaştın, biraz geri gel"],
        evening: ["Gün batımı buradan çok güzel görünüyor"],
        night: ["Uyumadan önce bir bardak su 💧"],
      },
      cond: {
        rain: ["Yağmur sesi en güzel beyaz gürültü 🌧"],
        snow: ["Camdan kar seyretmek en kârlı iş ☃"],
        cold: ["Bu soğukta ev en güzel yer"],
      },
    },
    him: {
      base: ["Ellerim cepte, keyfim yerinde", "Sen işini yap, ben seni izlerim"],
      slot: {
        morning: ["Sabah ışığı güzel, gün senin 🌞"],
        work: ["Ekran ile gözün arası bir karış olsun"],
        evening: ["Gün batımı tam buradan bakılacak yer"],
        night: ["Gece sessiz, iyi ki varsın 🌙"],
      },
      cond: {
        rain: ["Yağmur başladı, camdan bak 🌧"],
        snow: ["Kar yağıyor, sessiz olalım ☃"],
        cold: ["Bu soğukta ev en güzel yer"],
      },
    },
  },

  /* ---------- çıkarken ---------- */
  leave: {
    her: {
      base: ["Ben bir bakayım, hemen dönerim!", "Mutfağa bakıyorum, koku güzeldi"],
      slot: {
        morning: ["Kahve alıp geliyorum, sen bekle ☕"],
        work: ["Bir bardak su almaya gidiyorum, sen devam et"],
        evening: ["Mutfağa bakayım, hemen geliyorum"],
        night: ["Su alıp geliyorum, kalkma 🌙"],
      },
    },
    him: {
      base: ["Ben bir bakayım, hemen dönerim!", "Bir şey alıp geliyorum"],
      slot: {
        morning: ["Kahve alıp geliyorum, bekle ☕"],
        work: ["Su almaya gidiyorum, devam et"],
        evening: ["Mutfağa bakayım, hemen geliyorum"],
        night: ["Su alıp geliyorum 🌙"],
      },
    },
  },
};

/* ============================================================
   Diyaloglar: baştan sona yazılmış, cevabı belli konuşmalar.
   Burak iltifat eder, Berna karşılık verir.
   ============================================================ */

type Dialogue = { beats: Beat[] };

/* İltifat -> karşılık. */
const FLIRT: Dialogue[] = [
  {
    beats: [
      { who: 1, text: "Saçların bugün çok güzel olmuş." },
      { who: 0, text: "Yeni kestirdim. Fark etmen hoşuma gitti ♡" },
    ],
  },
  {
    beats: [
      { who: 1, text: "Gülüşün bütün günümü düzeltiyor, biliyor musun?" },
      { who: 0, text: "O zaman daha çok gülerim." },
    ],
  },
  {
    beats: [
      { who: 1, text: "Bugün de seni gördüm, gün tamam oldu." },
      { who: 0, text: "Abartma... ama devam et." },
    ],
  },
  {
    beats: [
      { who: 1, text: "Gözlerin yorgun görünüyor." },
      { who: 0, text: "Yorgunum ama yanında oturunca geçiyor." },
      { who: 1, text: "O zaman biraz daha otur." },
    ],
  },
  {
    beats: [
      { who: 1, text: "Sen konuşurken dinlemek istiyorum, devam et." },
      { who: 0, text: "Ne anlatayım? Aklımda bir şey yok." },
      { who: 1, text: "Hiçbir şey. Sesin yeter." },
    ],
  },
  {
    beats: [
      { who: 1, text: "Bu kadar güzel olman haksızlık." },
      { who: 0, text: "Bugün aynaya bakmadım, senden duyuyorum." },
    ],
  },
];

/* Günlük hâller. */
const EVERYDAY: Dialogue[] = [
  {
    beats: [
      { who: 1, text: "Bugün ne yaptın, anlat." },
      { who: 0, text: "Hiçbir şey. Seni bekledim, o da bir şey sayılır." },
    ],
  },
  {
    beats: [
      { who: 1, text: "Akşama ne yesek?" },
      { who: 0, text: "Sen ne istersen. Ama bulaşıklar senin." },
    ],
  },
  {
    beats: [
      { who: 1, text: "Yorulmuşsun, biraz otur." },
      { who: 0, text: "Oturursam kalkmam, biliyorsun değil mi?" },
      { who: 1, text: "Kalkma. Ben hallederim." },
    ],
  },
  {
    beats: [
      { who: 1, text: "Bugün seni çok düşündüm." },
      { who: 0, text: "Ben de. Aynı anda düşünmüşüz yine." },
    ],
  },
  {
    beats: [
      { who: 0, text: "Canım sıkılıyor." },
      { who: 1, text: "Otur, sana bir şey anlatayım." },
      { who: 0, text: "Anlat bakalım." },
    ],
  },
];

/* Saate özel diyaloglar. */
const SLOT_CHAT: Partial<Record<Slot, Dialogue[]>> = {
  morning: [
    {
      beats: [
        { who: 1, text: "Uyandın mı? Sesi duydum." },
        { who: 0, text: "Duydun demek. Kahveyi sen yapıyorsun o zaman." },
        { who: 1, text: "Zaten kalkıyordum ☀" },
      ],
    },
    {
      beats: [
        { who: 1, text: "Sabah saçın dağınık, çok tatlı." },
        { who: 0, text: "Taramadım. Sen de taramadın." },
      ],
    },
  ],
  work: [
    {
      beats: [
        { who: 1, text: "Molada mısın?" },
        { who: 0, text: "Evet, on dakika. Sadece seninle oturmak istedim." },
      ],
    },
    {
      beats: [
        { who: 1, text: "Bu kadar çalışıp yine de güzel kalman haksızlık." },
        { who: 0, text: "Yorgunum ama bu cümle işe yaradı." },
      ],
    },
  ],
  evening: [
    {
      beats: [
        { who: 1, text: "Gün bitti, artık hiçbir şey yapmayalım." },
        { who: 0, text: "Anlaştık. Sadece burada oturalım." },
      ],
    },
    {
      beats: [
        { who: 1, text: "Akşam ışığında gözlerin başka bir güzel." },
        { who: 0, text: "Işık mı, ben mi?" },
        { who: 1, text: "Sen." },
      ],
    },
  ],
  night: [
    {
      beats: [
        { who: 1, text: "Geç oldu, uyusak mı?" },
        { who: 0, text: "Biraz daha. Bu saatte konuşmak daha kolay." },
      ],
    },
    {
      beats: [
        { who: 1, text: "Uyumadan önce son gördüğüm sen olacaksın." },
        { who: 0, text: "İyi geceler o zaman ♡" },
      ],
    },
  ],
};

/* Havaya özel diyaloglar. */
const COND_CHAT: Partial<Record<Condition, Dialogue[]>> = {
  rain: [
    {
      beats: [
        { who: 1, text: "Yağmur bastırdı, dışarı çıkmayalım." },
        { who: 0, text: "Zaten niyetim yoktu. Sesi dinleyelim." },
      ],
    },
  ],
  snow: [
    {
      beats: [
        { who: 1, text: "Kar yağıyor, camdan bak." },
        { who: 0, text: "Bakıyorum. Dışarısı buz, burada sıcacık." },
      ],
    },
  ],
  cold: [
    {
      beats: [
        { who: 1, text: "Ellerin buz gibi, ver bakayım." },
        { who: 0, text: "Isıt o zaman, bırakmam." },
      ],
    },
  ],
};

/* Atışma: suçlama -> savunma -> uzlaşma. */
const SQUABBLE: Dialogue[] = [
  {
    beats: [
      { who: 0, text: "Bulaşıkları yine bana bıraktın." },
      { who: 1, text: "Ben bir şey bırakmadım, orada duruyorlardı!" },
      { who: 0, text: "Tamam. Bu seferlik ben yıkıyorum." },
      { who: 1, text: "Yarın hepsini ben yıkarım, söz." },
    ],
  },
  {
    beats: [
      { who: 0, text: "Beni dinlemiyorsun." },
      { who: 1, text: "Dinliyorum ya, devam et." },
      { who: 0, text: "Ne dedim peki?" },
      { who: 1, text: "...Tekrar edeyim, en baştan." },
    ],
  },
  {
    beats: [
      { who: 0, text: "Ceketini yine almadın, değil mi?" },
      { who: 1, text: "Aldım! Yani... arabada kaldı ama aldım." },
      { who: 0, text: "Of. Yarın alacaksın." },
      { who: 1, text: "Alacağım, tamam ♡" },
    ],
  },
  {
    beats: [
      { who: 0, text: "Telefonuna yine daldın." },
      { who: 1, text: "Bir saniye, bitiyor... tamam, bitti. Buyur." },
      { who: 0, text: "Bak, böyle olunca kızmıyorum." },
    ],
  },
];

/* Burak bekler, Berna gelir. Tek parça senaryo:
   ilk replik Burak yalnızken, kalanı Berna gelince oynar. */
const ARRIVALS: { wait: string; beats: Beat[] }[] = [
  {
    wait: "Nerede kaldı bu kız?",
    beats: [
      { who: 0, text: "Geldim, geldimmmm! ♡" },
      { who: 1, text: "Sonunda. Merak ettim." },
      { who: 0, text: "Trafik vardı, kusura bakma." },
    ],
  },
  {
    wait: "Hâlâ gelmedi... merak ettim.",
    beats: [
      { who: 0, text: "Geldim, geldimmmm!" },
      { who: 1, text: "İyi ki geldin." },
      { who: 0, text: "Yolda biriyle karşılaştım, ondan geciktim." },
    ],
  },
  {
    wait: "Bekliyorum ama söylemesi benden ♡",
    beats: [
      { who: 0, text: "Geldim, geldimmmm! Beklettim mi?" },
      { who: 1, text: "Beklettin. Ama önemli değil." },
    ],
  },
];

const lastPicked = new Map<string, string>();

function pickFrom(pool: string[], key: string): string {
  if (pool.length === 0) return "";
  const prev = lastPicked.get(key);
  const fresh = pool.length > 1 && prev ? pool.filter((l) => l !== prev) : pool;
  const line = fresh[Math.floor(Math.random() * fresh.length)];
  lastPicked.set(key, line);
  return line;
}

export function linesFor(kind: SoloKind, scene: BuddyScene, who: Who): string[] {
  const voice = SOLO[kind][who === 0 ? "her" : "him"];
  const slot = voice.slot?.[scene.slot] ?? [];
  const cond = scene.condition ? voice.cond?.[scene.condition] ?? [] : [];
  return [...slot, ...cond, ...voice.base];
}

export function pickLine(kind: SoloKind, scene: BuddyScene, who: Who): string {
  return pickFrom(linesFor(kind, scene, who), `${kind}:${who}`);
}

function poolFor(scene: BuddyScene, kind: "chat" | "squabble"): Dialogue[] {
  if (kind === "squabble") return SQUABBLE;
  const slot = SLOT_CHAT[scene.slot] ?? [];
  const cond = scene.condition ? COND_CHAT[scene.condition] ?? [] : [];
  return [...cond, ...slot, ...FLIRT, ...EVERYDAY];
}

/* Bir diyalog seçer; aynı diyalog üst üste gelmez. */
export function pickDialogue(scene: BuddyScene, kind: "chat" | "squabble"): Beat[] {
  const pool = poolFor(scene, kind);
  const keys = pool.map((d) => d.beats.map((b) => b.text).join("|"));
  const chosen = pickFrom(keys, `dialogue:${kind}`);
  const found = pool[keys.indexOf(chosen)];
  return found ? found.beats : [];
}

/* Burak'ın beklemesi + Berna'nın gelişi. */
export function pickArrival(): { wait: string; beats: Beat[] } {
  const waits = ARRIVALS.map((a) => a.wait);
  const chosen = pickFrom(waits, "arrival");
  return ARRIVALS[waits.indexOf(chosen)] ?? ARRIVALS[0];
}

/* Kavuşunca Burak'ın söylediği tek cümle. */
const MEET = ["Sonunda geldin.", "Seni gördüm, gün güzelleşti.", "Gel buraya ♡"];

export function pickMeetLine(): string {
  return pickFrom(MEET, "meet");
}

/* Bir karakter tıklanınca yanındakinin verdiği kısa karşılık.
   "Beni mi tıkladın" yanlış olur, çünkü tıklanan o değil. */
const POKE_REPLY: Record<"her" | "him", string[]> = {
  her: ["Ne oldu? 😄", "Ben de zıpladım!"],
  him: ["Hey, ben de buradayım 😄", "Bana da mı?"],
};

export function pickPokeReply(who: Who): string {
  return pickFrom(POKE_REPLY[who === 0 ? "her" : "him"], `poke:${who}`);
}

/* Balonda görünecek isim. */
export const NAMES = ["Berna", "Burak"] as const;
