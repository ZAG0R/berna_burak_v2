# Sadece özellikler — başka oturuma verilecek prompt

Aşağıdaki bloğu kopyalayıp yeni sohbetin başına yapıştır. Bu prompt kasıtlı
olarak **sadece ne yapıyor** sorusuna cevap veriyor: tasarım, kod, derleme yok.

---

## KOPYALA — BAŞLANGIÇ

Kız arkadaşım Berna için yaptığım "Günaydın Berna" adlı web uygulamasının
özelliklerini anlatıyorum. Amacım sana sadece **ne işe yaradığını** aktarmak;
tasarım dili, kod yapısı, derleme detayları senin konun değil.

Fikir şu: sabah açtığında onu bekleyen küçük, kişisel bir dünya. Bir dashboard
gibi geziniliyor ama içindeki her şey birine yazılmış.

### 1) Saate ve havaya göre değişen sahne

Uygulamanın en görünür özelliği bu: arka plan ve selamlama, saate ve o anki hava
durumuna göre kendiliğinden değişiyor.

Gün 14 dilime bölünmüş — 05'te şafakta yatak odası, 06–08 güneşli sabah,
08–12 çalışma, 12–14 yemek, 14–17 hedef, 17–18 oyun, 18–20 gün batımı,
20–21 film, 21–22 oyun, 22–05 uyku. Her dilimin kendi illüstrasyonu var, geçiş
yumuşak bir çapraz sönümleme ile oluyor, ekran bir anda değişmiyor.

Saat dilimleri dört selamlama sınıfına düşüyor: **Günaydın** (06–08),
**Kolay gelsin** (08–18), **Evine hoş geldin** (18–22), **İyi geceler** (22–06).
Bunlar sadece metin değil — her biri elle çizilmiş bir el yazısı görseli olarak
hazırlanmış, sağ üstte görünüyor.

Hava durumu bunun üstüne biniyor. Şehir Adana, veri açık bir servisten
(Open-Meteo) çekiliyor, yarım saatte bir tazeleniyor. Sıcaklık, açıklama,
rüzgar ve nem gösteriliyor. Yağmur, kar veya aşırı soğuk varsa sahne değişiyor:
yağmurlu versiyonda yağmur damlaları ekranda akıyor, karda kar taneleri yağıyor,
soğukta ince bir pus oluyor. Bu efektler 3B olarak çiziliyor, video değil. Ayrıca
selamlama sırası değişiyor — önce hava durumu uyarısı ("Yağmurlu hava"), sonra
normal selamlama; ikisi arasında dönüyor, biri diğerini ezmiyor.

Gece ile gündüz ayrı: hava durumu ikonları gece aya/ bulutlu aya dönüşüyor.

Ağ yoksa hiçbir şey bozulmuyor, sabit bir değere düşüyor (22°, parçalı bulutlu).
Yani uçakta, internet olmayan yerde de çalışır.

### 2) Günlük plan — "günlük görevler"

Beş hazır madde var, saat etiketleriyle. İşaretlenebiliyor, altında yüzdelik
ilerleme çubuğu ve duruma göre değişen bir motivasyon cümlesi var ("Yarısını
geçtin, harika gidiyorsun" gibi). Kendi maddesini ekleyebiliyor, eklediğini
silebiliyor.

Önemli detay: işaretler **her gece yarısı sıfırlanıyor**, maddeler kalıyor. Yani
dün yapılanlar bugün yapılmış sayılmıyor; liste her sabah taze başlıyor. Bu
bilerek böyle — gece yarısı hesabı yerel saate göre yapılıyor, yoksa Türkiye'de
gün 03:00'te dönüyordu (bunu düzelttim).

Maddeler esprili: "Burak'ı sev (zorla değil, istersen)", "Bol su iç (2. raunt)".

### 3) Günlük sürpriz

Her gün tek bir sürpriz açılıyor ve **gün içinde hep aynı sürpriz** geliyor —
gece yarısı bir sonrakine geçiyor. Yani sayfayı yenilesen de sürprizi
değiştiremiyor, kaçamıyor.

Sürpriz 3B bir hediye kutusunun içinde. Kutuya tıklayınca kapak fırlıyor,
kalpler ve konfeti yükseliyor. Toplam 10 sürpriz var, hepsi bir şey yapmasını
istiyor: "Aynı şarkı, aynı dakika" (ikisi aynı anda aynı şarkıyı başlatıyor),
"Günün ilk mesajı bana", bunun gibi. Hiçbiri "al işte bir hediye" değil; hepsi
aramızdaki iletişimi büyütmeye yönelik.

Sürpriz defterinde diğer günler **kapalı** duruyor. Başlıkları görünmüyor,
sadece kaçıncı gün olduğu yazıyor. Böylece ileriden bakıp sürprizi bozmak
mümkün değil.

Altında bir geri sayım var: bir sonraki buluşma anına (09:00 veya 21:00, hangisi
önceyse) saat-dakika-saniye olarak sayıyor. Her zaman 12 saatten kısa, yani hiç
"3 gün kaldı" gibi uzak bir şey görünmüyor.

### 4) Birlikte geçen zaman sayacı

Başlangıç tarihinden bugüne kaç gün, kaç saat, kaç dakika geçtiğini canlı
gösteriyor, ayrıca yıl dönümüne kaç gün kaldığını yazıyor. Tarih ayarlardan
değiştirilebiliyor; değiştirince sayaç ve yıl dönümü hesabı anında güncelleniyor.
Sekme arka plandayken durmuyor, geri dönünce doğru değeri gösteriyor.

### 5) Mektup — harf harf yazılan

"Mesajım" bölümünde bir mektup var ve açtığında **harf harf yazılıyor**, gerçek
bir el yazısı hızında. Yazmasını beklemeden "Hepsini göster" ile atlayabiliyor.
Kâğıt görünümlü, bantlı bir tasarım.

Yanında "nedenler" listesi var — onu neden sevdiğime dair kısa maddeler.

### 6) "Aç bunu ne zaman" mektupları

Bu benim en sevdiğim özellik. 6 tane mühürlü zarf var ama bunlar günlük mektup
değil. Her biri bir ana ait: "bunu çok yorulduğun bir gün aç", "bunu bana
kızdığın bir gün aç", "bunu özlediğin bir gün aç" gibi.

Zarf kapalıyken sadece **koşul** görünüyor — başlık ve içerik gizli, mum mührü
duruyor. Açınca yazı harf harf beliriyor. Hangilerini açtığı hatırlanıyor, sonra
tekrar bakınca "bunu açmıştım" görünüyor. Yani bir tür zaman kapsülü.

### 7) Anılar

Üç katmanlı: en üstte sürükleyip döndürebileceğin **3B bir karusel** — dönen bir
silindirin üzerine dizilmiş fotoğraf kartları, kendi kendine yavaşça dönüyor,
dokununca merkeze geliyor ve alttaki yazı o kareye göre değişiyor. Altında
polaroid ızgarası (hafif eğik, gerçek polaroid gibi). En altta bir zaman
çizelgesi: tanışma, ilk buluşma, ilk yolculuk gibi dönüm noktaları.

### 8) "Beni ne kadar tanıyorsun" oyunu

8 soruluk küçük bir quiz. Yanlış cevap diye bir şey yok; sonunda yüzdelik bir
skor ve skora göre değişen bir yorum çıkıyor ("Tam isabet. Bunu beklemiyordum,
gerçekten." / "Hiç doğru yok. Ama yine de en sevdiğim kişi sensin, bu
değişmiyor."). Her sorunun altında benim kısa notum görünüyor. Tekrar
çözülebiliyor.

### 9) Ses — tamamen sentezlenmiş

Harici tek bir ses dosyası yok. Her şey tarayıcıda gerçek zamanlı üretiliyor.

Müzik çalar 5 şarkı içeriyor; her şarkı akor dizisi ve temposuyla tanımlanmış,
çalarken ekolayzır çubukları oynuyor, kapak dönüyor. Altta 6 ambiyans kanalı var,
istenildiği kadar birlikte açılabiliyor: doğa sesleri, yağmur, kuşlar, deniz, gün
doğumu, gece. Ses seviyesi kaydırıcısı hepsini birden kontrol ediyor.

Tarayıcılar otomatik ses çalmayı engellediği için ilk dokunuşta devreye giriyor.

### 10) İki küçük 3B karakter

Ana sayfanın alt kısmında, kartların üstünde minik iki karakter duruyor: kalp
antenli kız (Berna) ve taçlı oğlan (Burak). Sürekli bir koreografileri var —
sahneden çıkıyorlar, tekrar giriyorlar, buluşup zıplıyorlar, kalp saçıyorlar,
bazen birbirlerine laf atıp sinirleniyorlar. Konuşma balonlarında saat dilimine
ve hava durumuna göre değişen replikleri var.

Varsayılan olarak gizliler. Sayfanın altındaki "Seni seviyorum — Burak ♡"
imzasına basınca geliyorlar, tekrar basınca gidiyorlar. Yani sürpriz bozulmuyor.

### 11) Ayarlar ve kişiselleştirme

Dört renk teması (Gün doğumu, Gül, Nane, Lila) — seçince tüm uygulamanın vurgu
rengi değişiyor. Ses açma/kapama ve seviye. "Azaltılmış hareket" anahtarı:
animasyonları sadeleştiriyor, hareket hassasiyeti olanlar için. Birlikte olma
tarihi. Ve "her şeyi sıfırla".

Bütün tercihler cihazda saklanıyor, hiçbir yere gönderilmiyor.

### 12) Küçük dokunuşlar

Açılışta bir giriş perdesi var — güneş ikonu, selamlama, ilerleme çubuğu,
yaklaşık 3 saniye, dokununca atlanıyor. Sekme başlığı saate göre değişiyor
("Günaydın Berna ♡" / "İyi geceler Berna ♡"). Başlığa tıklayınca ekranda kalpler
patlıyor. Klavye kısayolları var: 1–8 bölümler, boşluk müziği çal/durdur, Esc
menüyü kapatır. İşlemler için kısa bildirimler çıkıyor ("Plana eklendi ♡").

### 13) Teknik olarak kullanıcıyı ilgilendiren üç şey

Birincisi, **tamamen çevrimdışı** çalışıyor. Tüm görseller, fontlar ve kod tek
bir HTML dosyasının içine gömülü, ~4 MB. Yani dosyayı gönderdiğinde çift
tıklayıp açılıyor, internet gerekmiyor, hiçbir sunucuya bağlanmıyor. (Hava
durumu tek istisna — o da düşerse sessizce sabit değere geçiyor.)

İkincisi, **mobil uyumlu**. Telefonda tek sütuna geçiyor, kenar çubuğu yerine
alt gezinme çubuğu geliyor, dokunmatik için ayrı dikey görsel seti devreye
giriyor.

Üçüncüsü, **masaüstünde tek ekrana sığıyor**. 1920×1080'de kaydırma yok; içerik
ekran yüksekliğine göre otomatik ölçekleniyor. Diğer bölümler normal kayıyor.

### 14) İçerik tonu

Hepsi Türkçe, hepsi birine yazılmış gibi. Şakacı ama duygusal; "Burak'ı sev
(zorla değil, istersen)" gibi espriler var ama "Aç bunu ne zaman" mektupları
gerçekten ciddi. Ne yapmacık ne mesafeli — iki kişinin dili.

## KOPYALA — BİTİŞ

---

## Notlar

Bu prompt'ta kasten dışarıda bıraktıklarım: renk paleti, tipografi, piksel
ölçüleri, CSS mimarisi, derleme komutu, `emptyOutDir` tuzağı, doğrulama yöntemi.
Bunlar "ne yapıyor" değil "nasıl yapılmış" sorusunun cevabı; başka bir prompt'un
konusu.

Sayılar koddan doğrulandı: 14 zaman dilimi (`DAY_PLAN`), 10 sürpriz
(`SURPRISES`), 8 quiz sorusu (`QUIZ`), 6 mühürlü mektup (`KEPT_LETTERS`),
6 anı (`MEMORIES`), 5 dönüm noktası (`MILESTONES`), 5 plan maddesi
(`PLAN_ITEMS`), 5 şarkı (`SONGS`), 6 ambiyans kanalı (`AMBIENCES`), 3 alt kart
(`BOTTOM_CARDS`), 4 renk teması (`ACCENTS`).

Bir şeyi belirtmek isterim: uygulamanın selamlama görselleri (Günaydın / Kolay
gelsin / İyi geceler + hava durumu varyantları) hazır çizimler. Yeni bir
selamlama eklemek istersen görsel de üretmen gerekir, sadece metin yazmak
yetmiyor. Bu, özellik listesinde görünmeyen ama işi planlarken bilinmesi gereken
bir kısıt.
