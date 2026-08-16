import { Canvas, useFrame } from '@react-three/fiber'
import { Environment, RoundedBox, Sparkles } from '@react-three/drei'
import { Suspense, useEffect, useRef, useState } from 'react'
import type { Group } from 'three'
import { AIOrb } from './AIOrb'
import { FloatingPanel3D } from './FloatingPanel3D'
import { LegalDocument3D } from './LegalDocument3D'
import { SecurityShield3D } from './SecurityShield3D'
import { useI18n } from '../../i18n'

function useReducedMotion() { const [reduced, setReduced] = useState(false); useEffect(() => { const query = matchMedia('(prefers-reduced-motion: reduce)'); const update = () => setReduced(query.matches); update(); query.addEventListener('change', update); return () => query.removeEventListener('change', update) }, []); return reduced }
function useCompactScene() { const [compact, setCompact] = useState(false); useEffect(() => { const query = matchMedia('(max-width: 700px)'); const update = () => setCompact(query.matches); update(); query.addEventListener('change', update); return () => query.removeEventListener('change', update) }, []); return compact }
function WorkspaceFrame({ compact = false }: { compact?: boolean }) {
  return <group position={[-.12, .08, -.72]} rotation={[.04, .03, 0]}>
    <RoundedBox args={[3.7, 3.35, .14]} radius={.12} smoothness={5}><meshStandardMaterial color="#0a2336" roughness={.34} metalness={.55} /></RoundedBox>
    <mesh position={[0, 0, .085]}><planeGeometry args={[3.18, 2.82]} /><meshStandardMaterial color="#102f40" roughness={.7} /></mesh>
    <mesh position={[-1.63, 0, .1]}><planeGeometry args={[.12, 2.75]} /><meshBasicMaterial color="#183d4d" /></mesh>
    {[1.02, .58, .14, -.3, -.74].map((y, i) => <mesh key={y} position={[-1.63, y, .115]}><circleGeometry args={[.045, 16]} /><meshBasicMaterial color={i === 1 ? '#d7b573' : '#6f929c'} /></mesh>)}
    {!compact && <><mesh position={[1.28, 1.08, .115]}><planeGeometry args={[.48, .035]} /><meshBasicMaterial color="#c8a56b" /></mesh><mesh position={[1.14, .88, .115]}><planeGeometry args={[.72, .018]} /><meshBasicMaterial color="#668a96" transparent opacity={.7} /></mesh></>}
  </group>
}
function Scene({ reduced, compact = false }: { reduced: boolean, compact?: boolean }) {
  const group = useRef<Group>(null)
  useFrame((state) => { if (group.current && !reduced) { group.current.rotation.y = state.pointer.x * .12; group.current.rotation.x = -state.pointer.y * .07; group.current.position.y = -Math.min(1, window.scrollY / 1200) * .22 } })
  return <group ref={group}>
    <WorkspaceFrame compact={compact} />
    <AIOrb reduced={reduced} scale={compact ? .58 : .68} />
    <LegalDocument3D position={[-.86, .32, .02]} rotation={[.1, .42, -.1]} accent="#d7ae6a" reduced={reduced} />
    {!compact && <><LegalDocument3D position={[1.48, -.52, -.35]} rotation={[-.1, -.48, .1]} accent="#87b2bf" reduced={reduced} /><LegalDocument3D position={[.74, 1.38, -1.2]} rotation={[.16, -.32, .06]} reduced={reduced} /><FloatingPanel3D position={[-1.9, -1.02, .3]} variant="risk" reduced={reduced} /><FloatingPanel3D position={[1.62, .72, .05]} variant="analysis" color="#75aeb5" reduced={reduced} /><FloatingPanel3D position={[1.2, -1.05, .2]} variant="assistant" reduced={reduced} /></>}
    <group position={[1.75, 1.05, -.55]}><SecurityShield3D reduced={reduced} scale={.56} /></group>
    {!reduced && <Sparkles count={compact ? 18 : 38} scale={compact ? 5 : 6.5} size={1.2} speed={.25} color="#d6b672" />}
  </group>
}

export function LegalAIHeroScene() {
  const { lang } = useI18n()
  const reduced = useReducedMotion()
  const compact = useCompactScene()
  return <div className="legal-3d-stage" aria-label={lang.hero.workspaceAria} role="img">
    <div className="scene-label label-analysis"><span>{lang.hero.analysis}</span><b>{lang.hero.analyzing}…</b></div><div className="scene-label label-risk"><span>{lang.hero.risk}</span><b>{lang.hero.riskMedium}</b></div><div className="scene-label label-ai"><span>{lang.hero.ai}</span><b>{lang.hero.important}</b></div>
    <Canvas dpr={[1, compact ? 1.15 : 1.5]} camera={{ position: [0, 0, compact ? 7.2 : 6.7], fov: 39 }} gl={{ antialias: false, powerPreference: 'high-performance', alpha: true }}>
      <Suspense fallback={null}><ambientLight intensity={1.6} /><directionalLight position={[3, 4, 4]} intensity={2.2} color="#fff3d7" /><pointLight position={[-3, -1, 3]} intensity={8} color="#4d8195" /><Scene reduced={reduced} compact={compact} /><Environment preset="city" /></Suspense>
    </Canvas>
  </div>
}

export function LegalProductScene() {
  const { lang } = useI18n()
  const reduced = useReducedMotion()
  return <div className="product-3d-stage" aria-label={lang.product.aria} role="img"><Canvas dpr={[1, 1.35]} camera={{ position: [0, 0, 6.2], fov: 40 }} gl={{ antialias: false, powerPreference: 'high-performance', alpha: true }}><Suspense fallback={null}><ambientLight intensity={1.6} /><directionalLight position={[2, 3, 4]} intensity={2} /><pointLight position={[-3, 1, 3]} intensity={7} color="#cda967" /><group rotation={[.08, -.12, 0]}><LegalDocument3D position={[0, 0, 0]} rotation={[.03, -.25, 0]} accent="#c29b57" reduced={reduced} /><FloatingPanel3D position={[-1.35, -.8, .25]} reduced={reduced} /><FloatingPanel3D position={[1.32, .7, .1]} color="#80afb7" reduced={reduced} /></group><Environment preset="city" /></Suspense></Canvas></div>
}

export function SecurityScene() { const { lang } = useI18n(); const reduced = useReducedMotion(); return <div className="security-3d" aria-label={lang.security.alt} role="img"><Canvas dpr={[1, 1.25]} camera={{ position: [0, 0, 4.2], fov: 40 }} gl={{ antialias: false, powerPreference: 'high-performance', alpha: true }}><Suspense fallback={null}><ambientLight intensity={1.2}/><pointLight position={[2,2,3]} intensity={8} color="#d9ba78"/><SecurityShield3D reduced={reduced} scale={1.25}/>{!reduced && <Sparkles count={18} scale={3.3} size={1.5} speed={.2} color="#d8bd83"/>}</Suspense></Canvas></div> }
