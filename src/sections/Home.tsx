import {
  BottomCards,
  MusicBar,
  PlanCard,
  QuoteCard,
  TogetherCard,
  WeatherCard,
} from "../components/Cards";
import { SceneGreeting } from "../components/Scenery";
import {
  BOTTOM_CARDS,
  QUOTE,
  TOGETHER,
  type PlanItem,
  type Song,
} from "../data/content";
import type { Scene } from "../data/scenes";
import type { Weather } from "../hooks/useWeather";

type Props = {
  scene: Scene;
  weather: Weather;
  weatherLive: boolean;
  planItems: PlanItem[];
  planDone: Record<string, boolean>;
  onTogglePlan: (id: string) => void;
  onOpen: (kind: "coffee" | "gift" | "memory" | "cat") => void;
  volume: number;
  onVolume: (v: number) => void;
  song: Song;
  playing: boolean;
  elapsed: number;
  duration: number;
  onPlayToggle: () => void;
  onNext: () => void;
  onPrev: () => void;
  onSeek: (ratio: number) => void;
  onOpenLetter: () => void;
  togetherSince: string;
};

export default function Home({
  scene,
  weather,
  weatherLive,
  planItems,
  planDone,
  onTogglePlan,
  onOpen,
  volume,
  onVolume,
  song,
  playing,
  elapsed,
  duration,
  onPlayToggle,
  onNext,
  onPrev,
  onSeek,
  togetherSince,
}: Props) {
  return (
    <section className="home" aria-label="Ana sayfa">
      <div className="home__grid">
        {/* Sol üst: boş bırakılır, illüstrasyon görünür kalsın. */}
        <div className="home__hero" aria-hidden />

        {/* Sağ sütun: dört kart. Hava durumu yazısı masaüstünde kenar
            çubuğunda durur; mobilde çekmece kapalı olduğu için burada. */}
        <div className="home__aside">
          <SceneGreeting scene={scene} />
          <TogetherCard since={togetherSince} label={TOGETHER.label} hint={TOGETHER.hint} />
          <WeatherCard w={weather} live={weatherLive} id="home-weather" />
          <QuoteCard text={QUOTE.text} by={QUOTE.by} />
          <PlanCard items={planItems} done={planDone} onToggle={onTogglePlan} />
        </div>

        {/* Alt şerit: dört mini kart */}
        <div className="home__bottom">
          <div className="home__cards">
            <BottomCards cards={BOTTOM_CARDS} onOpen={onOpen} />
          </div>
        </div>

        {/* Tam genişlikte müzik çubuğu */}
        <div className="home__music">
          <MusicBar
            id="home-music"
            song={song}
            playing={playing}
            elapsed={elapsed}
            duration={duration}
            volume={volume}
            onVolume={onVolume}
            onToggle={onPlayToggle}
            onNext={onNext}
            onPrev={onPrev}
            onSeek={onSeek}
          />
        </div>

      </div>
    </section>
  );
}
