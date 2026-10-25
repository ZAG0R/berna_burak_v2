import { useEffect, useState } from "react";
import { Icon } from "./Icons";
import { textForHour } from "../data/scenes";

export default function Intro({ onDone, hour }: { onDone: () => void; hour: number }) {
  const [out, setOut] = useState(false);
  const text = textForHour(hour);

  useEffect(() => {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const hold = reduced ? 500 : 2300;
    const t1 = window.setTimeout(() => setOut(true), hold);
    const t2 = window.setTimeout(onDone, hold + 950);
    return () => {
      window.clearTimeout(t1);
      window.clearTimeout(t2);
    };
  }, [onDone]);

  return (
    <div
      className={`intro ${out ? "intro--out" : ""}`}
      onClick={() => {
        setOut(true);
        window.setTimeout(onDone, 900);
      }}
      role="presentation"
    >
      <div className="intro__inner">
        <div className="intro__sun" aria-hidden>
          <Icon name="sunrays" />
        </div>
        <p className="intro__line">
          {text.line1} <span>{text.line2}</span> ♡
        </p>
        <p className="intro__sub">{text.sub}</p>
        <div className="intro__bar" aria-hidden>
          <i />
        </div>
      </div>
    </div>
  );
}
