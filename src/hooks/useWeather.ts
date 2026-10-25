import { useEffect, useState } from "react";
import { DEFAULT_WEATHER } from "../data/content";
import type { WeatherIconName } from "../components/WeatherIcons";

/* ============================================================
   Hava durumu — açık servis, hata olursa sabit değere düşer
   ============================================================ */

export type Weather = {
  temp: number;
  desc: string;
  icon: WeatherIconName;
  wind: number;
  humidity: number;
};

/* Open-Meteo kodları → ikon adları. Gece için güneşli ikonlar aya döner. */
const WCODE: Record<number, { desc: string; icon: WeatherIconName; night?: WeatherIconName }> = {
  0: { desc: "Açık", icon: "sun", night: "moon" },
  1: { desc: "Az bulutlu", icon: "cloudSun", night: "cloudMoon" },
  2: { desc: "Parçalı bulutlu", icon: "cloudSun", night: "cloudMoon" },
  3: { desc: "Kapalı", icon: "cloud" },
  45: { desc: "Puslu", icon: "fog" },
  48: { desc: "Sisli", icon: "fog" },
  51: { desc: "Hafif çisenti", icon: "cloudRain" },
  53: { desc: "Çisenti", icon: "cloudRain" },
  55: { desc: "Yoğun çisenti", icon: "cloudRain" },
  61: { desc: "Hafif yağmur", icon: "cloudRain" },
  63: { desc: "Yağmurlu", icon: "cloudRain" },
  65: { desc: "Sağanak", icon: "shower" },
  71: { desc: "Hafif kar", icon: "cloudSnow" },
  73: { desc: "Kar yağışlı", icon: "cloudSnow" },
  75: { desc: "Yoğun kar", icon: "cloudSnow" },
  77: { desc: "Kar taneleri", icon: "cloudSnow" },
  80: { desc: "Sağanak geçişi", icon: "shower" },
  81: { desc: "Yağmur sağanağı", icon: "shower" },
  82: { desc: "Şiddetli sağanak", icon: "shower" },
  85: { desc: "Kar sağanağı", icon: "cloudSnow" },
  86: { desc: "Yoğun kar sağanağı", icon: "sleet" },
  95: { desc: "Gök gürültülü", icon: "cloudLightning" },
  96: { desc: "Fırtına + dolu", icon: "cloudLightning" },
  99: { desc: "Şiddetli fırtına", icon: "cloudLightning" },
};

const FALLBACK: Weather = {
  temp: DEFAULT_WEATHER.temp,
  desc: DEFAULT_WEATHER.desc,
  icon: "cloudSun",
  wind: 8,
  humidity: 48,
};

const ENDPOINT =
  "https://api.open-meteo.com/v1/forecast?latitude=37.0&longitude=35.32" +
  "&current=temperature_2m,relative_humidity_2m,weather_code,wind_speed_10m&timezone=auto";

type Payload = {
  current?: {
    temperature_2m?: number;
    relative_humidity_2m?: number;
    weather_code?: number;
    wind_speed_10m?: number;
  };
};

/* Test kolaylığı: ?h=19 ile saat zorlanabilir. */
function currentHour() {
  const raw = new URLSearchParams(window.location.search).get("h");
  const n = Number(raw);
  return raw !== null && Number.isFinite(n) && n >= 0 && n <= 23 ? n : new Date().getHours();
}

export function useWeather() {
  const forced = new URLSearchParams(window.location.search);
  const forcedCode = Number(forced.get("wc"));
  const forcedTemp = Number(forced.get("t"));
  const override = forced.has("wc") && Number.isFinite(forcedCode);

  const [weather, setWeather] = useState<Weather>(
    override
      ? (() => {
          const meta = WCODE[forcedCode] ?? { desc: "Parçalı bulutlu", icon: "cloudSun" as const };
          const h = currentHour();
          const isNight = h >= 19 || h < 6;
          return {
            ...FALLBACK,
            temp: Number.isFinite(forcedTemp) ? forcedTemp : FALLBACK.temp,
            desc: meta.desc,
            icon: isNight && meta.night ? meta.night : meta.icon,
          };
        })()
      : FALLBACK,
  );
  const [live, setLive] = useState(false);
  const [code, setCode] = useState(override ? forcedCode : 2);

  useEffect(() => {
    if (override) return;
    const ac = new AbortController();

    const load = () =>
      fetch(ENDPOINT, { signal: ac.signal })
        .then((r) => (r.ok ? r.json() : Promise.reject(new Error("yanıt yok"))))
        .then((data: Payload) => {
          const c = data.current;
          if (!c || typeof c.temperature_2m !== "number") return;

          // Gece ise güneş/ay ikonları gece karşılığına döner.
          const hour = currentHour();
          const isNight = hour >= 19 || hour < 6;
          const weatherCode = c.weather_code ?? 2;
          const meta = WCODE[weatherCode] ?? { desc: "Parçalı bulutlu", icon: "cloudSun" as const, night: "cloudMoon" as const };
          const icon = isNight && meta.night ? meta.night : meta.icon;

          setCode(weatherCode);
          setWeather({
            temp: Math.round(c.temperature_2m),
            desc: meta.desc,
            icon,
            wind: Math.round(c.wind_speed_10m ?? 8),
            humidity: Math.round(c.relative_humidity_2m ?? 48),
          });
          setLive(true);
        })
        .catch(() => undefined);

    void load();
    // Hava durumu yarım saatte bir tazelenir.
    const id = window.setInterval(() => void load(), 30 * 60 * 1000);

    return () => {
      ac.abort();
      window.clearInterval(id);
    };
  }, [override]);

  return { weather, code, live };
}
