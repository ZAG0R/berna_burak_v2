import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import type { Scene } from "../data/scenes";
import { NAMES, pickLine, type LineKind, type Who } from "../data/buddy";

/* ============================================================
   Minik dostlar - kalp antenli kiz ve tacli oglan.

   Koreografi (surekli dongu):
     1) exit      : ikisi de kenarlardan disari yurur
     2) enterHer  : kiz soldan ortaya gelir (yandan, yuruyerek)
     3) bored     : ortada bekler, sikilir, oflar
     4) enterHim  : oglan sagdan gelir
     5) meet      : kameraya donerler, ziplayip kalp sacarlar
     6) idle      : normal hallerine donerler
     arada bir     : squabble - birbirlerine laf atarlar, sinirlenirler

   Karakterler kartlarin tam ustunde durur; zemin cizgisi kartlarin
   ust kenarindan olculur. Katman tiklamayi engellemez.
   ============================================================ */

type Props = { scene: Scene; reducedMotion: boolean; dancing?: boolean };

const PINK = "#ff9db4";
const CROWN = "#ffd479";

const lerp = (a: number, b: number, k: number) => a + (b - a) * k;
const damp = (a: number, b: number, k: number) =>
  lerp(a, b, Math.min(1, Math.max(0, k)));

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
  brows: THREE.Mesh[];
  arms: THREE.Mesh[];
  feet: THREE.Mesh[];
  heart?: THREE.Mesh;
  crown?: THREE.Group;
};

function makeBuddy(opts: { body: string; accent: string; crown?: boolean; lash?: boolean }): BuddyParts {
  const root = new THREE.Group();

  const HEAD_Y = 0;
  const HEAD_R = 0.5;

  const bodyMat = new THREE.MeshStandardMaterial({ color: opts.body, roughness: 0.62, metalness: 0.04 });
  const body = new THREE.Mesh(new THREE.SphereGeometry(HEAD_R, 34, 26), bodyMat);
  body.scale.set(1, 0.95, 1);
  root.add(body);

  const earGeo = new THREE.SphereGeometry(0.125, 18, 14);
  for (const sx of [-1, 1]) {
    const ear = new THREE.Mesh(earGeo, bodyMat);
    ear.position.set(sx * 0.37, 0.4, -0.02);
    ear.scale.set(0.9, 1, 0.75);
    root.add(ear);
  }

  /* Yüz parçaları baş küresinin yüzeyine oturur; profil görünümde de yerinde kalır. */
  const surfZ = (x: number, y: number) =>
    Math.sqrt(Math.max(0.04, HEAD_R * HEAD_R - x * x - (y / 0.95) ** 2));

  const face = new THREE.Group();
  face.position.y = HEAD_Y;
  root.add(face);

  const eyeMat = new THREE.MeshStandardMaterial({ color: "#2b2230", roughness: 0.35 });
  const eyeGeo = new THREE.SphereGeometry(0.072, 20, 16);
  const shineGeo = new THREE.SphereGeometry(0.026, 10, 8);
  const shineMat = new THREE.MeshBasicMaterial({ color: "#ffffff" });
  const eyes: THREE.Mesh[] = [];
  const brows: THREE.Mesh[] = [];
  const browGeo = new THREE.BoxGeometry(0.12, 0.022, 0.026);
  const browMat = new THREE.MeshStandardMaterial({ color: "#4a3340", roughness: 0.5 });

  for (const sx of [-1, 1]) {
    /* Gözler başın kenarına fazla yakındı: karakterler birbirine
       döndüğünde göz küresi kafanın siluetinden dışarı taşıp yanağın
       kenarında siyah bir çıkıntı gibi görünüyordu. */
    const ex = sx * 0.145;
    const ey = 0.09;
    const ez = surfZ(ex, ey);
    const eye = new THREE.Mesh(eyeGeo, eyeMat);
    eye.position.set(ex, ey, ez - 0.03);
    eye.scale.set(1, 1.06, 0.46);
    face.add(eye);
    eyes.push(eye);

    const shine = new THREE.Mesh(shineGeo, shineMat);
    shine.position.set(ex + 0.022, ey + 0.024, ez + 0.012);
    face.add(shine);

    const brow = new THREE.Mesh(browGeo, browMat);
    brow.position.set(ex, 0.225, surfZ(ex, 0.225) + 0.008);
    /* Kaşlar düz çubuk gibi durup öfkeli bir ifade veriyordu; dış uca
       doğru hafif kalkık, yumuşak bir eğim. */
    brow.rotation.z = sx * 0.13;
    brow.scale.x = 0.92;
    face.add(brow);
    brows.push(brow);

    /* Kirpik yayı kaldırıldı: torus göz küresinin içine girip gözün
       altında/kenarında siyah bir çentik gibi görünüyordu. Kaş, göz
       parlaması ve yanak yüzü zaten yeterince ifade ediyor. */
  }

  const blushMat = new THREE.MeshBasicMaterial({ color: opts.accent, transparent: true, opacity: 0.4 });
  /* Yanak: ince bir küre — yandan bakıldığında da havada duran disk gibi görünmez. */
  const blushGeo = new THREE.SphereGeometry(0.062, 16, 12);
  for (const sx of [-1, 1]) {
    const blush = new THREE.Mesh(blushGeo, blushMat);
    blush.position.set(sx * 0.29, -0.06, surfZ(sx * 0.29, -0.06) - 0.02);
    blush.scale.set(1, 0.9, 0.35);
    face.add(blush);
  }

  const mouth = new THREE.Mesh(
    new THREE.TorusGeometry(0.058, 0.013, 6, 16, Math.PI),
    new THREE.MeshBasicMaterial({ color: "#7a4550" }),
  );
  mouth.position.set(0, -0.06, surfZ(0, -0.06) + 0.009);
  mouth.rotation.z = Math.PI;
  face.add(mouth);

  const armGeo = new THREE.SphereGeometry(0.082, 14, 10);
  const arms: THREE.Mesh[] = [];
  for (const sx of [-1, 1]) {
    const arm = new THREE.Mesh(armGeo, bodyMat);
    arm.position.set(sx * 0.44, -0.14, 0.05);
    arm.scale.set(0.85, 1.15, 0.85);
    root.add(arm);
    arms.push(arm);
  }

  const footGeo = new THREE.SphereGeometry(0.098, 14, 10);
  const feet: THREE.Mesh[] = [];
  for (const sx of [-1, 1]) {
    const foot = new THREE.Mesh(footGeo, bodyMat);
    foot.position.set(sx * 0.16, -0.44, 0.1);
    foot.scale.set(1, 0.6, 1.15);
    root.add(foot);
    feet.push(foot);
  }

  let heart: THREE.Mesh | undefined;
  if (!opts.crown) {
    const stem = new THREE.Mesh(
      new THREE.CylinderGeometry(0.011, 0.011, 0.17, 8),
      new THREE.MeshStandardMaterial({ color: "#8f6b57", roughness: 0.7 }),
    );
    stem.position.set(0, 0.55, 0);
    root.add(stem);

    heart = new THREE.Mesh(
      new THREE.ExtrudeGeometry(heartShape(0.145), {
        depth: 0.05,
        bevelEnabled: true,
        bevelSize: 0.01,
        bevelThickness: 0.01,
        bevelSegments: 2,
      }),
      new THREE.MeshStandardMaterial({
        color: PINK,
        roughness: 0.35,
        emissive: new THREE.Color(PINK),
        emissiveIntensity: 0.32,
      }),
    );
    heart.position.set(0, 0.65, 0.02);
    heart.rotation.z = Math.PI;
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
    crown.add(new THREE.Mesh(new THREE.CylinderGeometry(0.15, 0.17, 0.08, 18, 1, true), goldMat));
    const spikeGeo = new THREE.ConeGeometry(0.045, 0.13, 12);
    for (let i = 0; i < 5; i += 1) {
      const a = (i / 5) * Math.PI * 2;
      const spike = new THREE.Mesh(spikeGeo, goldMat);
      spike.position.set(Math.cos(a) * 0.135, 0.1, Math.sin(a) * 0.135);
      crown.add(spike);
    }
    crown.position.set(0, 0.58, 0);
    crown.rotation.y = 0.4;
    root.add(crown);
  }

  return { root, face, eyes, brows, arms, feet, heart, crown };
}

type Actor = {
  parts: BuddyParts;
  shadow: THREE.Mesh;
  x: number;
  targetX: number;
  face: number;
  rotY: number;
  walk: number;
  moving: boolean;
  jumping: boolean;
  jump: number;
  angry: number;
  lean: number;
  /** El sallama yoğunluğu (0-1). */
  wave: number;
};

type Particle = { mesh: THREE.Mesh; vx: number; vy: number; life: number; spin: number };

type Phase = "exit" | "enterHer" | "bored" | "enterHim" | "meet" | "idle" | "squabble" | "chat";

export default function Buddy({ scene, reducedMotion, dancing = false }: Props) {
  const hostRef = useRef<HTMLDivElement | null>(null);
  const bubbleRef = useRef<HTMLDivElement | null>(null);
  const sayRef = useRef<((text: string, who?: 0 | 1) => void) | null>(null);
  const pauseRef = useRef<((v: boolean) => void) | null>(null);
  /* Selamlama, iki karakter de sahnedeyken söylenmeli; biri ekran
     dışındayken "buradayım" demek mantıksız duruyor. */
  const greetPending = useRef(true);
  const danceRef = useRef(dancing);
  danceRef.current = dancing;
  const [line, setLine] = useState<string | null>(null);
  const lineRef = useRef<string | null>(null);
  const whoRef = useRef<Who>(0);
  const hideTimer = useRef<number | undefined>(undefined);

  lineRef.current = line;

  const say = (text: string, who: Who = 0) => {
    whoRef.current = who;
    setLine(text);
    window.clearTimeout(hideTimer.current);
    hideTimer.current = window.setTimeout(() => setLine(null), 6400);
  };
  sayRef.current = say;

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

  const slotKey = scene.slot;
  const condKey = scene.condition;
  const sceneRef = useRef({ slot: scene.slot, condition: scene.condition });
  sceneRef.current = { slot: scene.slot, condition: scene.condition };

  /* Sahne bağımlı konuşma: her karakterin kendi repliği vardır. */
  const sayKind = (kind: LineKind, who: Who = 0) =>
    sayRef.current?.(pickLine(kind, sceneRef.current, who), who);

  useEffect(() => {
    /* Sahne/saat değişince selamlama yeniden kuyruğa girer. */
    greetPending.current = true;
  }, [slotKey, condKey]);

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

    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    const vw0 = Math.max(1, host.clientWidth);
    const vh0 = Math.max(1, host.clientHeight);
    renderer.setSize(vw0, vh0, false);
    renderer.domElement.style.width = "100%";
    renderer.domElement.style.height = "100%";
    renderer.domElement.style.pointerEvents = "none";
    host.appendChild(renderer.domElement);

    const VIS_H = 6.4;
    const FOV = 30;
    const scene3 = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(FOV, vw0 / vh0, 0.1, 90);
    camera.position.set(0, 0, VIS_H / (2 * Math.tan((FOV * Math.PI) / 360)));
    camera.lookAt(0, 0, 0);

    scene3.add(new THREE.AmbientLight(0xffe7cf, 1.5));
    const keyLight = new THREE.DirectionalLight(0xfff2dd, 2.1);
    keyLight.position.set(-3, 5, 6);
    scene3.add(keyLight);
    const rim = new THREE.PointLight(0xff9db4, 9, 14, 2);
    rim.position.set(3.4, -1.4, 3.4);
    scene3.add(rim);
    const fill = new THREE.PointLight(0x9fd0ff, 3.2, 14, 2);
    fill.position.set(-3.6, 1.2, 2.2);
    scene3.add(fill);

    let vw = vw0;
    let vh = vh0;
    let visH = VIS_H;
    let visW = VIS_H * (vw0 / vh0);
    let unit = 1;
    let offX = visW / 2 + 1.2;
    let meetX = 0.62;
    let idleX = 0.85;
    let groundY = -1.5;

    const layout = () => {
      vw = Math.max(1, host.clientWidth);
      vh = Math.max(1, host.clientHeight);
      camera.aspect = vw / vh;
      camera.updateProjectionMatrix();
      renderer.setSize(vw, vh, false);
      visH = VIS_H;
      visW = VIS_H * (vw / vh);
      unit = Math.min(0.8, visW / 8.5);
      /* Gövdenin tamamı ekran dışında kalacak kadar uzağa. */
      offX = visW / 2 + 1.2 * unit + 0.5;
      meetX = 0.62 * unit;
      idleX = 0.85 * unit;
    };
    layout();

    const measureGround = () => {
      const el =
        document.querySelector<HTMLElement>(".home__cards") ??
        document.querySelector<HTMLElement>(".home__bottom");
      if (el) {
        const r = el.getBoundingClientRect();
        if (r.height > 0) groundY = (0.5 - r.top / vh) * visH;
      } else {
        groundY = (0.5 - 0.74) * visH;
      }
    };
    measureGround();

    const her = makeBuddy({ body: "#ffd7c4", accent: PINK, lash: true });
    const him = makeBuddy({ body: "#ffe8cc", accent: "#ffb37a", crown: true });
    scene3.add(her.root, him.root);

    const shadowTex = (() => {
      const c = document.createElement("canvas");
      c.width = 128;
      c.height = 128;
      const g = c.getContext("2d")!;
      const grd = g.createRadialGradient(64, 64, 4, 64, 64, 62);
      grd.addColorStop(0, "rgba(18,12,24,0.62)");
      grd.addColorStop(0.55, "rgba(18,12,24,0.24)");
      grd.addColorStop(1, "rgba(18,12,24,0)");
      g.fillStyle = grd;
      g.fillRect(0, 0, 128, 128);
      return new THREE.CanvasTexture(c);
    })();

    const makeShadow = () => {
      const sh = new THREE.Mesh(
        new THREE.CircleGeometry(0.5, 28),
        new THREE.MeshBasicMaterial({ map: shadowTex, transparent: true, depthWrite: false, opacity: 0.5 }),
      );
      sh.scale.set(1.4, 0.46, 1);
      scene3.add(sh);
      return sh;
    };

    const mkActor = (parts: BuddyParts, side: number): Actor => ({
      parts,
      shadow: makeShadow(),
      x: side * offX,
      targetX: side * meetX,
      face: 0,
      rotY: 0,
      walk: 0,
      moving: false,
      jumping: false,
      jump: 0,
      angry: 0,
      lean: 0,
      wave: 0,
    });

    const herA = mkActor(her, -1);
    const himA = mkActor(him, 1);
    const actors = [herA, himA];

    const heartGeo = new THREE.ExtrudeGeometry(heartShape(0.1), { depth: 0.035, bevelEnabled: false });
    const hearts: Particle[] = [];
    for (let i = 0; i < 20; i += 1) {
      const mesh = new THREE.Mesh(
        heartGeo,
        new THREE.MeshBasicMaterial({
          color: i % 3 === 0 ? "#ffd9a6" : "#ff9db4",
          transparent: true,
          opacity: 0,
          depthWrite: false,
        }),
      );
      mesh.rotation.z = Math.PI;
      mesh.visible = false;
      scene3.add(mesh);
      hearts.push({ mesh, vx: 0, vy: 0, life: 0, spin: 0 });
    }

    const steamGeo = new THREE.SphereGeometry(0.09, 12, 10);
    const steams: Particle[] = [];
    for (let i = 0; i < 10; i += 1) {
      const mesh = new THREE.Mesh(
        steamGeo,
        new THREE.MeshBasicMaterial({ color: "#ffffff", transparent: true, opacity: 0, depthWrite: false }),
      );
      mesh.visible = false;
      scene3.add(mesh);
      steams.push({ mesh, vx: 0, vy: 0, life: 0, spin: 0 });
    }

    const burst = (x: number, y: number, count: number, spread: number) => {
      let placed = 0;
      for (const p of hearts) {
        if (placed >= count) break;
        if (p.life > 0) continue;
        placed += 1;
        p.life = 1;
        p.mesh.visible = true;
        p.mesh.position.set(x + (Math.random() - 0.5) * 0.5, y + (Math.random() - 0.5) * 0.4, 0.5);
        p.vx = (Math.random() - 0.5) * spread;
        p.vy = 0.9 + Math.random() * 1.5;
        p.spin = (Math.random() - 0.5) * 7;
      }
    };

    const puff = (x: number, y: number) => {
      for (const p of steams) {
        if (p.life > 0) continue;
        p.life = 1;
        p.mesh.visible = true;
        p.mesh.position.set(x + (Math.random() - 0.5) * 0.35, y, 0.5);
        p.vx = (Math.random() - 0.5) * 0.5;
        p.vy = 0.8 + Math.random() * 0.5;
        p.spin = 0;
        return;
      }
    };

    let phase: Phase = "idle";
    let pt = 0;
    let phaseDur = 8;
    let boredAt = 0;
    let squabbleAt = 0;
    let squabbleRound = 0;
    let meetJump = 0;
    let meetBurst = 0;
    let chatAt = 0;
    let chatRound = 0;
    let herLineAt = 0;
    let steamAt = 0;
    let ambientAt = 0.6;
    let nextIdle = 12;

    /* Yürüme hızı: süreleri mesafeye göre hesaplarken de bunu kullanıyoruz,
       yoksa karakterler hedefe varmadan sahne değişiyor (ortada belirme). */
    const walkTime = (a: Actor, target: number) =>
      Math.abs(a.x - target) / (1.15 * unit) + 0.35;

    const setPhase = (p: Phase) => {
      phase = p;
      pt = 0;
      herA.wave = 0;
      himA.wave = 0;
      herLineAt = 0;
      switch (p) {
        case "exit":
          /* Sahnede yalnızca Berna çıkar; Burak kalıp onu bekler.
             Böylece tekrar girişte "nerede kaldı bu kız" mantıklı olur. */
          herA.targetX = -offX;
          himA.targetX = idleX;
          phaseDur = walkTime(herA, herA.targetX);
          sayKind("leave", 0);
          break;
        case "enterHer":
          herA.targetX = -meetX;
          phaseDur = walkTime(herA, herA.targetX);
          /* Berna gelirken cevap verir: "Geldim, geldimmmm!" */
          herLineAt = 0.3;
          break;
        case "bored":
          /* Bu kez yalnız bekleyen Burak: Berna'yı sorar. */
          phaseDur = 6;
          boredAt = 1.2;
          break;
        case "enterHim":
          himA.targetX = meetX;
          phaseDur = walkTime(himA, himA.targetX);
          /* Burak sessizce gelir; sorusu bekleme sahnesinde sorulur. */
          break;
        case "meet":
          phaseDur = 4.6;
          meetJump = 0.5;
          meetBurst = 1.2;
          break;
        case "idle":
          /* Boşta bekleme kısaltıldı: karakterler daha sık birbirine
             dönüp konuşuyor. */
          phaseDur = 8 + Math.random() * 6;
          herA.targetX = -idleX;
          himA.targetX = idleX;
          break;
        case "squabble":
          phaseDur = 10;
          squabbleAt = 1.4;
          squabbleRound = 0;
          steamAt = 0;
          sayKind("squabble", 0);
          break;
        case "chat":
          /* Yan yana durup sırayla konuşurlar; ilki el sallar. */
          phaseDur = 12;
          chatAt = 0.9;
          chatRound = 0;
          herA.wave = 1;
          herA.targetX = -idleX;
          himA.targetX = idleX;
          break;
      }
    };

    const nextPhase = () => {
      switch (phase) {
        case "exit":
          /* Berna gitti; Burak yalnız kalıp bekler. */
          setPhase("bored");
          break;
        case "enterHim":
          /* Burak tek başına geldi; Berna'yı bekler. */
          setPhase("bored");
          break;
        case "bored":
          /* Berna gelir: "Geldim, geldimmmm!" */
          setPhase("enterHer");
          break;
        case "enterHer":
          setPhase("meet");
          break;
        case "meet":
          setPhase("idle");
          break;
        case "idle":
          /* Sıradaki sahne rastgele: sohbet, atışma ya da yeni giriş. */
          {
            const r = Math.random();
            setPhase(r < 0.4 ? "chat" : r < 0.68 ? "squabble" : "exit");
          }
          break;
        case "chat":
          setPhase("idle");
          break;
        case "squabble":
          setPhase("idle");
          break;
        default:
          setPhase("idle");
      }
    };

    const pointer = { x: 0, y: 0 };
    const look = { x: 0, y: 0 };
    let idleSince = 0;
    let t = 0;
    let paused = false;
    let raf = 0;

    const onPointerMove = (e: PointerEvent) => {
      pointer.x = (e.clientX / window.innerWidth - 0.5) * 2;
      pointer.y = (e.clientY / window.innerHeight - 0.5) * 2;
      idleSince = t;
    };
    window.addEventListener("pointermove", onPointerMove, { passive: true });

    const pokeOne = (a: Actor) => {
      a.jumping = true;
      a.jump = 0;
      burst(a.x, groundY + 0.95 * unit, 7, 2.6);
      idleSince = t;
      sayKind("click", a === herA ? 0 : 1);
      /* Yanındaki de tepki verir: bir süre sonra o da zıplayıp
         karşılık verir, böylece tıklama iki karakteri de hareket
         ettiriyor. */
      const partner = a === herA ? himA : herA;
      window.setTimeout(() => {
        partner.jumping = true;
        partner.jump = 0;
        burst(partner.x, groundY + 0.95 * unit, 4, 2.2);
        /* Partner tıklanmadı; "beni mi tıkladın" demek yerine
           arkadaşına cevap verir. */
        sayKind("chat", partner === herA ? 0 : 1);
      }, 700);
    };

    const onPoke = (e: PointerEvent) => {
      const target = e.target as HTMLElement | null;
      if (target && target.closest && target.closest("button,a,input,textarea,select")) return;
      const rad = (0.85 * unit) / visH * vh;
      for (const a of actors) {
        const sx = (a.x / visW + 0.5) * vw;
        const sy = (0.5 - (a.parts.root.position.y - 0.1 * unit) / visH) * vh;
        if (Math.hypot(e.clientX - sx, e.clientY - sy) < rad) {
          pokeOne(a);
          return;
        }
      }
    };
    window.addEventListener("pointerdown", onPoke);

    const ro = new ResizeObserver(() => {
      layout();
      measureGround();
    });
    ro.observe(host);
    window.addEventListener("resize", measureGround);

    pauseRef.current = (v) => {
      paused = v;
    };

    const clock = new THREE.Clock();

    const stepToward = (a: Actor, dt: number, speed: number) => {
      const d = a.targetX - a.x;
      if (Math.abs(d) < 0.015) {
        a.x = a.targetX;
        a.moving = false;
        return;
      }
      a.moving = true;
      a.face = Math.sign(d);
      a.x += Math.sign(d) * Math.min(Math.abs(d), speed * dt);
    };

    const updateParticles = (
      pool: Particle[],
      gravity: number,
      life: number,
      size: number,
      rise: number,
      dt: number,
    ) => {
      for (const p of pool) {
        if (p.life <= 0) continue;
        p.life -= dt / life;
        if (p.life <= 0) {
          p.life = 0;
          p.mesh.visible = false;
          continue;
        }
        p.vy -= gravity * dt;
        p.mesh.position.x += p.vx * dt;
        p.mesh.position.y += (p.vy + rise) * dt;
        p.mesh.rotation.z += p.spin * dt;
        p.mesh.scale.setScalar(size * (0.6 + (1 - p.life) * 0.6));
        (p.mesh.material as THREE.MeshBasicMaterial).opacity = Math.min(1, p.life * 1.8) * 0.75;
      }
    };

    const faceTarget = (a: Actor, i: number) => {
      if (phase === "squabble") return i === 0 ? 0.85 : -0.85;
      /* Yalnız bekleyen Burak etrafına bakınır. */
      if (phase === "bored" && i === 1) return Math.sin(t * 0.7) * 0.35;
      if (phase === "meet" || phase === "idle" || danceRef.current) return 0;
      return a.moving ? a.face : 0;
    };

    const draw = () => {
      const dt = Math.min(clock.getDelta(), 0.05);
      t += dt;

      const slow = reducedMotion ? 0.55 : 1;
      const dancingNow = danceRef.current;

      if (!dancingNow) {
        pt += dt;
        if (pt >= phaseDur) nextPhase();
      } else if (phase !== "idle") {
        setPhase("idle");
      }

      look.x = damp(look.x, pointer.x, dt * 4);
      look.y = damp(look.y, pointer.y, dt * 4);

      if (phase === "bored" && boredAt > 0 && pt >= boredAt) {
        boredAt = -1;
        /* Bekleyen Burak: "Nerede kaldı bu kız?" */
        himA.lean = 0.45;
        sayKind("wait", 1);
      }

      /* Berna gelirken cevap: "Geldim, geldimmmm!" */
      if (phase === "enterHer" && herLineAt > 0 && pt >= herLineAt) {
        herLineAt = -1;
        herA.wave = 1;
        sayKind("wait", 0);
      }
      if (phase === "squabble") {
        if (squabbleAt > 0 && pt >= squabbleAt) {
          /* Karşılıklı atışma: bir o, bir o. */
          squabbleAt = pt + 2.6;
          if (squabbleRound >= 3) squabbleAt = -1;
          else {
            squabbleRound += 1;
            sayKind("squabble", squabbleRound % 2 === 1 ? 1 : 0);
          }
        }
        steamAt -= dt;
        if (steamAt <= 0) {
          steamAt = 0.4;
          puff(herA.x + 0.25 * unit, groundY + 1.2 * unit);
          puff(himA.x - 0.25 * unit, groundY + 1.2 * unit);
        }
      }
      if (phase === "meet") {
        if (meetJump > 0 && pt >= meetJump) {
          meetJump = pt + 1.1;
          herA.jumping = true;
          herA.jump = 0;
          himA.jumping = true;
          himA.jump = 0;
        }
        if (meetBurst > 0 && pt >= meetBurst) {
          meetBurst = -1;
          const cx = (herA.x + himA.x) / 2;
          burst(cx, groundY + 0.95 * unit, 14, 3.4);
          /* Karşılaşınca iltifat Burak'tan gelir. */
          sayKind("chat", 1);
        }
      }

      /* Sohbet: sırayla konuşurlar, konuşan hafifçe öne eğilir. */
      if (phase === "chat" && chatAt > 0 && pt >= chatAt) {
        if (chatRound >= 4) {
          chatAt = -1;
          /* Sohbet sonu: küçük bir kalp bulutu. */
          burst((herA.x + himA.x) / 2, groundY + 1.0 * unit, 6, 2.2);
        } else {
          /* Sohbeti Burak açar (iltifat), sonra sırayla devam ederler. */
          const who: Who = chatRound % 2 === 0 ? 1 : 0;
          /* Sohbet havuzu ayrı: yan yana dururken "nerede kaldı bu"
             gibi yalnızlık replikleri söylenmiyor. */
          sayKind("chat", who);
          if (who === 0) herA.wave = 1;
          else himA.wave = 1;
          chatRound += 1;
          chatAt = pt + 2.8;
        }
      }

      /* Selamlama yalnızca ikisi de sahnedeyken ve konuşma balonu
         boşken söylenir; devam eden bir repliği kesmesin. */
      if (
        greetPending.current &&
        phase === "idle" &&
        pt > 3.5 &&
        !lineRef.current
      ) {
        greetPending.current = false;
        sayKind("greet", 0);
      }

      if (!dancingNow) {
        const speed = (phase === "meet" ? 1.5 : 1.15) * unit;
        for (const a of actors) stepToward(a, dt, speed);
      }

      for (let i = 0; i < actors.length; i += 1) {
        const a = actors[i];
        const b = a.parts;
        const sleeping = phase === "idle" && !dancingNow && t - idleSince > 46;

        a.rotY = damp(a.rotY, faceTarget(a, i) * (Math.PI / 2), dt * 6);

        if (a.jumping) {
          a.jump += dt / 0.55;
          if (a.jump >= 1) {
            a.jumping = false;
            a.jump = 0;
          }
        }
        const jump = a.jumping ? Math.sin(a.jump * Math.PI) : 0;

        a.walk += dt * (a.moving ? 8.5 : 1.4);

        const beat = dancingNow ? Math.abs(Math.sin(t * 4.4 + i * 0.9)) : 0;
        const bobAmp = sleeping ? 0.02 : a.moving ? 0.05 : 0.045;
        const bob = Math.sin(a.walk * (a.moving ? 1.1 : 0.8)) * bobAmp * slow;

        a.angry = damp(a.angry, phase === "squabble" ? 1 : 0, dt * 4);
        a.lean = damp(
          a.lean,
          phase === "bored" && i === 1 ? 0.35 : a.moving ? 0.16 : 0,
          dt * 3,
        );
        /* El sallama kısa sürer: bir süre sonra kendiliğinden söner. */
        a.wave = Math.max(0, a.wave - dt * 0.55);

        const shake = a.angry * Math.sin(t * 34) * 0.035;

        b.root.position.x = a.x;
        b.root.position.y = groundY + 0.48 * unit + bob + jump * 0.5 * unit + beat * 0.07 * unit;
        b.root.rotation.y = a.rotY + (a.jumping ? a.jump * Math.PI * 2 : 0);
        b.root.rotation.z = bob * 0.5 + shake;
        b.root.rotation.x = a.lean;

        const stretch = 1 + jump * 0.1 + beat * 0.03;
        b.root.scale.set(unit * (1 - jump * 0.05), unit * stretch, unit);

        a.shadow.position.set(a.x, groundY + 0.02, 0.1);
        const lift = Math.max(0, b.root.position.y - (groundY + 0.48 * unit));
        const grow = 1 + lift * 0.6;
        a.shadow.scale.set(1.4 * unit * grow, 0.46 * unit * grow, 1);
        (a.shadow.material as THREE.MeshBasicMaterial).opacity = 0.5 / (1 + lift * 2.6);

        const lookK = a.moving || phase === "meet" || dancingNow ? 0 : 1;
        b.face.position.set(0, 0, 0);
        b.root.rotation.x = a.lean + -look.y * 0.03 * lookK;
        b.root.rotation.y = a.rotY + look.x * 0.12 * lookK + (a.jumping ? a.jump * Math.PI * 2 : 0);

        for (let fi = 0; fi < b.feet.length; fi += 1) {
          const foot = b.feet[fi];
          const sx = fi === 0 ? -1 : 1;
          if (a.moving) {
            const s = Math.sin(a.walk + (fi === 0 ? 0 : Math.PI));
            foot.position.z = 0.1 + s * 0.24;
            foot.position.y = -0.44 + Math.max(0, s) * 0.09;
          } else {
            /* Yalnızca bekleyen Burak ayağını yere vurur. */
            const tapping = phase === "bored" && i === 1 && fi === 1;
            const tap = tapping ? Math.max(0, Math.sin(t * 7)) * 0.07 : 0;
            const dz = tapping ? 0.14 : 0;
            foot.position.z = damp(foot.position.z, 0.1 + dz, dt * 8);
            foot.position.y = damp(foot.position.y, -0.44 + tap, dt * 8);
          }
          foot.position.x = sx * 0.15;
        }

        for (let ai = 0; ai < b.arms.length; ai += 1) {
          const arm = b.arms[ai];
          const sx = ai === 0 ? -1 : 1;
          let ay = -0.14;
          let az = 0.06;
          /* Kol gövdenin yüzeyinde kalsın, kopmuş gibi durmasın. */
          let ax = sx * 0.45;
          if (dancingNow) {
            const s = Math.sin(t * 4.4 + ai * Math.PI + i);
            ay = 0.1 + s * 0.22;
            ax = sx * (0.4 + Math.max(0, s) * 0.12);
            az = 0.06 + Math.cos(t * 4.4 + ai) * 0.1;
          } else if (a.moving) {
            const s = Math.sin(a.walk + (ai === 0 ? Math.PI : 0));
            az = 0.06 + s * 0.24;
            ay = -0.14 + Math.abs(s) * 0.04;
          } else if (a.wave > 0.05) {
            /* Sağ kol havada, el sallar gibi. */
            const w = Math.sin(t * 9) * 0.22 * a.wave;
            if (ai === 1) {
              ay = 0.3 * a.wave;
              ax = sx * (0.3 - 0.05 * a.wave) + w * 0.12;
              az = 0.1;
            }
          } else if (a.angry > 0.4) {
            ay = -0.02 + Math.sin(t * 18 + ai) * 0.06;
            ax = sx * 0.44;
          }
          arm.position.x = damp(arm.position.x, ax, dt * 8);
          arm.position.y = damp(arm.position.y, ay, dt * 8);
          arm.position.z = damp(arm.position.z, az, dt * 8);
        }

        for (let bi = 0; bi < b.brows.length; bi += 1) {
          const brow = b.brows[bi];
          const sx = bi === 0 ? -1 : 1;
          /* Temel eğim korunur; öfke yalnızca üstüne eklenir. */
          brow.rotation.z = damp(brow.rotation.z, sx * 0.13 + a.angry * sx * 0.42, dt * 8);
          brow.position.y = damp(brow.position.y, 0.225 - a.angry * 0.035, dt * 8);
        }

        const blinkCycle = 4.6 + i * 1.3;
        const bph = (t + i * 2.1) % blinkCycle;
        let shut = bph > blinkCycle - 0.12 ? 0.1 : 1;
        if (sleeping) shut = 0.06;
        if (a.angry > 0.5) shut = 0.7;
        b.eyes.forEach((eye) => {
          eye.scale.y = damp(eye.scale.y, 1.06 * shut, dt * 14);
        });

        if (b.heart) {
          b.heart.rotation.y = Math.sin(t * 0.9 + i) * 0.4;
          b.heart.scale.setScalar(0.92 + Math.sin(t * 2.4) * 0.05);
        }
        if (b.crown) b.crown.rotation.y = 0.4 + Math.sin(t * 0.55) * 0.25;
      }

      updateParticles(hearts, 1.1, 1.7, 0.95, 0, dt);
      updateParticles(steams, -0.2, 1.2, 1, 0.9, dt);

      ambientAt -= dt;
      if (ambientAt <= 0) {
        ambientAt = 1.1 + Math.random() * 1.4;
        const x = (Math.random() - 0.5) * 2.4 * unit;
        burst(x, groundY + 0.3 * unit, 1, 0.7);
      }

      if (t > nextIdle) {
        nextIdle = t + 16 + Math.random() * 18;
        if (phase === "idle" && !dancingNow) {
          /* Boşta bekleme replikleri ("nerede kaldı bu" gibi) yalnızca
             karakter yalnızken anlamlı. İkisi yan yanayken sohbet
             havuzundan konuşulur. */
          const together = Math.abs(herA.x - himA.x) < 2.2 * unit;
          sayKind(together ? "chat" : "idle", Math.random() < 0.5 ? 0 : 1);
        }
      }

      const bubbleEl = bubbleRef.current;
      if (bubbleEl && lineRef.current) {
        const speaker = whoRef.current === 0 ? herA : himA;
        const sx = (speaker.x / visW + 0.5) * vw;
        const sy = (0.5 - (speaker.parts.root.position.y + 0.95 * unit) / visH) * vh;
        bubbleEl.style.left = `${Math.max(96, Math.min(vw - 96, sx))}px`;
        bubbleEl.style.top = `${Math.max(64, sy)}px`;
      }

      renderer.render(scene3, camera);
    };

    /* İlk perde: önce Burak tek başına gelir ve Berna'yı bekler;
       ardından Berna gelip cevap verir. */
    herA.x = -offX;
    herA.targetX = -offX;
    setPhase("enterHim");

    const loop = () => {
      raf = requestAnimationFrame(loop);
      if (paused) return;
      draw();
    };
    loop();

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      window.removeEventListener("resize", measureGround);
      window.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("pointerdown", onPoke);
      pauseRef.current = null;

      for (const parts of [her, him]) {
        parts.root.traverse((o) => {
          const m = o as THREE.Mesh;
          if (m.geometry) m.geometry.dispose();
          const mat = m.material as THREE.Material | THREE.Material[] | undefined;
          if (Array.isArray(mat)) mat.forEach((x) => x.dispose());
          else mat?.dispose();
        });
      }
      heartGeo.dispose();
      steamGeo.dispose();
      shadowTex.dispose();
      for (const a of actors) {
        a.shadow.geometry.dispose();
        (a.shadow.material as THREE.Material).dispose();
      }
      hearts.forEach((p) => (p.mesh.material as THREE.Material).dispose());
      steams.forEach((p) => (p.mesh.material as THREE.Material).dispose());
      renderer.dispose();
      if (renderer.domElement.parentNode === host) host.removeChild(renderer.domElement);
    };
  }, [reducedMotion]);

  return (
    <div className="buddy" ref={hostRef} aria-hidden={line ? undefined : true}>
      <div
        ref={bubbleRef}
        className={`buddy__bubble ${line ? "is-in" : ""}`}
        data-who={whoRef.current === 0 ? "her" : "him"}
        role="status"
        aria-live="polite"
      >
        {line ? (
          <>
            <b className="buddy__who">{NAMES[whoRef.current]}</b>
            <span>{line}</span>
          </>
        ) : null}
      </div>
    </div>
  );
}
