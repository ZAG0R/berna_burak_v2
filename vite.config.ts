import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { viteSingleFile } from 'vite-plugin-singlefile'

// Tek dosyalık çıktı: dist/index.html hem sunucudan hem de doğrudan
// çift tıklanarak (file://) açıldığında sorunsuz çalışır.
export default defineConfig({
  base: './',
  plugins: [react(), viteSingleFile({ removeViteModuleLoader: true })],
  build: {
    target: 'es2020',
    cssCodeSplit: false,
    // Bağlı klasörde vite'in dist'i boşaltması EPERM veriyor
    // (dist/images/arkaplan.png silinemiyor) ve build yarıda kalıyordu.
    // Boşaltmayı kapatınca dosyaların üzerine yazar; index.html her
    // seferinde baştan üretildiği için eski çıktı sorun olmaz.
    emptyOutDir: false,
    assetsInlineLimit: 100_000_000,
    chunkSizeWarningLimit: 2000,
  },
  server: {
    port: 5173,
    host: true,
    /* public/images ve kökteki images/ yalnızca kaynak görselleri barındırır;
       uygulama src/assets'ten import ediyor. Vite bu klasörleri izlerken
       kilitli bir dosyada EBUSY ile çöküyordu (ör. indirilen GIF).
       Kökteki pano/ekran görüntüleri de aynı sorunu yaratıyor: biri kilitliyken
       (Photoshop, önizleme, indirme) tüm dev sunucusu düşüyordu. Uygulama
       kökteki görselleri kullanmadığı için hepsi izleme dışında. */
    watch: {
      ignored: [
        '**/images/**',
        '**/dist/**',
        '**/uygulama.html',
        '**/*.gif',
        '*.png',
        '*.jpg',
        '*.jpeg',
        '*.webp',
        '*.psd',
        '*.mp4',
      ],
    },
  },
})
