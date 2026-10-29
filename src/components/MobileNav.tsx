import type { NavKey } from "../App";
import { Icon } from "./Icons";

const ITEMS: { key: NavKey; label: string; icon: string }[] = [
  { key: "home", label: "Ana Sayfa", icon: "home" },
  { key: "letter", label: "Mesajım", icon: "chat" },
  { key: "surprise", label: "Sürpriz", icon: "gift" },
  { key: "quiz", label: "Oyun", icon: "sparkles" },
  { key: "memories", label: "Anılar", icon: "heart" },
];

export default function MobileNav({
  active,
  onNavigate,
}: {
  active: NavKey;
  onNavigate: (k: NavKey) => void;
}) {
  return (
    <nav className="mobilenav" aria-label="Hızlı menü">
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
          </button>
        );
      })}
    </nav>
  );
}
