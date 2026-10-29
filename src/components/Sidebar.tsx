import type { NavKey } from '../App'
import { Icon } from './Icons'
import { IMAGES, DEFAULT_PEOPLE } from '../data/content'
import iyiki from '../assets/iyiki-crop.png'
import { greetImageForHour } from '../data/scenes'

/* Menüde bir sayfa değil, ana sayfadaki bir kartı işaret eden iki kısayol
   var: Müzik ve Hava Durumu. Tıklanınca ana sayfaya dönülür ve ilgili
   karta kaydırılır. */
export type NavItemKey = NavKey | 'music' | 'weather'

type Props = {
  active: NavKey
  onNavigate: (k: NavItemKey) => void
  open: boolean
  onClose: () => void
  hour: number
  soundOn: boolean
  onToggleSound: () => void
}

/* Sıra referanstaki menüyle aynıdır. */
export const NAV_ITEMS: { key: NavItemKey; label: string; icon: string }[] = [
  { key: 'home', label: 'Ana Sayfa', icon: 'home' },
  { key: 'letter', label: 'Mesajım', icon: 'chat' },
  { key: 'kept', label: 'Sakladıklarım', icon: 'mail' },
  { key: 'memories', label: 'Anılarımız', icon: 'camera' },
  { key: 'plan', label: 'Günün Planı', icon: 'calendar' },
  { key: 'surprise', label: 'Sürprizler', icon: 'gift' },
  { key: 'quiz', label: 'Mini Oyun', icon: 'sparkles' },
]

/* Kenar çubuğunda gösterilen tarih: "26 Ekim 2026" + "Pazartesi" */
function dateLine(now: Date) {
  const day = new Intl.DateTimeFormat('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' }).format(now)
  const weekday = new Intl.DateTimeFormat('tr-TR', { weekday: 'long' }).format(now)
  return { day, weekday }
}

export default function Sidebar({
  active,
  onNavigate,
  open,
  onClose,
  hour,
  soundOn,
  onToggleSound,
}: Props) {
  const him = DEFAULT_PEOPLE[0]
  const her = DEFAULT_PEOPLE[1]
  const greet = greetImageForHour(hour)
  const { day, weekday } = dateLine(new Date())

  return (
    <>
      <div
        className={`sidebar__backdrop ${open ? 'sidebar__backdrop--open' : ''}`}
        onClick={onClose}
        aria-hidden={!open}
      />
      <aside className={`sidebar ${open ? 'sidebar--open' : ''}`} aria-label="Ana menü">
        <div className="sidebar__brand">
          <div className="sidebar__sun" aria-hidden>
            <Icon name="sunrays" />
          </div>
          <h1 className="sidebar__title">
            <img className="sidebar__greet" src={greet.src} alt={greet.label} draggable={false} />
          </h1>
          <p className="sidebar__date">{day}</p>
          <p className="sidebar__weekday">{weekday}</p>
        </div>

        <nav className="sidebar__nav">
          {NAV_ITEMS.map((item) => {
            const isActive = item.key === active
            return (
              <button
                key={item.key}
                type="button"
                className={`navitem ${isActive ? 'navitem--active' : ''}`}
                aria-current={isActive ? 'page' : undefined}
                onClick={() => {
                  onNavigate(item.key)
                  onClose()
                }}
              >
                <Icon name={item.icon} />
                <span>{item.label}</span>
                <span className="navitem__hint" aria-hidden>
                  <Icon name="chevronRight" />
                </span>
              </button>
            )
          })}
        </nav>

        <div className="sidebar__spacer" />

        <div className="sidebar__tagline">
          <img src={iyiki} alt="İyi ki varsın Berna" draggable={false} />
        </div>

        <div className="sidebar__people">
          <div className="person person--crown">
            <div className="person__ring">
              {/* Emoji fontu bu derlemede yok; kutu ciziyordu. */}
              <span className="person__crown" aria-hidden>
                <Icon name="crown" />
              </span>
              <img className="person__img" src={him.avatar} alt={him.name} loading="lazy" />
            </div>
            <span className="person__name">{him.name}</span>
          </div>
          <div className="person">
            <div className="person__ring">
              <img className="person__img" src={her.avatar} alt={her.name} loading="lazy" />
              <span className="person__heart" aria-hidden>♡</span>
            </div>
            <span className="person__name">{her.name}</span>
          </div>
        </div>

        {/* Ses, sürpriz ve ayarlar en altta: başlık ve menü sıkışmasın. */}
        <div className="sidebar__tools">
          <button
            type="button"
            className={`sidebtn ${soundOn ? 'sidebtn--on' : ''}`}
            onClick={onToggleSound}
            aria-pressed={soundOn}
            aria-label={soundOn ? 'Sesi kapat' : 'Sesi aç'}
            title={soundOn ? 'Sesi kapat' : 'Sesi aç'}
          >
            <Icon name={soundOn ? 'volume' : 'volumeOff'} />
          </button>
          <button
            type="button"
            className={`sidebtn ${active === 'surprise' ? 'sidebtn--on' : ''}`}
            onClick={() => {
              onNavigate('surprise')
              onClose()
            }}
            aria-label="Sürprizler"
            title="Sürprizler"
          >
            <Icon name="gift" />
          </button>
          <button
            type="button"
            className={`sidebtn ${active === 'settings' ? 'sidebtn--on' : ''}`}
            onClick={() => {
              onNavigate('settings')
              onClose()
            }}
            aria-label="Ayarlar"
            title="Ayarlar"
          >
            <Icon name="settings" />
          </button>
        </div>
      </aside>
    </>
  )
}

export { IMAGES }
