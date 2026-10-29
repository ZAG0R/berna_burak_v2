# Başka bir oturumda bu projeyi anlatmak için prompt

Aşağıdaki bloğu olduğu gibi kopyalayıp yeni bir sohbetin başına yapıştır. Proje
klasörünü de (C:\Users\Burak\Desktop\sevgili) o oturuma bağlarsan Claude dosyaları
kendisi okur; bağlamazsan bu metin tek başına yeterli olur.

---

## KOPYALANACAK PROMPT — BAŞLANGIÇ

Merhaba. Devam eden bir projem var, sana tüm bağlamı veriyorum.

**Ne yapıyoruz:** Kız arkadaşım Berna için bir doğum günü/hediye web uygulaması
geliştiriyorum. Adı "Günaydın Berna". Amaç sıradan bir hediye sayfası değil —
açtığında gerçekten "vay" dedirten, üst düzey, sinematik bir deneyim. Tek sayfalık
bir dashboard gibi görünüyor ama içindeki her bölüm gerçek ve çalışıyor.

**Kullanıcı (ben):** Burak. Türkçe konuşuyorum; kısa özet değil, ayrıntılı ve
gerekçeli açıklama istiyorum. Görsel kaliteye (tasarım sistemi, animasyon,
tipografi, renk uyumu) ve işin gerçekten uçtan uca çalışmasına önem veriyorum.
Yarım bırakılmış işi kabul etmiyorum. Bir şey bozuksa kök nedeni bilmek istiyorum,
"olmuyor" cevabıyla yetinmiyorum. Bittiğini söylemeden önce gerçekten test et.

**Proje klasörü:** C:\Users\Burak\Desktop\sevgili

**Teknoloji yığını**
- Vite 5 + React 18 + TypeScript (strict; noUnusedLocals/noUnusedParameters açık)
- three.js 0.169 (3B sahneler) + framer-motion (geçişler)
- vite-plugin-singlefile → çıktı tek dosya: `uygulama.html` (~3.7–4 MB)
- Tüm fontlar (Caveat, Inter, Playfair Display) ve tüm görseller base64 data-URI
  olarak gömülü. Yani çıktı **tamamen çevrimdışı** çalışır, 0 harici istek.
  Çift tıklayıp file:// ile de açılabilir.

**Derleme — TEK komut**
```
python3 tools/build.py
```
Bu betik sırayla: dist'i temizler → `npx tsc --noEmit` → `npx vite build` →
çıktının gerçekten değiştiğini 15 kontrolle doğrular → `tools/embed-fonts.py` ile
fontları gömer → test sayfalarını üretir. **`npx vite build`'i doğrudan çağırma**,
doğrulama ve font gömme adımlarını atlarsın.

**Kritik tuzak:** Bağlı klasörde vite'in `dist` klasörünü boşaltması EPERM veriyor
ve build sessizce yarıda kalıp ESKİ index.html'i bırakıyordu — yani yaptığım
düzeltmeler çıktıya hiç girmiyordu. Bu yüzden `vite.config.ts` içinde
`emptyOutDir: false`. Belirtisi: build stack trace + `uygulama.html`'in boyutunun
ve zaman damgasının değişmemesi. `rm -rf dist` de EPERM verir, gerekmiyor.

**Bölümler (hepsi çalışır durumda, gezinilebilir)**
Ana Sayfa · Mesajım (mektup) · Sakladığım Mektuplar · Günün Planı · Sürprizler ·
Anılarımız · Quiz · Ayarlar

**Ana Sayfa'nın yapısı** (bunu bozma, çok uğraştım)
- Sol sütunda sidebar (sabit), sağda içerik.
- Sağ üstte selamlama: ince, beyaz, el yazısı fontla "Günaydın **Berna** ♡"
  (Caveat 400, pembe kalp), üstünde ortalanmış güneş ikonu + yavaş dönen ışınlar.
  Hemen altında el yazısıyla tek satırlık alt yazı.
- Selamlamanın altında hava durumu kartı; altında günün planı kartı.
- En altta üç yatay kart (müzik çalar + bilgi kartları) ve footer.
- 1920×1080'de **her şey tek ekrana sığmalı, kaydırma olmamalı.** Bu bir CSS
  zoom + JS fit döngüsüyle çözüldü: `documentElement` üzerinde `--hz` değişkeni,
  `.app__shell`'de `zoom: var(--hz)` + `width: calc(100% / var(--hz))` +
  `min-height: calc(100dvh / var(--hz))`. `App.tsx` içinde `useLayoutEffect` ile
  `scrollHeight` ölçülüp 4 iterasyonda küçültülüyor. Bu mekanizmaya dokunacaksan
  taşma testini yeniden yap.

**Görsel yön**
- Koyu, sıcak bordo/kahve zemin; altın ve gül tonları. (İlk sürüm lacivertti,
  referans görsele göre komple sıcak palete çevrildi.)
- Palet: `--bg-0 #1a0f12`, `--bg-1 #22141a`, `--bg-2 #2c1a20`,
  `--panel rgba(46,24,27,.80)`, `--ink #fdf3e7`, `--accent` altın, `--accent-2` pembe.
- Arka plan: gün batımı illüstrasyonu, `background-size: cover`, üstünde
  blur'lu dolgu katmanı + çok hafif scrim. Görsel 1920×920'ye kırpılıp referans
  görselin renk istatistiklerine (kanal ortalama/std, doygunluk) göre kalibre edildi.
  Yanlarda siyah bant oluşmaması için en-boy oranı ekranla eşlendi.
- Fontlar: Caveat (el yazısı), Inter (arayüz), Playfair Display (başlık).

**Ses**
Harici ses dosyası yok. Her şey tarayıcıda WebAudio ile sentezleniyor:
`src/audio/engine.ts` (~690 satır). Müzik çalar + 6 ambiyans kanalı
(doğa, yağmur, kuşlar, dalgalar, gün doğumu, gece). Tarayıcı otomatik oynatmayı
engellediği için ilk kullanıcı etkileşiminde başlıyor.

**3B sahneler (three.js)**
- `AmbientCanvas` — zerre alanı
- `GiftBox` — açılabilir hediye kutusu (Sürprizler)
- `MemoryCarousel` — döner anı karuseli (Anılarımız)
- `WeatherFX` — hava durumuna göre yağmur/kar efekti
- `Buddy` — küçük karakterler (varsayılan gizli, footer'daki imzaya basınca açılır)

**Hava durumu**
Şehir Adana. `src/hooks/useWeather.ts` api.open-meteo.com kullanıyor; ağ yoksa
`DEFAULT_WEATHER`'a düşüyor (22°, parçalı bulutlu), yani çevrimdışı da bozulmuyor.

**Saate göre sahne**
`src/data/scenes.ts` — saate göre 4 dilim (sabah/çalışma/akşam/gece), hava koduna
göre yağmur/kar/soğuk varyantı. Görsel, başlık ve alt yazı buna göre değişiyor;
mobil için ayrı `src/assets/mobile/` görsel seti var.

**Durum saklama**
`localStorage` üzerinden: tema rengi, ses, ses seviyesi, plan maddeleri ve
işaretleri, birlikte olma tarihi, müzik sırası, dostlar. Yeni gün başlayınca plan
işaretleri sıfırlanır, maddeler kalır.

**Mobil**
Kırılma noktası 900/981px. Mobilde sidebar yerine alt gezinme çubuğu
(`MobileNav`), tek sütun, dikey kaydırma normal. 390×844'te yatay taşma 0 olmalı.

**Nasıl doğrulama yapmalısın — bunu ciddiye al**
- Cowork önizleme paneli 456×716 gibi dar bir viewport; orada masaüstü medya
  sorguları hiç tetiklenmez, yani masaüstü düzenini panelde göremezsin.
  iframe/ölçekleme hileleri güvenilmez çıktı; gerçek tarayıcı şart.
- Güvenilir yöntem: Playwright + chromium. Ekran görüntüsünü al ve **kendin bak**.
- `libXdamage.so.1` hatası alırsan: Ubuntu .deb'i indirip `dpkg -x` ile aç ve
  `LD_LIBRARY_PATH` ver; `apt`/`sudo` bu ortamda çalışmıyor.
- Siyah/boş sayfa görürsen suçlu genelde `.page { animation: page-in ... both }`
  (opacity 0'dan başlıyor); test kopyasında animasyonları kapat.
- Test ettiğin ölçüler: 1920×1080, 1912×915, 1440×900, 390×844.

**Çalışma tarzım**
- Bana ne yaptığını ve neden yaptığını anlat, sadece "düzelttim" deme.
- Ölçerek konuş: "taşma 0", "kart 76px", "renk ortalaması hedefle eşleşti" gibi.
- Tahminle değil, gerçek tarayıcı çıktısıyla doğrula.
- Bitmiş işi bana `computer://` linkiyle sun; geçici test dosyalarını klasörde
  bırakma.

**Şu anki durum:** Uygulama çalışıyor, tek ekrana sığıyor, mobil uyumlu, çevrimdışı.
Sıradaki işi söyleyince buradan devam edelim.

## KOPYALANACAK PROMPT — BİTİŞ

---

## Neden bunlar var (kısa not)

Prompt'un üç işi var: (1) hedefi ve zevk seviyesini anlatmak, (2) teknik tuzakları
önceden vermek — özellikle `emptyOutDir` ve `--hz` fit döngüsü, çünkü bunlar
bilinmezse saatler kaybedilir, (3) doğrulama yöntemini dayatmak, çünkü bu projede
en çok hata "panelde doğru görünüyor ama gerçek tarayıcıda bozuk" yüzünden çıktı.

Eksik bırakabileceğin şeyler: içerik metinleri (`src/data/content.ts` içinde,
617 satır — hepsi Türkçe, kişisel), ve `tools/` altındaki yardımcı betikler.
Bir oturumda Claude bunları kendisi okur, prompt'a sığdırmaya çalışma.
