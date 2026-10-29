import { useCallback, useEffect, useRef, useState } from 'react'

/* ============================================================
   Kalıcı durum (localStorage)
   ============================================================ */

const PREFIX = 'gunaydin-berna:'

export function useStoredState<T>(key: string, initial: T): [T, (v: T | ((prev: T) => T)) => void] {
  const [value, setValue] = useState<T>(() => {
    try {
      const raw = localStorage.getItem(PREFIX + key)
      return raw === null ? initial : (JSON.parse(raw) as T)
    } catch {
      return initial
    }
  })

  useEffect(() => {
    try {
      localStorage.setItem(PREFIX + key, JSON.stringify(value))
    } catch {
      /* kota dolu olabilir, sessizce geç */
    }
  }, [key, value])

  const set = useCallback((v: T | ((prev: T) => T)) => setValue(v), [])
  return [value, set]
}

/* ============================================================
   Görünürlükte belirme (IntersectionObserver)
   ============================================================ */

export function useReveal<T extends HTMLElement = HTMLDivElement>(delay = 0) {
  const ref = useRef<T | null>(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      el.classList.add('reveal--in')
      return
    }
    el.classList.add('reveal')
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) {
            const t = window.setTimeout(() => el.classList.add('reveal--in'), delay)
            io.unobserve(el)
            return () => window.clearTimeout(t)
          }
        }
      },
      { threshold: 0.14, rootMargin: '0px 0px -8% 0px' },
    )
    io.observe(el)
    return () => io.disconnect()
  }, [delay])

  return ref
}

/* ============================================================
   Saat
   ============================================================ */

export function useClock() {
  const [now, setNow] = useState(() => new Date())

  useEffect(() => {
    const id = window.setInterval(() => setNow(new Date()), 1000)
    return () => window.clearInterval(id)
  }, [])

  return now
}

/* ============================================================
   Yerel gün

   Sürpriz ve plan "gün"ü gece yarısı dönmeli. Date.now()/86_400_000
   UTC'ye göre saydığı için Türkiye'de gün 03:00'te değişiyordu.
   Bu yardımcı, saat dilimi kaymasını ekleyerek yerel gece yarısını
   sınır kabul eden bir gün numarası üretir.
   ============================================================ */

export function dayNumber(d: Date = new Date()) {
  return Math.floor((d.getTime() - d.getTimezoneOffset() * 60_000) / 86_400_000)
}

/** Yerel gün anahtarı: "2026-05-17" */
export function dayKey(d: Date = new Date()) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

/** Gece yarısını (ya da sekmeye geri dönüşü) yakalayan canlı gün anahtarı. */
export function useLocalDay() {
  const [key, setKey] = useState(() => dayKey())

  useEffect(() => {
    const tick = () =>
      setKey((prev) => {
        const next = dayKey()
        return prev === next ? prev : next
      })
    const id = window.setInterval(tick, 30_000)
    window.addEventListener('focus', tick)
    document.addEventListener('visibilitychange', tick)
    return () => {
      window.clearInterval(id)
      window.removeEventListener('focus', tick)
      document.removeEventListener('visibilitychange', tick)
    }
  }, [])

  return key
}

/* ============================================================
   Bildirim
   ============================================================ */

export function useToast() {
  const [msg, setMsg] = useState<string | null>(null)
  const timer = useRef<number | null>(null)

  const show = useCallback((text: string) => {
    setMsg(text)
    if (timer.current) window.clearTimeout(timer.current)
    timer.current = window.setTimeout(() => setMsg(null), 2600)
  }, [])

  useEffect(() => () => { if (timer.current) window.clearTimeout(timer.current) }, [])

  return { msg, show }
}

/* ============================================================
   Medya sorgusu
   ============================================================ */

export function useMediaQuery(query: string) {
  const [matches, setMatches] = useState(() =>
    typeof window === 'undefined' ? false : window.matchMedia(query).matches,
  )

  useEffect(() => {
    const mq = window.matchMedia(query)
    const onChange = () => setMatches(mq.matches)
    onChange()
    mq.addEventListener('change', onChange)
    return () => mq.removeEventListener('change', onChange)
  }, [query])

  return matches
}

/* ============================================================
   Azaltılmış hareket
   ============================================================ */

export function useReducedMotion() {
  return useMediaQuery('(prefers-reduced-motion: reduce)')
}

/* ============================================================
   Günün saatine göre selamlama

   Ton bilerek samimi tutuldu: resmi "İyi günler" / "İyi öğleden
   sonralar" yerine gündelik karşılıklar kullanılıyor. Havuzdan seçim
   saat numarasına bağlı, yani aynı saat içinde metin zıplamıyor,
   saat başında kendiliğinden tazeleniyor.
   ============================================================ */

type GreetSlot = 'night' | 'morning' | 'noon' | 'evening'

const CASUAL_GREETINGS: Record<GreetSlot, string[]> = {
  night: ['Hâlâ ayakta mısın', 'Gece kuşu', 'Uyumadın mı'],
  morning: ['Günaydın', 'Günaydın, selam', 'Selam, günaydın'],
  noon: ['Selam', 'Naber', 'Hey'],
  evening: ['İyi akşamlar', 'Akşam oldu, selam', 'Selam'],
}

export function greetingFor(date: Date) {
  const h = date.getHours()
  const slot: GreetSlot = h < 6 ? 'night' : h < 11 ? 'morning' : h < 18 ? 'noon' : h < 22 ? 'evening' : 'night'
  const pool = CASUAL_GREETINGS[slot]
  return pool[h % pool.length]
}

/* ============================================================
   Kalp patlaması
   ============================================================ */

export function burstHearts(x: number, y: number, count = 7) {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
  const glyphs = ['♡', '❤', '✦', '♡']
  for (let i = 0; i < count; i += 1) {
    const el = document.createElement('span')
    el.className = 'burstheart'
    el.textContent = glyphs[i % glyphs.length]
    el.style.left = `${x + (Math.random() - 0.5) * 60}px`
    el.style.top = `${y + (Math.random() - 0.5) * 24}px`
    el.style.animationDelay = `${i * 55}ms`
    el.style.color = i % 2 === 0 ? 'var(--accent-2)' : 'var(--accent)'
    document.body.appendChild(el)
    window.setTimeout(() => el.remove(), 1400)
  }
}

/* ============================================================
   Tarih biçimleri
   ============================================================ */

const TR_MONTHS = ['Ocak','Şubat','Mart','Nisan','Mayıs','Haziran','Temmuz','Ağustos','Eylül','Ekim','Kasım','Aralık']
const TR_DAYS = ['Pazar','Pazartesi','Salı','Çarşamba','Perşembe','Cuma','Cumartesi']

export function formatLongDate(d: Date) {
  return `${d.getDate()} ${TR_MONTHS[d.getMonth()]} ${d.getFullYear()}, ${TR_DAYS[d.getDay()]}`
}

export function formatTime(d: Date) {
  return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`
}

export function daysUntil(target: Date) {
  const a = new Date(target.getFullYear(), target.getMonth(), target.getDate()).getTime()
  const b = new Date()
  const today = new Date(b.getFullYear(), b.getMonth(), b.getDate()).getTime()
  return Math.max(0, Math.round((a - today) / 86_400_000))
}

/* ============================================================
   Yıl dönümü geri sayımı

   Başlangıç günü ile bugünün ay/günü esas alınır; bu yılki tarih
   geçtiyse gelecek yılki tarih döner. Kalan gün yerel gece yarısına
   göre sayılır, böylece saat dilimi kayması ve negatif değer olmaz.
   Bileşenler kendi hesabını yapmasın diye tek kaynak burasıdır.
   ============================================================ */

/** Sıradaki yıl dönümü (bugünse bugün). */
export function nextAnniversary(start: Date, now: Date = new Date()) {
  const d = new Date(now.getFullYear(), start.getMonth(), start.getDate())
  const midnight = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  if (d.getTime() < midnight.getTime()) d.setFullYear(d.getFullYear() + 1)
  return d
}

/** Yıl dönümüne kalan tam gün; bugünse 0. Asla negatife düşmez. */
export function daysUntilAnniversary(start: Date, now: Date = new Date()) {
  const midnight = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  return Math.max(0, Math.round((nextAnniversary(start, now).getTime() - midnight.getTime()) / 86_400_000))
}
