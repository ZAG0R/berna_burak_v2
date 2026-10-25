import { useEffect, useRef } from 'react'
import * as THREE from 'three'

/* ============================================================
   Açılabilir 3B hediye kutusu — tıklayınca kapak fırlar,
   kalpler/konfeti yükselir, ışık patlaması olur.
   ============================================================ */

type Props = { open: boolean; onToggle: () => void }

export default function GiftBox({ open, onToggle }: Props) {
  const hostRef = useRef<HTMLDivElement | null>(null)
  const openRef = useRef(open)
  const toggleRef = useRef(onToggle)

  openRef.current = open
  toggleRef.current = onToggle

  useEffect(() => {
    const host = hostRef.current
    if (!host) return

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
    renderer.shadowMap.enabled = true
    renderer.shadowMap.type = THREE.PCFSoftShadowMap
    host.appendChild(renderer.domElement)

    const scene = new THREE.Scene()
    const camera = new THREE.PerspectiveCamera(42, host.clientWidth / host.clientHeight, 0.1, 100)
    camera.position.set(0, 2.1, 7.4)
    camera.lookAt(0, 0.15, 0)

    /* ---------- ışıklar ---------- */
    scene.add(new THREE.AmbientLight(0x8899cc, 0.55))

    const key = new THREE.DirectionalLight(0xffd9a8, 2.1)
    key.position.set(4, 6.5, 5)
    key.castShadow = true
    key.shadow.mapSize.set(1024, 1024)
    key.shadow.camera.near = 1
    key.shadow.camera.far = 22
    key.shadow.camera.left = -6
    key.shadow.camera.right = 6
    key.shadow.camera.top = 6
    key.shadow.camera.bottom = -6
    scene.add(key)

    const rim = new THREE.PointLight(0xf4728f, 22, 22)
    rim.position.set(-4.2, 1.6, -2.4)
    scene.add(rim)

    const warm = new THREE.PointLight(0xffb35c, 16, 20)
    warm.position.set(3.4, 0.4, 3.2)
    scene.add(warm)

    // kutu içi ışık (açılınca parlar)
    const inner = new THREE.PointLight(0xfff0c8, 0, 12)
    inner.position.set(0, 0.5, 0)
    scene.add(inner)

    /* ---------- zemin ---------- */
    const floorGeo = new THREE.CircleGeometry(9, 48)
    const floorMat = new THREE.MeshStandardMaterial({
      color: 0x11162a,
      roughness: 0.85,
      metalness: 0.1,
      transparent: true,
      opacity: 0.85,
    })
    const floor = new THREE.Mesh(floorGeo, floorMat)
    floor.rotation.x = -Math.PI / 2
    floor.position.y = -1.35
    floor.receiveShadow = true
    scene.add(floor)

    /* ---------- kutu ---------- */
    const group = new THREE.Group()
    scene.add(group)

    const size = 2.05
    const ribbonColor = 0xffb35c
    const boxColor = 0x1c2340

    const boxMat = new THREE.MeshStandardMaterial({ color: boxColor, roughness: 0.42, metalness: 0.22 })
    const ribMat = new THREE.MeshStandardMaterial({
      color: ribbonColor,
      roughness: 0.28,
      metalness: 0.5,
      emissive: new THREE.Color(0xffb35c).multiplyScalar(0.14),
    })

    const body = new THREE.Mesh(new THREE.BoxGeometry(size, size * 0.78, size), boxMat)
    body.position.y = -0.42
    body.castShadow = true
    body.receiveShadow = true
    group.add(body)

    // gövde şeritleri
    const strapGeo = new THREE.BoxGeometry(size * 1.02, size * 0.8, size * 0.16)
    const strapA = new THREE.Mesh(strapGeo, ribMat)
    strapA.position.copy(body.position)
    strapA.castShadow = true
    group.add(strapA)
    const strapB = new THREE.Mesh(new THREE.BoxGeometry(size * 0.16, size * 0.8, size * 1.02), ribMat)
    strapB.position.copy(body.position)
    strapB.castShadow = true
    group.add(strapB)

    // kapak
    const lid = new THREE.Group()
    lid.position.set(0, 0.28, 0)
    group.add(lid)

    const lidMesh = new THREE.Mesh(new THREE.BoxGeometry(size * 1.1, size * 0.24, size * 1.1), boxMat)
    lidMesh.castShadow = true
    lid.add(lidMesh)

    const lidStrapA = new THREE.Mesh(new THREE.BoxGeometry(size * 1.12, size * 0.26, size * 0.16), ribMat)
    lidStrapA.castShadow = true
    lid.add(lidStrapA)
    const lidStrapB = new THREE.Mesh(new THREE.BoxGeometry(size * 0.16, size * 0.26, size * 1.12), ribMat)
    lidStrapB.castShadow = true
    lid.add(lidStrapB)

    // fiyonk
    const bowMat = ribMat
    const bowGeo = new THREE.TorusGeometry(0.32, 0.085, 10, 26)
    const bowL = new THREE.Mesh(bowGeo, bowMat)
    bowL.position.set(-0.3, 0.16, 0)
    bowL.rotation.set(Math.PI / 2, 0, 0.5)
    lid.add(bowL)
    const bowR = new THREE.Mesh(bowGeo, bowMat)
    bowR.position.set(0.3, 0.16, 0)
    bowR.rotation.set(Math.PI / 2, 0, -0.5)
    lid.add(bowR)
    const knot = new THREE.Mesh(new THREE.SphereGeometry(0.15, 18, 14), bowMat)
    knot.position.set(0, 0.22, 0)
    lid.add(knot)

    /* ---------- içeriden çıkan kalpler ---------- */
    const heartShape = new THREE.Shape()
    heartShape.moveTo(0, 0.3)
    heartShape.bezierCurveTo(0, 0.55, -0.42, 0.62, -0.42, 0.28)
    heartShape.bezierCurveTo(-0.42, 0.02, -0.16, -0.2, 0, -0.44)
    heartShape.bezierCurveTo(0.16, -0.2, 0.42, 0.02, 0.42, 0.28)
    heartShape.bezierCurveTo(0.42, 0.62, 0, 0.55, 0, 0.3)

    const heartGeo = new THREE.ExtrudeGeometry(heartShape, {
      depth: 0.16,
      bevelEnabled: true,
      bevelSize: 0.035,
      bevelThickness: 0.035,
      bevelSegments: 3,
      curveSegments: 8,
    })
    heartGeo.center()

    const HEARTS = 16
    type Heart = { mesh: THREE.Mesh; seed: number; spin: number }
    const hearts: Heart[] = []
    const heartColors = [0xffb35c, 0xf4728f, 0xffd9a8, 0xc4a4ff]

    for (let i = 0; i < HEARTS; i += 1) {
      const mat = new THREE.MeshStandardMaterial({
        color: heartColors[i % heartColors.length],
        roughness: 0.3,
        metalness: 0.35,
        emissive: new THREE.Color(heartColors[i % heartColors.length]).multiplyScalar(0.22),
        transparent: true,
        opacity: 0,
      })
      const mesh = new THREE.Mesh(heartGeo, mat)
      const seed = i / HEARTS
      mesh.scale.setScalar(0.34 + (i % 4) * 0.055)
      mesh.position.set(0, -0.4, 0)
      mesh.castShadow = true
      scene.add(mesh)
      hearts.push({ mesh, seed, spin: (Math.random() - 0.5) * 2.2 })
    }

    /* ---------- toz parçacıkları ---------- */
    const PCOUNT = 130
    const pGeo = new THREE.BufferGeometry()
    const pPos = new Float32Array(PCOUNT * 3)
    const pSeed = new Float32Array(PCOUNT)
    for (let i = 0; i < PCOUNT; i += 1) {
      const r = Math.random() * 4.2
      const a = Math.random() * Math.PI * 2
      pPos[i * 3] = Math.cos(a) * r
      pPos[i * 3 + 1] = -1.2 + Math.random() * 4.4
      pPos[i * 3 + 2] = Math.sin(a) * r
      pSeed[i] = Math.random()
    }
    pGeo.setAttribute('position', new THREE.BufferAttribute(pPos, 3))
    pGeo.setAttribute('aSeed', new THREE.BufferAttribute(pSeed, 1))

    const pMat = new THREE.ShaderMaterial({
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      uniforms: {
        uTime: { value: 0 },
        uSize: { value: dpr * 4.2 },
        uOpacity: { value: 0.5 },
      },
      vertexShader: /* glsl */ `
        attribute float aSeed;
        uniform float uTime;
        uniform float uSize;
        varying float vF;
        void main() {
          vec3 p = position;
          p.y += mod(uTime * (0.25 + aSeed * 0.5) + aSeed * 6.0, 5.4) - 1.2;
          p.x += sin(uTime * 0.4 + aSeed * 12.0) * 0.35;
          vec4 mv = modelViewMatrix * vec4(p, 1.0);
          gl_Position = projectionMatrix * mv;
          gl_PointSize = uSize * (0.4 + aSeed) * (14.0 / -mv.z);
          vF = 0.3 + aSeed * 0.7;
        }
      `,
      fragmentShader: /* glsl */ `
        uniform float uOpacity;
        varying float vF;
        void main() {
          float d = length(gl_PointCoord - 0.5);
          float a = smoothstep(0.5, 0.0, d);
          gl_FragColor = vec4(1.0, 0.82, 0.58, a * a * uOpacity * vF);
        }
      `,
    })
    const particles = new THREE.Points(pGeo, pMat)
    scene.add(particles)

    /* ---------- etkileşim ---------- */
    let lidLift = 0
    let burst = 0
    const clock = new THREE.Clock()
    const pointer = { x: 0, y: 0 }
    const target = { x: 0, y: 0 }

    const onMove = (e: PointerEvent) => {
      const rect = host.getBoundingClientRect()
      target.x = ((e.clientX - rect.left) / rect.width - 0.5) * 2
      target.y = ((e.clientY - rect.top) / rect.height - 0.5) * 2
    }
    const onLeave = () => { target.x = 0; target.y = 0 }
    const onClick = (e: PointerEvent) => {
      e.preventDefault()
      burst = 1
      toggleRef.current()
    }

    host.addEventListener('pointermove', onMove, { passive: true })
    host.addEventListener('pointerleave', onLeave)
    host.addEventListener('pointerdown', onClick)

    let raf = 0
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

      pointer.x += (target.x - pointer.x) * 0.07
      pointer.y += (target.y - pointer.y) * 0.07

      // kapak açılma hedefi
      const want = openRef.current ? 1 : 0
      lidLift += (want - lidLift) * Math.min(1, dt * 4.6)
      burst = Math.max(0, burst - dt * 0.85)

      lid.position.y = 0.28 + lidLift * 1.5
      lid.position.x = lidLift * 0.12
      lid.position.z = -lidLift * 0.55
      lid.rotation.x = -lidLift * 0.72
      lid.rotation.z = lidLift * 0.3

      inner.intensity = lidLift * 26 + burst * 14

      group.rotation.y = pointer.x * 0.4 + t * 0.1
      group.rotation.x = -pointer.y * 0.12
      group.position.y = Math.sin(t * 1.1) * 0.07

      hearts.forEach((h, i) => {
        const mat = h.mesh.material as THREE.MeshStandardMaterial
        const rise = lidLift
        const phase = (t * (0.45 + h.seed * 0.5) + h.seed * 5) % 1
        h.mesh.position.y = -0.45 + rise * (0.7 + phase * 3.4)
        const spread = 0.35 + rise * 2.1
        h.mesh.position.x = Math.cos(h.seed * Math.PI * 2 + t * 0.5) * spread * (0.4 + h.seed)
        h.mesh.position.z = Math.sin(h.seed * Math.PI * 2 + t * 0.5) * spread * (0.4 + h.seed)
        h.mesh.rotation.y = t * h.spin + h.seed * 6
        h.mesh.rotation.z = Math.sin(t * 1.2 + i) * 0.28
        const targetOpacity = rise * (1 - phase * 0.55)
        mat.opacity += (targetOpacity - mat.opacity) * Math.min(1, dt * 6)
        const s = 0.34 + (i % 4) * 0.055 + burst * 0.12
        h.mesh.scale.setScalar(s)
      })

      pMat.uniforms.uTime.value = t
      pMat.uniforms.uOpacity.value = 0.35 + burst * 0.5

      rim.intensity = 22 + burst * 26
      warm.intensity = 16 + Math.sin(t * 1.7) * 3 + burst * 18

      camera.position.x = pointer.x * 0.75
      camera.position.y = 2.1 - pointer.y * 0.5
      camera.lookAt(0, 0.15, 0)

      renderer.render(scene, camera)
    }
    render()

    return () => {
      cancelAnimationFrame(raf)
      ro.disconnect()
      host.removeEventListener('pointermove', onMove)
      host.removeEventListener('pointerleave', onLeave)
      host.removeEventListener('pointerdown', onClick)
      document.removeEventListener('visibilitychange', onVis)
      scene.traverse((o) => {
        const m = o as THREE.Mesh
        if (m.geometry) m.geometry.dispose()
        const mat = m.material as THREE.Material | THREE.Material[] | undefined
        if (Array.isArray(mat)) mat.forEach((x) => x.dispose())
        else mat?.dispose()
      })
      heartGeo.dispose()
      pGeo.dispose()
      pMat.dispose()
      renderer.dispose()
      if (renderer.domElement.parentNode === host) host.removeChild(renderer.domElement)
    }
  }, [])

  return <div className="gift__canvas" ref={hostRef} />
}
