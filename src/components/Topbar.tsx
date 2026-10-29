import { Icon } from './Icons'

type Props = {
  onBurger: () => void
}

/* Üst bar masaüstünde gizli; yalnızca mobilde menü düğmesini taşır.
   Ses, sürpriz ve ayarlar kısayolları kenar çubuğuna taşındı. */
export default function Topbar({ onBurger }: Props) {
  return (
    <header className="topbar">
      <button type="button" className="iconbtn iconbtn--burger" onClick={onBurger} aria-label="Menüyü aç">
        <Icon name="menu" />
      </button>
    </header>
  )
}
