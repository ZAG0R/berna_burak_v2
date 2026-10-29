# Sadece UI — başka oturuma verilecek prompt

Aşağıdaki bloğu kopyalayıp yeni sohbetin başına yapıştır. Klasörü de bağlarsan
Claude kodu kendisi okur; bağlamazsan bu metin tek başına yeterli.

---

## KOPYALA — BAŞLANGIÇ

Kız arkadaşım Berna için yaptığım "Günaydın Berna" web uygulamasının arayüzünü
geliştirmeye devam ediyorum. Sana sadece **UI tarafını** anlatıyorum; ses motoru,
veri, derleme detayları senin konun değil.

**Kullanıcı:** Burak, Türkçe. Kısa özet değil, ayrıntılı ve gerekçeli açıklama
istiyorum. Görsel kaliteye (tasarım sistemi, animasyon, tipografi, renk uyumu)
takıntılıyım; yarım işi kabul etmiyorum. Bir şey bozuksa kök nedeni bilmek
istiyorum. "Düzelttim" demeden önce gerçekten ölç ve göster.

**Proje klasörü:** C:\Users\Burak\Desktop\sevgili
**Teknoloji:** Vite + React 18 + TypeScript + framer-motion + three.js
(stil: saf CSS, `src/styles/global.css` · `components.css` · `sections.css` ·
`extras.css`). Tailwind yok, CSS-in-JS yok.

### 1) Genel his

Tek sayfalık, koyu, sinematik bir "dashboard" gibi davranıyor ama aslında bir
hediye. Arka planda illüstrasyon var, önünde cam panelden kartlar. Lüks ve sıcak
hissi vermeli: altın vurgular, el yazısı başlıklar, yumuşak gölgeler, hafif
blur'lu paneller. Ne kurumsal ne çocuksu — "birinin özenle hazırladığı hediye"
hissi.

### 2) Ekran iskeleti

Solda sabit kenar çubuğu, sağda içerik. Üstte ince bir bar (sadece mobil menü
düğmesi + ses ve sürpriz ikonları). İçerik alanı iki sütuna ayrılıyor: geniş
sol blok ve sağda dar bir kart sütunu.

**1920×1080'de ölçülen gerçek değerler** (bunlar referans, bozma):
- Kenar çubuğu: 0–245px genişlik, tam yükseklik 1080
- Üst bar: 275px'ten başlıyor, ince
- İçerik ızgarası: x 268, genişlik 1628
- Sağ kart sütunu: x 1477, genişlik 419
  - Hava durumu kartı: y 308, h 102
  - Alıntı kartı: y 418, h 100
  - Günün planı kartı: y 527, h 322
- Alt kart şeridi: x 269, y 861, h 98 (üç kart yan yana), sağda müzik çalar
  x 1498, h 134
- En altta ambiyans çubuğu: x 268, y 1017, genişlik 957, h 58, hap şeklinde
- Sağ altta "Seni seviyorum — Burak ♡" imzası

**Kural: 1920×1080'de her şey tek ekrana sığar, kaydırma yok.** Bunu CSS `zoom`
ile çözdüm: `--hz` değişkeni, `.app__shell` üzerinde `zoom: var(--hz)` +
`width: calc(100% / var(--hz))` + `min-height: calc(100dvh / var(--hz))`.
`App.tsx` içinde `useLayoutEffect` + `scrollHeight` ölçümüyle 4 iterasyonlu
küçültme var. 1080'de `--hz` ≈ 1.08 çıkıyor. Bu mekanizmayı bozarsan taşma
testini baştan yap.

### 3) Tasarım sistemi

`:root` içindeki gerçek token'lar — bunları kullan, yeni renk uydurma:

```
Yüzeyler   --bg-0 #0b1020   --bg-1 #111830   --bg-2 #182142
Cam panel  --panel rgba(13,19,34,.60)   --panel-strong rgba(10,15,28,.80)
           --panel-soft rgba(255,236,214,.05)
Metin      --ink #fdf6ec  --ink-soft #ece0d1  --ink-muted #c6b8a8  --ink-faint #9a8c7c
Vurgu      --accent #f2b478 (altın)   --accent-2 #ef8fa6 (gül)
           --glow rgba(242,180,120,.20)   --glow-2 rgba(239,143,166,.16)
Çizgi      --line rgba(255,255,255,.11)   --line-strong rgba(255,255,255,.22)
Yarıçap    --r-xs 10 · --r-sm 14 · --r-md 22 · --r-lg 32 · --r-xl 42 · pill 999
Gölge      --shadow-sm 0 8px 24px rgba(0,0,0,.42)
           --shadow-md 0 16px 52px rgba(0,0,0,.54)
           --shadow-lg 0 32px 96px rgba(0,0,0,.64)
Yumuşatma  --ease-out cubic-bezier(.16,1,.3,1)
           --ease-soft cubic-bezier(.4,0,.2,1)
           --ease-spring cubic-bezier(.34,1.56,.64,1)
Kenar çubuğu genişliği --sidebar-w 190px   mobil alt menü yüksekliği --nav-h 68px
```

Dört tema vurgusu var, `data-accent` ile: `amber` (varsayılan, altın),
`rose` (#ff8fab / #c084fc), `mint` (#7fe3c4 / #7cc7ff), `lilac` (#c4a4ff / #ff9ec4).
Yeni bir bileşen yazarken rengi sabit verme, `var(--accent)` kullan ki tema
değişince o da dönsün.

### 4) Tipografi

Üç aile, üçü de projeye gömülü:
- `--font-hand`: **Sacramento** → el yazısı. Selamlama, alt yazı, kart
  başlıklarındaki el yazısı varyant, imza. Hero başlığı 96px, ağırlık 400.
  Asla bold kullanma; Sacramento kalınlaşınca çirkinleşiyor.
- `--font-sans`: **Inter** → tüm arayüz metni, gövde 15px/1.6.
- `--font-display`: **Playfair Display** → bölüm başlıkları, büyük başlıklar.

Hiyerarşi kuralı: el yazısı = duygusal metin, Inter = işlevsel metin,
Playfair = başlık. Bu üçünü karıştırma.

### 5) Arka plan

Katmanlı: önce bulanık kopya (`blur(86px) saturate(1.05) brightness(.96)`),
üstünde net illüstrasyon (`background-size: cover`), üstünde çok hafif bir
scrim. Katmanlar arası `opacity` geçişi 1.2s.

Arka plan **saate ve hava durumuna bağlı** ve iki katmanlı çapraz geçişle
değişiyor (yeni görsel arkaya yazılır, katmanlar yer değiştirir):
- 14 zaman dilimi: 05–06 şafak yatak odası, 06–07 ve 07–08 güneşli,
  08–12 çalışma, 12–14 yemek, 14–17 hedef, 17–18 oyun, 18–19 ve 19–20 gün
  batımı, 20–21 film, 21–22 oyun, 22–24 ve 00–05 uyku.
- Hava koşulu varsa (yağmur/kar/soğuk) sahne ve selamlama değişiyor.
- Mobil/dikey için ayrı görsel seti var (`src/assets/mobile/`), 900px altında
  otomatik devreye giriyor.

Sağ üstteki "Günaydın Berna" yazısı **metin değil, hazır görsel**
(`gunaydin_yazi.webp`) — el yazısı tipografi elle çizilmiş. Aynı setten
"Kolay gelsin Berna", "İyi geceler Berna", yağmurlu/soğuk hava varyantları var.
Yeni selamlama eklerken bu görsel mantığını koru.

### 6) Bileşen envanteri

Kenar çubuğu: güneş ikonu + iki satırlık el yazısı başlık ("Günaydın / Berna"),
8 maddelik menü (Ana Sayfa, Mesajım, Sakladıklarım, Mini Oyun, Günün Planı,
Sürprizler, Anılarımız, Ayarlar), her maddede ikon + etiket, aktif maddede
sol tarafta işaretçi ve kalp ipucu. Altta "İyi ki varsın Berna" görseli, iki
kişi avatarı (birinde taç, birinde kalp, halka çerçeve), en altta ruh hali
çubuğu.

Kartlar: `--panel` zeminli, `--r-md` (22px) köşeli, `--line` ince kenarlıklı cam
paneller. `card--hover` varyantında hover'da hafif kalkma + parıltı. Kart
başlığında ikon rozeti (`card__icon`, gül varyantı `card__icon--rose`), başlık,
alt başlık, sağda ok.

Ana sayfa kartları: hava durumu (şehir, sıcaklık, açıklama, rüzgar/nem, canlı
rozeti), alıntı (el yazısı italik metin + "— Burak" imzası), günün planı
(checkbox listesi, saat etiketleri, altında yüzde çubuğu), birliktelik sayacı
("987 gün", "10 saat 36 dakika", "yıl dönümüne 109 gün").

Alt şerit: üç görselli mini kart (`bottomcard`) + müzik çalar. Kart yüksekliği
98px; küçük tutmak kritik, bir kez SVG boyutu yüzünden 155px'e şişip düzeni
bozmuştu — ikonlara her zaman `width/height` ver.

Ambiyans çubuğu: hap şeklinde, 6 kanal çipi (`ambchip`, açıkken `--on`),
ses seviyesi kaydırıcısı.

Bölümler: mektup/gazete okuyucu, saklanan mektuplar (mühürlü zarflar), plan,
sürpriz kutusu, anılar (polaroid ızgarası + 3B karusel + zaman çizelgesi),
quiz, ayarlar (vurgu renk seçici, ses, azaltılmış hareket).

### 7) Duyarlılık

- **> 981px:** masaüstü. Kenar çubuğu sabit, iki sütun, tek ekrana sığar.
- **≤ 900px:** mobil. Kenar çubuğu ekran dışına kayar ve `sidebar__backdrop`
  ile açılır; altta `mobilenav` (5 madde: Ana Sayfa, Mesajım, Sürpriz, Oyun,
  Anılar). Tek sütun, dikey kaydırma normaldir. Yatay taşma **0** olmalı.

Masaüstünde `sidebar__backdrop` kesinlikle `display: none` olmalı — bir kez
grid'in ilk sütununu kaplayıp tüm düzeni çökertmişti.

### 8) Hareket

Giriş perdesi (`intro`), sayfa girişi (`page-in`), `reveal` ile kaydırma
görünümü, kalp patlaması (başlığa tıklayınca, `burstHearts`), güneş
ışınlarının 34s'de bir tur dönüşü, hava durumu ikonunda yüzme, polaroidlerde
hafif eğim, `prefers-reduced-motion` desteği (ayarlardan da kapatılabiliyor).
Animasyonlar `var(--ease-out)` gibi token'lardan beslenmeli; süreler 0.4–0.7s,
abartıya kaçma.

### 9) Doğrulama — bunu atlama

Cowork önizleme paneli ~456px geniş; orada masaüstü medya sorguları hiç
tetiklenmez, yani masaüstü düzenini panelde göremezsin. iframe/ölçekleme
hilelerini denedim, güvenilmez çıktı. Gerçek tarayıcı şart: Playwright ile
1920×1080, 1440×900 ve 390×844 ekran görüntüsü al ve **kendin bak**.

Sık çıkan tuzaklar:
- Siyah/boş sayfa → `.page { animation: page-in ... both }` opacity 0'dan
  başlıyor; test kopyasında animasyonları kapat.
- Playwright `libXdamage.so.1` hatası → Ubuntu .deb'i indirip `dpkg -x` ile aç,
  `LD_LIBRARY_PATH` ver; `apt`/`sudo` bu ortamda çalışmıyor.
- Düzen bozulduğunda önce ölç: `document.documentElement.scrollHeight` ile
  `window.innerHeight` eşit olmalı (taşma 0).
- Metin kartla çakışıyorsa `getBoundingClientRect` ile alt/üst sınırları al,
  gözle tahmin etme.

**Bitmiş işi bana `computer://` linkiyle sun, geçici test dosyalarını klasörde
bırakma.**

### 10) Çalışma tarzı

Ölçerek konuş ("taşma 0", "kart 98px", "kenar çubuğu 245px"), tahminle değil.
Bir tasarım kararı verdiğinde nedenini söyle. Var olan token ve bileşenleri
kullan; yeni bir renk/ölçü uydurmadan önce sistemde karşılığı var mı bak.

## KOPYALA — BİTİŞ

---

## Notlar

Bu prompt'ta bilinçli olarak dışarıda bıraktıklarım: ses motoru (`audio/engine.ts`,
690 satır), three.js sahneleri, derleme hattı (`tools/build.py`, `emptyOutDir`
tuzağı), içerik metinleri. Bunlar UI değil. Ama üç şeyi bilmen iyi olur:

Birincisi, ses tarafında bir hata mesajı var — müzik çalar dosya bulamazsa
"Parça dosyası yüklenemedi, söylenen müzik çalıyor" diye bir toast çıkıyor.
UI açısından bu toast'ın stili de tasarım sistemine uymalı.

İkincisi, uygulama şu an lacivert-altın palet üzerine kurulu (`--bg-0 #0b1020`).
Daha önce sıcak bordo palete çevirmeyi denemiştim ama mevcut kaynakta o değişiklik
yok; yani lacivert güncel gerçek. Prompt'u buna göre yazdım.

Üçüncüsü, 1920×1080'de `--hz` değeri derlemeden derlemeye 1.08–1.29 arasında
çıkabiliyor çünkü ekran yüksekliğine göre hesaplanıyor ve içerik yüksekliği
değiştikçe iterasyon farklı yerde duruyor. Taşma testi `scrollHeight ==
innerHeight` olduğu sürece sorun yok.
