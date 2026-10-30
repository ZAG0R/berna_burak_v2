import type { NavKey } from "../App";
import { Icon } from "./Icons";

const ITEMS: { key: NavKey; label: string; icon: string }[] = [
  { key: "home", label: "Ana Sayfa", icon: "home" },
  { key: "letter", label: "Mesajım", icon: "chat" },
  { key: "memories", label: "Anılarımız", icon: "camera" },
  { key: "plan", label: "Günün Planı", icon: "calendar" },
  { key: "quiz", label: "Oyun", icon: "sparkles" },
];

export default function MobileNav({
  active,
  onNavigate,
  hidden = false,
  peek = false,
}: {
  active: NavKey;
  onNavigate: (k: NavKey) => void;
  /** Çekme menü açıkken alt çubuk gizlenir; menü tam yükseklik alır. */
  hidden?: boolean;
  /** Kaydırma sırasında çubuk görünür, durunca yeniden çekilir. */
  peek?: boolean;
}) {
  return (
    <nav
      className={`mobilenav ${hidden ? "mobilenav--hidden" : ""} ${peek ? "mobilenav--peek" : ""}`}
      aria-label="Hızlı menü"
      aria-hidden={hidden || undefined}
    >
      {ITEMS.map((item) => {
        const isActive = item.key === active;
        return (
          <button
            key={item.key}
            type="button"
            className={`mobilenav__item ${isActive ? "mobilenav__item--active" : ""}`}
            onClick={() => onNavigate(item.key)}
            aria-current={isActive ? "page" : undefined}
          >
            <Icon name={item.icon} />
            <span>{item.label}</span>
            <i className="mobilenav__dot" aria-hidden />
          </button>
        );
      })}
    </nav>
  );
}
