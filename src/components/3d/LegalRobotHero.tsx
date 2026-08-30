import { Canvas, useFrame } from '@react-three/fiber'
import { ContactShadows, Sparkles, useGLTF } from '@react-three/drei'
import { useGSAP } from '@gsap/react'
import gsap from 'gsap'
import { Suspense, useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Bone, Group, MathUtils, Mesh, MeshStandardMaterial } from 'three'
import { clone } from 'three/examples/jsm/utils/SkeletonUtils.js'

type RobotMotion = { pointerX: number; pointerY: number; gesture: number; success: number }
type RobotBones = {
  head?: Bone; neck?: Bone; chest?: Bone
  upperArmL?: Bone; forearmL?: Bone; handL?: Bone
  upperArmR?: Bone; forearmR?: Bone; handR?: Bone
  fingersL: Bone[]; thumbL: Bone[]
  fingersR: Bone[]; thumbR: Bone[]
}

const ROBOT_MODEL_URL = '/models/legal-robot-rigged.glb?v=1'
const SANAD_ENVIRONMENT_URL = '/models/sanad-environment.glb?v=1'
const FINGER_NAMES = ['Index', 'Middle', 'Ring', 'Pinky'] as const
const PLATFORM_WIDTH_SCALE = 0.78

function SanadEnvironment() {
  const gltf = useGLTF(SANAD_ENVIRONMENT_URL)
  const environment = useMemo(() => {
    const scene = gltf.scene.clone(true)
    // The page owns the continuous backdrop gradient. Hiding the exported
    // cyclorama avoids exposing the GLB as a separate dark rectangle.
    scene.getObjectByName('SANAD_Backdrop')?.traverse(object => { object.visible = false })
    // The hero is much wider on large screens than it is tall. Narrowing only
    // the stage platform keeps its rings visually round instead of stretched,
    // without affecting the mascot's proportions or its ground alignment.
    scene.traverse(object => {
      if (object.name.startsWith('SANAD_Platform')) object.scale.x *= PLATFORM_WIDTH_SCALE
    })
    return scene
  }, [gltf.scene])

  // Keep the platform top at the robot's existing ground plane while scaling
  // the environment to frame the mascot rather than overpower it.
  return <primitive object={environment} position={[0, -1.58, 0]} scale={0.52} />
}

function RobotModel({ reduced, onReady }: { reduced: boolean; onReady: () => void }) {
  const gltf = useGLTF(ROBOT_MODEL_URL)
  const model = useMemo(() => {
    const copy = clone(gltf.scene) as Group
    copy.traverse((child) => {
      if (!(child instanceof Mesh)) return
      const materials = Array.isArray(child.material) ? child.material : [child.material]
      materials.forEach((material) => {
        if (material instanceof MeshStandardMaterial) {
          material.metalnessMap = null
          material.roughnessMap = null
          material.metalness = 0.14
          material.roughness = 0.78
          material.envMapIntensity = 0.68
          material.needsUpdate = true
        }
      })
    })
    return copy
  }, [gltf.scene])

  const group = useRef<Group>(null)
  const motion = useRef<RobotMotion>({ pointerX: 0, pointerY: 0, gesture: 0, success: 0 })
  const bones = useMemo<RobotBones>(() => {
    const bone = (name: string) => (model.getObjectByName(name) || model.getObjectByName(name.replace('.', ''))) as Bone | undefined
    const fingers = (side: 'L' | 'R') => FINGER_NAMES.flatMap((digit) => [1, 2].map((segment) => bone(`${digit}.${String(segment).padStart(2, '0')}.${side}`))).filter((item): item is Bone => Boolean(item))
    const thumb = (side: 'L' | 'R') => [1, 2].map((segment) => bone(`Thumb.${String(segment).padStart(2, '0')}.${side}`)).filter((item): item is Bone => Boolean(item))
    return {
      head: bone('Head'),
      neck: bone('Neck'),
      chest: bone('Chest'),
      upperArmL: bone('UpperArm.L'),
      forearmL: bone('Forearm.L'),
      handL: bone('Hand.L'),
      upperArmR: bone('UpperArm.R'),
      forearmR: bone('Forearm.R'),
      handR: bone('Hand.R'),
      fingersL: fingers('L'),
      thumbL: thumb('L'),
      fingersR: fingers('R'),
      thumbR: thumb('R')
    }
  }, [model])
  const baseRotations = useRef(new Map<Bone, { x: number; y: number; z: number }>())

  useEffect(() => {
    const allBones = [
      bones.head, bones.neck, bones.chest,
      bones.upperArmL, bones.forearmL, bones.handL,
      bones.upperArmR, bones.forearmR, bones.handR,
      ...bones.fingersL, ...bones.thumbL, ...bones.fingersR, ...bones.thumbR
    ]
    allBones.forEach((bone) => {
      if (bone) baseRotations.current.set(bone, { x: bone.rotation.x, y: bone.rotation.y, z: bone.rotation.z })
    })
  }, [bones])

  useEffect(() => {
    const frame = requestAnimationFrame(onReady)
    return () => cancelAnimationFrame(frame)
  }, [model, onReady])

  useGSAP((_, contextSafe) => {
    if (reduced) return
    const xTo = gsap.quickTo(motion.current, 'pointerX', { duration: 0.55, ease: 'power3.out' })
    const yTo = gsap.quickTo(motion.current, 'pointerY', { duration: 0.55, ease: 'power3.out' })
    const gesture = gsap.timeline({ repeat: -1, repeatDelay: 4.5 })
      .to(motion.current, { gesture: 1, duration: 0.8, ease: 'power3.inOut', delay: 3.5 })
      .to(motion.current, { gesture: 0, duration: 0.85, ease: 'power2.inOut', delay: 1.15 })

    const onPointerMoveBase = (event: PointerEvent) => {
      xTo(MathUtils.clamp((event.clientX / window.innerWidth) * 2 - 1, -1, 1))
      yTo(MathUtils.clamp(1 - (event.clientY / window.innerHeight) * 2, -1, 1))
    }
    const onPointerDownBase = (event: PointerEvent) => {
      if (!(event.target instanceof Element) || !event.target.closest('.button')) return
      gsap.fromTo(motion.current, { success: 0 }, {
        success: 1, duration: 0.45, ease: 'back.out(2)', repeat: 1, yoyo: true, overwrite: 'auto'
      })
    }
    const onPointerMove = contextSafe ? contextSafe(onPointerMoveBase) : onPointerMoveBase
    const onPointerDown = contextSafe ? contextSafe(onPointerDownBase) : onPointerDownBase
    window.addEventListener('pointermove', onPointerMove, { passive: true })
    window.addEventListener('pointerdown', onPointerDown, { passive: true })
    return () => {
      window.removeEventListener('pointermove', onPointerMove)
      window.removeEventListener('pointerdown', onPointerDown)
      gesture.kill()
      gsap.killTweensOf(motion.current)
    }
  }, { dependencies: [reduced] })

  useFrame((state, delta) => {
    const root = group.current
    if (!root) return
    const time = state.clock.elapsedTime
    const mx = reduced ? 0 : motion.current.pointerX
    const my = reduced ? 0 : motion.current.pointerY
    const success = reduced ? 0 : motion.current.success

    root.position.y = -1.52 + (reduced ? 0 : Math.sin(time * 1.25) * 0.025 + success * 0.07)
    root.rotation.y = MathUtils.damp(root.rotation.y, mx * 0.085, 4.5, delta)
    root.rotation.x = MathUtils.damp(root.rotation.x, -my * 0.025, 4.5, delta)
    root.rotation.z = MathUtils.damp(root.rotation.z, -mx * 0.018, 4.5, delta)

    const pose = (bone: Bone | undefined, x: number, y: number, z: number) => {
      if (!bone) return
      const base = baseRotations.current.get(bone)
      if (!base) return
      bone.rotation.x = MathUtils.damp(bone.rotation.x, base.x + x, 7, delta)
      bone.rotation.y = MathUtils.damp(bone.rotation.y, base.y + y, 7, delta)
      bone.rotation.z = MathUtils.damp(bone.rotation.z, base.z + z, 7, delta)
    }
    pose(bones.head, my * 0.16 + Math.sin(time * 0.7) * 0.018, mx * 0.34, -mx * 0.055)
    pose(bones.neck, my * 0.045, mx * 0.095, -mx * 0.018)
    pose(bones.chest, -my * 0.018, mx * 0.03, -mx * 0.018)
    pose(bones.upperArmL, 0, 0, 0)
    pose(bones.forearmL, 0, 0, 0)
    pose(bones.handL, 0, 0, 0)
    pose(bones.upperArmR, 0, 0, 0)
    pose(bones.forearmR, 0, 0, 0)
    pose(bones.handR, 0, 0, 0)
    ;[...bones.fingersL, ...bones.thumbL, ...bones.fingersR, ...bones.thumbR].forEach((bone) => pose(bone, 0, 0, 0))
  })

  return <group ref={group} dispose={null}><primitive object={model} /></group>
}

export function LegalRobotHero({ reduced = false, onReady }: { reduced?: boolean; onReady?: () => void }) {
  const canvasRef = useRef<HTMLDivElement | null>(null)
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(reduced)
  const [modelReady, setModelReady] = useState(false)
  const [isVisible, setIsVisible] = useState(true)
  const handleReady = useCallback(() => {
    setModelReady(true)
    onReady?.()
  }, [onReady])

  useEffect(() => {
    const media = window.matchMedia('(prefers-reduced-motion: reduce)')
    const update = () => setPrefersReducedMotion(reduced || media.matches)
    update()
    media.addEventListener('change', update)
    return () => media.removeEventListener('change', update)
  }, [reduced])

  useEffect(() => {
    const node = canvasRef.current
    if (!node || !('IntersectionObserver' in window)) return
    const observer = new IntersectionObserver(([entry]) => setIsVisible(entry.isIntersecting), { rootMargin: '180px 0px' })
    observer.observe(node)
    return () => observer.disconnect()
  }, [])

  const shouldAnimate = isVisible && !prefersReducedMotion

  return <div ref={canvasRef} className="legal-robot-canvas" data-model-ready={modelReady ? 'true' : 'false'} aria-hidden="true">
    <Canvas
      frameloop={shouldAnimate ? 'always' : 'demand'}
      dpr={[1, 2]}
      camera={{ position: [0, 0.05, 7.05], fov: 33 }}
      gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }}
      onCreated={({ gl, scene }) => { scene.background = null; gl.setClearColor(0x000000, 0) }}
    >
      <Suspense fallback={null}>
        <SanadEnvironment />
        <ambientLight intensity={0.48} />
        <directionalLight position={[3, 5, 4]} intensity={1.28} color="#fff0d6" />
        <pointLight position={[0, -1.16, 1.85]} intensity={7.2} distance={6.5} decay={1.7} color="#efad58" />
        <pointLight position={[-3, 1.5, 3]} intensity={2.6} color="#c9965d" />
        <pointLight position={[2.5, 2.8, -2]} intensity={2.2} color="#f1c27a" />
        <RobotModel reduced={!shouldAnimate} onReady={handleReady} />
        <ContactShadows position={[0, -1.45, 0]} opacity={0.24} scale={5.8} blur={2.8} far={3.8} color="#120a05" frames={1} resolution={256} />
        {shouldAnimate && <Sparkles count={18} scale={[3.8, 3.5, 2]} size={1.2} speed={0.18} color="#dba65b" />}
      </Suspense>
    </Canvas>
  </div>
}

useGLTF.preload(ROBOT_MODEL_URL)
useGLTF.preload(SANAD_ENVIRONMENT_URL)
