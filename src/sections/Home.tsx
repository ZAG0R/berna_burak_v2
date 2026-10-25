import { Icon } from "../components/Icons";
import {
  AmbienceBar,
  BottomCards,
  PlanCard,
  PlayerCard,
  QuoteCard,
  WeatherCard,
} from "../components/Cards";
import { SceneGreeting } from "../components/Scenery";
import {
  BOTTOM_CARDS,
  HERO,
  QUOTE,
  type AmbienceId,
  type PlanItem,
  type Song,
} from "../data/content";
import type { Scene } from "../data/scenes";
import { burstHearts } from "../hooks/useAppState";
import type { Weather } from "../hooks/useWeather";

type Props = {
  scene: Scene;
  weather: Weather;
  weatherLive: boolean;
  planItems: PlanItem[];
  planDone: Record<string, boolean>;
  onTogglePlan: (id: string) => void;
  onOpen: (kind: "coffee" | "gift" | "memory") => void;
  ambience: Record<string, boolean>;
  onAmbience: (id: AmbienceId) => void;
  volume: number;
  onVolume: (v: number) => void;
  song: Song;
  playing: boolean;
  progress: number;
  onPlayToggle: () => void;
  onNext: () => void;
  onPrev: () => void;
  onOpenLetter: () => void;
  buddiesOn: boolean;
  onToggleBuddies: () => void;
};

export default function Home({
  scene,
  weather,
  weatherLive,
  planItems,
  planDone,
  onTogglePlan,
  onOpen,
  ambience,
  onAmbience,
  volume,
  onVolume,
  song,
  playing,
  progress,
  onPlayToggle,
  onNext,
  onPrev,
  buddiesOn,
  onToggleBuddies,
}: Props) {
  return (
    <section className="home" aria-label="Ana sayfa">
      <div className="home__grid">
        <div className="home__hero">
          <div className="hero">
            <div className="hero__head">
              <span className="hero__sun" aria-hidden>
                <span className="hero__rays">
                  <Icon name="sunrays" />
                </span>
                <Icon name="sun" />
              </span>

              <h2
                className="hero__title"
                onClick={(e) => burstHearts(e.clientX, e.clientY)}
                title="Bana dokun ♡"
              >
                {HERO.title} <span className="hero__accent">{HERO.titleAccent}</span>{" "}
                <span className="hero__heart" aria-hidden>♡</span>
              </h2>

              <p className="hero__sub">{HERO.sub}</p>
            </div>

          </div>
        </div>

        <div className="home__aside">
          <SceneGreeting scene={scene} />
          <WeatherCard w={weather} live={weatherLive} />
          <QuoteCard text={QUOTE.text} by={QUOTE.by} />
          <PlanCard items={planItems} done={planDone} onToggle={onTogglePlan} />
        </div>

        <div className="home__bottom">
          <div className="home__cards">
            <BottomCards cards={BOTTOM_CARDS} onOpen={onOpen} />
            <PlayerCard
              song={song}
              playing={playing}
              progress={progress}
              onToggle={onPlayToggle}
              onNext={onNext}
              onPrev={onPrev}
            />
          </div>
        </div>

        <div className="home__foot">
          <AmbienceBar active={ambience} onToggle={onAmbience} volume={volume} onVolume={onVolume} />
          <button
            type="button"
            className={`home__sig ${buddiesOn ? "is-on" : ""}`}
            onClick={onToggleBuddies}
            aria-pressed={buddiesOn}
            title={buddiesOn ? "Dostları gizle" : "Dostları çağır ♡"}
          >
            Seni seviyorum
            <span>— Burak ♡</span>
          </button>
        </div>
      </div>
    </section>
  );
}
