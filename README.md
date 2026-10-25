# Berna & Burak

Berna için hazırlanmış, saat ve hava durumuna göre değişen interaktif web deneyimi.

## Geliştirme

```bash
npm install
npm run dev
```

## Build

```bash
npm run build
```

Çıktı `dist/index.html` tek dosyadır: tüm görseller, font ve stiller içine gömülür.
Dosyayı çift tıklayarak (`file://`) ya da herhangi bir statik sunucuda açabilirsin.

Müzik dosyası gömülü değildir, `public/images/icim-dolu-her-seyim.mp3` olarak servis edilir.

## Test parametreleri

| Parametre | Açıklama | Örnek |
| --- | --- | --- |
| `h` | Saati sabitler (0–23) | `?h=19` |
| `wc` | Hava durumu kodunu sabitler (WMO) | `?wc=63` |
| `t` | Sıcaklığı sabitler | `?t=-2` |

## Yayın

`main` dalına yapılan her push'ta GitHub Actions `dist/` klasörünü GitHub Pages'e yayınlar.
