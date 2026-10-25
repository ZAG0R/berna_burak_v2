import arkaplan from "../assets/arkaplan.webp";
import avatarBurak from "../assets/avatar_burak.webp";
import avatarBerna from "../assets/avatar_berna.webp";
import kahve from "../assets/kahve.webp";
import manzara from "../assets/manzara.webp";
import manzarayaKarsi from "../assets/manzaraya_karsi.webp";
import manzarayaTek from "../assets/manzaraya_tek.webp";

/* ============================================================
   Varlıklar
   ============================================================ */

export const IMAGES = {
  arkaplan,
  avatarBurak,
  avatarBerna,
  kahve,
  manzara,
  manzarayaKarsi,
  manzarayaTek,
} as const;

/* ============================================================
   Kişiler ve varsayılanlar
   ============================================================ */

export type Person = { key: "him" | "her"; name: string; avatar: string; emoji: string };

export const DEFAULT_PEOPLE: Person[] = [
  { key: "him", name: "Burak", avatar: avatarBurak, emoji: "👑" },
  { key: "her", name: "Berna", avatar: avatarBerna, emoji: "♡" },
];

export const DEFAULT_CITY = "Adana";
export const DEFAULT_WEATHER = { temp: 22, desc: "Parçalı bulutlu", icon: "partly" as const };

/* ============================================================
   Ana sayfa
   ============================================================ */

export const HERO = {
  title: "Günaydın",
  titleAccent: "Berna",
  sub: "Yeni bir gün, yeni güzel anlar ve sen... İyi ki varsın. ♡",
  chips: [
    { icon: "sun", text: "Bugün güzel geçecek" },
    { icon: "heart", text: "Seninle her gün özel" },
    { icon: "star", text: "Küçük mutluluklar" },
  ],
};

export const QUOTE = {
  text: "Bugün kendin için iyi bir şey yapmayı unutma.",
  by: "— Burak",
};

export const PLAN_ITEMS: PlanItem[] = [
  { id: "p1", time: "07:30", label: "Burak'ı sev (zorla değil, istersen)", note: "Sabah koşusu gibi düşün, 10 dakika" },
  { id: "p2", time: "09:45", label: "Bol su iç", note: "Bunu da sevmek zorunda değilsin ama iç" },
  { id: "p3", time: "13:15", label: "Burak'ı bir daha sev", note: "Öğle arası, ısınma turu" },
  { id: "p4", time: "17:30", label: "Bol su iç (2. raunt)", note: "Susuzluğu bu kadar erteleme" },
  { id: "p5", time: "21:45", label: "Burak'ı günün sonunda sev", note: "Uyumadan önce, en kolayı bu" },
];

export type PlanItem = { id: string; time: string; label: string; note?: string };
export type SurpriseIdea = { emoji: string; title: string; text: string };
export type Memory = { id: string; image: string; caption: string; date: string; place: string };
export type Milestone = { when: string; what: string; desc: string };

export const BOTTOM_CARDS = [
  {
    id: "kahve",
    kind: "coffee" as const,
    image: kahve,
    tag: "Günün kahvesi",
    title: "senin için hazır.",
    text: "Kalkmasana minik güneşim...",
  },
  {
    id: "surpriz",
    kind: "gift" as const,
    image: manzara,
    tag: "Bugün",
    title: "sana güzel bir sürpriz var...",
    text: "Kutuyu açmak için Sürprizler'e bak.",
  },
  {
    id: "ani",
    kind: "memory" as const,
    image: manzarayaKarsi,
    tag: "Mini anılar",
    title: "Seninle her an daha güzel...",
    text: "Biriktirdiğimiz her kare.",
  },
] as const;

/* ============================================================
   Mektup
   ============================================================ */

export const LETTER_PARAGRAPHS = [
  "Günaydın güzelim,",
  "Uyandığın anı hayal ediyorum: gözlerini ovuşturuyorsun, saçların dağınık, ve o ilk bakışın var ya... İşte dünyanın en güzel manzarası orada başlıyor.",
  "Bugün sana tek bir şey diliyorum: kendine karşı nazik ol. Yorulduğunda mola ver, güldüğünde içinden geldiği gibi gül, canın istediğinde hiçbir şey yapma. Çünkü sen, bir şeyler başardığın için değil, sadece var olduğun için değerlisin.",
  "Küçük şeyleri hatırla: sıcak kahve, pencere kenarı, çalan güzel bir şarkı, ve birinin seni düşünüyor olması. O birisi bu sabah da seni düşündü.",
  "Ne zaman kendini yalnız hissedersen, bu sayfayı aç. Çünkü burada, bu küçük dünyada, senin adın her yerde geçiyor.",
  "İyi ki varsın. İyi ki bizsin.",
];

export const LETTER_SIGNOFF = "Seni çok seven,\nBurak ♡";

export const REASONS = [
  "Gülüşün bir odayı ısıtıyor.",
  "En basit şeyi bile özel yapıyorsun.",
  "Yanında insan kendisi gibi olabiliyor.",
  "Sabahları seninle daha kolay başlıyor.",
  "Kalbin hep doğru yerde atıyor.",
  "Seninle susmak bile güzel.",
];

export const NOTE_CARDS = [
  { label: "Bugünün notu", text: "Küçük şeyler büyük mutluluklar getirir. Onları kaçırma." },
  { label: "Hatırla", text: "Yavaşladığın gün, kaybettiğin gün değildir." },
];

/* ============================================================
   Sürprizler
   ============================================================ */

export const SURPRISE = {
  hint: "Kutuyu aç",
  sub: "bir dokunuş yeter",
  title: "Küçük bir sürpriz",
  text: "Bugünün sürprizi: bu akşam telefonunu bir kenara bırak, en sevdiğin şarkıyı aç ve pencereden gökyüzüne bak. Ben de aynısını yapacağım. Aynı gökyüzü, aynı şarkı, aynı biz.",
  cta: "Yeniden kapat",
};

export const SURPRISE_IDEAS: SurpriseIdea[] = [
  { emoji: "☕", title: "Kahve falı", text: "Birlikte içelim, fincanıma bakıp geleceği uyduralım." },
  { emoji: "🎬", title: "Film gecesi", text: "Aynı filmi aynı anda başlatalım, telefonda yorumlayalım." },
  { emoji: "🧺", title: "Piknik", text: "Battaniye, iki sandviç, güneş. Fazlasına gerek yok." },
  { emoji: "✉️", title: "El yazısı mektup", text: "Postaya verilen bir mektup, ekrandan daha ağır." },
  { emoji: "🌌", title: "Yıldızların altında", text: "Işıklar kapalı, battaniye açık, gökyüzü konuşsun." },
  { emoji: "🍝", title: "Birlikte yemek", text: "Aynı tarifi seçip aynı anda pişirmek." },
  { emoji: "🎶", title: "Ortak çalma listesi", text: "İkimizin şarkılarından tek bir liste yapalım." },
  { emoji: "📷", title: "Anı çekimi", text: "Bugünü kaydet. Yarın gülerek bakacağız." },
];

export const COUNTDOWN_LABEL = "Bir sonraki buluşmamıza";

/* ============================================================
   Anılar
   ============================================================ */

export const MEMORIES: Memory[] = [
  { id: "m1", image: manzara, caption: "İlk birlikte izlediğimiz gün batımı", date: "2024", place: "Sahil" },
  { id: "m2", image: manzarayaKarsi, caption: "Sana sırtımı yasladığım o an", date: "2024", place: "Yol" },
  { id: "m3", image: manzarayaTek, caption: "Sen giderken arkandan bakışım", date: "2025", place: "Pencere" },
  { id: "m4", image: kahve, caption: "İki fincan, tek masa", date: "2025", place: "Kafe" },
  { id: "m5", image: arkaplan, caption: "Seninle her yer ev", date: "2025", place: "Ev" },
  { id: "m6", image: avatarBerna, caption: "Bu gülüş için her şey", date: "2026", place: "Her yer" },
];

export const MILESTONES: Milestone[] = [
  { when: "İlk gün", what: "İlk mesaj", desc: "Kısa bir 'merhaba' ile başlayan, hâlâ devam eden en uzun cümlemiz." },
  { when: "Sonra", what: "İlk kahve", desc: "Konuşacak konu bitmedi, kahve bitti. O gün anladım." },
  { when: "Daha sonra", what: "İlk yolculuk", desc: "Yol boyunca şarkı seçmekten hiç bitmeyen bir güzergâh." },
  { when: "Sonraki", what: "İlk 'seni seviyorum'", desc: "Fazla planlı değildi, fazla doğruydu." },
  { when: "Bugün", what: "Hâlâ ilk günkü gibi", desc: "Aynı heyecan, aynı gülüş, aynı kişi." },
];

/* ============================================================
   Müzik
   ============================================================ */

export type Song = {
  id: string;
  title: string;
  artist: string;
  cover: string;
  bpm: number;
  root: number;
  chords: number[][];
  mood: string;
  audioFile?: string; // Gerçek MP3 dosyası için
};

export const SONGS: Song[] = [
  {
    id: "s1",
    title: "İçi Dolu Her Şeyim",
    artist: "Kaan Boşnak",
    cover: manzarayaKarsi,
    bpm: 84,
    root: 60,
    chords: [
      [0, 4, 7, 11],
      [-3, 0, 4, 9],
      [-5, 2, 5, 9],
      [-7, 0, 4, 7],
    ],
    mood: "romantik",
    audioFile: "images/icim-dolu-her-seyim.mp3",
  },
  {
    id: "s2",
    title: "Aşk",
    artist: "Tarkan",
    cover: manzarayaTek,
    bpm: 86,
    root: 62,
    chords: [
      [0, 5, 9, 12],
      [-2, 3, 7, 10],
      [-4, 0, 5, 9],
      [-5, 2, 7, 11],
    ],
    mood: "tutkulu",
  },
  {
    id: "s3",
    title: "Gel",
    artist: "Barış Manço",
    cover: manzarayaKarsi,
    bpm: 104,
    root: 64,
    chords: [
      [0, 4, 7, 14],
      [-3, 4, 9, 12],
      [-5, 0, 7, 11],
      [-1, 4, 9, 14],
    ],
    mood: "nostaljik",
  },
  {
    id: "s4",
    title: "Sevda Yanığı",
    artist: "Müslüm Gürses",
    cover: arkaplan,
    bpm: 74,
    root: 57,
    chords: [
      [0, 3, 7, 10],
      [-4, 3, 8, 12],
      [-2, 5, 9, 12],
      [-5, 2, 7, 10],
    ],
    mood: "hüzünlü",
  },
  {
    id: "s5",
    title: "Senin Olmak Güzel",
    artist: "Ceylan",
    cover: kahve,
    bpm: 90,
    root: 65,
    chords: [
      [0, 4, 7, 12],
      [-3, 2, 7, 11],
      [-5, 0, 4, 9],
      [-7, 0, 5, 12],
    ],
    mood: "neşeli",
  },
];

/* ============================================================
   Ambiyans
   ============================================================ */

export type AmbienceId = "nature" | "rain" | "birds" | "waves" | "sunrise" | "night";

export const AMBIENCES: { id: AmbienceId; label: string; icon: string; hint: string }[] = [
  { id: "nature", label: "Doğa Sesleri", icon: "leaf", hint: "Rüzgâr ve yapraklar" },
  { id: "rain", label: "Yağmur", icon: "rain", hint: "Cama vuran damlalar" },
  { id: "birds", label: "Kuş Sesleri", icon: "bird", hint: "Sabah cıvıltısı" },
  { id: "waves", label: "Deniz", icon: "waves", hint: "Kıyıya vuran dalgalar" },
  { id: "sunrise", label: "Gün doğumu", icon: "sunrise", hint: "Sıcak bir örtü" },
  { id: "night", label: "Gece", icon: "moon", hint: "Cırcır ve sessizlik" },
];

/* ============================================================
   Ayarlar
   ============================================================ */

export const ACCENTS = [
  { id: "amber", label: "Gün doğumu", colors: ["#ffb35c", "#f4728f"] },
  { id: "rose", label: "Gül", colors: ["#ff8fab", "#c084fc"] },
  { id: "mint", label: "Nane", colors: ["#7fe3c4", "#7cc7ff"] },
  { id: "lilac", label: "Lila", colors: ["#c4a4ff", "#ff9ec4"] },
] as const;

export const MOOD_LABELS = [
  "Bugün daha iyi hissedeceksin",
  "Bugün senin günün",
  "Bugün hafifleyeceksin",
  "Bugün güzel bir gün",
];

export const TIPS = [
  "Derin bir nefes al. Şimdi bir tane daha.",
  "Omuzlarını indir, çeneni gevşet.",
  "Gözlerini 20 saniye kapat, sadece nefesine odaklan.",
  "Bir bardak su iç. Şimdi.",
  "Kendine bir iltifat et. İçinden bile olsa.",
  "Pencereden dışarı bak, en uzaktaki şeyi bul.",
];
