import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import type { Scene } from "../data/scenes";
import { CLICK_LINES, COND_LINES, IDLE_LINES, SLOT_LINES, pick } from "../data/buddy";

/* ============================================================
   Minik dostlar — kalp antenli kız ve taçlı oğlan.

   Neden three.js: projede zaten var (babylon ~700 KB ek yük olurdu).
   Davranış:
   - nefes alır, hafifçe sallanır, göz kırpar, imleci takip eder
   - tıklanınca zıplar, kalp saçar ve konuşur
   - saat dilimi / hava durumu değişince bir şey söyler
   - ara ara kendi kendine konuşur
   ============================================================ */

type Props = { scene: Scene; reducedMotion: boolean; dancing?: boolean };

const PINK = "#ff9db4";
const CROWN = "#ffd479";

/** Kalp profili (extrude için). */
function heartShape(size: number) {
  const s = size;
  const shape = new THREE.Shape();
  shape.moveTo(0, -s * 0.5);
  shape.bezierCurveTo(s * 0.95, s * 0.15, s * 0.5, s * 1.05, 0, s * 0.5);
  shape.bezierCurveTo(-s * 0.5, s * 1.05, -s * 0.95, s * 0.15, 0, -s * 0.5);
  return shape;
}

type BuddyParts = {
  root: THREE.Group;
  face: THREE.Group;
  eyes: THREE.Mesh[];
  heart?: THREE.Mesh;
  crown?: THREE.Group;
  arms: THREE.Mesh[];
};

function makeBuddy(opts: {
  body: string;
  accent: string;
  crown?: boolean;
  lash?: boolean;
}): BuddyParts {
  const root = new THREE.Group();

  const bodyMat = new THREE.MeshStandardMaterial({
    color: opts.body,
    roughness: 0.62,
    metalness: 0.04,
  });

  const body = new THREE.Mesh(new THREE.SphereGeometry(0.62, 32, 24), bodyMat);
  body.scale.set(1, 0.94, 1);
  root.add(body);

  /* kulaklar */
  const earGeo = new THREE.SphereGeometry(0.17, 20, 14);
  for (const sx of [-1, 1]) {
    const ear = new THREE.Mesh(earGeo, bodyMat);
    ear.position.set(sx * 0.45, 0.42, -0.02);
    ear.scale.set(1, 1, 0.7);
    root.add(ear);
  }

  /* yüz */
  const face = new THREE.Group();
  face.position.z = 0.5;
  root.add(face);

  const eyeMat = new THREE.MeshStandardMaterial({ color: "#2b2230", roughness: 0.35 });
  const eyeGeo = new THREE.SphereGeometry(0.082, 18, 14);
  const shineGeo = new THREE.SphereGeometry(0.026, 10, 8);
  const shineMat = new THREE.MeshBasicMaterial({ color: "#ffffff" });
  const eyes: THREE.Mesh[] = [];

  for (const sx of [-1, 1]) {
    const eye = new THREE.Mesh(eyeGeo, eyeMat);
    eye.position.set(sx * 0.2, 0.1, 0.035);
    eye.scale.set(1, 1.06, 0.55);
    face.add(eye);
    eyes.push(eye);

    const shine = new THREE.Mesh(shineGeo, shineMat);
    shine.position.set(sx * 0.2 + 0.024, 0.13, 0.085);
    face.add(shine);

    if (opts.lash) {
      const lash = new THREE.Mesh(
        new THREE.TorusGeometry(0.1, 0.012, 6, 14, Math.PI * 0.85),
        eyeMat,
      );
      lash.position.set(sx * 0.2, 0.13, 0.05);
      lash.rotation.z = sx > 0 ? -0.2 : Math.PI + 0.2;
      face.add(lash);
    }
  }

  /* allık */
  const blushMat = new THREE.MeshBasicMaterial({
    color: opts.accent,
    transparent: true,
    opacity: 0.4,
  });
  const blushGeo = new THREE.CircleGeometry(0.085, 16);
  for (const sx of [-1, 1]) {
    const blush = new THREE.Mesh(blushGeo, blushMat);
    blush.position.set(sx * 0.36, -0.06, 0.03);
    face.add(blush);
  }

  /* gülümseme */
  const mouth = new THREE.Mesh(
    new THREE.TorusGeometry(0.075, 0.014, 6, 16, Math.PI),
    new THREE.MeshBasicMaterial({ color: "#7a4550" }),
  );
  mouth.position.set(0, -0.02, 0.04);
  mouth.rotation.z = Math.PI;
  face.add(mouth);

  /* kollar */
  const armGeo = new THREE.SphereGeometry(0.12, 14, 10);
  const arms: THREE.Mesh[] = [];
  for (const sx of [-1, 1]) {
    const arm = new THREE.Mesh(armGeo, bodyMat);
    arm.position.set(sx * 0.58, -0.2, 0.06);
    arm.scale.set(0.85, 1.15, 0.85);
    root.add(arm);
    arms.push(arm);
  }

  /* ayaklar */
  const footGeo = new THREE.SphereGeometry(0.14, 14, 10);
  for (const sx of [-1, 1]) {
    const foot = new THREE.Mesh(footGeo, bodyMat);
    foot.position.set(sx * 0.2, -0.56, 0.12);
    foot.scale.set(1, 0.6, 1.15);
    root.add(foot);
  }

  let heart: THREE.Mesh | undefined;
  if (!opts.crown) {
    /* kalp anten */
    const stem = new THREE.Mesh(
      new THREE.CylinderGeometry(0.012, 0.012, 0.2, 8),
      new THREE.MeshStandardMaterial({ color: "#8f6b57", roughness: 0.7 }),
    );
    stem.position.set(0, 0.66, 0);
    root.add(stem);

    heart = new THREE.Mesh(
      new THREE.ExtrudeGeometry(heartShape(0.17), {
        depth: 0.06,
        bevelEnabled: true,
        bevelSize: 0.012,
        bevelThickness: 0.012,
        bevelSegments: 2,
      }),
      new THREE.MeshStandardMaterial({
        color: PINK,
        roughness: 0.35,
        emissive: new THREE.Color(PINK),
        emissiveIntensity: 0.32,
      }),
    );
    heart.position.set(0, 0.74, 0.02);
    heart.rotation.z = Math.PI; // sivri ucu aşağı
    heart.scale.setScalar(0.95);
    root.add(heart);
  }

  let crown: THREE.Group | undefined;
  if (opts.crown) {
    crown = new THREE.Group();
    const goldMat = new THREE.MeshStandardMaterial({
      color: CROWN,
      roughness: 0.28,
      metalness: 0.55,
      emissive: new THREE.Color("#7a5410"),
      emissiveIntensity: 0.3,
    });
    const band = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.22, 0.1, 18, 1, true), goldMat);
    crown.add(band);
    const spikeGeo = new THREE.ConeGeometry(0.055, 0.16, 12);
    for (let i = 0; i < 5; i += 1) {
      const a = (i / 5) * Math.PI * 2;
      const spike = new THREE.Mesh(spikeGeo, goldMat);
      spike.position.set(Math.cos(a) * 0.18, 0.12, Math.sin(a) * 0.18);
      crown.add(spike);
    }
    crown.position.set(0, 0.7, 0);
    crown.rotation.y = 0.4;
    root.add(crown);
  }

  return { root, face, eyes, heart, crown, arms };
}

export default function Buddy({ scene, reducedMotion, dancing = false }: Props) {
  const hostRef = useRef<HTMLDivElement | null>(null);
  const sayRef = useRef<((text: string) => void) | null>(null);
  const pauseRef = useRef<((v: boolean) => void) | null>(null);
  const danceRef = useRef(dancing);
  danceRef.current = dancing;
  const [line, setLine] = useState<string | null>(null);
  const hideTimer = useRef<number | undefined>(undefined);

  const say = (text: string) => {
    setLine(text);
    window.clearTimeout(hideTimer.current);
    hideTimer.current = window.setTimeout(() => setLine(null), 6200);
  };
  sayRef.current = say;

  /* Dışarıdan konuşturma: window.dispatchEvent(new CustomEvent("buddy:say", { detail: "..." })) */
  useEffect(() => {
    const onSay = (e: Event) => {
      const detail = (e as CustomEvent<string>).detail;
      if (typeof detail === "string" && detail.length > 0) sayRef.current?.(detail);
    };
    window.addEventListener("buddy:say", onSay);
    return () => {
      window.removeEventListener("buddy:say", onSay);
      window.clearTimeout(hideTimer.current);
    };
  }, []);

  /* Sahne değişince: hava durumu varsa onu, yoksa saat dilimini söyler. */
  const slotKey = scene.slot;
  const condKey = scene.condition;
  useEffect(() => {
    const lines = condKey ? COND_LINES[condKey] : SLOT_LINES[slotKey];
    const id = window.setTimeout(() => sayRef.current?.(pick(lines)), 1_400);
    return () => window.clearTimeout(id);
  }, [slotKey, condKey]);

  /* Sekme arkada kalınca render'ı durdur. */
  useEffect(() => {
    const onVis = () => pauseRef.current?.(document.visibilityState !== "visible");
    document.addEventListener("visibilitychange", onVis);
    return () => document.removeEventListener("visibilitychange", onVis);
  }, []);

  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;

    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true, powerPreference: "low-power" });
    } catch {
      return;
    }

    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    renderer.setPixelRatio(dpr);
    renderer.setSize(host.clientWidth, host.clientHeight, false);
    renderer.domElement.style.width = "100%";
    renderer.domElement.style.height = "100%";
    renderer.domElement.style.pointerEvents = "none";
    host.appendChild(renderer.domElement);

    const scene3 = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(30, host.clientWidth / host.clientHeight, 0.1, 60);
    camera.position.set(0, 0.2, 6.05);
    camera.lookAt(0, 0.05, 0);

    scene3.add(new THREE.AmbientLight(0xffe7cf, 1.5));
    const key = new THREE.DirectionalLight(0xfff2dd, 2.1);
    key.position.set(-3, 5, 6);
    scene3.add(key);
    const rim = new THREE.PointLight(0xff9db4, 9, 12, 2);
    rim.position.set(3.4, -1.4, 3.4);
    scene3.add(rim);
    const fill = new THREE.PointLight(0x9fd0ff, 3.2, 12, 2);
    fill.position.set(-3.6, 1.2, 2.2);
    scene3.add(fill);

    /* ---------- iki dost ---------- */
    const her = makeBuddy({ body: "#ffd7c4", accent: PINK, lash: true });
    const him = makeBuddy({ body: "#ffe8cc", accent: "#ffb37a", crown: true });
    her.root.position.set(-0.62, -0.1, 0);
    him.root.position.set(0.64, -0.02, -0.12);
    him.root.scale.setScalar(0.95);
    scene3.add(her.root, him.root);

    const pointers = [her, him];
    const bobSpeed = [1.15, 0.92];
    const bobPhase = [0, 1.7];
    const baseY = [her.root.position.y, him.root.position.y];
    const baseScale = [1, him.root.scale.x];

    /* ---------- etrafta uçuşan kalpler ---------- */
    const heartGeo = new THREE.ExtrudeGeometry(heartShape(0.11), {
      depth: 0.04,
      bevelEnabled: false,
    });
    const floaters: { mesh: THREE.Mesh; t: number; speed: number; x: number; drift: number }[] = [];
    for (let i = 0; i < 5; i += 1) {
      const mat = new THREE.MeshBasicMaterial({
        color: i % 2 ? "#ffb7c8" : "#ffd9a6",
        transparent: true,
        opacity: 0,
        depthWrite: false,
      });
      const mesh = new THREE.Mesh(heartGeo, mat);
      mesh.rotation.z = Math.PI;
      mesh.visible = false;
      scene3.add(mesh);
      floaters.push({
        mesh,
        t: i / 5,
        speed: 0.1 + Math.random() * 0.08,
        x: -1.4 + Math.random() * 2.8,
        drift: (Math.random() - 0.5) * 0.5,
      });
    }

    /* ---------- etkileşim ---------- */
    const pointer = { x: 0, y: 0 };
    const look = { x: 0, y: 0 };
    const onPointerMove = (e: PointerEvent) => {
      pointer.x = (e.clientX / window.innerWidth - 0.5) * 2;
      pointer.y = (e.clientY / window.innerHeight - 0.5) * 2;
      if (t - idleSince > 1) idleSince = t;
    };
    window.addEventListener("pointermove", onPointerMove, { passive: true });

    let jumpedAt = -10;
    let action: "hop" | "spin" | "wiggle" = "hop";
    let t = 0;
    /* Tıklama tepkisi rastgele seçilir: zıpla, dön ya da sallan. */
    const onPoke = () => {
      jumpedAt = t;
      action = (["hop", "spin", "wiggle"] as const)[Math.floor(Math.random() * 3)];
      sayRef.current?.(pick(CLICK_LINES));
      /* kalpleri fırlat */
      for (const f of floaters) {
        f.t = Math.random() * 0.2;
        f.mesh.visible = true;
      }
      /* Uyuyorsa uyandır */
      idleSince = t;
    };
    host.addEventListener("click", onPoke);

    /* ---------- boyut ---------- */
    const resize = () => {
      const w = host.clientWidth;
      const h = host.clientHeight;
      if (w === 0 || h === 0) return;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h, false);
    };
    const ro = new ResizeObserver(resize);
    ro.observe(host);

    /* ---------- döngü ---------- */
    let raf = 0;
    let paused = false;
    let nextIdle = 9 + Math.random() * 8;
    /* İmleç hiç oynatılmazsa dostlar uykuya dalar; bir hareketle uyanır. */
    let idleSince = 0;
    pauseRef.current = (v) => {
      paused = v;
    };

    const clock = new THREE.Clock();

    const draw = () => {
      const dt = Math.min(clock.getDelta(), 0.05);
      t += dt;

      look.x += (pointer.x - look.x) * 0.06;
      look.y += (pointer.y - look.y) * 0.06;

      for (let i = 0; i < pointers.length; i += 1) {
        const b = pointers[i];
        const sleeping = t - idleSince > 46;
        const beat = danceRef.current ? Math.abs(Math.sin(t * 4.4 + i * 0.9)) : 0;
        const bob = Math.sin(t * (sleeping ? 0.45 : bobSpeed[i] * (danceRef.current ? 2.6 : 1)) + bobPhase[i]);
        let jump = 0;
        let spin = 0;
        let wiggle = 0;
        if (i === 0) {
          const since = t - jumpedAt;
          if (since >= 0 && since < 0.7) {
            const k = since / 0.7;
            if (action === "hop") jump = Math.sin(k * Math.PI) * 0.55;
            else if (action === "spin") spin = Math.sin(k * Math.PI) * Math.PI * 2;
            else wiggle = Math.sin(k * Math.PI * 5) * 0.4;
          }
        }
        b.root.position.y = baseY[i] + bob * 0.045 + jump + beat * 0.075;
        b.root.rotation.z = bob * 0.026 + look.x * 0.03 + spin + wiggle;
        b.root.rotation.y = look.x * 0.14;
        b.root.scale.y = baseScale[i] * (1 + bob * 0.014) * (1 - beat * 0.07);
        b.root.scale.x = baseScale[i] * (1 - beat * 0.035);
        b.root.scale.z = baseScale[i];

        /* gözler imleci takip eder */
        b.face.position.x = look.x * 0.035;
        b.face.position.y = -look.y * 0.028;

        /* kollar hafifçe sallanır */
        b.arms.forEach((arm, ai) => {
          arm.position.y = -0.2 + bob * 0.018 * (ai ? -1 : 1);
        });

        if (b.heart) {
          b.heart.rotation.y = Math.sin(t * 0.9 + i) * 0.4;
          b.heart.scale.setScalar(0.92 + Math.sin(t * 2.4) * 0.05);
        }
        if (b.crown) b.crown.rotation.y = 0.4 + Math.sin(t * 0.55) * 0.25;

        /* göz kırpma; uyuyorsa kapalı kalır */
        const blinkCycle = 4.6 + i * 1.3;
        const ph = (t + i * 2.1) % blinkCycle;
        const shut = sleeping ? 0.06 : ph > blinkCycle - 0.12 ? 0.1 : 1;
        b.eyes.forEach((eye) => {
          eye.scale.y += (1.06 * shut - eye.scale.y) * 0.55;
        });
      }

      /* uçuşan kalpler */
      for (const f of floaters) {
        f.t += dt * f.speed;
        if (f.t > 1) {
          f.t = 0;
          f.x = -1.5 + Math.random() * 3;
          f.drift = (Math.random() - 0.5) * 0.5;
        }
        const p = f.t;
        f.mesh.position.set(
          f.x + Math.sin(p * 5 + f.drift * 6) * 0.35 + f.drift * p,
          -0.55 + p * 2.1,
          0.6,
        );
        f.mesh.rotation.z = Math.PI + Math.sin(p * 4) * 0.3;
        f.mesh.scale.setScalar(0.7 + Math.sin(p * Math.PI) * 0.5);
        const mat = f.mesh.material as THREE.MeshBasicMaterial;
        mat.opacity = Math.sin(p * Math.PI) * 0.62;
      }

      /* kendi kendine konuşma (uyurken zıtları) */
      if (t > nextIdle) {
        nextIdle = t + 16 + Math.random() * 18;
        if (t - idleSince > 46) sayRef.current?.("zZz... bana bakma, uyuyorum 😴");
        else sayRef.current?.(pick(IDLE_LINES));
      }

      renderer.render(scene3, camera);
    };

    const loop = () => {
      raf = requestAnimationFrame(loop);
      if (paused) return;
      draw();
    };

    if (reducedMotion) {
      /* Hareket yok: tek kare çiz, tıklama yine çalışsın. */
      pauseRef.current = () => undefined;
      draw();
      renderer.render(scene3, camera);
    } else {
      loop();
    }

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      host.removeEventListener("click", onPoke);
      window.removeEventListener("pointermove", onPointerMove);
      pauseRef.current = null;

      her.root.traverse((o) => {
        const m = o as THREE.Mesh;
        if (m.geometry) m.geometry.dispose();
        const mat = m.material as THREE.Material | THREE.Material[] | undefined;
        if (Array.isArray(mat)) mat.forEach((x) => x.dispose());
        else mat?.dispose();
      });
      him.root.traverse((o) => {
        const m = o as THREE.Mesh;
        if (m.geometry) m.geometry.dispose();
        const mat = m.material as THREE.Material | THREE.Material[] | undefined;
        if (Array.isArray(mat)) mat.forEach((x) => x.dispose());
        else mat?.dispose();
      });
      heartGeo.dispose();
      floaters.forEach((f) => (f.mesh.material as THREE.Material).dispose());
      renderer.dispose();
      if (renderer.domElement.parentNode === host) host.removeChild(renderer.domElement);
    };
  }, [reducedMotion]);

  return (
    <div className="buddy" ref={hostRef} aria-hidden={line ? undefined : true}>
      <div className={`buddy__bubble ${line ? "is-in" : ""}`} role="status" aria-live="polite">
        {line ?? ""}
      </div>
    </div>
  );
}
