import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import Sidebar from "./components/Sidebar";
import Topbar from "./components/Topbar";
import MobileNav from "./components/MobileNav";
import Intro from "./components/Intro";
import AmbientCanvas from "./three/AmbientCanvas";
import WeatherFX from "./three/WeatherFX";
import Buddy from "./three/Buddy";
import Home from "./sections/Home";
import Letter from "./sections/Letter";
import Planner from "./sections/Planner";
import Surprise from "./sections/Surprise";
import Memories from "./sections/Memories";
import Settings from "./sections/Settings";
import { SceneBackground } from "./components/Scenery";
import { MusicPlayer, setMasterVolume, toggleAmbience, stopAllAmbience } from "./audio/engine";
import {
  ACCENTS,
  MOOD_LABELS,
  PLAN_ITEMS,
  SONGS,
  type AmbienceId,
  type PlanItem,
} from "./data/content";
import { buildScene, titleForHour } from "./data/scenes";
import { useStoredState, useToast, useMediaQuery } from "./hooks/useAppState";
import { useWeather } from "./hooks/useWeather";

export type NavKey = "home" | "letter" | "plan" | "surprise" | "memories" | "settings";

export default function App() {
  const [introDone, setIntroDone] = useState(false);
  const [nav, setNav] = useState<NavKey>("home");
  const [sidebar, setSidebar] = useState(false);

  const [accent, setAccent] = useStoredState<string>("ui:accent", "amber");
  const [soundOn, setSoundOn] = useStoredState<boolean>("ui:sound", true);
  const [volume, setVolume] = useStoredState<number>("ui:volume", 0.6);
  const [reducedMotion, setReducedMotion] = useStoredState<boolean>("ui:reduced", false);
  const [ambience, setAmbience] = useStoredState<Record<string, boolean>>("ui:ambience", {});
  /* Dostlar varsayılan olarak gizli; alttaki imzaya basınca açılır ve
     yenilemede de açık kalır (kullanıcı tekrar basana kadar). */
  const [buddies, setBuddies] = useStoredState<boolean>("ui:buddies", false);

  const [planItems, setPlanItems] = useStoredState<PlanItem[]>("plan:items:v2", PLAN_ITEMS);
  const [planDone, setPlanDone] = useStoredState<Record<string, boolean>>("plan:done:v2", {});

  const [songIndex, setSongIndex] = useStoredState<number>("music:index", 0);
  const [playing, setPlaying] = useState(false);
  const [progress, setProgress] = useState(0);

  const { msg, show } = useToast();
  const finePointer = useMediaQuery("(pointer: fine)");
  const playerRef = useRef<MusicPlayer | null>(null);

  const song = SONGS[songIndex % SONGS.length];
  const mood = useMemo(() => 62 + (planItems.length % 7) * 5, [planItems.length]);
  const moodLabel = useMemo(() => MOOD_LABELS[songIndex % MOOD_LABELS.length], [songIndex]);

  /* ---------- sahne: saat + hava durumu ---------- */
  const { weather, code, live } = useWeather();
  const hourParam = new URLSearchParams(window.location.search).get("h");
  const forcedHour = Number(hourParam);
  const hourOverride =
    hourParam !== null && Number.isFinite(forcedHour) && forcedHour >= 0 && forcedHour <= 23
      ? forcedHour
      : null;
  const [hour, setHour] = useState(() => hourOverride ?? new Date().getHours());

  useEffect(() => {
    if (hourOverride !== null) {
      setHour(hourOverride);
      return;
    }
    // Saat dilimi sınırları dakika içinde yakalanır.
    const tick = () => setHour(new Date().getHours());
    const id = window.setInterval(tick, 60_000);
    return () => window.clearInterval(id);
  }, [hourOverride]);

  const scene = useMemo(() => buildScene(hour, code, weather.temp), [hour, code, weather.temp]);

  /* Sekme başlığı saate göre değişir: Günaydın / Kolay gelsin / İyi akşamlar / İyi geceler. */
  useEffect(() => {
    document.title = titleForHour(hour);
  }, [hour]);

  /* ---------- tema ---------- */
  useEffect(() => {
    document.documentElement.dataset.accent = accent;
  }, [accent]);

  /* Ana sayfa tek ekrana sığmalı (alt kartlar görünsün) → yükseklik ölçeği
     yalnızca burada uygulanır. Diğer sayfalar gerçek boyutunda kalır ve
     kaydırılır; orada küçültme yapılırsa içerik minicik kalıyordu. */
  useLayoutEffect(() => {
    const root = document.documentElement;
    const onlyHome = nav === "home";

    const fit = () => {
      const vw = window.innerWidth;
      const vh = window.innerHeight;

      /* Mobil tek sütun düzeni doğal olarak kayar. Masaüstünde de yalnızca
         ana sayfa küçültülür. */
      if (!onlyHome || vw < 901) {
        root.style.setProperty("--hz", "1");
        return;
      }

      let hz = Math.min(1.35, Math.max(0.7, vh / 720));
      root.style.setProperty("--hz", hz.toFixed(4));
      /* Kökün scrollHeight'i .app'teki overflow yüzünden kırpılıyor.
         Gerçek içerik yüksekliği kabuğun kutusundan ölçülür. */
      const shell = document.querySelector<HTMLElement>(".app__shell");
      for (let i = 0; i < 10; i += 1) {
        const sh = shell ? shell.getBoundingClientRect().height : root.scrollHeight;
        if (sh <= vh + 1) break;
        hz = Math.max(0.5, hz * (vh / sh));
        root.style.setProperty("--hz", hz.toFixed(4));
      }
    };

    fit();
    const id = window.setTimeout(fit, 80);
    const id2 = window.setTimeout(fit, 400);
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(fit).catch(() => undefined);
    window.addEventListener("resize", fit);
    return () => {
      window.clearTimeout(id);
      window.clearTimeout(id2);
      window.removeEventListener("resize", fit);
    };
  }, [introDone, nav]);

  /* Sayfa değişince en başa dön. */
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "auto" });
  }, [nav]);

  useEffect(() => {
    if (reducedMotion) document.documentElement.dataset.motion = "reduced";
    else delete document.documentElement.dataset.motion;
  }, [reducedMotion]);

  /* ---------- ses ---------- */
  useEffect(() => {
    setMasterVolume(soundOn ? volume : 0);
  }, [soundOn, volume]);

  useEffect(() => () => stopAllAmbience(), []);

  /* ---------- müzik ---------- */
  useEffect(() => {
    const p = new MusicPlayer();
    playerRef.current = p;
    p.onProgress = (r) => setProgress((prev) => (Math.abs(prev - r) > 0.008 ? r : prev));
    p.onEnded = () => {
      setSongIndex((i) => (i + 1) % SONGS.length);
    };
    p.onError = (message) => {
      setPlaying(false);
      show(message);
    };
    return () => {
      p.dispose();
      playerRef.current = null;
    };
  }, [setSongIndex, show]);

  useEffect(() => {
    const p = playerRef.current;
    if (!p) return;
    const wasPlaying = p.playing;
    p.pause();
    p.load({ 
      id: song.id, 
      bpm: song.bpm, 
      root: song.root, 
      chords: song.chords,
      audioFile: song.audioFile 
    });
    setProgress(0);
    if (wasPlaying) p.play();
    setPlaying(wasPlaying);
  }, [song]);

  const togglePlay = useCallback(() => {
    const p = playerRef.current;
    if (!p) return;
    if (!p.playing && !soundOn) {
      setSoundOn(true);
    }
    const nowPlaying = p.toggle();
    setPlaying(nowPlaying);
    if (nowPlaying) show(`♪ ${song.title} çalıyor`);
  }, [show, song.title, soundOn, setSoundOn]);

  const nextSong = useCallback(() => {
    setSongIndex((i) => (i + 1) % SONGS.length);
  }, [setSongIndex]);

  const prevSong = useCallback(() => {
    setSongIndex((i) => (i - 1 + SONGS.length) % SONGS.length);
  }, [setSongIndex]);

  /* ---------- plan ---------- */
  const togglePlan = useCallback(
    (id: string) => {
      setPlanDone((d) => ({ ...d, [id]: !d[id] }));
    },
    [setPlanDone],
  );

  const addPlan = useCallback(
    (label: string) => {
      const id = `c${Date.now()}`;
      const time = new Date().toLocaleTimeString("tr-TR", { hour: "2-digit", minute: "2-digit" });
      setPlanItems((list) => [...list, { id, time, label }]);
      show("Plana eklendi ♡");
    },
    [setPlanItems, show],
  );

  const removePlan = useCallback(
    (id: string) => {
      setPlanItems((list) => list.filter((i) => i.id !== id));
      setPlanDone((d) => {
        const next = { ...d };
        delete next[id];
        return next;
      });
    },
    [setPlanItems, setPlanDone],
  );

  /* ---------- ambiyans ---------- */
  const onAmbience = useCallback(
    (id: AmbienceId) => {
      if (!soundOn) setSoundOn(true);
      const on = toggleAmbience(id);
      setAmbience((a) => ({ ...a, [id]: on }));
      show(on ? "Ortam sesi açıldı" : "Ortam sesi kapatıldı");
    },
    [show, soundOn, setAmbience, setSoundOn],
  );

  const onVolume = useCallback(
    (v: number) => {
      setVolume(v);
    },
    [setVolume],
  );

  /* ---------- gezinme ---------- */
  const go = useCallback((k: NavKey) => {
    setNav(k);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  const onOpenBottom = useCallback(
    (kind: "coffee" | "gift" | "memory") => {
      if (kind === "coffee") {
        show("Kahven hazır, afiyet olsun ☕");
        return;
      }
      go(kind === "gift" ? "surprise" : "memories");
    },
    [go, show],
  );

  const resetAll = useCallback(() => {
    try {
      Object.keys(localStorage)
        .filter((k) => k.startsWith("gunaydin-berna:"))
        .forEach((k) => localStorage.removeItem(k));
    } catch {
      /* */
    }
    window.location.reload();
  }, []);

  const page = () => {
    switch (nav) {
      case "letter":
        return <Letter />;
      case "plan":
        return (
          <Planner
            items={planItems}
            done={planDone}
            onToggle={togglePlan}
            onAdd={addPlan}
            onRemove={removePlan}
          />
        );
      case "surprise":
        return <Surprise />;
      case "memories":
        return <Memories />;
      case "settings":
        return (
          <Settings
            accent={accent}
            onAccent={setAccent}
            soundOn={soundOn}
            onSound={setSoundOn}
            volume={volume}
            onVolume={setVolume}
            reducedMotion={reducedMotion}
            onReducedMotion={setReducedMotion}
            onReset={resetAll}
            onTestSound={() => show("Ses çalışıyor ♪")}
          />
        );
      default:
        return (
          <Home
            scene={scene}
            weather={weather}
            weatherLive={live}
            planItems={planItems}
            planDone={planDone}
            onTogglePlan={togglePlan}
            onOpen={onOpenBottom}
            ambience={ambience}
            onAmbience={onAmbience}
            volume={volume}
            onVolume={onVolume}
            song={song}
            playing={playing}
            progress={progress}
            onPlayToggle={togglePlay}
            onNext={nextSong}
            onPrev={prevSong}
            onOpenLetter={() => go("letter")}
            buddiesOn={buddies}
            onToggleBuddies={() => setBuddies((b) => !b)}
          />
        );
    }
  };

  return (
    <div className="app">
      <SceneBackground scene={scene} />

      <WeatherFX condition={scene.condition} />

      <AmbientCanvas />

      {nav === "home" && introDone && buddies ? (
        <Buddy scene={scene} reducedMotion={reducedMotion} dancing={playing} />
      ) : null}

      {!introDone ? <Intro onDone={() => setIntroDone(true)} hour={hour} /> : null}

      <div className="app__shell">
        <Sidebar
          active={nav}
          onNavigate={go}
          open={sidebar}
          onClose={() => setSidebar(false)}
          mood={mood}
          moodLabel={moodLabel}
          hour={hour}
        />

        <div className="app__main">
          <Topbar
            onBurger={() => setSidebar((s) => !s)}
            soundOn={soundOn}
            onToggleSound={() => {
              setSoundOn((s) => !s);
              show(soundOn ? "Ses kapatıldı" : "Ses açıldı");
            }}
            onSurprise={() => go("surprise")}
          />

          <main className="app__content">
            <div key={nav} className="page">
              {page()}
            </div>
          </main>
        </div>
      </div>

      <MobileNav active={nav} onNavigate={go} />

      {finePointer && introDone ? (
        <CursorLight />
      ) : null}

      <div className={`toast ${msg ? "toast--in" : ""}`} role="status" aria-live="polite">
        {msg ?? ""}
      </div>
    </div>
  );
}

function CursorLight() {
  const ref = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    let x = window.innerWidth / 2;
    let y = window.innerHeight / 2;
    let tx = x;
    let ty = y;
    let raf = 0;

    const onMove = (e: PointerEvent) => {
      tx = e.clientX;
      ty = e.clientY;
    };
    window.addEventListener("pointermove", onMove, { passive: true });

    const tick = () => {
      raf = requestAnimationFrame(tick);
      x += (tx - x) * 0.08;
      y += (ty - y) * 0.08;
      const el = ref.current;
      if (el) {
        el.style.left = `${x}px`;
        el.style.top = `${y}px`;
      }
    };
    tick();

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("pointermove", onMove);
    };
  }, []);

  return <div className="cursorlight" ref={ref} aria-hidden />;
}

export { ACCENTS };











