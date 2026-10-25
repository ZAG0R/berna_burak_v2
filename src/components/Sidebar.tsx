import type { NavKey } from '../App'
import { Icon } from './Icons'
import { IMAGES, DEFAULT_PEOPLE } from '../data/content'
import iyiki from '../assets/iyiki.webp'
import { textForHour } from '../data/scenes'

type Props = {
  active: NavKey
  onNavigate: (k: NavKey) => void
  open: boolean
  onClose: () => void
  mood: number
  moodLabel: string
  hour: number
}

export const NAV_ITEMS: { key: NavKey; label: string; icon: string }[] = [
  { key: 'home', label: 'Ana Sayfa', icon: 'home' },
  { key: 'letter', label: 'Mesajım', icon: 'chat' },
  { key: 'plan', label: 'Günün Planı', icon: 'calendar' },
  { key: 'surprise', label: 'Sürprizler', icon: 'gift' },
  { key: 'memories', label: 'Anılarımız', icon: 'heart' },
  { key: 'settings', label: 'Ayarlar', icon: 'settings' },
]

export default function Sidebar({ active, onNavigate, open, onClose, mood, moodLabel, hour }: Props) {
  const him = DEFAULT_PEOPLE[0]
  const her = DEFAULT_PEOPLE[1]
  const text = textForHour(hour)

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
            {text.line1}
            <br />
            <em>{text.line2}</em>
          </h1>
          <span className="sidebar__heart" aria-hidden>
            ♡
          </span>
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
                <span className="navitem__marker" aria-hidden />
                <Icon name={item.icon} />
                <span>{item.label}</span>
                <span className="navitem__hint" aria-hidden>
                  ♡
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
              <span className="person__crown" aria-hidden>👑</span>
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

        <div className="sidebar__mood">
          <p>{moodLabel}</p>
          <div className="moodbar" role="progressbar" aria-valuenow={mood} aria-valuemin={0} aria-valuemax={100}>
            <span style={{ width: `${mood}%` }} />
          </div>
        </div>
      </aside>
    </>
  )
}

export { IMAGES }
