import { Float, MeshTransmissionMaterial } from '@react-three/drei'
import { useFrame } from '@react-three/fiber'
import { useRef } from 'react'
import type { Group } from 'three'

export function AIOrb({ reduced = false, scale = 1 }: { reduced?: boolean, scale?: number }) {
  const core = useRef<Group>(null)
  useFrame((state, delta) => {
    if (!core.current || reduced) return
    core.current.rotation.y += delta * 0.16
    core.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.35) * 0.08
  })
  return <Float speed={reduced ? 0 : 1.1} rotationIntensity={reduced ? 0 : 0.16} floatIntensity={reduced ? 0 : 0.22}>
    <group ref={core} scale={scale}>
      <mesh scale={1.12}><icosahedronGeometry args={[1, 2]} /><MeshTransmissionMaterial color="#b9d1d8" thickness={.35} roughness={.16} transmission={.75} transparent opacity={.82} /></mesh>
      <mesh scale={.63}><icosahedronGeometry args={[1, 1]} /><meshStandardMaterial color="#c7a66c" emissive="#a17638" emissiveIntensity={.7} metalness={.85} roughness={.19} /></mesh>
      <mesh rotation={[Math.PI / 2.7, 0, .5]}><torusGeometry args={[1.42, .016, 8, 72]} /><meshBasicMaterial color="#c9ab76" transparent opacity={.75} /></mesh>
      <mesh rotation={[-.55, .5, -.28]}><torusGeometry args={[1.7, .009, 8, 72]} /><meshBasicMaterial color="#7fa6b5" transparent opacity={.62} /></mesh>
      <pointLight color="#d7bd8a" intensity={10} distance={4} />
    </group>
  </Float>
}
