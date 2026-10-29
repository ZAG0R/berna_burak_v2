import { useEffect, useRef } from 'react'
import * as THREE from 'three'

/* ============================================================
   Kalp bağı — iki avatarın arasına kalp ve damar ağı çizer.
   Damarların içinden soldan sağa parlak bir akım geçer.
   Yerleşimi değiştirmez: sidebar__people kutusunun üstüne
   mutlak konumlu, tıklamayı geçiren bir katman olarak biner.
   ============================================================ */

const VESSEL_VERT = /* glsl */ `
  varying vec2 vUv;
  varying vec3 vNormal;
  void main() {
    vUv = uv;
    vNormal = normalize(normalMatrix * normal);
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`

const VESSEL_FRAG = /* glsl */ `
  uniform float uTime;
  uniform float uBase;
  uniform float uSpeed;
  uniform float uGain;
  uniform float uPhase;
  uniform vec3 uColor;
  uniform vec3 uHot;
  varying vec2 vUv;
  varying vec3 vNormal;

  /* Damar boyunca tek yönde ilerleyen akım. */
  float pulseAt(float t, float head, float width) {
    float d = abs(fract(t - head + 0.5) - 0.5);
    return exp(-pow(d / width, 2.0));
  }

  void main() {
    float facing = 0.45 + 0.55 * abs(vNormal.z);
    float t = vUv.x;

    /* Bas akisi: tek, genis bir dalga. */
    float head = fract(uTime * uSpeed + uPhase);
    float a = pulseAt(t, head, 0.11) * 0.95;
    float b = pulseAt(t, fract(head + 0.58), 0.06) * 0.45;

    /* Damarin kendi nabzi: butun yuzeyde cok hafif nefes. */
    float breathe = 0.5 + 0.5 * sin(uTime * 2.2 + t * 3.0);
    float pulse = a + b + breathe * 0.12;

    float base = uBase * facing;
    vec3 col = mix(uColor, uHot, clamp(pulse * 0.95, 0.0, 1.0));
    float alpha = clamp(base + pulse * uGain, 0.0, 1.0) * facing;

    gl_FragColor = vec4(col, alpha);
  }
`

const GLOW_FRAG = /* glsl */ `
  uniform float uTime;
  uniform vec3 uColor;
  uniform float uIntensity;
  varying vec2 vUv;

  void main() {
    vec2 uv = vUv - 0.5;
    float d = length(uv) * 2.0;
    float halo = smoothstep(1.0, 0.0, d);
    halo = pow(halo, 2.2);
    float beat = 0.72 + 0.28 * sin(uTime * 2.6);
    gl_FragColor = vec4(uColor, halo * uIntensity * beat);
  }
`

const GLOW_VERT = /* glsl */ `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`

/* Kalp eğrisi: klasik parametrik denklem. */
function heartPoints(steps: number) {
  const pts: THREE.Vector2[] = []
  for (let i = 0; i < steps; i += 1) {
    const t = (i / steps) * Math.PI * 2
    const x = 16 * Math.sin(t) ** 3
    const y =
      13 * Math.cos(t) - 5 * Math.cos(2 * t) - 2 * Math.cos(3 * t) - Math.cos(4 * t)
    pts.push(new THREE.Vector2(x / 17, y / 17))
  }
  return pts
}

/* Keskin köşeli çoklu çizgi eğrisi: EKG'nin sivri uçları
   Catmull-Rom'un yumuşatmasıyla bozulmasın. */
class Polyline3 extends THREE.Curve<THREE.Vector3> {
  private points: THREE.Vector3[]
  private lengths: number[]
  private total: number

  constructor(points: THREE.Vector3[]) {
    super()
    this.points = points
    this.lengths = [0]
    let total = 0
    for (let i = 1; i < points.length; i += 1) {
      total += points[i].distanceTo(points[i - 1])
      this.lengths.push(total)
    }
    this.total = total || 1
  }

  getPoint(t: number, target = new THREE.Vector3()) {
    const d = Math.min(Math.max(t, 0), 1) * this.total
    let i = 1
    while (i < this.lengths.length - 1 && this.lengths[i] < d) i += 1
    const a = this.points[i - 1]
    const b = this.points[i]
    const span = this.lengths[i] - this.lengths[i - 1] || 1
    const k = (d - this.lengths[i - 1]) / span
    return target.copy(a).lerp(b, k)
  }
}

export default function HeartLink() {
  const hostRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    const host = hostRef.current
    if (!host) return
    const shell = host.parentElement
    if (!shell) return

    let renderer: THREE.WebGLRenderer
    try {
      renderer = new THREE.WebGLRenderer({
        alpha: true,
        antialias: true,
        powerPreference: 'low-power',
      })
    } catch {
      return
    }

    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const dpr = Math.min(window.devicePixelRatio || 1, 2)
    renderer.setPixelRatio(dpr)
    renderer.setClearAlpha(0)
    renderer.domElement.style.width = '100%'
    renderer.domElement.style.height = '100%'
    renderer.domElement.style.display = 'block'
    host.appendChild(renderer.domElement)

    const scene = new THREE.Scene()
    /* Ekran koordinatı aşağı büyür; dünyada yukarı büyüsün diye
       üst kenar h, alt kenar 0 alınır. */
    const camera = new THREE.OrthographicCamera(0, 1, 1, 0, -100, 100)
    camera.position.z = 10

    const now = { value: 0 }

    const vesselMat = (base: number, gain: number, speed: number, phase = 0) =>
      new THREE.ShaderMaterial({
        vertexShader: VESSEL_VERT,
        fragmentShader: VESSEL_FRAG,
        transparent: true,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
        side: THREE.DoubleSide,
        uniforms: {
          uTime: now,
          uBase: { value: base },
          uGain: { value: gain },
          uSpeed: { value: speed },
          uPhase: { value: phase },
          uColor: { value: new THREE.Color('#ff4d7d') },
          uHot: { value: new THREE.Color('#ffd9e6') },
        },
      })

    let meshes: THREE.Mesh[] = []
    const disposables: Array<{ dispose: () => void }> = []

    const clear = () => {
      for (const mesh of meshes) {
        scene.remove(mesh)
        mesh.geometry.dispose()
        const mat = mesh.material
        if (Array.isArray(mat)) mat.forEach((m) => m.dispose())
        else mat.dispose()
      }
      meshes = []
      for (const d of disposables) d.dispose()
      disposables.length = 0
    }

    const build = () => {
      clear()
      const w = host.clientWidth
      const h = host.clientHeight
      if (w < 40 || h < 20) return

      renderer.setSize(w, h, false)
      camera.left = 0
      camera.right = w
      camera.top = h
      camera.bottom = 0
      camera.updateProjectionMatrix()

      /* Avatar merkezlerini gerçek yerleşimden al (yukarı = artı). */
      const rings = shell.querySelectorAll('.person__ring')
      const shellBox = shell.getBoundingClientRect()
      const centers = Array.from(rings).map((ring) => {
        const r = ring.getBoundingClientRect()
        return {
          x: r.left + r.width / 2 - shellBox.left,
          y: h - (r.top + r.height / 2 - shellBox.top),
          rx: r.width / 2,
        }
      })
      if (centers.length < 2) return
      const [left, right] = centers
      const midX = (left.x + right.x) / 2
      const midY = (left.y + right.y) / 2

      const heartSize = Math.min(19, Math.max(15, (right.x - left.x) * 0.38))
      const scale = heartSize / 2

      /* --- kalp --- */
      const pts2 = heartPoints(120)
      const heartCurve = new THREE.CatmullRomCurve3(
        pts2.map((p) => new THREE.Vector3(midX + p.x * scale, midY + p.y * scale, 0)),
        true,
      )
      const heartGeo = new THREE.TubeGeometry(heartCurve, 200, 0.75, 8, true)
      const heartMesh = new THREE.Mesh(heartGeo, vesselMat(0.42, 1.5, 0.16))
      heartMesh.renderOrder = 3
      scene.add(heartMesh)
      meshes.push(heartMesh)

      /* --- damarlar: EKG dalgası ---
         Damarlar düz bir taban çizgisi + P/QRS/T kompleksleri
         halinde çizilir; aradaki kalp atışın merkezi olur. */
      const startX = left.x + left.rx * 0.72
      const endX = right.x - right.rx * 0.72
      const segL = [startX, midX - heartSize * 0.42]
      const segR = [midX + heartSize * 0.42, endX]
      const amp = Math.min(7, Math.max(4.5, (segL[1] - segL[0]) * 0.27))

      /* [x oranı, y oranı] — 0 taban, 1 R tepesi. */
      const ecg = (fromX: number, toX: number, baseY: number, a: number) => {
        const shape: Array<[number, number]> = [
          [0.0, 0.0],
          [0.16, 0.0],
          [0.3, -0.26],
          [0.4, 1.0],
          [0.5, -0.55],
          [0.58, 0.04],
          [0.7, 0.4],
          [0.82, 0.0],
          [1.0, 0.0],
        ]
        const pts = shape.map(
          ([u, v]) => new THREE.Vector3(fromX + (toX - fromX) * u, baseY + v * a, 0),
        )
        return new Polyline3(pts)
      }

      const curveL = ecg(segL[0], segL[1], midY, amp)
      const curveR = ecg(segR[0], segR[1], midY, amp)

      const geoL = new THREE.TubeGeometry(curveL, 160, 0.62, 6, false)
      const geoR = new THREE.TubeGeometry(curveR, 160, 0.62, 6, false)
      /* Akim soldan saga kesintisiz gitsin diye iki damar ayni
         hizda ve faz kaymasiyla akar. */
      const matL = vesselMat(0.34, 1.3, 0.3, 0)
      const matR = vesselMat(0.34, 1.3, 0.3, 0.5)
      const meshL = new THREE.Mesh(geoL, matL)
      const meshR = new THREE.Mesh(geoR, matR)

      meshL.renderOrder = 2
      meshR.renderOrder = 2
      scene.add(meshL)
      scene.add(meshR)
      meshes.push(meshL, meshR)

      /* --- kalbin arkasındaki yumuşak pembemsi hale --- */
      const glowGeo = new THREE.PlaneGeometry(heartSize * 3.4, heartSize * 3.4)
    const glowMat = new THREE.ShaderMaterial({
      vertexShader: GLOW_VERT,
      fragmentShader: GLOW_FRAG,
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      uniforms: {
        uTime: now,
        uColor: { value: new THREE.Color('#ff5f97') },
        uIntensity: { value: reduced ? 0.18 : 0.3 },
      },
    })
    const glowMesh = new THREE.Mesh(glowGeo, glowMat)
    glowMesh.position.set(midX, midY - heartSize * 0.05, -1)
    glowMesh.renderOrder = 1
    scene.add(glowMesh)
    meshes.push(glowMesh)
    }

    build()

    const ro = new ResizeObserver(() => build())
    ro.observe(shell)

    let raf = 0
    const clock = new THREE.Clock()
    const tick = () => {
      raf = requestAnimationFrame(tick)
      now.value = reduced ? 0.35 : clock.getElapsedTime()
      renderer.render(scene, camera)
    }
    tick()

    return () => {
      cancelAnimationFrame(raf)
      ro.disconnect()
      clear()
      renderer.dispose()
      if (renderer.domElement.parentElement === host) {
        host.removeChild(renderer.domElement)
      }
    }
  }, [])

  return <div ref={hostRef} className="heartlink" aria-hidden />
}
