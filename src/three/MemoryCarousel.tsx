import { useEffect, useRef } from 'react'
import * as THREE from 'three'

/* ============================================================
   3B anı karuseli — dönen silindir üzerinde fotoğraf kartları.
   Sürükleyerek döndürülür, otomatik yavaş dönüş, merkez vurgusu.
   ============================================================ */

type Item = { image: string; caption: string; date: string }

type Props = { items: Item[]; onSelect?: (index: number) => void }

export default function MemoryCarousel({ items, onSelect }: Props) {
  const hostRef = useRef<HTMLDivElement | null>(null)
  const onSelectRef = useRef(onSelect)
  onSelectRef.current = onSelect

  const keys = items.map((i) => i.image + i.caption).join('|')

  useEffect(() => {
    const host = hostRef.current
    if (!host || items.length === 0) return

    let renderer: THREE.WebGLRenderer
    try {
      renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true })
    } catch {
      return
    }

    const dpr = Math.min(window.devicePixelRatio || 1, 2)
    renderer.setPixelRatio(dpr)
    renderer.setSize(host.clientWidth, host.clientHeight, false)
    renderer.domElement.style.width = '100%'
    renderer.domElement.style.height = '100%'
    renderer.domElement.style.display = 'block'
    host.appendChild(renderer.domElement)

    const scene = new THREE.Scene()
    const camera = new THREE.PerspectiveCamera(46, host.clientWidth / host.clientHeight, 0.1, 100)
    camera.position.set(0, 0.4, 9.6)
    camera.lookAt(0, 0, 0)

    scene.add(new THREE.AmbientLight(0xaab4d4, 0.85))
    const key = new THREE.DirectionalLight(0xffe0b8, 1.6)
    key.position.set(3, 5, 6)
    scene.add(key)
    const rim = new THREE.PointLight(0xf4728f, 14, 26)
    rim.position.set(-5, 1.5, -3)
    scene.add(rim)

    const carousel = new THREE.Group()
    scene.add(carousel)

    const loader = new THREE.TextureLoader()
    loader.setCrossOrigin('anonymous')

    const radius = 4.6
    const count = items.length
    type Card = {
      group: THREE.Group
      plane: THREE.Mesh
      frame: THREE.Mesh
      baseMat: THREE.MeshBasicMaterial
      frameMat: THREE.MeshStandardMaterial
      angle: number
      seed: number
    }
    const cards: Card[] = []
    const textures: THREE.Texture[] = []

    const W = 2.3
    const H = 2.9

    items.forEach((item, i) => {
      const angle = (i / count) * Math.PI * 2
      const group = new THREE.Group()

      const tex = loader.load(item.image)
      tex.colorSpace = THREE.SRGBColorSpace
      textures.push(tex)

      const baseMat = new THREE.MeshBasicMaterial({ map: tex, transparent: true, opacity: 0.92 })
      const plane = new THREE.Mesh(new THREE.PlaneGeometry(W, H), baseMat)
      plane.position.z = 0.02
      group.add(plane)

      const frameMat = new THREE.MeshStandardMaterial({
        color: 0xf7f2e8,
        roughness: 0.55,
        metalness: 0.05,
        transparent: true,
        opacity: 0.96,
      })
      const frame = new THREE.Mesh(new THREE.PlaneGeometry(W + 0.22, H + 0.5), frameMat)
      frame.position.z = 0
      group.add(frame)

      group.position.set(Math.sin(angle) * radius, 0, Math.cos(angle) * radius)
      group.rotation.y = angle

      carousel.add(group)
      cards.push({ group, plane, frame, baseMat, frameMat, angle, seed: i / count })
    })

    // yansıma zemini
    const ringGeo = new THREE.RingGeometry(3.1, 5.9, 64)
    const ringMat = new THREE.MeshBasicMaterial({
      color: 0xffb35c,
      transparent: true,
      opacity: 0.08,
      side: THREE.DoubleSide,
    })
    const ring = new THREE.Mesh(ringGeo, ringMat)
    ring.rotation.x = -Math.PI / 2
    ring.position.y = -1.9
    scene.add(ring)

    // parçacıklar
    const P = 160
    const pGeo = new THREE.BufferGeometry()
    const pPos = new Float32Array(P * 3)
    const pSeed = new Float32Array(P)
    for (let i = 0; i < P; i += 1) {
      const a = Math.random() * Math.PI * 2
      const r = 2.6 + Math.random() * 5.4
      pPos[i * 3] = Math.cos(a) * r
      pPos[i * 3 + 1] = -2 + Math.random() * 5
      pPos[i * 3 + 2] = Math.sin(a) * r
      pSeed[i] = Math.random()
    }
    pGeo.setAttribute('position', new THREE.BufferAttribute(pPos, 3))
    pGeo.setAttribute('aSeed', new THREE.BufferAttribute(pSeed, 1))
    const pMat = new THREE.ShaderMaterial({
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      uniforms: { uTime: { value: 0 }, uSize: { value: dpr * 3.6 } },
      vertexShader: /* glsl */ `
        attribute float aSeed;
        uniform float uTime;
        uniform float uSize;
        varying float vF;
        void main() {
          vec3 p = position;
          p.y += mod(uTime * (0.2 + aSeed * 0.35) + aSeed * 7.0, 6.0) - 2.0;
          p.x += sin(uTime * 0.3 + aSeed * 10.0) * 0.4;
          vec4 mv = modelViewMatrix * vec4(p, 1.0);
          gl_Position = projectionMatrix * mv;
          gl_PointSize = uSize * (0.4 + aSeed) * (14.0 / -mv.z);
          vF = 0.25 + aSeed * 0.75;
        }
      `,
      fragmentShader: /* glsl */ `
        varying float vF;
        void main() {
          float d = length(gl_PointCoord - 0.5);
          float a = smoothstep(0.5, 0.0, d);
          gl_FragColor = vec4(1.0, 0.85, 0.65, a * a * 0.45 * vF);
        }
      `,
    })
    const particles = new THREE.Points(pGeo, pMat)
    scene.add(particles)

    /* ---------- etkileşim ---------- */
    let rot = 0
    let velocity = 0.09
    let dragging = false
    let lastX = 0
    let dragMoved = 0
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches

    const onDown = (e: PointerEvent) => {
      dragging = true
      lastX = e.clientX
      dragMoved = 0
      renderer.domElement.setPointerCapture(e.pointerId)
    }
    const onMove = (e: PointerEvent) => {
      if (!dragging) return
      const dx = e.clientX - lastX
      lastX = e.clientX
      dragMoved += Math.abs(dx)
      velocity = dx * 0.006
      rot += velocity
    }
    const onUp = (e: PointerEvent) => {
      if (!dragging) return
      dragging = false
      try { renderer.domElement.releasePointerCapture(e.pointerId) } catch { /* */ }
      if (dragMoved < 6) {
        // tıklama: en yakın kartı merkeze getir
        const step = (Math.PI * 2) / count
        const idx = Math.round(-rot / step)
        onSelectRef.current?.(((idx % count) + count) % count)
      }
    }

    renderer.domElement.addEventListener('pointerdown', onDown)
    renderer.domElement.addEventListener('pointermove', onMove)
    renderer.domElement.addEventListener('pointerup', onUp)
    renderer.domElement.addEventListener('pointercancel', onUp)

    let raf = 0
    const clock = new THREE.Clock()
    let visible = true
    const onVis = () => { visible = document.visibilityState === 'visible' }
    document.addEventListener('visibilitychange', onVis)

    const resize = () => {
      const w = host.clientWidth
      const h = host.clientHeight
      if (!w || !h) return
      camera.aspect = w / h
      camera.updateProjectionMatrix()
      renderer.setSize(w, h, false)
    }
    const ro = new ResizeObserver(resize)
    ro.observe(host)

    const render = () => {
      raf = requestAnimationFrame(render)
      if (!visible) return
      const t = clock.getElapsedTime()
      const dt = Math.min(clock.getDelta(), 0.05)

      if (!dragging) {
        if (reduced) {
          // sabit
        } else {
          velocity += (0.09 - velocity) * 0.02
          rot += velocity * dt * 60 * 0.016
        }
      }
      carousel.rotation.y = rot

      // merkez vurgusu
      cards.forEach((c) => {
        const world = c.angle + rot
        const facing = Math.cos(world)
        const focus = (facing + 1) / 2 // 0 arka, 1 ön
        c.baseMat.opacity = 0.35 + focus * 0.62
        c.frameMat.opacity = 0.4 + focus * 0.58
        c.group.scale.setScalar(0.86 + focus * 0.22)
        c.group.position.y = (focus - 0.5) * 0.55
        c.group.rotation.z = (1 - focus) * 0.06 * Math.sin(t + c.seed * 6)
      })

      pMat.uniforms.uTime.value = t
      particles.rotation.y = rot * 0.2
      ring.rotation.z = t * 0.06

      renderer.render(scene, camera)
    }
    render()

    return () => {
      cancelAnimationFrame(raf)
      ro.disconnect()
      renderer.domElement.removeEventListener('pointerdown', onDown)
      renderer.domElement.removeEventListener('pointermove', onMove)
      renderer.domElement.removeEventListener('pointerup', onUp)
      renderer.domElement.removeEventListener('pointercancel', onUp)
      document.removeEventListener('visibilitychange', onVis)
      textures.forEach((tx) => tx.dispose())
      cards.forEach((c) => {
        c.plane.geometry.dispose()
        c.frame.geometry.dispose()
        c.baseMat.dispose()
        c.frameMat.dispose()
      })
      ringGeo.dispose()
      ringMat.dispose()
      pGeo.dispose()
      pMat.dispose()
      renderer.dispose()
      if (renderer.domElement.parentNode === host) host.removeChild(renderer.domElement)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [keys])

  return <div className="carousel3d" ref={hostRef} />
}
