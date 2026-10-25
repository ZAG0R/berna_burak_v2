import { useMemo, useState } from "react";
import { Icon } from "../components/Icons";
import { Counter, Ring } from "../components/Cards";
import { TIPS, type PlanItem } from "../data/content";
import { useReveal } from "../hooks/useAppState";

type Props = {
  items: PlanItem[];
  done: Record<string, boolean>;
  onToggle: (id: string) => void;
  onAdd: (label: string) => void;
  onRemove: (id: string) => void;
};

export default function Planner({ items, done, onToggle, onAdd, onRemove }: Props) {
  const [draft, setDraft] = useState("");
  const [tip, setTip] = useState(() => TIPS[Math.floor(Math.random() * TIPS.length)]);
  const sideRef = useReveal<HTMLDivElement>(100);

  const total = items.length;
  const count = items.filter((i) => done[i.id]).length;
  const pct = total === 0 ? 0 : Math.round((count / total) * 100);

  const message = useMemo(() => {
    if (pct === 0) return "Hazır olduğunda başla. Sıralama önemli değil.";
    if (pct < 40) return "Güzel başlangıç. Acele yok, sadece devam.";
    if (pct < 75) return "Yarısını geçtin, harika gidiyorsun.";
    if (pct < 100) return "Neredeyse tamam. Son bir adım kaldı.";
    return "Hepsi tamam! Kendinle gurur duy.";
  }, [pct]);

  const submit = () => {
    const label = draft.trim();
    if (!label) return;
    onAdd(label);
    setDraft("");
  };

  return (
    <section className="section" aria-label="Günün planı">
      <header className="section__head">
        <div>
          <p className="section__eyebrow">Küçük hedefler</p>
          <h2 className="section__title">
            Bugünün <em>planı</em>
          </h2>
          <p className="section__lead">
            Kimse senden mükemmel bir gün beklemiyor. Sadece iyi hissettiğin bir gün yeter.
          </p>
        </div>
      </header>

      <div className="planner">
        <div className="planner__list">
          {items.map((item) => {
            const isDone = Boolean(done[item.id]);
            return (
              <div key={item.id} className={`pitem ${isDone ? "pitem--done" : ""}`}>
                <button
                  type="button"
                  className={`planitem__box ${isDone ? "planitem__box--on" : ""}`}
                  onClick={() => onToggle(item.id)}
                  aria-pressed={isDone}
                  aria-label={`${item.label} maddesini ${isDone ? "geri al" : "tamamla"}`}
                >
                  {isDone ? <Icon name="check" /> : null}
                </button>
                <span className="pitem__time">{item.time}</span>
                <span className="pitem__label">
                  {item.label}
                  {item.note ? <span className="pitem__note">{item.note}</span> : null}
                </span>
                <button
                  type="button"
                  className="pitem__del"
                  onClick={() => onRemove(item.id)}
                  aria-label={`${item.label} maddesini sil`}
                >
                  <Icon name="trash" />
                </button>
              </div>
            );
          })}

          {items.length === 0 ? (
            <p className="card__sub" style={{ padding: "18px 4px" }}>
              Liste boş. Aşağıdan ilk maddeyi ekle.
            </p>
          ) : null}

          <div className="addrow">
            <label className="sr-only" htmlFor="yeni-madde">
              Yeni plan maddesi
            </label>
            <input
              id="yeni-madde"
              className="field"
              placeholder="Bugün için bir şey ekle..."
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") submit();
              }}
            />
            <button type="button" className="btn btn--accent" onClick={submit}>
              <Icon name="plus" />
              Ekle
            </button>
          </div>
        </div>

        <aside className="planner__side" ref={sideRef}>
          <article className="card scorecard">
            <Ring value={pct} cap="tamamlandı" />
            <p className="scorecard__hint">{message}</p>
            <div className="row gap-10" style={{ justifyContent: "center", marginTop: 16, flexWrap: "wrap" }}>
              <span className="badge">
                <Icon name="check" />
                <Counter to={count} /> tamam
              </span>
              <span className="badge badge--rose">
                <Icon name="clock" />
                <Counter to={Math.max(0, total - count)} /> kaldı
              </span>
            </div>
          </article>

          <article className="card" style={{ padding: 20 }}>
            <header className="card__head">
              <span className="card__icon" aria-hidden>
                <Icon name="leaf" />
              </span>
              <div>
                <h3 className="card__title">Küçük bir mola</h3>
                <p className="card__sub">30 saniyen var mı?</p>
              </div>
            </header>
            <p className="note__text" style={{ minHeight: 52 }}>
              {tip}
            </p>
            <button
              type="button"
              className="btn btn--sm"
              style={{ marginTop: 12 }}
              onClick={() => setTip(TIPS[Math.floor(Math.random() * TIPS.length)])}
            >
              <Icon name="refresh" />
              Başka bir öneri
            </button>
          </article>

          <article className="card" style={{ padding: 20 }}>
            <header className="card__head">
              <span className="card__icon card__icon--rose" aria-hidden>
                <Icon name="smile" />
              </span>
              <div>
                <h3 className="card__title">Not</h3>
                <p className="card__sub">yapılacaklar listesi değil, iyi hissetme listesi</p>
              </div>
            </header>
            <p className="note__text">
              Bir maddeyi yapamadıysan o gün başarısız değilsin. Sadece o maddeyi başka bir güne taşı.
            </p>
          </article>
        </aside>
      </div>
    </section>
  );
}
