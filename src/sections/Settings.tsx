import { Icon } from "../components/Icons";
import { ACCENTS } from "../data/content";

type Props = {
  accent: string;
  onAccent: (a: string) => void;
  soundOn: boolean;
  onSound: (v: boolean) => void;
  volume: number;
  onVolume: (v: number) => void;
  reducedMotion: boolean;
  onReducedMotion: (v: boolean) => void;
  onReset: () => void;
  onTestSound: () => void;
};

export default function Settings({
  accent,
  onAccent,
  soundOn,
  onSound,
  volume,
  onVolume,
  reducedMotion,
  onReducedMotion,
  onReset,
  onTestSound,
}: Props) {
  return (
    <section className="section" aria-label="Ayarlar">
      <header className="section__head">
        <div>
          <p className="section__eyebrow">Küçük dokunuşlar</p>
          <h2 className="section__title">
            Ayarlar
          </h2>
          <p className="section__lead">
            Renk, ses ve hareket tercihleri. Hepsi bu cihazda saklanır, hiçbir yere gönderilmez.
          </p>
        </div>
      </header>

      <div className="settings">
        <article className="card setcard">
          <h3 className="setcard__title">Renk teması</h3>
          <p className="setcard__desc">Gün doğumu, gül, nane veya lila.</p>
          <div className="setrow setrow--col">
            <div className="swatches" role="radiogroup" aria-label="Renk teması">
              {ACCENTS.map((a) => (
                <button
                  key={a.id}
                  type="button"
                  role="radio"
                  aria-checked={accent === a.id}
                  aria-label={a.label}
                  title={a.label}
                  className={`swatch ${accent === a.id ? "swatch--on" : ""}`}
                  style={{
                    background: `linear-gradient(135deg, ${a.colors[0]}, ${a.colors[1]})`,
                  }}
                  onClick={() => onAccent(a.id)}
                />
              ))}
            </div>
            <p className="setrow__hint">
              Seçili: {ACCENTS.find((a) => a.id === accent)?.label ?? "Gün doğumu"}
            </p>
          </div>
        </article>

        <article className="card setcard">
          <h3 className="setcard__title">Ses</h3>
          <p className="setcard__desc">Müzik ve ortam seslerinin genel seviyesi.</p>

          <div className="setrow">
            <div>
              <p className="setrow__label">Ses açık</p>
              <p className="setrow__hint">Kapatınca her şey sessizleşir</p>
            </div>
            <button
              type="button"
              className={`switch ${soundOn ? "switch--on" : ""}`}
              role="switch"
              aria-checked={soundOn}
              aria-label="Sesi aç veya kapat"
              onClick={() => onSound(!soundOn)}
            >
              <i />
            </button>
          </div>

          <div className="setrow">
            <div>
              <p className="setrow__label">Seviye</p>
              <p className="setrow__hint">%{Math.round(volume * 100)}</p>
            </div>
            <input
              type="range"
              min={0}
              max={100}
              value={Math.round(volume * 100)}
              onChange={(e) => onVolume(Number(e.target.value) / 100)}
              aria-label="Ses seviyesi"
              style={{ width: 120, accentColor: "var(--accent)" }}
            />
          </div>

          <button type="button" className="btn btn--sm" style={{ marginTop: 8 }} onClick={onTestSound}>
            <Icon name="volume" />
            Sesi dene
          </button>
        </article>

        <article className="card setcard">
          <h3 className="setcard__title">Hareket</h3>
          <p className="setcard__desc">Animasyonları azaltmak isteyenler için.</p>

          <div className="setrow">
            <div>
              <p className="setrow__label">Azaltılmış hareket</p>
              <p className="setrow__hint">Geçişleri ve sürekli animasyonları sadeleştirir</p>
            </div>
            <button
              type="button"
              className={`switch ${reducedMotion ? "switch--on" : ""}`}
              role="switch"
              aria-checked={reducedMotion}
              aria-label="Azaltılmış hareket"
              onClick={() => onReducedMotion(!reducedMotion)}
            >
              <i />
            </button>
          </div>
        </article>

        <article className="card setcard">
          <h3 className="setcard__title">Veriler</h3>
          <p className="setcard__desc">
            Plan maddeleri, seçilen sürpriz, tema ve ses tercihleri tarayıcıda tutulur.
          </p>
          <button type="button" className="btn btn--sm" onClick={onReset}>
            <Icon name="refresh" />
            Her şeyi sıfırla
          </button>
        </article>

        <article className="card setcard">
          <h3 className="setcard__title">Kısayollar</h3>
          <p className="setcard__desc">Klavyeden hızlı gezinme.</p>
          <div className="setrow">
            <p className="setrow__label">Menü öğeleri</p>
            <span className="badge">Tab</span>
          </div>
          <div className="setrow">
            <p className="setrow__label">Ana sayfaya dön</p>
            <span className="badge">1</span>
          </div>
          <div className="setrow">
            <p className="setrow__label">Müziği çal / duraklat</p>
            <span className="badge">Boşluk</span>
          </div>
        </article>

        <article className="card setcard">
          <h3 className="setcard__title">Hakkında</h3>
          <p className="setcard__desc">
            Berna için hazırlandı. Three.js ile 3B sahneler, WebAudio ile tamamen sentezlenmiş sesler —
            harici ses dosyası yok.
          </p>
          <p className="note__text" style={{ marginTop: 6 }}>
            Seni seviyorum ♡
          </p>
        </article>
      </div>
    </section>
  );
}
