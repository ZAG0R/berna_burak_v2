import { useEffect, useRef } from 'react'
import * as THREE from 'three'

/* ============================================================
   Arka plan ambiyansı — yüzen toz zerreleri, bokeh ışıklar,
   yumuşak parıltılar. Fare/dokunma ile hafif parallaks.
   ============================================================ */

type Props = { intensity?: number }

export default function AmbientCanvas({ intensity = 1 }: Props) {
  const hostRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    const host = hostRef.current
    if (!host) return

    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    let renderer: THREE.WebGLRenderer
    try {
      renderer = new THREE.WebGLRenderer({ alpha: true, antialias: false, powerPreference: 'low-power' })
    } catch {
      return
    }

    const dpr = Math.min(window.devicePixelRatio || 1, 1.75)
    renderer.setPixelRatio(dpr)
    renderer.setSize(host.clientWidth, host.clientHeight, false)
    renderer.domElement.style.width = '100%'
    renderer.domElement.style.height = '100%'
    host.appendChild(renderer.domElement)

    const scene = new THREE.Scene()
    const camera = new THREE.PerspectiveCamera(58, host.clientWidth / host.clientHeight, 0.1, 120)
    camera.position.z = 16

    const isMobile = host.clientWidth < 760
    const dustCount = isMobile ? 320 : 720
    const bokehCount = isMobile ? 26 : 54

    /* ---------- yüzen zerreler ---------- */
    const dustGeo = new THREE.BufferGeometry()
    const dpos = new Float32Array(dustCount * 3)
    const dseed = new Float32Array(dustCount)
    for (let i = 0; i < dustCount; i += 1) {
      dpos[i * 3] = (Math.random() - 0.5) * 46
      dpos[i * 3 + 1] = (Math.random() - 0.5) * 30
      dpos[i * 3 + 2] = (Math.random() - 0.5) * 26
      dseed[i] = Math.random()
    }
    dustGeo.setAttribute('position', new THREE.BufferAttribute(dpos, 3))
    dustGeo.setAttribute('aSeed', new THREE.BufferAttribute(dseed, 1))

    const dustMat = new THREE.ShaderMaterial({
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      uniforms: {
        uTime: { value: 0 },
        uSize: { value: dpr * (isMobile ? 2.6 : 3.4) },
        uOpacity: { value: 0.5 * intensity },
        uTint: { value: new THREE.Color('#ffc98a') },
      },
      vertexShader: /* glsl */ `
        attribute float aSeed;
        uniform float uTime;
        uniform float uSize;
        varying float vFade;
        void main() {
          vec3 p = position;
          float s = aSeed;
          p.x += sin(uTime * (0.14 + s * 0.2) + s * 8.0) * 1.5;
          p.y += cos(uTime * (0.1 + s * 0.16) + s * 5.0) * 1.25 + mod(uTime * (0.25 + s * 0.3), 1.0) * 0.6;
          p.z += sin(uTime * (0.08 + s * 0.12) + s * 3.0) * 1.1;
          vec4 mv = modelViewMatrix * vec4(p, 1.0);
          gl_Position = projectionMatrix * mv;
          gl_PointSize = uSize * (0.5 + s) * (18.0 / -mv.z);
          vFade = 0.35 + s * 0.65;
        }
      `,
      fragmentShader: /* glsl */ `
        uniform float uOpacity;
        uniform vec3 uTint;
        varying float vFade;
        void main() {
          vec2 uv = gl_PointCoord - 0.5;
          float d = length(uv);
          float a = smoothstep(0.5, 0.0, d);
          gl_FragColor = vec4(uTint, a * a * uOpacity * vFade);
        }
      `,
    })

    const dust = new THREE.Points(dustGeo, dustMat)
    scene.add(dust)

    /* ---------- bokeh ışık daireleri ---------- */
    const bokehGeo = new THREE.BufferGeometry()
    const bpos = new Float32Array(bokehCount * 3)
    const bseed = new Float32Array(bokehCount)
    for (let i = 0; i < bokehCount; i += 1) {
      bpos[i * 3] = (Math.random() - 0.5) * 40
      bpos[i * 3 + 1] = (Math.random() - 0.5) * 26
      bpos[i * 3 + 2] = -4 - Math.random() * 14
      bseed[i] = Math.random()
    }
    bokehGeo.setAttribute('position', new THREE.BufferAttribute(bpos, 3))
    bokehGeo.setAttribute('aSeed', new THREE.BufferAttribute(bseed, 1))

    const bokehMat = new THREE.ShaderMaterial({
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      uniforms: {
        uTime: { value: 0 },
        uSize: { value: dpr * (isMobile ? 26 : 40) },
        uOpacity: { value: 0.14 * intensity },
        uA: { value: new THREE.Color('#ffab5e') },
        uB: { value: new THREE.Color('#f4728f') },
      },
      vertexShader: /* glsl */ `
        attribute float aSeed;
        uniform float uTime;
        uniform float uSize;
        varying float vMix;
        varying float vFade;
        void main() {
          vec3 p = position;
          float s = aSeed;
          p.x += sin(uTime * (0.05 + s * 0.08) + s * 12.0) * 2.4;
          p.y += cos(uTime * (0.04 + s * 0.07) + s * 9.0) * 2.0;
          vec4 mv = modelViewMatrix * vec4(p, 1.0);
          gl_Position = projectionMatrix * mv;
          gl_PointSize = uSize * (0.45 + s) * (20.0 / -mv.z);
          vMix = s;
          vFade = 0.4 + 0.6 * (0.5 + 0.5 * sin(uTime * 0.5 + s * 20.0));
        }
      `,
      fragmentShader: /* glsl */ `
        uniform float uOpacity;
        uniform vec3 uA;
        uniform vec3 uB;
        varying float vMix;
        varying float vFade;
        void main() {
          vec2 uv = gl_PointCoord - 0.5;
          float d = length(uv);
          float a = smoothstep(0.5, 0.06, d);
          vec3 col = mix(uA, uB, vMix);
          gl_FragColor = vec4(col, a * uOpacity * vFade);
        }
      `,
    })

    const bokeh = new THREE.Points(bokehGeo, bokehMat)
    scene.add(bokeh)

    /* ---------- parallaks ---------- */
    const pointer = { x: 0, y: 0 }
    const target = { x: 0, y: 0 }

    const onPointerMove = (e: PointerEvent) => {
      target.x = (e.clientX / window.innerWidth - 0.5) * 2
      target.y = (e.clientY / window.innerHeight - 0.5) * 2
    }
    const onOrient = (e: DeviceOrientationEvent) => {
      target.x = Math.max(-1, Math.min(1, (e.gamma ?? 0) / 35))
      target.y = Math.max(-1, Math.min(1, ((e.beta ?? 0) - 45) / 35))
    }

    window.addEventListener('pointermove', onPointerMove, { passive: true })
    window.addEventListener('deviceorientation', onOrient)

    /* ---------- döngü ---------- */
    let raf = 0
    const clock = new THREE.Clock()

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

    let visible = true
    const onVis = () => { visible = document.visibilityState === 'visible' }
    document.addEventListener('visibilitychange', onVis)

    const render = () => {
      raf = requestAnimationFrame(render)
      if (!visible) return
      const t = clock.getElapsedTime()
      pointer.x += (target.x - pointer.x) * 0.045
      pointer.y += (target.y - pointer.y) * 0.045
      dustMat.uniforms.uTime.value = t
      bokehMat.uniforms.uTime.value = t
      dust.rotation.y = pointer.x * 0.1
      dust.rotation.x = -pointer.y * 0.07
      bokeh.rotation.y = pointer.x * 0.05
      camera.position.x = pointer.x * 1.4
      camera.position.y = -pointer.y * 1.0
      camera.lookAt(0, 0, 0)
      renderer.render(scene, camera)
    }

    if (reduced) {
      dustMat.uniforms.uTime.value = 4
      bokehMat.uniforms.uTime.value = 4
      renderer.render(scene, camera)
    } else {
      render()
    }

    return () => {
      cancelAnimationFrame(raf)
      ro.disconnect()
      window.removeEventListener('pointermove', onPointerMove)
      window.removeEventListener('deviceorientation', onOrient)
      document.removeEventListener('visibilitychange', onVis)
      dustGeo.dispose()
      dustMat.dispose()
      bokehGeo.dispose()
      bokehMat.dispose()
      renderer.dispose()
      if (renderer.domElement.parentNode === host) host.removeChild(renderer.domElement)
    }
  }, [intensity])

  return <div className="ambient" ref={hostRef} aria-hidden />
}
