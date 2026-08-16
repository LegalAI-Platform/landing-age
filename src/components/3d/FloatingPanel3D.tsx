import { Float, RoundedBox } from '@react-three/drei'
type PanelProps = { position: [number, number, number], color?: string, reduced?: boolean, variant?: 'analysis' | 'risk' | 'assistant' }
export function FloatingPanel3D({ position, color = '#c49d60', reduced = false, variant = 'analysis' }: PanelProps) {
  const isRisk = variant === 'risk'
  const isAssistant = variant === 'assistant'
  return <Float speed={reduced ? 0 : .85} floatIntensity={reduced ? 0 : .28} rotationIntensity={reduced ? 0 : .06}><group position={position} rotation={[0, -.25, 0]}>
    <RoundedBox args={[isAssistant ? 1.42 : 1.2, isRisk ? .68 : .62, .05]} radius={.05} smoothness={3}><meshStandardMaterial color="#0b2739" roughness={.3} metalness={.48} /></RoundedBox>
    <mesh position={[-.38, .21, .03]}><planeGeometry args={[.62, .028]} /><meshBasicMaterial color="#f2ead9" transparent opacity={.86} /></mesh>
    <mesh position={[-.39, .11, .03]}><planeGeometry args={[.78, .018]} /><meshBasicMaterial color="#7c9aa3" transparent opacity={.76} /></mesh>
    {isRisk ? <><mesh position={[-.22, -.12, .031]}><planeGeometry args={[.82, .055]} /><meshBasicMaterial color="#233f4c" /></mesh><mesh position={[-.38, -.12, .034]}><planeGeometry args={[.34, .055]} /><meshBasicMaterial color={color} /></mesh></> : <mesh position={[-.39, -.05, .03]}><planeGeometry args={[isAssistant ? .92 : .68, .024]} /><meshBasicMaterial color={isAssistant ? '#d2b170' : '#86a3ad'} transparent opacity={.8} /></mesh>}
    <mesh position={[.42, .11, .032]}><circleGeometry args={[.09, 20]} /><meshBasicMaterial color={color} /></mesh>
  </group></Float>
}
