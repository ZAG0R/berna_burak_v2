# Yedekleme ve Geri Dönme

Bu proje sürüm kontrolü altında. İstediğin an yedek alıp istediğin ana geri dönebilirsin. Her şey sadece bu bilgisayarda kalır, hiçbir yere gönderilmez.

## Yedek almak

`YEDEK AL.bat` dosyasına çift tıkla.

- O anki hali tarih damgalı bir yedek noktası olarak kaydeder (örn. `yedek-2026-10-29_2140`).
- Değişiklik yoksa boşuna kayıt açmaz, mevcut yedekleri listeler.

## Geri dönmek

`ESKI HALINE DON.bat` dosyasına çift tıkla.

- Bütün yedek noktalarını tarih sırasıyla listeler.
- Numarasını yazıp seçersin.
- Geri dönmeden önce, o anki hali de ayrıca `yedek-oncesi-...` adıyla güvenceye alır. Yani geri dönüşün de geri alınabilir.

## Komut satırından

```
git tag --list "yedek-*" --sort=-creatordate   # yedekleri listele
git reset --hard yedek-2026-10-29_2140         # o ana dön
git reset --hard yedek-oncesi-...              # geri dönüşü geri al
```

## Notlar

- Yedekler git etiketi olarak durur. `node_modules`, `dist` ve `tools` gibi ağır klasörler yedeğe girmez; bu yüzden yedekler hızlı ve küçüktür.
- Geri döndükten sonra uygulamayı görmek için `npm run build` çalıştırıp `dist/index.html` dosyasını aç.
- Silmek istediğin bir yedek olursa: `git tag -d yedek-...`
- Bu üç dosya (`YEDEK AL.bat`, `ESKI HALINE DON.bat`, `YEDEKLEME.md`) da yedeğe dahildir, yani geri dönüşte kaybolmaz.
