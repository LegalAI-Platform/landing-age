import { Float, RoundedBox } from '@react-three/drei'
import { useFrame } from '@react-three/fiber'
import { useRef } from 'react'
import type { Group, Mesh } from 'three'

type DocumentProps = { position: [number, number, number], rotation?: [number, number, number], accent?: string, reduced?: boolean }
export function LegalDocument3D({ position, rotation = [0, 0, 0], accent = '#c29c60', reduced = false }: DocumentProps) {
  const group = useRef<Group>(null)
  const scan = useRef<Mesh>(null)
  useFrame((state) => { if (group.current && !reduced) group.current.position.y = position[1] + Math.sin(state.clock.elapsedTime * .7 + position[0]) * .055 })
  useFrame((state) => { if (scan.current && !reduced) scan.current.position.y = -.62 + ((state.clock.elapsedTime * .42) % 1) * 1.22 })
  return <Float speed={reduced ? 0 : .75} rotationIntensity={reduced ? 0 : .05} floatIntensity={reduced ? 0 : .18}>
    <group ref={group} position={position} rotation={rotation}>
      <RoundedBox args={[1.25, 1.58, .055]} radius={.065} smoothness={4}><meshStandardMaterial color="#f7f4ec" roughness={.67} metalness={.1} /></RoundedBox>
      <mesh position={[0, .5, .04]}><planeGeometry args={[.76, .03]} /><meshBasicMaterial color="#264858" /></mesh>
      {[.3, .13, -.04, -.42].map((y, i) => <mesh key={y} position={[i === 3 ? -.08 : 0, y, .04]}><planeGeometry args={[i === 3 ? .79 : .9 - i * .1, .021]} /><meshBasicMaterial color={i === 2 ? accent : '#9fabb0'} transparent opacity={i === 2 ? .85 : .65} /></mesh>)}
      <mesh position={[0, -.18, .041]}><planeGeometry args={[.93, .14]} /><meshBasicMaterial color={accent} transparent opacity={.18} /></mesh>
      <mesh position={[-.39, -.18, .043]}><planeGeometry args={[.06, .06]} /><meshBasicMaterial color={accent} /></mesh>
      <mesh ref={scan} position={[0, -.62, .048]}><planeGeometry args={[1.02, .022]} /><meshBasicMaterial color="#e4c582" transparent opacity={reduced ? 0 : .78} /></mesh>
      <mesh position={[.2, -.34, .046]}><planeGeometry args={[.38, .07]} /><meshBasicMaterial color={accent} transparent opacity={.28} /></mesh>
      <mesh position={[-.18, -.06, .046]}><planeGeometry args={[.44, .07]} /><meshBasicMaterial color={accent} transparent opacity={.2} /></mesh>
    </group>
  </Float>
}
