import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import Sidebar, { type NavItemKey } from "./components/Sidebar";
import Topbar from "./components/Topbar";
import MobileNav from "./components/MobileNav";
import Intro from "./components/Intro";
import AmbientCanvas from "./three/AmbientCanvas";
import WeatherFX from "./three/WeatherFX";
import Buddy from "./three/Buddy";
import Home from "./sections/Home";
import Letter from "./sections/Letter";
import KeptLetters from "./sections/KeptLetters";
import Planner from "./sections/Planner";
import Surprise from "./sections/Surprise";
import Memories from "./sections/Memories";
import Quiz from "./sections/Quiz";
import Settings from "./sections/Settings";
import { SceneBackground } from "./components/Scenery";
import { MusicPlayer, setMasterVolume, toggleAmbience, stopAllAmbience } from "./audio/engine";
import {
  ACCENTS,
  PLAN_ITEMS,
  SONGS,
  TOGETHER_SINCE_DEFAULT,
  type AmbienceId,
  type PlanItem,
} from "./data/content";
import { buildScene, titleForHour } from "./data/scenes";
import { useStoredState, useToast, useMediaQuery, useLocalDay } from "./hooks/useAppState";
import { useWeather } from "./hooks/useWeather";

export type NavKey =
  | "home"
  | "letter"
  | "kept"
  | "plan"
  | "surprise"
  | "memories"
  | "quiz"
  | "settings";

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
  const [planDay, setPlanDay] = useStoredState<string>("plan:day", "");
  const [togetherSince, setTogetherSince] = useStoredState<string>(
    "together:since",
    TOGETHER_SINCE_DEFAULT,
  );
  const today = useLocalDay();

  /* Yeni gün başlayınca işaretler temizlenir; maddeler (kendi ekledikleri
     dahil) durur. Böylece dün "yaptım" denen şeyler bugün yapılmış sayılmaz. */
  useEffect(() => {
    if (planDay === today) return;
    setPlanDone({});
    setPlanDay(today);
  }, [today, planDay, setPlanDone, setPlanDay]);

  const [songIndex, setSongIndex] = useStoredState<number>("music:index", 0);
  const [playing, setPlaying] = useState(false);
  const [track, setTrack] = useState({ elapsed: 0, duration: 0 });

  const { msg, show } = useToast();
  const finePointer = useMediaQuery("(pointer: fine)");
  const playerRef = useRef<MusicPlayer | null>(null);

  const song = SONGS[songIndex % SONGS.length];

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

      /* Referans 1647x918'de cizildi ve icerik oraya tam sigiyor; olcek
         o orana baglanir. Onceden icerik sigmadikca zoom kisiliyordu ve
         tum yazilar/kartlar kucuk kaliyordu. */
      const REF_W = 1647;
      const REF_H = 918;
      let hz = Math.min(1.42, Math.max(0.92, Math.min(vw / REF_W, vh / REF_H)));
      root.style.setProperty("--hz", hz.toFixed(4));

      /* Genis ekranda yukseklik, dar ekranda genislik belirleyici olur;
         yalnizca gercekten tasma varsa ve cok az, ince ayar yapilir. */
      const shell = document.querySelector<HTMLElement>(".app__shell");
      for (let i = 0; i < 6; i += 1) {
        const sh = shell ? shell.getBoundingClientRect().height : root.scrollHeight;
        if (sh <= vh + 1) break;
        hz = Math.max(0.55, hz * Math.min(0.995, vh / sh));
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
    p.onTime = (elapsed, duration) => setTrack({ elapsed, duration });
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
    setTrack({ elapsed: 0, duration: 0 });
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

  const seekTrack = useCallback((ratio: number) => {
    playerRef.current?.seek(ratio);
  }, []);

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
  const go = useCallback((k: NavItemKey) => {
    /* Müzik ve Hava Durumu ayrı sayfa değil: ana sayfadaki kartları
       işaret eder. Önce ana sayfaya dönülür, kart geldikten sonra
       kaydırılır. */
    if (k === "music" || k === "weather") {
      setNav("home");
      window.setTimeout(() => {
        const el = document.getElementById(k === "music" ? "home-music" : "home-weather");
        el?.scrollIntoView({ behavior: "smooth", block: "center" });
        el?.animate(
          [
            { boxShadow: "0 0 0 0 rgba(255,179,92,0)" },
            { boxShadow: "0 0 0 3px rgba(255,179,92,0.55)" },
            { boxShadow: "0 0 0 0 rgba(255,179,92,0)" },
          ],
          { duration: 1400, easing: "ease-out" },
        );
      }, 120);
      return;
    }
    setNav(k);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  /* ---------- klavye kısayolları ----------
     Ayarlar sayfasında yazan kısayollar burada dinlenir. Yazı alanında
     (plan maddesi eklerken) tuşlar normal davransın diye input/textarea
     içindeyken devre dışı kalır. */
  useEffect(() => {
    if (!introDone) return;

    const isTyping = (el: EventTarget | null) => {
      const node = el as HTMLElement | null;
      if (!node) return false;
      const tag = node.tagName;
      return tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT" || node.isContentEditable;
    };

    const onKey = (e: KeyboardEvent) => {
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      if (isTyping(e.target)) return;

      /* Boşluk: müziği çal / duraklat */
      if (e.code === "Space") {
        e.preventDefault();
        togglePlay();
        return;
      }

      switch (e.key) {
        case "1":
          go("home");
          break;
        case "2":
          go("letter");
          break;
        case "3":
          go("kept");
          break;
        case "4":
          go("plan");
          break;
        case "5":
          go("surprise");
          break;
        case "6":
          go("memories");
          break;
        case "7":
          go("quiz");
          break;
        case "8":
          go("settings");
          break;
        case "?":
          show("1–8 sayfalar · Boşluk müzik · Esc menüyü kapatır");
          break;
        case "Escape":
          setSidebar(false);
          break;
        default:
          return;
      }
    };

    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [introDone, go, togglePlay, show]);

  const onOpenBottom = useCallback(
    (kind: "coffee" | "gift" | "memory" | "cat") => {
      if (kind === "coffee") {
        show("Kahven hazır, afiyet olsun ☕");
        return;
      }
      if (kind === "cat") {
        show("Minik patiler yakında burada ♡");
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
      case "kept":
        return <KeptLetters />;
      case "quiz":
        return <Quiz />;
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
            togetherSince={togetherSince}
            onTogetherSince={setTogetherSince}
            onReset={resetAll}
            onTestSound={() => show("Ses çalışıyor ♪")}
            ambience={ambience}
            onAmbience={onAmbience}
            buddiesOn={buddies}
            onToggleBuddies={() => setBuddies((b) => !b)}
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
            volume={volume}
            onVolume={onVolume}
            song={song}
            playing={playing}
            elapsed={track.elapsed}
            duration={track.duration}
            onPlayToggle={togglePlay}
            onNext={nextSong}
            onPrev={prevSong}
            onSeek={seekTrack}
            onOpenLetter={() => go("letter")}
            togetherSince={togetherSince}
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
          hour={hour}
          soundOn={soundOn}
          onToggleSound={() => {
            setSoundOn((s) => !s);
            show(soundOn ? "Ses kapatıldı" : "Ses açıldı");
          }}
        />

        <div className="app__main">
          <Topbar onBurger={() => setSidebar((s) => !s)} />

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











