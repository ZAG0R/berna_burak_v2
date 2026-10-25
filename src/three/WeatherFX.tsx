import { useEffect, useRef } from 'react'
import * as THREE from 'three'
import type { Condition } from '../data/scenes'

/* ============================================================
   Hava durumu efektleri — yağmur çizgileri, kar taneleri, soğuk
   havada ince pus. Sahne bir kez kurulur; hava değişince ilgili
   katman yumuşakça belirir/kaybolur.
   ============================================================ */

type Mode = Condition | null

type Handles = {
  setMode: (m: Mode) => void
}

const RAIN_VERT = /* glsl */ `
  attribute float aSeed;
  attribute float aVert;
  uniform float uTime;
  varying float vA;

  void main() {
    float span = 15.0;
    float speed = 11.0 * (0.75 + aSeed * 0.6);
    float y = 9.2 - mod(aSeed * span + uTime * speed, span);
    float drift = (9.2 - y) * 0.22;
    vec3 p = vec3(position.x + drift, y - aVert * 0.6, position.z);
    vec4 mv = modelViewMatrix * vec4(p, 1.0);
    gl_Position = projectionMatrix * mv;
    vA = 1.0 - aVert * 0.8;
  }
`

const RAIN_FRAG = /* glsl */ `
  uniform float uOpacity;
  uniform vec3 uTint;
  varying float vA;
  void main() {
    gl_FragColor = vec4(uTint, vA * uOpacity);
  }
`

const SNOW_VERT = /* glsl */ `
  attribute float aSeed;
  uniform float uTime;
  uniform float uSize;
  varying float vA;

  void main() {
    float s = aSeed;
    float span = 17.0;
    float y = 9.6 - mod(s * span + uTime * (0.55 + s * 0.9), span);
    float x = position.x + sin(uTime * (0.25 + s * 0.4) + s * 21.0) * 1.1;
    vec3 p = vec3(x, y, position.z);
    vec4 mv = modelViewMatrix * vec4(p, 1.0);
    gl_Position = projectionMatrix * mv;
    gl_PointSize = uSize * (0.45 + s) * (16.0 / -mv.z);
    vA = 0.4 + 0.6 * s;
  }
`

const SNOW_FRAG = /* glsl */ `
  uniform float uOpacity;
  varying float vA;
  void main() {
    vec2 uv = gl_PointCoord - 0.5;
    float d = length(uv);
    float a = smoothstep(0.5, 0.05, d);
    gl_FragColor = vec4(vec3(0.94, 0.97, 1.0), a * vA * uOpacity);
  }
`

const MIST_VERT = /* glsl */ `
  attribute float aSeed;
  uniform float uTime;
  uniform float uSize;
  varying float vA;
  void main() {
    float s = aSeed;
    vec3 p = position;
    p.x += sin(uTime * (0.06 + s * 0.05) + s * 14.0) * 2.6;
    p.y += cos(uTime * (0.05 + s * 0.04) + s * 9.0) * 1.2;
    vec4 mv = modelViewMatrix * vec4(p, 1.0);
    gl_Position = projectionMatrix * mv;
    gl_PointSize = uSize * (0.5 + s) * (18.0 / -mv.z);
    vA = 0.35 + 0.45 * (0.5 + 0.5 * sin(uTime * 0.22 + s * 22.0));
  }
`

const MIST_FRAG = /* glsl */ `
  uniform float uOpacity;
  varying float vA;
  void main() {
    vec2 uv = gl_PointCoord - 0.5;
    float d = length(uv);
    float a = smoothstep(0.5, 0.0, d);
    gl_FragColor = vec4(vec3(0.82, 0.9, 1.0), a * a * vA * uOpacity);
  }
`

export default function WeatherFX({ condition }: { condition: Condition | null }) {
  const hostRef = useRef<HTMLDivElement | null>(null)
  const handles = useRef<Handles | null>(null)
  const mode = useRef<Mode>(condition)

  useEffect(() => {
    mode.current = condition
    handles.current?.setMode(condition)
  }, [condition])

  useEffect(() => {
    const host = hostRef.current
    if (!host) return

    let renderer: THREE.WebGLRenderer
    try {
      renderer = new THREE.WebGLRenderer({ alpha: true, antialias: false, powerPreference: 'low-power' })
    } catch {
      return
    }

    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const dpr = Math.min(window.devicePixelRatio || 1, 1.6)
    renderer.setPixelRatio(dpr)
    renderer.setSize(host.clientWidth, host.clientHeight, false)
    renderer.domElement.style.width = '100%'
    renderer.domElement.style.height = '100%'
    host.appendChild(renderer.domElement)

    const scene = new THREE.Scene()
    const camera = new THREE.PerspectiveCamera(58, host.clientWidth / host.clientHeight, 0.1, 120)
    camera.position.z = 16

    const isMobile = host.clientWidth < 760

    /* ---------- yağmur ---------- */
    const rainCount = isMobile ? 260 : 620
    const rainPos = new Float32Array(rainCount * 2 * 3)
    const rainSeed = new Float32Array(rainCount * 2)
    const rainVert = new Float32Array(rainCount * 2)
    for (let i = 0; i < rainCount; i += 1) {
      const x = (Math.random() - 0.5) * 40
      const z = (Math.random() - 0.5) * 14
      const s = Math.random()
      for (let v = 0; v < 2; v += 1) {
        rainPos[(i * 2 + v) * 3] = x
        rainPos[(i * 2 + v) * 3 + 1] = 0
        rainPos[(i * 2 + v) * 3 + 2] = z
        rainSeed[i * 2 + v] = s
        rainVert[i * 2 + v] = v
      }
    }
    const rainGeo = new THREE.BufferGeometry()
    rainGeo.setAttribute('position', new THREE.BufferAttribute(rainPos, 3))
    rainGeo.setAttribute('aSeed', new THREE.BufferAttribute(rainSeed, 1))
    rainGeo.setAttribute('aVert', new THREE.BufferAttribute(rainVert, 1))

    const rainMat = new THREE.ShaderMaterial({
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      uniforms: {
        uTime: { value: 0 },
        uOpacity: { value: 0 },
        uTint: { value: new THREE.Color('#bcd9ff') },
      },
      vertexShader: RAIN_VERT,
      fragmentShader: RAIN_FRAG,
    })
    const rain = new THREE.LineSegments(rainGeo, rainMat)
    scene.add(rain)

    /* ---------- kar ---------- */
    const snowCount = isMobile ? 460 : 1250
    const snowPos = new Float32Array(snowCount * 3)
    const snowSeed = new Float32Array(snowCount)
    for (let i = 0; i < snowCount; i += 1) {
      snowPos[i * 3] = (Math.random() - 0.5) * 40
      snowPos[i * 3 + 1] = 0
      snowPos[i * 3 + 2] = (Math.random() - 0.5) * 16
      snowSeed[i] = Math.random()
    }
    const snowGeo = new THREE.BufferGeometry()
    snowGeo.setAttribute('position', new THREE.BufferAttribute(snowPos, 3))
    snowGeo.setAttribute('aSeed', new THREE.BufferAttribute(snowSeed, 1))

    const snowMat = new THREE.ShaderMaterial({
      transparent: true,
      depthWrite: false,
      uniforms: {
        uTime: { value: 0 },
        uSize: { value: dpr * (isMobile ? 3.4 : 4.6) },
      uOpacity: { value: 0 },
      },
      vertexShader: SNOW_VERT,
      fragmentShader: SNOW_FRAG,
    })
    const snow = new THREE.Points(snowGeo, snowMat)
    scene.add(snow)

    /* ---------- soğuk hava pusu ---------- */
    const mistCount = isMobile ? 26 : 44
    const mistPos = new Float32Array(mistCount * 3)
    const mistSeed = new Float32Array(mistCount)
    for (let i = 0; i < mistCount; i += 1) {
      mistPos[i * 3] = (Math.random() - 0.5) * 34
      mistPos[i * 3 + 1] = (Math.random() - 0.5) * 18
      mistPos[i * 3 + 2] = -6 - Math.random() * 6
      mistSeed[i] = Math.random()
    }
    const mistGeo = new THREE.BufferGeometry()
    mistGeo.setAttribute('position', new THREE.BufferAttribute(mistPos, 3))
    mistGeo.setAttribute('aSeed', new THREE.BufferAttribute(mistSeed, 1))

    const mistMat = new THREE.ShaderMaterial({
      transparent: true,
      depthWrite: false,
      uniforms: {
        uTime: { value: 0 },
        uSize: { value: dpr * 190 },
        uOpacity: { value: 0 },
      },
      vertexShader: MIST_VERT,
      fragmentShader: MIST_FRAG,
    })
    const mist = new THREE.Points(mistGeo, mistMat)
    scene.add(mist)

    /* ---------- geçiş hedefleri ---------- */
    const target = { rain: 0, snow: 0, mist: 0 }
    const apply = (m: Mode) => {
      target.rain = m === 'rain' ? 1 : 0
      target.snow = m === 'snow' ? 1 : 0
      target.mist = m === 'cold' ? 1 : 0
    }

    handles.current = { setMode: apply }
    apply(mode.current)

    const resize = () => {
      const w = host.clientWidth
      const h = host.clientHeight
      if (w === 0 || h === 0) return
      camera.aspect = w / h
      camera.updateProjectionMatrix()
      renderer.setSize(w, h, false)
    }
    const ro = new ResizeObserver(resize)
    ro.observe(host)

    let raf = 0
    const clock = new THREE.Clock()
    let visible = true
    const onVis = () => {
      visible = document.visibilityState === 'visible'
    }
    document.addEventListener('visibilitychange', onVis)

    const render = () => {
      raf = requestAnimationFrame(render)
      if (!visible) return
      const t = clock.getElapsedTime()
      const ease = 0.045
      rainMat.uniforms.uOpacity.value += (target.rain * 0.5 - rainMat.uniforms.uOpacity.value) * ease
      snowMat.uniforms.uOpacity.value += (target.snow * 0.95 - snowMat.uniforms.uOpacity.value) * ease
      mistMat.uniforms.uOpacity.value += (target.mist * 0.09 - mistMat.uniforms.uOpacity.value) * ease
      rainMat.uniforms.uTime.value = t
      snowMat.uniforms.uTime.value = t
      mistMat.uniforms.uTime.value = t * 0.35
      renderer.render(scene, camera)
    }

    if (reduced) {
      rainMat.uniforms.uTime.value = 6
      snowMat.uniforms.uTime.value = 6
      rainMat.uniforms.uOpacity.value = target.rain * 0.5
      snowMat.uniforms.uOpacity.value = target.snow * 0.95
      mistMat.uniforms.uOpacity.value = target.mist * 0.09
      renderer.render(scene, camera)
      handles.current = {
        setMode: (m) => {
          apply(m)
          rainMat.uniforms.uOpacity.value = target.rain * 0.5
          snowMat.uniforms.uOpacity.value = target.snow * 0.95
          mistMat.uniforms.uOpacity.value = target.mist * 0.09
          renderer.render(scene, camera)
        },
      }
      handles.current.setMode(mode.current)
    } else {
      render()
    }

    return () => {
      cancelAnimationFrame(raf)
      ro.disconnect()
      document.removeEventListener('visibilitychange', onVis)
      handles.current = null
      rainGeo.dispose()
      rainMat.dispose()
      snowGeo.dispose()
      snowMat.dispose()
      mistGeo.dispose()
      mistMat.dispose()
      renderer.dispose()
      if (renderer.domElement.parentNode === host) host.removeChild(renderer.domElement)
    }
  }, [])

  return <div className="weatherfx" ref={hostRef} aria-hidden />
}
