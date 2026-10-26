import type { Condition, Slot } from "./scenes";

/* ============================================================
   Minik dostların replikleri

   Sol taraf HER (Berna), sağ taraf HIM (Burak). Her replik türünün
   iki ayrı sesi vardır; böylece hangi balonun kime ait olduğu
   karışmaz. Balonda da isim yazar.

   Her sesin içinde üç katman var:
     base — her zaman geçerli
     slot — saat dilimine özel (sabah / iş / akşam / gece)
     cond — hava durumuna özel (yağmur / kar / soğuk)
   ============================================================ */

export type BuddyScene = { slot: Slot; condition: Condition | null };

export type Who = 0 | 1;

export type LineKind =
  | "greet"
  | "click"
  | "idle"
  | "leave"
  | "bored"
  | "arrive"
  | "love"
  | "squabble";

type Voice = {
  base: string[];
  slot?: Partial<Record<Slot, string[]>>;
  cond?: Partial<Record<Condition, string[]>>;
};

const TABLE: Record<LineKind, Record<"her" | "him", Voice>> = {
  /* ---------- sahne değişince bir kez ---------- */
  greet: {
    her: {
      base: ["Buradayım Burak! Merak ettiysen diye söylüyorum ♡", "Ben geldim. Sen de fark ettin mi?"],
      slot: {
        morning: [
          "Günaydın! Perdeyi aç, güneş girdi ☀",
          "Kahve hazır mı? Ben bekliyorum...",
          "Bu saatte uyanan insan efsane olur",
          "Saçın dağılmış ama tatlı olmuş",
        ],
        work: [
          "Kolay gelsin! Mola da hakkın ♡",
          "Su iç. Evet, şimdi. Ben beklerim 💧",
          "Omuzların yukarıda, indir bakayım",
          "Kimse fark etmez ama ben fark ediyorum ♡",
        ],
        evening: [
          "Hoş geldin! Terlikleri çıkar ♡",
          "Ben hâlâ buradayım, bekledim",
          "Gün bitti sayılır, artık yavaşla",
          "Sana bir çay borcum var, söylemesi benden",
        ],
        night: [
          "İyi geceler... gözlerimi kapatıyorum",
          "Yarın erken kalkacağız, hadi uyu 🌙",
          "Gece düşünceleri yalan söyler, inanma",
          "Bu saatte ayaktaysan sebebi güzeldir umarım",
        ],
      },
      cond: {
        rain: ["Şemsiyeni al! Ben su geçirmezim 🌂", "Yağmur var, camdan bakalım mı?"],
        snow: ["Sarıl bana, üşüdüm ☃", "Kar yağıyor, dışarısı kartpostal"],
        cold: ["Brrr! Önce terlik, sonra konuşma", "Soğuk... sen içeri geç ♡"],
      },
    },
    him: {
      base: ["Buradayım, sen devam et ♡", "Ben buralardayım, gözüm üstünde"],
      slot: {
        morning: [
          "Günaydın Berna! Ben de yeni uyandım 🌞",
          "Kahveyi ben yapayım, sen otur",
          "Bugün plan ne? Bana her şey uyar",
        ],
        work: [
          "Kolay gelsin! Bir şey lazımsa söyle",
          "Bilgisayar da senin gibi ısındı",
          "Mola verince haber ver, yanındayım",
        ],
        evening: [
          "Hoş geldin! Bugün nasıl geçti?",
          "Akşam yemeğini birlikte yapalım mı?",
          "Ayakkabılar kenarda, dertler kapıda",
        ],
        night: [
          "İyi geceler Berna 🌙",
          "Ben nöbetteyim, sen uyu",
          "Bir yudum su, bir derin nefes, yatak",
        ],
      },
      cond: {
        rain: ["Şemsiye bende, merak etme 🌂", "Yağmur sesi en güzel beyaz gürültü 🌧"],
        snow: ["Kar topu atma, ben de kardanım ☃", "Dışarısı kartpostal ama soğuk"],
        cold: ["Ceketini giy dedim... giydin mi?", "Ellerim buz, ısıt beni 🧊"],
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
        "Burak, ben buradayım ♡",
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
    him: {
      base: [
        "Hey! Dikkat et, düşeceğim 😄",
        "Tıkladın, ben de zıpladım",
        "Yine mi sen? Hoşuma gitti ♡",
        "Bak, kalpler saçıldı ♡",
      ],
      slot: {
        morning: ["Sabahın bu saatinde bu enerji bana da geçti 🌞"],
        work: ["Molada tıklarsan kaçmam 🏃"],
        evening: ["Günü kurtardın, tebrikler ♡"],
        night: ["Uyku kaçtı, sorumlu sensin 🌙"],
      },
      cond: {
        rain: ["Islandım, ama tıklamaya devam 😅"],
        snow: ["Eldivenlerim nerede, dur ☃"],
        cold: ["Ellerim buz, ısıt beni 🧊"],
      },
    },
  },

  /* ---------- ara ara kendi kendine ---------- */
  idle: {
    her: {
      base: [
        "Bakışlarımı takip etme, utanırım 👀",
        "Bir nefes almayı unutma 🌬",
        "Zaman geçiyor, sen hep güzelsin",
        "Burak... ben sadece dekor değilim",
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
    him: {
      base: [
        "Sıkılırsan konuş, buradayım ♡",
        "Bir bardak su iç, sonra devam",
        "Ellerim cepte, keyfim yerinde",
        "Sen işini yap, ben seni izlerim",
      ],
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

  /* ---------- sahneden çıkarken ---------- */
  leave: {
    her: {
      base: ["Ben bir bakayım, hemen dönerim!", "Mutfağa bakıyorum, koku güzeldi"],
      slot: {
        morning: ["Kahve alıp geliyorum, sen bekle ☕"],
        work: ["Bir bardak su almaya gidiyorum, sen devam et"],
        evening: ["Mutfağa bakayım, hemen geliyorum"],
        night: ["Pijamalarımı giyip geliyorum 🌙"],
      },
      cond: {
        rain: ["Şemsiyeyi alıp geliyorum, ıslanmayayım 🌂"],
        snow: ["Atkımı alayım, yoksa donarım ☃"],
        cold: ["Çorap. Kesinlikle çorap lazım 🧦"],
      },
    },
    him: {
      base: ["Şöyle bir tur atıp geliyorum", "Bir şey unuttum, hemen dönerim"],
      slot: {
        morning: ["Ekmek alıp geliyorum, beş dakika 🥖"],
        work: ["Kısa bir mola, geliyorum"],
        evening: ["Balkona bakıp geliyorum"],
        night: ["Suyumu alıp geliyorum 🌙"],
      },
      cond: {
        rain: ["Şemsiyeyi kapıp geliyorum 🌂"],
        snow: ["Botlarımı giyip geliyorum ☃"],
        cold: ["Montu alıyorum, geliyorum 🧥"],
      },
    },
  },

  /* ---------- yalnız kalınca ---------- */
  bored: {
    her: {
      base: [
        "Hâlâ gelmedi... ben burada çimleniyorum",
        "Sıkıldım. Ciddiyim. Çok sıkıldım.",
        "*iç çeker* Nerede kaldı bu?",
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
    him: {
      base: [
        "Kendi kendime konuşmaya başladım, hayırlısı",
        "Gelmezse ben de uyurum 😴",
        "Burada beklemek de bir iş sayılır mı?",
      ],
      slot: {
        morning: ["Sabah sabah nerede kaldı bu?"],
        work: ["Toplantı bitmedi herhalde"],
        evening: ["Yemekten önce gelir umarım"],
        night: ["Bu saatte gelen olur mu ki?"],
      },
      cond: {
        rain: ["Yağmur var, belki sıkıştı 🌧"],
        snow: ["Bu soğukta yolu uzatmıştır ☃"],
        cold: ["Üşümeye başladım, hadi ama"],
      },
    },
  },

  /* ---------- öbürü gelince ---------- */
  arrive: {
    her: {
      base: ["Geldim! Geç kalmadım, sen erken geldin!", "Yolda bir kedi vardı, ondan geciktim"],
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
    him: {
      base: ["Geldim! Geç kalmadım, sen erken geldin!", "Bak kim geldi ♡", "Yolda bir kedi vardı, ondan geciktim"],
      slot: {
        morning: ["Günaydın Berna! Uyandım, geldim 🌞"],
        work: ["Molada kaçtım geldim, kimse görmedi"],
        evening: ["İşten çıktım, direkt sana geldim ♡"],
        night: ["Gece yarısı buluşması, çok romantik 🌙"],
      },
      cond: {
        rain: ["Şemsiyem vardı ama rüzgâr vardı 🌂"],
        snow: ["Kardan adam gibi geldim, bak ☃"],
        cold: ["Ellerim buz, ısıt beni 🧊"],
      },
    },
  },

  /* ---------- sevgi anı ---------- */
  love: {
    her: {
      base: [
        "Seni seviyorum, biliyorsun ♡",
        "İyi ki varsın. Gerçekten.",
        "Kalbim hep seninle ♡",
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
    him: {
      base: [
        "Seni seviyorum Berna ♡",
        "Burada seni bekleyen bir şey var ♡",
        "İyi ki varsın. Gerçekten.",
      ],
      slot: {
        morning: ["Günaydın demek bile güzel, senin sayende ☀"],
        work: ["Bugünü seninle bölmek isterdim ♡"],
        evening: ["Gün bitti, en güzel kısmı sen kaldın"],
        night: ["İyi geceler, kalbim sende 🌙"],
      },
      cond: {
        rain: ["Yağmurda seninle yürümek güzel 🌧♡"],
        snow: ["Kar yağarken elini tutmak isterdim ☃"],
        cold: ["Üşüyorsan gel, ben ısıtırım ♡"],
      },
    },
  },

  /* ---------- atışma: sırayla bir o bir o ---------- */
  squabble: {
    her: {
      base: [
        "Ben haklıydım, kabul et.",
        "Bana öyle bakma!",
        "Sen böyle yapınca sinirleniyorum.",
        "Yine mi kaşlarını çattın?",
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
    him: {
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
  },
};

const lastPicked = new Map<string, string>();

/* Aynı sesin aynı repliği üst üste söylemesini engeller. */
function pickFrom(pool: string[], key: string): string {
  if (pool.length === 0) return "";
  const prev = lastPicked.get(key);
  const fresh = pool.length > 1 && prev ? pool.filter((l) => l !== prev) : pool;
  const line = fresh[Math.floor(Math.random() * fresh.length)];
  lastPicked.set(key, line);
  return line;
}

export function linesFor(kind: LineKind, scene: BuddyScene, who: Who): string[] {
  const voice = TABLE[kind][who === 0 ? "her" : "him"];
  const slot = voice.slot?.[scene.slot] ?? [];
  const cond = scene.condition ? voice.cond?.[scene.condition] ?? [] : [];
  return [...slot, ...cond, ...voice.base];
}

export function pickLine(kind: LineKind, scene: BuddyScene, who: Who): string {
  return pickFrom(linesFor(kind, scene, who), `${kind}:${who}`);
}

/* Balonda görünecek isim. */
export const NAMES = ["Berna", "Burak"] as const;
