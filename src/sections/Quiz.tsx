import { useMemo, useState } from "react";
import { Icon } from "../components/Icons";
import { QUIZ } from "../data/content";
import { burstHearts, useReveal, useStoredState } from "../hooks/useAppState";

/* ============================================================
   "Beni ne kadar tanıyorsun?" — küçük quiz

   Cevaplar cihazda saklanır; hiçbir yere gönderilmez. Sonuç ekranında
   her sorunun altında Burak'ın kısa notu çıkar. Tekrar çözülebilir.
   ============================================================ */

const LETTERS = ["A", "B", "C", "D"];

export default function Quiz() {
  const [picks, setPicks] = useStoredState<Record<string, number>>("quiz:picks", {});
  const [step, setStep] = useState(0);
  const [finished, setFinished] = useState(false);
  const sideRef = useReveal<HTMLDivElement>(100);

  const total = QUIZ.length;
  const answered = QUIZ.filter((q) => typeof picks[q.id] === "number").length;
  const score = useMemo(() => QUIZ.filter((q) => picks[q.id] === q.answer).length, [picks]);

  const current = QUIZ[step];

  const choose = (optionIndex: number) => {
    setPicks((p) => ({ ...p, [current.id]: optionIndex }));
    window.setTimeout(() => {
      if (step + 1 >= total) {
        setFinished(true);
        burstHearts(window.innerWidth / 2, window.innerHeight * 0.4, 14);
      } else {
        setStep((s) => s + 1);
      }
    }, 240);
  };

  const restart = () => {
    setPicks({});
    setStep(0);
    setFinished(false);
  };

  const verdict = () => {
    const pct = (score / total) * 100;
    if (pct === 100) return "Tam isabet. Bunu beklemiyordum, gerçekten.";
    if (pct >= 75) return "Beni benden iyi tanıyorsun. Bu biraz korkutucu, çoğunlukla güzel.";
    if (pct >= 50) return "Fena değil. Kalanları da birlikte yaşayıp öğreneceğiz.";
    if (pct >= 25) return "Bazı yerlerde beni yanlış okumuşsun. Biraz daha anlatayım, tamam.";
    return "Hiç doğru yok. Ama yine de en sevdiğim kişi sensin, bu değişmiyor.";
  };

  return (
    <section className="section section--scrim" aria-label="Mini quiz">
      <header className="section__head">
        <div>
          <p className="section__eyebrow">
            Küçük bir oyun · {answered}/{total} cevaplandı
          </p>
          <h2 className="section__title">
            Beni ne kadar <em>tanıyorsun</em>
          </h2>
          <p className="section__lead">
            Sekiz soru. Yanlış cevap yok, sadece beni tanıma derecesi var. Sonunda ne düşündüğümü de
            yazdım.
          </p>
        </div>
        {answered > 0 ? (
          <button type="button" className="btn btn--sm" onClick={restart}>
            <Icon name="refresh" />
            Baştan başla
          </button>
        ) : null}
      </header>

      <div className="quiz">
        <div className="quiz__main">
          {finished ? (
            <article className="quiz__card quiz__card--result">
              <p className="quiz__eyebrow">Sonuç</p>
              <p className="quiz__score tnum">
                <b>{score}</b>
                <span>/ {total}</span>
              </p>
              <p className="quiz__verdict">{verdict()}</p>

              <div className="quiz__review">
                {QUIZ.map((q, i) => {
                  const pick = picks[q.id];
                  const right = pick === q.answer;
                  return (
                    <div key={q.id} className={`quiz__rev ${right ? "is-right" : "is-wrong"}`}>
                      <p className="quiz__rev-q">
                        <span className="quiz__rev-n tnum">{i + 1}</span>
                        {q.q}
                      </p>
                      <p className="quiz__rev-a">
                        <b>{right ? "Doğru" : "Senin cevabın:"}</b>{" "}
                        {pick === undefined ? "—" : q.options[pick]}
                        {right ? null : (
                          <>
                            {" · "}
                            <b>Benimki:</b> {q.options[q.answer]}
                          </>
                        )}
                      </p>
                      <p className="quiz__rev-note">{q.note}</p>
                    </div>
                  );
                })}
              </div>

              <button type="button" className="btn btn--sm btn--accent" onClick={restart}>
                <Icon name="refresh" />
                Bir daha oyna
              </button>
            </article>
          ) : (
            <article className="quiz__card">
              <div className="quiz__progress" aria-hidden>
                {QUIZ.map((q, i) => (
                  <span
                    key={q.id}
                    className={`quiz__dot ${i < step ? "is-done" : ""} ${i === step ? "is-now" : ""}`}
                  />
                ))}
              </div>

              <p className="quiz__eyebrow">{step + 1}. soru</p>
              <h3 className="quiz__q">{current.q}</h3>

              <div className="quiz__options" role="group" aria-label="Seçenekler">
                {current.options.map((opt, i) => {
                  const picked = picks[current.id] === i;
                  return (
                    <button
                      key={opt}
                      type="button"
                      className={`quiz__opt ${picked ? "quiz__opt--on" : ""}`}
                      onClick={() => choose(i)}
                      aria-pressed={picked}
                    >
                      <span className="quiz__letter">{LETTERS[i]}</span>
                      <span>{opt}</span>
                    </button>
                  );
                })}
              </div>

              <div className="quiz__nav">
                <button
                  type="button"
                  className="btn btn--sm"
                  onClick={() => setStep((s) => Math.max(0, s - 1))}
                  disabled={step === 0}
                >
                  <Icon name="chevronLeft" />
                  Geri
                </button>
                <button
                  type="button"
                  className="btn btn--sm"
                  onClick={() => (step + 1 >= total ? setFinished(true) : setStep((s) => s + 1))}
                >
                  {step + 1 >= total ? "Bitir" : "Geç"}
                  <Icon name="chevronRight" />
                </button>
              </div>
            </article>
          )}
        </div>

        <aside className="quiz__side" ref={sideRef}>
          <article className="card" style={{ padding: 20 }}>
            <header className="card__head">
              <span className="card__icon card__icon--rose" aria-hidden>
                <Icon name="heartfilled" />
              </span>
              <div>
                <h3 className="card__title">Kural yok</h3>
                <p className="card__sub">bu bir sınav değil</p>
              </div>
            </header>
            <p className="note__text">
              Emin değilsen tahmin et. Yanlış tahmin etmek, hiç cevaplamamaktan iyi — en azından beni
              düşündüğünü anlarım.
            </p>
          </article>

          <article className="card scorecard">
            <p className="quiz__side-score tnum">
              <b>{score}</b>
              <span>doğru</span>
            </p>
            <p className="scorecard__hint">
              {answered === 0
                ? "İlk soruyla başla."
                : answered < total
                  ? `${total - answered} soru kaldı.`
                  : "Hepsi cevaplandı."}
            </p>
          </article>
        </aside>
      </div>
    </section>
  );
}
