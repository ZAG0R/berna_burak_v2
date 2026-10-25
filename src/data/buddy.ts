import type { Condition, Slot } from "./scenes";

/* ============================================================
   Minik dostların replikleri

   Replikler üç katmandan oluşur:
     1) BASE  — her zaman geçerli, sahne bağımsız cümleler
     2) SLOT  — saat dilimine özel (sabah / iş / akşam / gece)
     3) COND  — hava durumuna özel (yağmur / kar / soğuk)

   Böylece dostlar sabah "kahve" derken gece "uyku"dan, yağmurda ise
   şemsiyeden konuşur. Atışma ve sevgi cümleleri de saate göre değişir.
   ============================================================ */

export type BuddyScene = { slot: Slot; condition: Condition | null };

export type LineKind =
  | "greet"
  | "click"
  | "idle"
  | "leave"
  | "bored"
  | "arrive"
  | "love"
  | "squabbleHer"
  | "squabbleHim";

type KindTable = {
  base: string[];
  slot?: Partial<Record<Slot, string[]>>;
  cond?: Partial<Record<Condition, string[]>>;
};

const TABLE: Record<LineKind, KindTable> = {
  /* ---------- karşılama: sahne değişince bir kez ---------- */
  greet: {
    base: ["Buradayım! Bir şey olursa buradayım ♡"],
    slot: {
      morning: [
        "Günaydın! Perdeyi aç, güneş girdi ☀",
        "Kahve hazır mı? Ben bekliyorum...",
        "Bugün güzel geçecek, biliyorum ♡",
        "Bu saatte uyanan insan efsane olur",
        "Saçın dağılmış ama tatlı olmuş",
        "Ekmek kızartayım mı, yoksa sen mi?",
        "Güne benimle başladın, gerisi kolay",
      ],
      work: [
        "Kolay gelsin! Mola da hakkın ♡",
        "Bilgisayar da senin gibi ısındı",
        "Bir dakika ara? Almayayım 😅",
        "Bugün kaç sayfa açık kaldı bakalım",
        "Su iç. Evet, şimdi. Ben beklerim 💧",
        "Omuzların yukarıda, indir bakayım",
        "Kimse fark etmez ama ben fark ediyorum ♡",
      ],
      evening: [
        "Hoş geldin! Terlikleri çıkar ♡",
        "Ben hâlâ buradayım, bekledim",
        "Yemek kokusu geldi mi?",
        "Gün bitti sayılır, artık yavaşla",
        "Bugün en zor kısmı halloldu, tamam mı?",
        "Sana bir çay borcum var, söylemesi benden",
        "Ayakkabılar kenarda, dertler kapıda",
      ],
      night: [
        "İyi geceler... gözlerimi kapatıyorum",
        "Horultu sesi benden değil",
        "Tatlı rüyalar, rüyanda bana yer aç ♡",
        "Bu saatte ayaktaysan sebebi güzeldir umarım",
        "Yarın erken kalkacağız, hadi uyu 🌙",
        "Gece düşünceleri yalan söyler, inanma",
        "Bir yudum su, bir derin nefes, yatak",
      ],
    },
    cond: {
      rain: ["Şemsiyeni al! Ben su geçirmezim 🌂", "Yağmur var, camdan bakalım mı?"],
      snow: ["Sarı sar beni, üşüdüm ☃", "Kar yağıyor, dışarısı kartpostal"],
      cold: ["Brrr! Önce terlik, sonra konuşma", "Soğuk... sen içeri geç ♡"],
    },
  },

  /* ---------- tıklanınca ---------- */
  click: {
    base: [
      "Beni mi tıkladın? Tekrar 😜",
      "Hop! Kalplerim dağıldı ♡",
      "Güldüm, bir daha!",
      "Sevgiden yapıldım, dokununca coşarım",
      "Berna, ben buradayım ♡",
    ],
    slot: {
      morning: ["Sabah sabah bu enerji nereden geldi 😄"],
      work: ["Mola mı? Mola mı? Molaa! 🎉"],
      evening: ["Günü kurtardın, tebrikler ♡"],
      night: ["Bu saatte tıklarsan uyku kaçar 🌙"],
    },
    cond: {
      rain: ["Islandım sanırım. Yine tıkla 😅"],
      snow: ["Kar topu atma, ben de kardanım ☃"],
      cold: ["Elin buz gibi! Isıtayım mı? 🔥"],
    },
  },

  /* ---------- ara ara kendi kendine ---------- */
  idle: {
    base: [
      "Buradayım, sıkılırsan konuş ♡",
      "Bir nefes almayı unutma 🌬",
      "Bakışlarımı takip etme, utanırım 👀",
      "Zaman geçiyor, sen hep güzelsin",
      "...ben sadece dekor değilim",
    ],
    slot: {
      morning: ["Sabah ışığı perdeden giriyor, kalk hadi ☀"],
      work: ["Ekrana çok yaklaştın, biraz geri gel"],
      evening: ["Gün batımı buradan çok güzel görünüyor"],
      night: ["Uyumadan önce bir bardak su 💧", "Ben nöbetteyim, sen uyu 🌙"],
    },
    cond: {
      rain: ["Yağmur sesi en güzel beyaz gürültü 🌧"],
      snow: ["Camdan kar seyretmek en kârlı iş ☃"],
      cold: ["Bu soğukta dışarı çıkmak yürek ister"],
    },
  },

  /* ---------- sahneden çıkarken ---------- */
  leave: {
    base: ["Ben bir bakayım, hemen dönerim!", "Bir dakika... bir şey unuttum"],
    slot: {
      morning: ["Kahve alıp geliyorum, sen bekle ☕"],
      work: ["Bir bardak su almaya gidiyorum, sen devam et"],
      evening: ["Mutfağa bakayım, koku güzeldi"],
      night: ["Pijamalarımı giyip geliyorum 🌙"],
    },
    cond: {
      rain: ["Şemsiyeyi alıp geliyorum, ıslanmayayım 🌂"],
      snow: ["Atkımı alayım, yoksa donarım ☃"],
      cold: ["Çorap. Kesinlikle çorap lazım 🧦"],
    },
  },

  /* ---------- yalnız kalınca ---------- */
  bored: {
    base: [
      "Hâlâ gelmedi... ben burada çimleniyorum",
      "Sıkıldım. Ciddiyim. Çok sıkıldım.",
      "*iç çeker* Nerede kaldı bu?",
      "Kendi kendime konuşmaya başladım, hayırlısı",
    ],
    slot: {
      morning: ["Sabahın bu saatinde beni yalnız bıraktı 😤"],
      work: ["Toplantı mı? Yine mi toplantı?"],
      evening: ["Akşam yemeği de mi bekleyeceğim?"],
      night: ["Bu saatte gelmezse ben de uyurum 😴"],
    },
    cond: {
      rain: ["Yağmurda beklemek de ayrı bir romantizm 🌧"],
      snow: ["Bu soğukta bekliyorum, bunu unutma ☃"],
      cold: ["Donuyorum. Kelimenin tam anlamıyla."],
    },
  },

  /* ---------- öbürü gelince ---------- */
  arrive: {
    base: ["Geldim! Geç kalmadım, sen erken geldin!", "Bak kim geldi ♡", "Yolda bir kedi vardı, ondan geciktim"],
    slot: {
      morning: ["Günaydın, uyuyakalmışım, özür 🌞"],
      work: ["Molada kaçtım geldim, kimse görmedi"],
      evening: ["İşten çıktım, direkt sana geldim ♡"],
      night: ["Gece yarısı buluşması, çok romantik 🌙"],
    },
    cond: {
      rain: ["Şemsiyem yoktu, ıslandım, sarıl 🌧"],
      snow: ["Kardan adam gibi geldim, bak ☃"],
      cold: ["Ellerim buz, ısıt beni 🧊"],
    },
  },

  /* ---------- sevgi anı ---------- */
  love: {
    base: [
      "Seni seviyorum, biliyorsun ♡",
      "Kalbim hep seninle ♡",
      "Berna, burada seni bekleyen bir şey var ♡",
      "İyi ki varsın. Gerçekten.",
    ],
    slot: {
      morning: ["Günün en güzel haberi: sen varsın ☀"],
      work: ["Bugünü seninle bölmek isterdim ♡"],
      evening: ["Bütün gün seni düşündüm, itiraf ediyorum"],
      night: ["Rüyalarımda bile seni arıyorum 🌙"],
    },
    cond: {
      rain: ["Yağmurda bile seninle olmak güzel 🌧♡"],
      snow: ["Kar yağarken elini tutmak isterdim ☃"],
      cold: ["Üşüyorsan gel, ben ısıtırım ♡"],
    },
  },

  /* ---------- atışma: kız tarafı ---------- */
  squabbleHer: {
    base: [
      "Yine mi kaşlarını çattın?",
      "Ben haklıydım, kabul et.",
      "Bana öyle bakma!",
      "Sen böyle yapınca sinirleniyorum.",
    ],
    slot: {
      morning: ["Sabahın yedisinde tartışma mı başlatıyoruz?", "Kahveden önce konuşma benimle ☕"],
      work: ["Sen işini yap, ben kendi işimi yapıyorum!", "Bu toplantı daha uzun süremez!"],
      evening: ["Akşam akşam bunu mu konuşacağız?", "Yemeği ben yaptım, ödülü de ben alacağım"],
      night: ["Bu saatte kavga edilir mi hiç?", "Uyumam lazım, seninle uğraşamam 🌙"],
    },
    cond: {
      rain: ["Şemsiyeyi yine almadın, değil mi?", "Islanınca bana geliyorsun, biliyorum"],
      snow: ["Kar topu atma dedim! ☃", "Donacaksın, sonra ben bakacağım"],
      cold: ["Ceketini giy dedim, giymedin!", "Ben mi üşüyorum, sen mi inatçısın?"],
    },
  },

  /* ---------- atışma: oğlan tarafı ---------- */
  squabbleHim: {
    base: [
      "Ben bir şey yapmadım ki!",
      "Tamam tamam, sen haklısın.",
      "Bağırma, komşular duyacak.",
      "Peki... özür dilerim ♡",
    ],
    slot: {
      morning: ["Günaydın demeden kavga mı? Güzel 🌞", "Tamam, kahveyi ben yapıyorum, tamam!"],
      work: ["Ben de çalışıyorum ama kimse sormuyor", "Tamam, molada konuşalım mı?"],
      evening: ["Akşam yemeğinden sonra tartışsak?", "Haklısın, hep haklısın. Mutlu musun?"],
      night: ["Tamam, yarın tartışırız, uyuyalım 🌙", "Ben yatağa gidiyorum, sen de gel"],
    },
    cond: {
      rain: ["Şemsiye vardı ama... rüzgâr vardı 🌂", "Tamam, bir daha alırım, söz"],
      snow: ["Kar topunu ben atmadım, rüzgâr attı ☃", "Tamam, eldiven takacağım"],
      cold: ["Ceketim vardı, gerçekten!", "Üşümüyorum... tamam biraz üşüyorum"],
    },
  },
};

const lastPicked = new Map<string, string>();

/* Aynı repliği üst üste söylemesin. */
function pickFrom(pool: string[], key: string): string {
  if (pool.length === 0) return "";
  const prev = lastPicked.get(key);
  const fresh = pool.length > 1 && prev ? pool.filter((l) => l !== prev) : pool;
  const line = fresh[Math.floor(Math.random() * fresh.length)];
  lastPicked.set(key, line);
  return line;
}

export function linesFor(kind: LineKind, scene: BuddyScene): string[] {
  const table = TABLE[kind];
  const slot = table.slot?.[scene.slot] ?? [];
  const cond = scene.condition ? table.cond?.[scene.condition] ?? [] : [];
  return [...slot, ...cond, ...table.base];
}

export function pickLine(kind: LineKind, scene: BuddyScene): string {
  return pickFrom(linesFor(kind, scene), kind);
}

/* Sırayla konuşan ikili için: iki tarafın da havuzunu birleştirir. */
export function pickDialog(scene: BuddyScene, who: 0 | 1, hero: boolean): string {
  if (!hero) return pickLine(who === 0 ? "squabbleHer" : "squabbleHim", scene);
  return pickLine(who === 0 ? "love" : "arrive", scene);
}
