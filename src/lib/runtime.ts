/* ============================================================
   runtime — bağımlılıksız minik UI çalışma zamanı
   ------------------------------------------------------------
   React'in kullandığımız alt kümesini birebir taklit eder:
   h() + JSX, fonksiyon bileşenleri, hooks (useState/useEffect/
   useRef/useMemo/useCallback), ref'ler, key'li listeler,
   koşullu render, fragment'lar, SVG ad alanı, style nesnesi.

   Neden: sandbox'ta npm/CDN erişimi yok. Bu dosya sayesinde
   uygulama node_modules olmadan ve çevrimdışı çalışır.
   ============================================================ */

export type AnyProps = Record<string, any>;
export type SVGProps<E = any> = AnyProps & { children?: any; ref?: E | null };

const FRAG = Symbol("frag");
const NS = "http://www.w3.org/2000/svg";

export type VNode = {
  t: string | Function | typeof FRAG;
  p: AnyProps;
  k: string | number | null;
  c: any[];
  d?: Node | null;
  i?: Instance | null;
};

type Slot = any;

type Instance = {
  hooks: Slot[];
  setters: ((v: any) => void)[];
  hi: number;
  child: VNode | null;
  alive: boolean;
};

/* ---------- SVG yardımcıları ---------- */

const SVG_TAGS = new Set([
  "svg", "g", "defs", "symbol", "use", "switch", "a",
  "path", "rect", "circle", "ellipse", "line", "polyline", "polygon",
  "text", "tspan", "textPath", "image", "foreignObject",
  "linearGradient", "radialGradient", "stop", "pattern", "clipPath", "mask", "marker",
  "filter", "feTurbulence", "feGaussianBlur", "feColorMatrix", "feBlend",
  "feOffset", "feComposite", "feMerge", "feMergeNode", "feFlood", "feDropShadow",
]);

/** SVG'de camelCase kalan (kebab'a çevrilmeyecek) nitelikler. */
const KEEP_SVG = new Set([
  "viewBox", "preserveAspectRatio", "gradientUnits", "gradientTransform",
  "patternUnits", "patternContentUnits", "clipPathUnits", "maskUnits",
  "maskContentUnits", "markerWidth", "markerHeight", "refX", "refY",
  "textLength", "lengthAdjust", "spreadMethod", "startOffset", "pathLength",
  "attributeName", "attributeType", "baseFrequency", "numOctaves", "stitchTiles",
  "tableValues", "filterUnits", "primitiveUnits", "kernelMatrix", "targetX", "targetY",
  "xChannelSelector", "yChannelSelector", "surfaceScale", "specularConstant",
  "specularExponent", "diffuseConstant", "limitingConeAngle", "zoomAndPan",
  "pointsAtX", "pointsAtY", "pointsAtZ", "requiredExtensions", "systemLanguage",
]);

const UNITLESS = new Set([
  "zIndex", "opacity", "flex", "flexGrow", "flexShrink", "lineHeight", "fontWeight",
  "order", "zoom", "aspectRatio", "columns", "columnCount", "scale",
  "animationIterationCount", "tabSize", "WebkitLineClamp", "gridRow", "gridColumn",
  "strokeDashoffset", "strokeDasharray", "strokeWidth", "fillOpacity", "strokeOpacity",
]);

const toKebab = (s: string) => s.replace(/[A-Z]/g, (m) => "-" + m.toLowerCase());

function cssName(k: string) {
  return k.startsWith("--") ? k : toKebab(k);
}

function attrName(name: string, svg: boolean) {
  if (name === "className") return "class";
  if (name === "htmlFor") return "for";
  if (name.startsWith("aria-") || name.startsWith("data-")) return name;
  if (svg) {
    if (KEEP_SVG.has(name)) return name;
    return toKebab(name);
  }
  return name.toLowerCase();
}

/* ============================================================
   VNode üretimi
   ============================================================ */

function flatten(kids: any[], out: any[] = []): any[] {
  for (const k of kids) {
    if (k === null || k === undefined || k === false || k === true) continue;
    if (Array.isArray(k)) flatten(k, out);
    else if (typeof k === "string" || typeof k === "number") {
      out.push({ t: "#text", p: { v: String(k) }, k: null, c: [] });
    } else out.push(k);
  }
  return out;
}

export function h(type: any, props?: AnyProps | null, ...children: any[]): VNode {
  const p: AnyProps = props ? { ...props } : {};
  if (children.length) p.children = children;
  return { t: type, p, k: p.key ?? null, c: flatten(children) };
}

export const createElement = h;

export function Frag(props?: AnyProps, ...children: any[]): VNode {
  return { t: FRAG, p: props ? { ...props } : {}, k: props?.key ?? null, c: flatten(children) };
}

function normalize(o: any): VNode | null {
  if (o === null || o === undefined || o === false || o === true) return null;
  if (Array.isArray(o)) {
    return { t: FRAG, p: {}, k: null, c: o.map(normalize).filter(Boolean) as VNode[] };
  }
  if (typeof o === "string" || typeof o === "number") {
    return { t: "#text", p: { v: String(o) }, k: null, c: [] };
  }
  return o as VNode;
}

/* ============================================================
   Hooks altyapısı
   ============================================================ */

let current: Instance | null = null;
let hookIndex = 0;

function need(): Instance {
  if (!current) throw new Error("Hook bir bilesen disinda cagrildi");
  return current;
}

const pending: { slot: Slot; fn: () => any }[] = [];
let scheduled = false;

export function schedule() {
  if (scheduled) return;
  scheduled = true;
  queueMicrotask(() => {
    scheduled = false;
    rerender();
  });
}

export function useState<T>(init: T | (() => T)): [T, (v: T | ((p: T) => T)) => void] {
  const inst = need();
  const i = inst.hi++;
  if (!(i in inst.hooks)) {
    inst.hooks[i] = typeof init === "function" ? (init as () => T)() : init;
  }
  if (!inst.setters[i]) {
    inst.setters[i] = (v: any) => {
      const prev = inst.hooks[i];
      const next = typeof v === "function" ? (v as (p: any) => any)(prev) : v;
      if (Object.is(next, prev)) return;
      inst.hooks[i] = next;
      schedule();
    };
  }
  return [inst.hooks[i] as T, inst.setters[i]];
}

export function useRef<T>(init: T): { current: T } {
  const inst = need();
  const i = inst.hi++;
  if (!(i in inst.hooks)) inst.hooks[i] = { current: init };
  return inst.hooks[i];
}

function depsChanged(a: any[] | undefined, b: any[] | undefined) {
  if (!a || !b) return true;
  if (a.length !== b.length) return true;
  for (let i = 0; i < a.length; i += 1) if (!Object.is(a[i], b[i])) return true;
  return false;
}

export function useEffect(fn: () => void | (() => void), deps?: any[]) {
  const inst = need();
  const i = inst.hi++;
  const slot = inst.hooks[i] ?? (inst.hooks[i] = { deps: undefined, cleanup: undefined });
  if (depsChanged(deps, slot.deps)) {
    slot.deps = deps ? deps.slice() : undefined;
    pending.push({ slot, fn });
  }
}

export function useMemo<T>(fn: () => T, deps?: any[]): T {
  const inst = need();
  const i = inst.hi++;
  const slot = inst.hooks[i] ?? (inst.hooks[i] = { deps: undefined, value: undefined });
  if (depsChanged(deps, slot.deps)) {
    slot.deps = deps ? deps.slice() : undefined;
    slot.value = fn();
  }
  return slot.value as T;
}

export function useCallback<T extends Function>(fn: T, deps?: any[]): T {
  return useMemo(() => fn, deps);
}

export function useLayoutEffect(fn: () => void | (() => void), deps?: any[]) {
  useEffect(fn, deps);
}

/* ============================================================
   DOM yaması
   ============================================================ */

function setRef(r: any, el: Element | null) {
  if (!r) return;
  if (typeof r === "function") r(el);
  else if (typeof r === "object") r.current = el;
}

function patchStyle(el: Element, prev: AnyProps | undefined, next: AnyProps | undefined) {
  const A = prev ?? {};
  const B = next ?? {};
  const style = (el as HTMLElement).style;
  for (const k of Object.keys(A)) if (!(k in B)) style.removeProperty(cssName(k));
  for (const k of Object.keys(B)) {
    const v = B[k];
    if (A[k] === v) continue;
    const val = typeof v === "number" && !UNITLESS.has(k) ? `${v}px` : String(v ?? "");
    style.setProperty(cssName(k), val);
  }
}

function eventName(prop: string, el: Element) {
  const raw = prop.slice(2).toLowerCase();
  const tag = el.tagName.toLowerCase();
  if (raw === "change" && (tag === "input" || tag === "textarea" || tag === "select")) return "input";
  if (raw === "doubleclick") return "dblclick";
  return raw;
}

function applyAttr(el: Element, name: string, value: any, svg: boolean) {
  const attr = attrName(name, svg);
  if (value === null || value === undefined || value === false) {
    el.removeAttribute(attr);
    return;
  }
  el.setAttribute(attr, value === true ? "true" : String(value));
}

function patchProps(el: Element, prev: AnyProps, next: AnyProps, svg: boolean) {
  const keys = new Set([...Object.keys(prev), ...Object.keys(next)]);
  for (const k of keys) {
    if (k === "children" || k === "key" || k === "dangerouslySetInnerHTML") continue;
    const a = prev[k];
    const b = next[k];
    if (k === "ref") {
      if (a !== b) {
        setRef(a, null);
        setRef(b, el);
      }
      continue;
    }
    if (k === "style") {
      if (a !== b) patchStyle(el, a, b);
      continue;
    }
    if (k.length > 2 && k[0] === "o" && k[1] === "n") {
      if (a === b) continue;
      const evt = eventName(k, el);
      if (typeof a === "function") el.removeEventListener(evt, a as EventListener);
      if (typeof b === "function") el.addEventListener(evt, b as EventListener);
      continue;
    }
    if (k === "value") {
      if (b !== undefined) {
        const input = el as HTMLInputElement;
        if (input.value !== String(b)) input.value = String(b);
      }
      continue;
    }
    if (k === "checked") {
      if (b !== undefined) (el as HTMLInputElement).checked = Boolean(b);
      continue;
    }
    if (Object.is(a, b)) continue;
    applyAttr(el, k, b, svg);
  }
}

/* ============================================================
   Diff / commit
   ============================================================ */

function destroy(v: VNode) {
  const inst = v.i;
  if (inst) {
    inst.alive = false;
    for (const slot of inst.hooks) {
      if (slot && typeof slot.cleanup === "function") {
        try {
          slot.cleanup();
        } catch (e) {
          console.error(e);
        }
      }
    }
    if (inst.child) destroy(inst.child);
  }
  for (const c of v.c) if (c) destroy(c);
  if (v.d && v.d.parentNode) v.d.parentNode.removeChild(v.d);
  v.d = null;
}

function diffChildren(parent: Node, nextArr: any[], prevArr: any[], svg: boolean): VNode[] {
  const keyed = new Map<string | number, VNode>();
  const unkeyed: VNode[] = [];
  for (const p of prevArr) {
    if (!p) continue;
    if (p.k !== null && p.k !== undefined) keyed.set(p.k, p);
    else unkeyed.push(p);
  }

  const used = new Set<VNode>();
  const out: VNode[] = [];
  const nodes: Node[] = [];

  for (const raw of nextArr) {
    const n = normalize(raw);
    if (!n) {
      out.push(null as unknown as VNode);
      continue;
    }
    let match: VNode | undefined;
    if (n.k !== null && n.k !== undefined) {
      match = keyed.get(n.k);
      if (match) keyed.delete(n.k);
    } else {
      match = unkeyed.find((u) => !used.has(u) && u.t === n.t);
      if (match) used.add(match);
    }
    const r = diff(parent, n, match ?? null, svg);
    out.push(r as VNode);
    if (r && r.d) nodes.push(r.d);
  }

  for (const p of keyed.values()) destroy(p);
  for (const p of unkeyed) if (!used.has(p)) destroy(p);

  for (let i = 0; i < nodes.length; i += 1) {
    const want = nodes[i];
    if (parent.childNodes[i] !== want) parent.insertBefore(want, parent.childNodes[i] ?? null);
  }

  return out;
}

function diff(parent: Node, next: VNode, prev: VNode | null, svg: boolean): VNode | null {
  if (!next) return null;

  if (prev && prev !== next && prev.t !== next.t) {
    destroy(prev);
    prev = null;
  }

  const type = next.t;

  if (type === FRAG) {
    next.c = diffChildren(parent, next.c, prev?.c ?? [], svg);
    next.d = next.c.find((c) => c && c.d)?.d ?? null;
    return next;
  }

  if (type === "#text") {
    const value = next.p.v as string;
    let node = prev?.d as Text | undefined;
    if (!node || node.nodeType !== 3) {
      node = document.createTextNode(value);
      parent.appendChild(node);
    } else if (node.nodeValue !== value) {
      node.nodeValue = value;
    }
    next.d = node;
    return next;
  }

  if (typeof type === "function") {
    let inst = prev?.i ?? null;
    if (!inst) {
      inst = { hooks: [], setters: [], hi: 0, child: null, alive: true };
    }
    next.i = inst;
    if (prev && prev !== next) prev.i = null;

    const savedInst = current;
    const savedIdx = hookIndex;
    current = inst;
    hookIndex = 0;
    let out: any;
    try {
      out = (type as Function)(next.p);
    } finally {
      current = savedInst;
      hookIndex = savedIdx;
    }
    inst.hi = 0;
    inst.child = diff(parent, normalize(out) as VNode, inst.child, svg);
    next.d = inst.child?.d ?? null;
    return next;
  }

  const tag = type as string;
  const isSvg = svg || SVG_TAGS.has(tag);
  let el = prev?.d as Element | undefined;
  if (!el || el.nodeType !== 1 || el.tagName.toLowerCase() !== tag.toLowerCase()) {
    if (el) destroy(prev as VNode);
    el = isSvg ? (document.createElementNS(NS, tag) as Element) : document.createElement(tag);
    parent.appendChild(el);
  }
  next.d = el;
  patchProps(el, prev?.p ?? {}, next.p, isSvg);
  next.c = diffChildren(el, next.c, prev?.c ?? [], isSvg);
  return next;
}

function flushEffects() {
  const list = pending.splice(0, pending.length);
  for (const item of list) {
    const { slot, fn } = item;
    if (typeof slot.cleanup === "function") {
      try {
        slot.cleanup();
      } catch (e) {
        console.error(e);
      }
      slot.cleanup = undefined;
    }
    const c = fn();
    slot.cleanup = typeof c === "function" ? c : undefined;
  }
}

/* ============================================================
   Kök
   ============================================================ */

let rootHost: Element | null = null;
let rootTree: VNode | null = null;

function rerender() {
  if (!rootHost || !rootTree) return;
  rootTree = diff(rootHost, rootTree, rootTree, false);
  flushEffects();
}

export function createRoot(host: Element) {
  rootHost = host;
  return {
    render(v: any) {
      rootTree = normalize(v);
      rerender();
    },
    unmount() {
      if (rootTree) destroy(rootTree);
      rootTree = null;
    },
  };
}

export function render(v: any, host: Element) {
  createRoot(host).render(v);
}

export function StrictMode(props: AnyProps) {
  return props.children ?? null;
}

/* jsx-runtime uyumu için */
export const jsx = h;
export const jsxs = h;
export const Fragment = Frag;

/* Global fabrika: JSX classic transform icin guvenlik agi */
(globalThis as any).h = h;
(globalThis as any).Frag = Frag;
