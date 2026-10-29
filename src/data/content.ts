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
   Birlikte geçen zaman

   Başlangıç tarihi burada varsayılan olarak durur; Ayarlar sayfasından
   değiştirilebilir ve seçim localStorage'da saklanır. Biçim: YYYY-MM-DD.
   ============================================================ */

export const TOGETHER_SINCE_DEFAULT = "2025-10-31";

export const TOGETHER = {
  label: "Birlikteyiz",
  hint: "İlk günden bu yana",
};

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
  { id: "p1", time: "07:30", label: "Burak'ı sev", note: "Sabah koşusu gibi düşün, 10 dakika" },
  { id: "p2", time: "09:45", label: "Bol su iç", note: "Bunu da sevmek zorunda değilsin ama iç" },
  { id: "p3", time: "13:15", label: "Öğle arası: Burak'ı sev", note: "Isınma turu, kısa tut" },
  { id: "p4", time: "17:30", label: "Bol su iç (2. raunt)", note: "Susuzluğu bu kadar erteleme" },
  { id: "p5", time: "21:45", label: "Günü Burak'la kapat", note: "Uyumadan önce, en kolayı bu" },
];

export type PlanItem = { id: string; time: string; label: string; note?: string };
export type Surprise = {
  id: string;
  emoji: string;
  tag: string;
  title: string;
  text: string;
  /** Yapılacak somut şey — süs cümlesi değil. */
  action: string;
  /** Yaklaşık süre. */
  minutes: number;
};
export type Memory = { id: string; image: string; caption: string; date: string; place: string };
export type Milestone = { when: string; what: string; desc: string };

export const BOTTOM_CARDS = [
  {
    id: "kahve",
    kind: "coffee" as const,
    image: kahve,
    tag: "Günün kahvesi",
    title: "Senin için hazır.",
    text: "Kalkmasana güneşim…",
  },
  {
    id: "surpriz",
    kind: "gift" as const,
    image: manzara,
    tag: "Bugün",
    title: "Sana sürprizim var.",
    text: "Sürprizler'e bir bak.",
  },
  {
    id: "ani",
    kind: "memory" as const,
    image: manzarayaKarsi,
    tag: "Mini anılar",
    title: "Seninle her an güzel.",
    text: "Biriktirdiğimiz her kare.",
  },
  {
    id: "pati",
    kind: "cat" as const,
    image: manzarayaTek,
    tag: "Minik patiler",
    title: "Sana benzeyen kedi.",
    text: "Patili bir gün dileğiyle.",
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

/* ============================================================
   "Aç bunu ne zaman..." mektupları

   Her zarf bir ana ait: kendini kötü hissettiğinde, özlediğinde,
   kızdığında, başardığında... Kilitli durur, tıklanınca açılır.
   Kural: hepsi onu rahatlatmak için yazıldı, ders vermek için değil.
   ============================================================ */

export type KeptLetter = {
  id: string;
  /** Zarfın üstündeki koşul — "Kendini kötü hissettiğinde aç" */
  when: string;
  emoji: string;
  /** Kısa tonda ipucu. */
  hint: string;
  title: string;
  paragraphs: string[];
};

export const KEPT_LETTERS: KeptLetter[] = [
  {
    id: "kotu",
    when: "Kendini kötü hissettiğinde aç",
    emoji: "🌧️",
    hint: "Hazır değilsen bırak, sonra açarsın",
    title: "Bugün değilse de yarın",
    paragraphs: [
      "Bilmeni istediğim şey şu: böyle hissettiğin için hiçbir şeyi kaçırmıyorsun. Sadece bir gün zor geçiyor, o kadar.",
      "Bir şeyi başaramadığın için, birini kırdığın için ya da sadece yorgun olduğun için kötü hissediyorsan: seni bu hâlinle de seviyorum. Üstelik dağınık hâlin bende ayrı bir yer kaplıyor, biliyorsun.",
      "Bugün yapman gereken tek şey var: kendine, hiç tanımadığın birine davranacağın kadar iyi davran. Su iç, bir şey ye, üstünde sıcak bir şey olsun. Gerisi yarın önemli olur.",
      "Ben buradayım. İstersen yaz, istersen sadece sessizce otur, ikisi de olur.",
    ],
  },
  {
    id: "ozledim",
    when: "Beni özlediğinde aç",
    emoji: "🌙",
    hint: "Yanında olmasam da burada",
    title: "Uzaklık bir tek metre sayıyor",
    paragraphs: [
      "Seni özlediğin anda benim de aklımda olduğunu bilmeni istiyorum. Bu, seni merak ettiğim anlamına geliyor; sık sık.",
      "Sesini duymadığım bir gün geçtiğinde, günün en boş yerinde bir şey eksik kalıyor. Kolaymış gibi davranmıyorum, gerçekten eksik kalıyor.",
      "Bu yazıyı okurken bir saniyeliğine gözlerini kapa ve bir şey söyleyeyim: iyi ki varsın. İyi ki bu kadar uzağında olmadığım bir dünyada karşılaşmışız.",
      "Şimdi bana yaz. Tek bir kelime. \"Özledim\" bile olur; ben ondan çok şey anlarım.",
    ],
  },
  {
    id: "kizgin",
    when: "Bana kızdığında aç",
    emoji: "🌶️",
    hint: "Haklıysan da haksızsan da oku",
    title: "Kızgın olmak pekâlâ, ama bana",
    paragraphs: [
      "Önce şunu söyleyeyim: neye kızdıysan dinlemek istiyorum. Savunmaya geçmeden, kesmeden, \"ama\" demeden.",
      "Bende gerçekten kötü olan bir şey varsa söyle — düzeltmeye çalışacağım. Her konuda başarılı olacağımı söyleyemem, ama denemeyi hiç bırakmayacağım.",
      "Bir de şunu hatırla: benimle kavga edebilmen, benimle bir gelecek görmen demek. Ben de bunu böyle okuyorum ve ciddiye alıyorum.",
      "Kızgınken bir şey yazma istersen. Önce bu sayfayı oku, sonra istersen yaz. Ben sabırla beklerim, bir yere gitmiyorum.",
    ],
  },
  {
    id: "basarili",
    when: "Bir şeyi başardığında aç",
    emoji: "🎉",
    hint: "Kutlamak için bahane arıyordum",
    title: "Bunu ben de kutlayacağım",
    paragraphs: [
      "Şu an sana sarılmak isterdim ama elimden gelen bu: varlığınla gurur duyduğumu yazmak.",
      "Bunu sen yaptın. Ne şans, ne tesadüf. Kimse sana vermedi, sen aldın.",
      "Ama bir şeyi de söylemem lazım: ben senin başarıların için değil, sen olduğun için buradayım. Yine de bugün, sadece bugün, biraz da bu yaptığın şeyi kutlayalım.",
      "Bana anlat. Uzun anlat, en ince ayrıntısına kadar. Dinlemek için boş bir yer ayırdım.",
    ],
  },
  {
    id: "uyuyamiyorum",
    when: "Uyuyamadığında aç",
    emoji: "🌌",
    hint: "Gece yarısı için yazıldı",
    title: "Şu an uyumak zorunda değilsin",
    paragraphs: [
      "Gece yarısı hiçbir şeyi çözmek için iyi bir zaman değil. Şu an aklındaki her şey, sabah olduğundan daha büyük ve daha karanlık görünüyor. Bu senin hatan değil, saatle ilgili bir şey.",
      "Nefes al. Dört say, tut, dört say, ver. Bir kere değil, dört kere. Biliyorum bunlar klişe, ama işe yarıyor.",
      "Bir şeyi kendine tekrar edebilirsin: bugün elimden geleni yaptım. Yarın yapılacaklar yarına ait.",
      "Uyuyamıyorsan uyanık kal, ama telefonu bir köşeye bırak. Ben burada olduğumu bilmen için buradayım; mesaj atarsan görmeyebilirim ama sabah ilk işim cevap vermek olacak.",
    ],
  },
  {
    id: "uzgun",
    when: "Ağlamak istediğinde aç",
    emoji: "🕯️",
    hint: "Sessizce okunacak",
    title: "Ağlamak da bir iştir",
    paragraphs: [
      "Birinin yanında ağlayabilmek, o kişiye güvenmek demekmiş. Ben o kişi olmak istiyorum, yanında olmayı değil; o kişi olmayı.",
      "Şimdi bir şey yapman gerekmiyor. Toplanman gerekmiyor. Güçlü görünmen gerekmiyor.",
      "Sadece nefes al ve bu birkaç satırı oku. Ben, senin terk edilmeyecek biri olduğunu bilmeni istiyorum. Yorgunken de, susarken de, hiçbir şey anlatmazken de.",
      "Hazır olduğunda yaz. Yazmak istemiyorsan yazma. Ben o zamanı fark ederim.",
    ],
  },
];

/* Her gün bir "seni sevme sebebi" — havuzdan sırayla. */
export const DAILY_REASONS = [
  "Gülüşünün bir odayı ısıtması.",
  "En basit şeyi bile bana özel yapman.",
  "Yanında kendim olabilmem.",
  "Bir şeyi anlatırken gözlerinin büyümesi.",
  "Kızdığında bile benden vazgeçmemen.",
  "Bana iyi geldiğini bilmeden iyi gelmen.",
  "Sabahları sesinin o ilk hâli.",
  "Yorgunken bile nazik kalabilmen.",
  "Bir şeye gerçekten inandığında kimsenin seni durduramaması.",
  "Bana \"iyi ki\" dedirten o küçük şeyler.",
  "Saçını kulağının arkasına atma şeklin.",
  "Bir şeyi beğendiğinde gözlerinin parlaması.",
  "Yalnız olmadığımı hissettirmen.",
  "Sana ait olan her şeyin bende ev gibi durması.",
  "Hâlâ ilk günkü gibi heyecanlanman.",
  "En saçma esprilerime bile gülmen.",
  "Bir konuda haklı olduğunu bilince vazgeçmemen.",
  "Benden önce kendine kızıp sonra bana sarılman.",
  "Beni dinlerken gerçekten dinlemen.",
  "Uzakta olsan da aklımda kalmayı başarman.",
  "Sessizliğinin bile rahatlatıcı olması.",
  "Benim için endişelenmen, bunu belli etmen.",
  "Bir şeyi yapmaya karar verince güzel yapman.",
  "Sana sarıldığımda dünyanın susması.",
  "Küçük şeylere sevinmeyi bırakmaman.",
  "Bana kendimi daha iyi biri gibi hissettirmen.",
  "Bir günü berbat geçse de yarına kızabilmen.",
];

/* ============================================================
   "Sen olsan hangisini seçerdin?" — mini quiz
   ============================================================ */

export type QuizQuestion = {
  id: string;
  q: string;
  options: string[];
  /** Doğru cevabın index'i (Burak'ın cevabı). */
  answer: number;
  /** Cevaplandıktan sonra gösterilen kısa not. */
  note: string;
};

export const QUIZ: QuizQuestion[] = [
  {
    id: "q1",
    q: "Benim için en zor şey hangisi?",
    options: ["Bir şeyi yarım bırakmak", "Yardım istemek", "Sabah erken kalkmak", "Cevap vermeyi beklemek"],
    answer: 1,
    note: "Hâlâ öğreniyorum. Ama sana sormak kolay gelmeye başladı, bu iyiye işaret.",
  },
  {
    id: "q2",
    q: "Sana ilk dikkat ettiğim şey neydi?",
    options: ["Gülüşün", "Sesin", "Konuşma şeklin", "Bana bakışın"],
    answer: 0,
    note: "Fotoğrafta bile aynı. Hâlâ her gün yeniden dikkatimi çekiyor.",
  },
  {
    id: "q3",
    q: "Hangi anı en çok saklıyorum?",
    options: ["İlk buluşma", "İlk kavga", "İlk uzun yol", "İlk 'seni seviyorum'"],
    answer: 2,
    note: "O yolda şarkı seçmekten hiç bitmeyen bir güzergâh vardı. Keşke bitmeseydi.",
  },
  {
    id: "q4",
    q: "Bir gün sonumuza dair hayalimde ilk ne var?",
    options: ["Büyük bir ev", "Bir kedi", "Sabah kahvaltısı", "Uzak bir yol"],
    answer: 2,
    note: "Küçük şeyler. Sana en çok yakışan mutluluk sessiz olanı.",
  },
  {
    id: "q5",
    q: "Bana kızdığında ben ne yaparım?",
    options: ["Susar beklerim", "Hemen konuşmak isterim", "Şaka yaparım", "Uzaklaşırım"],
    answer: 1,
    note: "Belki de yapmamam gerek. Sen söyle, ona göre.",
  },
  {
    id: "q6",
    q: "Söylemesi en zor ama en doğru cümlem hangisi?",
    options: ["Seni seviyorum", "Sana ihtiyacım var", "Sensiz yapamam", "Haklısın"],
    answer: 1,
    note: "Bunu söylemek kolay değil ama doğru. Söyledim sayılır mı?",
  },
  {
    id: "q7",
    q: "Seninle en çok neye gülerim?",
    options: ["Espri yaptığında", "Kızdığında", "Uykulu hâline", "Kendinle dalga geçtiğinde"],
    answer: 2,
    note: "O hâlin için her şeyi verirsin zannediyorsun ama haberin yok.",
  },
  {
    id: "q8",
    q: "En sevdiğim ortak planımız hangisi?",
    options: ["Bir şey izlemek", "Yürüyüşe çıkmak", "Bir yer keşfetmek", "Hiçbir şey yapmamak"],
    answer: 3,
    note: "Hiçbir şey yapmamak, seninle. Kulağa en güzel gelen plan.",
  },
];


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

export const SURPRISE_HINT = "Kutuyu aç";
export const SURPRISE_SUB = "bugünün sürprizi ikimize ait";

/* Her gün biri açılır.
   Ortak kural: hepsi bir şekilde bana ulaşmanla bitiyor. Telefonu bırakıp
   kaybolmak yok; sürprizler aşkımızı ve aramızdaki iletişimi büyütsün. */
export const SURPRISES: Surprise[] = [
  {
    id: "sarki",
    emoji: "🎧",
    tag: "Aynı anda",
    title: "Aynı şarkı, aynı dakika",
    text: "Bu akşam kulaklığını tak ve 'İçim Dolu Her Şeyim'i baştan başlat. Ben de tam o anda başlatacağım, ikimiz aynı şarkıyı dinleyeceğiz.",
    action: "Şarkı bitince bana ilk aklına gelen cümleyi yaz. Ne olursa olsun, tek satır.",
    minutes: 4,
  },
  {
    id: "ilkmesaj",
    emoji: "🌅",
    tag: "Sabah",
    title: "Günün ilk mesajı bana",
    text: "Sabah gözünü açar açmaz, hiçbir şeye bakmadan önce bana bir mesaj at. Tek kelime bile olur.",
    action: "İlk mesajın bana gelsin. Ben de seninkini bekliyor olacağım.",
    minutes: 2,
  },
  {
    id: "ses",
    emoji: "🎙️",
    tag: "Sesin",
    title: "Sesini duyayım",
    text: "Bugün bana kısa bir ses kaydı gönder. Ne söylediğin önemli değil; günün nasıl geçiyor, aklında ne var, saçma bir şey...",
    action: "Kaydı gönder. Ben de aynı gün sana bir tane göndereceğim.",
    minutes: 2,
  },
  {
    id: "sevgi5",
    emoji: "💗",
    tag: "Sevgi",
    title: "Beni sevdiğin 5 şey",
    text: "Bende sevdiğin beş şeyi yaz. Büyük şeyler olmasına gerek yok; en saçması en güzeli olur.",
    action: "Listeyi bana yolla. Ben de seninkini yazıp göndereceğim.",
    minutes: 5,
  },
  {
    id: "foto",
    emoji: "📷",
    tag: "Anı",
    title: "Galeriden bir kare seç",
    text: "Galerinde bizimle ilgili en sevdiğin kareyi bul. Silmeye kıyamadığın o kare.",
    action: "Fotoğrafı bana at ve neden o kare olduğunu tek satırda anlat.",
    minutes: 6,
  },
  {
    id: "sesliarama",
    emoji: "📞",
    tag: "Sesli",
    title: "Beş dakika sesimizi duyalım",
    text: "Bugün beş dakikanı bana ayır, telefonda konuşalım. Konu planlamayalım, sadece sesini duyayım.",
    action: "Müsait olduğun an yaz, ben arayayım ya da sen ara.",
    minutes: 5,
  },
  {
    id: "soru",
    emoji: "💭",
    tag: "Soru",
    title: "Cevabı merak ettiğim soru",
    text: "İlk günlerimizde beni en çok neye güldürdüğümü hatırlıyor musun? Aklına ilk gelen anı yaz.",
    action: "Cevabı bana yaz. Ben de kendi cevabımı yazacağım, söz.",
    minutes: 3,
  },
  {
    id: "yemek",
    emoji: "🍝",
    tag: "Mutfak",
    title: "Aynı tarifi, ayrı mutfaklarda",
    text: "Bu akşam basit bir makarna yap. Abartmaya gerek yok; aynısını ben de yapacağım.",
    action: "Tabak hazır olunca fotoğrafını çek ve bana gönder. Sofrada yalnız olmayacaksın.",
    minutes: 25,
  },
  {
    id: "gecemesaji",
    emoji: "🌙",
    tag: "Gece",
    title: "İyi geceler + bugünün en güzel anı",
    text: "Uyumadan önce bana iyi geceler yaz ve bugünün en güzel anını tek satırda anlat.",
    action: "Mesajı yolla. Ben de sana kendi günümden bir şey yazacağım.",
    minutes: 3,
  },
  {
    id: "bulusma",
    emoji: "🗓️",
    tag: "Plan",
    title: "Bir sonraki buluşmaya bir şey ekle",
    text: "Bir sonraki buluşmamıza küçük bir şey ekleyelim. Yapacak bir şey, gidilecek bir yer, denenecek bir tatlı...",
    action: "Fikrini bana yaz. Ben de kendi fikrimi ekleyeceğim ve ikisini birleştireceğiz.",
    minutes: 4,
  },
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
