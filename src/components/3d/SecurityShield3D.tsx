import { Float } from '@react-three/drei'
import { useFrame } from '@react-three/fiber'
import { useMemo, useRef } from 'react'
import { ExtrudeGeometry, Shape, type Group } from 'three'

export function SecurityShield3D({ reduced = false, scale = 1 }: { reduced?: boolean, scale?: number }) {
  const ref = useRef<Group>(null)
  const geometry = useMemo(() => { const s = new Shape(); s.moveTo(0, .8); s.lineTo(.62, .55); s.lineTo(.5, -.36); s.lineTo(0, -.77); s.lineTo(-.5, -.36); s.lineTo(-.62, .55); s.closePath(); return new ExtrudeGeometry(s, { depth: .12, bevelEnabled: true, bevelThickness: .035, bevelSize: .035, bevelSegments: 2 }) }, [])
  useFrame((_, d) => { if (ref.current && !reduced) ref.current.rotation.y += d * .18 })
  return <Float speed={reduced ? 0 : .9} floatIntensity={reduced ? 0 : .25}><group ref={ref} scale={scale} rotation={[0, -.35, 0]}><mesh geometry={geometry}><meshPhysicalMaterial color="#8cb1bd" metalness={.72} roughness={.18} transparent opacity={.78} /></mesh><mesh position={[0, .04, .145]} scale={[.38, .42, 1]}><ringGeometry args={[.22, .27, 4]} /><meshBasicMaterial color="#d7b875" /></mesh></group></Float>
}
