import { Icon } from './Icons'


type Props = {
  onBurger: () => void
  soundOn: boolean
  onToggleSound: () => void
  onSurprise: () => void
}

export default function Topbar({ onBurger, soundOn, onToggleSound, onSurprise }: Props) {

  return (
    <header className="topbar">
      <button type="button" className="iconbtn iconbtn--burger" onClick={onBurger} aria-label="Menüyü aç">
        <Icon name="menu" />
      </button>

      <div className="topbar__spacer" />

      <div className="topbar__actions">
        <button
          type="button"
          className={`iconbtn ${soundOn ? 'iconbtn--on' : ''}`}
          onClick={onToggleSound}
          aria-pressed={soundOn}
          aria-label={soundOn ? 'Sesi kapat' : 'Sesi aç'}
          title={soundOn ? 'Sesi kapat' : 'Sesi aç'}
        >
          <Icon name={soundOn ? 'volume' : 'volumeOff'} />
        </button>
        <button type="button" className="iconbtn" onClick={onSurprise} aria-label="Sürprizi aç" title="Sürpriz">
          <Icon name="gift" />
        </button>
      </div>
    </header>
  )
}
