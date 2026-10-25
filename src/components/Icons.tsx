import type { SVGProps } from 'react'

/* ============================================================
   İkon seti — 24px grid, stroke tabanlı, currentColor
   ============================================================ */

type IconProps = SVGProps<SVGSVGElement>

const base = (p: IconProps) => ({
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.5,
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const,
  'aria-hidden': true,
  focusable: false,
  ...p,
})

export const Sun = (p: IconProps) => (
  <svg {...base(p)}>
    <circle cx="12" cy="12" r="4.2" />
    <path d="M12 2.6v2.2M12 19.2v2.2M4.2 12H2M22 12h-2.2M6.3 6.3 4.8 4.8M19.2 19.2l-1.5-1.5M6.3 17.7l-1.5 1.5M19.2 4.8l-1.5 1.5" />
  </svg>
)

export const SunRays = (p: IconProps) => (
  <svg {...base(p)} strokeWidth={1.1}>
    <circle cx="12" cy="12" r="4" />
    <path d="M12 1.6v3M12 19.4v3M1.6 12h3M19.4 12h3M4.6 4.6l2.1 2.1M17.3 17.3l2.1 2.1M4.6 19.4l2.1-2.1M17.3 6.7l2.1-2.1M7.5 3.4 6.8 6M17.2 18l-.7 2.6M3.4 7.5 6 6.8M18 17.2l2.6-.7M3.4 16.5 6 17.2M18 6.8l2.6.7M7.5 20.6 6.8 18M17.2 6l-.7-2.6" />
  </svg>
)

export const Home = (p: IconProps) => (
  <svg {...base(p)}>
    <path d="M3.5 10.6 12 3.8l8.5 6.8V20a1 1 0 0 1-1 1h-15a1 1 0 0 1-1-1z" />
    <path d="M9.2 21v-6.4h5.6V21" />
  </svg>
)

export const Chat = (p: IconProps) => (
  <svg {...base(p)}>
    <path d="M20.4 12.2c0 4.1-3.8 7.4-8.4 7.4a9.7 9.7 0 0 1-2.6-.35L4.6 21l1.2-3.5A7 7 0 0 1 3.6 12.2c0-4.1 3.8-7.4 8.4-7.4s8.4 3.3 8.4 7.4Z" />
    <path d="M8.8 12h.01M12 12h.01M15.2 12h.01" strokeWidth={2.2} />
  </svg>
)

export const Calendar = (p: IconProps) => (
  <svg {...base(p)}>
    <rect x="3.4" y="5.2" width="17.2" height="15.4" rx="2.4" />
    <path d="M3.4 10h17.2M8.4 3.4v3.4M15.6 3.4v3.4" />
    <path d="M8 14.2h3.2M8 17.4h6.4" strokeWidth={1.5} />
  </svg>
)

export const Gift = (p: IconProps) => (
  <svg {...base(p)}>
    <path d="M3.6 11.2h16.8V20a1 1 0 0 1-1 1H4.6a1 1 0 0 1-1-1z" />
    <path d="M2.6 7.6h18.8v3.6H2.6zM12 7.6V21" />
    <path d="M12 7.6S10.9 3.2 8.6 3.2a2.4 2.4 0 0 0 0 4.4zM12 7.6s1.1-4.4 3.4-4.4a2.4 2.4 0 0 1 0 4.4z" />
  </svg>
)

export const Heart = (p: IconProps) => (
  <svg {...base(p)}>
    <path d="M12 20.4S3.6 15.3 3.6 9.6A4.6 4.6 0 0 1 12 7a4.6 4.6 0 0 1 8.4 2.6c0 5.7-8.4 10.8-8.4 10.8Z" />
  </svg>
)

export const HeartFilled = (p: IconProps) => (
  <svg {...base(p)} fill="currentColor" stroke="none">
    <path d="M12 20.8S3.3 15.5 3.3 9.5A4.9 4.9 0 0 1 12 6.7a4.9 4.9 0 0 1 8.7 2.8c0 6-8.7 11.3-8.7 11.3Z" />
  </svg>
)

export const Settings = (p: IconProps) => (
  <svg {...base(p)}>
    <circle cx="12" cy="12" r="3.1" />
    <path d="M12 2.6v2.1M12 19.3v2.1M4.1 7.2l1.8 1.05M18.1 15.75l1.8 1.05M4.1 16.8l1.8-1.05M18.1 8.25l1.8-1.05" />
    <path d="M6.4 12a5.6 5.6 0 0 1 .9-3.05M17.6 12a5.6 5.6 0 0 0-.9-3.05M17.6 12a5.6 5.6 0 0 1-.9 3.05M6.4 12a5.6 5.6 0 0 0 .9 3.05" />
  </svg>
)

export const Coffee = (p: IconProps) => (
  <svg {...base(p)}>
    <path d="M4.6 9.4h12v6.2a4.4 4.4 0 0 1-4.4 4.4H9a4.4 4.4 0 0 1-4.4-4.4z" />
    <path d="M16.6 10.8h1.7a2.6 2.6 0 0 1 0 5.2h-1.7" />
    <path d="M7.6 3.4c-.6 1.2.6 1.6 0 2.8M11 3.4c-.6 1.2.6 1.6 0 2.8" />
  </svg>
)

export const Star = (p: IconProps) => (
  <svg {...base(p)}>
    <path d="M12 3.4l2.6 5.4 5.9.8-4.3 4.1 1.05 5.9L12 16.8l-5.25 2.8L7.8 13.7 3.5 9.6l5.9-.8z" />
  </svg>
)

export const Sparkles = (p: IconProps) => (
  <svg {...base(p)}>
    <path d="M12 3.2l1.5 3.9 3.9 1.5-3.9 1.5L12 14l-1.5-3.9L6.6 8.6l3.9-1.5z" />
    <path d="M18.4 14.2l.75 1.95 1.95.75-1.95.75-.75 1.95-.75-1.95-1.95-.75 1.95-.75zM5.4 14.6l.6 1.5 1.5.6-1.5.6-.6 1.5-.6-1.5-1.5-.6 1.5-.6z" />
  </svg>
)

export const Leaf = (p: IconProps) => (
  <svg {...base(p)}>
    <path d="M20.4 3.6c0 8.6-4.2 12.6-9.6 12.6a5.4 5.4 0 0 1-5.4-5.4c0-5.4 4-9.6 15-7.2Z" />
    <path d="M4.2 20.4c1.2-4.2 3.6-7.2 7.2-9.6" />
  </svg>
)

export const Rain = (p: IconProps) => (
  <svg {...base(p)}>
    <path d="M6.6 13.4a4.1 4.1 0 0 1 .5-8.2 5.4 5.4 0 0 1 10.2 1.4 3.6 3.6 0 0 1 1.1 6.8" />
    <path d="M8.4 16.4l-.9 2.6M12 16.4l-.9 2.6M15.6 16.4l-.9 2.6" />
  </svg>
)

export const Bird = (p: IconProps) => (
  <svg {...base(p)}>
    <path d="M3.2 13.6c3.2.6 5.4-.6 6.8-2.6 1-1.5 1.4-3.4 3-4.4 1.6-1 3.4-.4 4 .6M3.2 13.6c0 3.4 2.6 5.4 5.8 5.4 3.4 0 6.2-2.4 6.2-6.2" />
    <path d="M15.4 9.2 20 8l-.8 3.4" />
    <path d="M9 19v2.2M13 19v2.2" />
    <circle cx="15.6" cy="6.6" r=".9" fill="currentColor" stroke="none" />
  </svg>
)

export const Waves = (p: IconProps) => (
  <svg {...base(p)}>
    <path d="M2.6 8.6c1.9 0 2.4-1.6 4.3-1.6s2.4 1.6 4.3 1.6 2.4-1.6 4.3-1.6 2.4 1.6 4.3 1.6M2.6 13.4c1.9 0 2.4-1.6 4.3-1.6s2.4 1.6 4.3 1.6 2.4-1.6 4.3-1.6 2.4 1.6 4.3 1.6M2.6 18.2c1.9 0 2.4-1.6 4.3-1.6s2.4 1.6 4.3 1.6 2.4-1.6 4.3-1.6 2.4 1.6 4.3 1.6" />
  </svg>
)

export const Sunrise = (p: IconProps) => (
  <svg {...base(p)}>
    <path d="M2.8 18.4h18.4M6.2 18.4a5.8 5.8 0 0 1 11.6 0" />
    <path d="M12 3.2v3.4M5.4 6.2l1.9 1.9M18.6 6.2l-1.9 1.9M2.4 13h1.6M20 13h1.6" />
  </svg>
)

export const Moon = (p: IconProps) => (
  <svg {...base(p)}>
    <path d="M20.4 14.2A8.6 8.6 0 0 1 9.8 3.6a8.6 8.6 0 1 0 10.6 10.6Z" />
  </svg>
)

export const Check = (p: IconProps) => (
  <svg {...base(p)} strokeWidth={2.6}>
    <path d="M4.6 12.6 9.4 17.4 19.4 6.8" />
  </svg>
)

export const ChevronRight = (p: IconProps) => (
  <svg {...base(p)} strokeWidth={2}>
    <path d="M9.2 5.6 15.6 12l-6.4 6.4" />
  </svg>
)

export const ChevronLeft = (p: IconProps) => (
  <svg {...base(p)} strokeWidth={2}>
    <path d="M14.8 5.6 8.4 12l6.4 6.4" />
  </svg>
)

export const ChevronDown = (p: IconProps) => (
  <svg {...base(p)} strokeWidth={2}>
    <path d="M5.6 9.2 12 15.6l6.4-6.4" />
  </svg>
)

export const Close = (p: IconProps) => (
  <svg {...base(p)} strokeWidth={2}>
    <path d="M6.2 6.2 17.8 17.8M17.8 6.2 6.2 17.8" />
  </svg>
)

export const Menu = (p: IconProps) => (
  <svg {...base(p)} strokeWidth={2}>
    <path d="M3.6 6.6h16.8M3.6 12h16.8M3.6 17.4h16.8" />
  </svg>
)

export const Play = (p: IconProps) => (
  <svg {...base(p)} fill="currentColor" stroke="none">
    <path d="M7.4 4.6 19.2 12 7.4 19.4z" />
  </svg>
)

export const Pause = (p: IconProps) => (
  <svg {...base(p)} fill="currentColor" stroke="none">
    <rect x="6.6" y="4.8" width="3.8" height="14.4" rx="1.1" />
    <rect x="13.6" y="4.8" width="3.8" height="14.4" rx="1.1" />
  </svg>
)

export const SkipBack = (p: IconProps) => (
  <svg {...base(p)} fill="currentColor" stroke="none">
    <path d="M17.6 5.4v13.2L8.6 12zM6.4 5.4h1.6v13.2H6.4z" />
  </svg>
)

export const SkipForward = (p: IconProps) => (
  <svg {...base(p)} fill="currentColor" stroke="none">
    <path d="M6.4 5.4v13.2L15.4 12zM16 5.4h1.6v13.2H16z" />
  </svg>
)

export const Volume = (p: IconProps) => (
  <svg {...base(p)}>
    <path d="M11.4 4.6 6.8 8.4H3.6v7.2h3.2l4.6 3.8z" />
    <path d="M15.2 9.2a3.9 3.9 0 0 1 0 5.6M17.8 6.6a7.6 7.6 0 0 1 0 10.8" />
  </svg>
)

export const VolumeOff = (p: IconProps) => (
  <svg {...base(p)}>
    <path d="M11.4 4.6 6.8 8.4H3.6v7.2h3.2l4.6 3.8z" />
    <path d="M15.4 9.6 19.8 14M19.8 9.6 15.4 14" />
  </svg>
)

export const Trash = (p: IconProps) => (
  <svg {...base(p)}>
    <path d="M4.4 6.8h15.2M9.4 6.8V4.6h5.2v2.2" />
    <path d="M6.4 6.8 7.4 20a1 1 0 0 0 1 .9h7.2a1 1 0 0 0 1-.9l1-13.2" />
    <path d="M10.4 10.6v6.8M13.6 10.6v6.8" strokeWidth={1.4} />
  </svg>
)

export const Plus = (p: IconProps) => (
  <svg {...base(p)} strokeWidth={2.1}>
    <path d="M12 5.4v13.2M5.4 12h13.2" />
  </svg>
)

export const Mail = (p: IconProps) => (
  <svg {...base(p)}>
    <rect x="3" y="5.4" width="18" height="13.2" rx="2.2" />
    <path d="M3.6 6.8 12 13.2l8.4-6.4" />
  </svg>
)

export const Camera = (p: IconProps) => (
  <svg {...base(p)}>
    <path d="M4.2 8.4h2.6l1.6-2.4h7.2l1.6 2.4h2.6a1.2 1.2 0 0 1 1.2 1.2v8.6a1.2 1.2 0 0 1-1.2 1.2H4.2A1.2 1.2 0 0 1 3 18.2V9.6a1.2 1.2 0 0 1 1.2-1.2Z" />
    <circle cx="12" cy="13.4" r="3.4" />
  </svg>
)

export const Send = (p: IconProps) => (
  <svg {...base(p)}>
    <path d="M20.6 3.6 3.4 10.4l6.8 2.8 2.8 6.8z" />
    <path d="M20.6 3.6 10.2 13.2" />
  </svg>
)

export const Refresh = (p: IconProps) => (
  <svg {...base(p)}>
    <path d="M20.2 12a8.2 8.2 0 1 1-2.4-5.8" />
    <path d="M20.6 3.8v4.4h-4.4" />
  </svg>
)

export const Crown = (p: IconProps) => (
  <svg {...base(p)} fill="currentColor" stroke="none">
    <path d="M3.2 18.6 2.4 7.2l5.4 3.8L12 4.2l4.2 6.8 5.4-3.8-.8 11.4z" />
  </svg>
)

export const Quote = (p: IconProps) => (
  <svg {...base(p)} fill="currentColor" stroke="none">
    <path d="M9.4 6.2c-3 1-4.8 3.2-4.8 6.6v5h5v-5H6.8c0-2 .9-3.4 2.6-4.2zM19.4 6.2c-3 1-4.8 3.2-4.8 6.6v5h5v-5h-2.8c0-2 .9-3.4 2.6-4.2z" />
  </svg>
)

export const Compass = (p: IconProps) => (
  <svg {...base(p)}>
    <circle cx="12" cy="12" r="8.8" />
    <path d="M15.4 8.6 13.6 13.6 8.6 15.4l1.8-5z" />
  </svg>
)

export const Clock = (p: IconProps) => (
  <svg {...base(p)}>
    <circle cx="12" cy="12" r="8.8" />
    <path d="M12 7.2V12l3.4 2" />
  </svg>
)

export const Wind = (p: IconProps) => (
  <svg {...base(p)}>
    <path d="M3.4 8.6h9.2a2.6 2.6 0 1 0-2.6-2.6M3.4 12.4h13a2.6 2.6 0 1 1-2.6 2.6M3.4 16.4h5.2" />
  </svg>
)

export const Droplet = (p: IconProps) => (
  <svg {...base(p)}>
    <path d="M12 3.4c3.2 3.6 5.4 6.4 5.4 9.4a5.4 5.4 0 0 1-10.8 0c0-3 2.2-5.8 5.4-9.4Z" />
  </svg>
)

export const Palette = (p: IconProps) => (
  <svg {...base(p)}>
    <path d="M12 3.4a8.6 8.6 0 0 0 0 17.2c1.3 0 2-.8 2-1.8s-.7-1.8-.7-2.6c0-.9.7-1.5 1.7-1.5h1.6a4.2 4.2 0 0 0 4.2-4.2c0-3.9-3.9-7.1-8.8-7.1Z" />
    <path d="M7.6 9.4h.01M11 7.4h.01M15 8.6h.01M6.6 13.6h.01" strokeWidth={2.3} />
  </svg>
)

export const Eye = (p: IconProps) => (
  <svg {...base(p)}>
    <path d="M2.4 12S5.8 5.8 12 5.8 21.6 12 21.6 12 18.2 18.2 12 18.2 2.4 12 2.4 12Z" />
    <circle cx="12" cy="12" r="3" />
  </svg>
)

export const Music = (p: IconProps) => (
  <svg {...base(p)}>
    <path d="M9.4 17.4V6.6l9-1.8v10.8" />
    <circle cx="6.8" cy="17.8" r="2.6" />
    <circle cx="15.8" cy="15.6" r="2.6" />
  </svg>
)

export const Feather = (p: IconProps) => (
  <svg {...base(p)}>
    <path d="M19.4 4.6c-6 0-10.8 3.4-12.4 8.4l-2.6 6.4 6.4-2.6c5-1.6 8.6-6.2 8.6-12.2Z" />
    <path d="M4.4 19.6 13 11M9.6 13.4h5.2" />
  </svg>
)

export const MapPin = (p: IconProps) => (
  <svg {...base(p)}>
    <path d="M12 21.4s6.4-5.6 6.4-10.6a6.4 6.4 0 0 0-12.8 0c0 5 6.4 10.6 6.4 10.6Z" />
    <circle cx="12" cy="10.6" r="2.4" />
  </svg>
)

export const Smile = (p: IconProps) => (
  <svg {...base(p)}>
    <circle cx="12" cy="12" r="8.8" />
    <path d="M8.4 14.2a4.4 4.4 0 0 0 7.2 0" />
    <path d="M9.2 9.6h.01M14.8 9.6h.01" strokeWidth={2.3} />
  </svg>
)

export const Award = (p: IconProps) => (
  <svg {...base(p)}>
    <circle cx="12" cy="9.4" r="5.4" />
    <path d="M8.6 13.8 7.4 20.6l4.6-2.6 4.6 2.6-1.2-6.8" />
  </svg>
)

export const Info = (p: IconProps) => (
  <svg {...base(p)}>
    <circle cx="12" cy="12" r="8.8" />
    <path d="M12 11v5.4M12 7.8h.01" strokeWidth={2.1} />
  </svg>
)

export const CloudSun = (p: IconProps) => (
  <svg {...base(p)}>
    <path d="M8.6 5.4a3.6 3.6 0 0 1 3.5 2.8M5.2 4.6V2.8M2.6 7.2H.9M3.4 4.4 2.1 3.1" />
    <path d="M9.4 18.4a3.6 3.6 0 0 1 .4-7.2 4.7 4.7 0 0 1 8.9 1.2 3.2 3.2 0 0 1 1 6" />
    <path d="M6.4 21.2h11" />
  </svg>
)

export const CloudRain = (p: IconProps) => (
  <svg {...base(p)}>
    <path d="M6.8 14.4a4.2 4.2 0 0 1 .5-8.4 5.5 5.5 0 0 1 10.4 1.4 3.7 3.7 0 0 1 1.1 7" />
    <path d="M8.6 17.4l-.9 2.8M12.2 17.4l-.9 2.8M15.8 17.4l-.9 2.8" />
  </svg>
)

export const Snow = (p: IconProps) => (
  <svg {...base(p)}>
    <path d="M12 3v18M6.3 6.3l11.4 11.4M3 12h18M6.3 17.7l11.4-11.4" />
    <circle cx="12" cy="6" r="1.2" fill="currentColor" stroke="none" />
    <circle cx="12" cy="18" r="1.2" fill="currentColor" stroke="none" />
    <circle cx="6" cy="12" r="1.2" fill="currentColor" stroke="none" />
    <circle cx="18" cy="12" r="1.2" fill="currentColor" stroke="none" />
  </svg>
)

export const CloudSnow = (p: IconProps) => (
  <svg {...base(p)}>
    <path d="M6.6 13.4a4.1 4.1 0 0 1 .5-8.2 5.4 5.4 0 0 1 10.2 1.4 3.6 3.6 0 0 1 1.1 6.8" />
    <circle cx="8" cy="17" r=".8" fill="currentColor" stroke="none" />
    <circle cx="12" cy="17" r=".8" fill="currentColor" stroke="none" />
    <circle cx="16" cy="17" r=".8" fill="currentColor" stroke="none" />
    <circle cx="10" cy="19.5" r=".8" fill="currentColor" stroke="none" />
    <circle cx="14" cy="19.5" r=".8" fill="currentColor" stroke="none" />
  </svg>
)

export const CloudLightning = (p: IconProps) => (
  <svg {...base(p)}>
    <path d="M6.6 13.4a4.1 4.1 0 0 1 .5-8.2 5.4 5.4 0 0 1 10.2 1.4 3.6 3.6 0 0 1 1.1 6.8" />
    <path d="M13.5 14.5 10 19l1.5-3h-3l3.5-4.5L11 15h3z" strokeWidth={1.9} />
  </svg>
)

export const Waves2 = (p: IconProps) => (
  <svg {...base(p)}>
    <path d="M2.6 12.6c2.2 0 2.6-2 4.8-2s2.6 2 4.8 2 2.6-2 4.8-2 2.6 2 4.4 2" />
    <path d="M2.6 17c2.2 0 2.6-2 4.8-2s2.6 2 4.8 2 2.6-2 4.8-2 2.6 2 4.4 2M2.6 8.2c2.2 0 2.6-2 4.8-2s2.6 2 4.8 2 2.6-2 4.8-2 2.6 2 4.4 2" />
  </svg>
)

export const ICON_MAP = {
  sun: Sun,
  sunrays: SunRays,
  home: Home,
  chat: Chat,
  calendar: Calendar,
  gift: Gift,
  heart: Heart,
  heartfilled: HeartFilled,
  settings: Settings,
  coffee: Coffee,
  star: Star,
  sparkles: Sparkles,
  leaf: Leaf,
  rain: Rain,
  snow: Snow,
  cloudSnow: CloudSnow,
  cloudLightning: CloudLightning,
  cloudRain: CloudRain,
  cloudSun: CloudSun,
  bird: Bird,
  waves: Waves,
  sunrise: Sunrise,
  moon: Moon,
  check: Check,
  chevronRight: ChevronRight,
  chevronLeft: ChevronLeft,
  chevronDown: ChevronDown,
  close: Close,
  menu: Menu,
  play: Play,
  pause: Pause,
  skipBack: SkipBack,
  skipForward: SkipForward,
  volume: Volume,
  volumeOff: VolumeOff,
  trash: Trash,
  plus: Plus,
  mail: Mail,
  camera: Camera,
  send: Send,
  refresh: Refresh,
  crown: Crown,
  quote: Quote,
  compass: Compass,
  clock: Clock,
  wind: Wind,
  droplet: Droplet,
  palette: Palette,
  eye: Eye,
  music: Music,
  feather: Feather,
  mapPin: MapPin,
  smile: Smile,
  award: Award,
  info: Info,
} as const

export type IconName = keyof typeof ICON_MAP

export function Icon({ name, ...rest }: { name: string } & IconProps) {
  const Cmp = ICON_MAP[name as IconName] ?? Sparkles
  return <Cmp {...rest} />
}
