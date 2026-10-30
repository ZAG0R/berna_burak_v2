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
import { SLOT_TEXT } from "../data/scenes";
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
  onOpenLetter,
  togetherSince,
}: Props) {
  return (
    <section className="home" aria-label="Ana sayfa">
      <div className="home__grid">
        {/* Mobil başlık: fotoğrafın üstünde el yazısı selamlama.
            Masaüstünde gizli, orada selamlama kenar çubuğunda durur. */}
        <div className="home__mobile-greet" aria-hidden>
          <span className="home__mobile-line1">{SLOT_TEXT[scene.slot].line1}</span>
          <span className="home__mobile-line2">
            {SLOT_TEXT[scene.slot].line2}
            <svg viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 21.2 10.4 19.8C5.1 15.2 1.8 12.2 1.8 8.5 1.8 5.5 4.1 3.2 7.1 3.2c1.7 0 3.4.8 4.9 2.4 1.5-1.6 3.2-2.4 4.9-2.4 3 0 5.3 2.3 5.3 5.3 0 3.7-3.3 6.7-8.6 11.3z" />
            </svg>
          </span>
          {/* Hava durumu yazısı: yağmur/kar/soğuk ya da açık hava. */}
          {scene.greet[0] && (
            <span className="home__mobile-weatherrow">
              <img
                key={scene.greet[0].src}
                className="home__mobile-weather"
                src={scene.greet[0].src}
                alt={scene.greet[0].label}
                draggable={false}
              />
            </span>
          )}
        </div>
        {/* Sol üst: boş bırakılır, illüstrasyon görünür kalsın. */}
        <div className="home__hero" aria-hidden />

        {/* Sağ sütun: dört kart. Hava durumu yazısı masaüstünde kenar
            çubuğunda durur; mobilde çekmece kapalı olduğu için burada. */}
        <div className="home__aside">
          <SceneGreeting scene={scene} />
          <TogetherCard
            since={togetherSince}
            label={TOGETHER.label}
            hint={TOGETHER.hint}
            onHint={onOpenLetter}
          />
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
