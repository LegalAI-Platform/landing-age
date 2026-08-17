import { useEffect, useState } from 'react'
import gsap from 'gsap'

function removeCheckerboard(source: HTMLImageElement) {
  const width = Math.min(900, source.naturalWidth)
  const height = Math.round(source.naturalHeight * (width / source.naturalWidth))
  const canvas = document.createElement('canvas')
  canvas.width = width
  canvas.height = height
  const context = canvas.getContext('2d', { willReadFrequently: true })
  if (!context) return ''
  context.drawImage(source, 0, 0, width, height)
  const pixels = context.getImageData(0, 0, width, height)
  const { data } = pixels
  const total = width * height
  const visited = new Uint8Array(total)
  const queue = new Int32Array(total)
  let head = 0
  let tail = 0
  const isCheckerPixel = (index: number) => {
    const offset = index * 4
    const r = data[offset]
    const g = data[offset + 1]
    const b = data[offset + 2]
    return Math.max(r, g, b) - Math.min(r, g, b) < 7 && r > 205
  }
  const enqueue = (index: number) => {
    if (index < 0 || index >= total || visited[index] || !isCheckerPixel(index)) return
    visited[index] = 1
    queue[tail++] = index
  }
  for (let x = 0; x < width; x += 1) { enqueue(x); enqueue((height - 1) * width + x) }
  for (let y = 1; y < height - 1; y += 1) { enqueue(y * width); enqueue(y * width + width - 1) }
  while (head < tail) {
    const index = queue[head++]
    const x = index % width
    if (x > 0) enqueue(index - 1)
    if (x < width - 1) enqueue(index + 1)
    if (index >= width) enqueue(index - width)
    if (index < total - width) enqueue(index + width)
  }
  for (let index = 0; index < total; index += 1) if (visited[index]) data[index * 4 + 3] = 0
  context.putImageData(pixels, 0, 0)
  return canvas.toDataURL('image/png')
}

export function AIAssistantImage({ open }: { open: boolean }) {
  const [imageSrc, setImageSrc] = useState('')
  useEffect(() => {
    let cancelled = false
    const source = new Image()
    source.src = '/ai-robot.jpg'
    source.onload = () => { const result = removeCheckerboard(source); if (!cancelled) setImageSrc(result) }
    return () => { cancelled = true }
  }, [])
  useEffect(() => {
    if (!open || !imageSrc || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    const image = document.querySelector<HTMLImageElement>('.ai-chat-robot img')
    if (!image) return
    const context = gsap.context(() => {
      gsap.fromTo(image, { autoAlpha: 0, y: 18, scale: 0.92 }, { autoAlpha: 1, y: 0, scale: 1, duration: 0.65, ease: 'power3.out' })
      gsap.to(image, { y: -5, rotation: -0.8, duration: 2.8, ease: 'sine.inOut', repeat: -1, yoyo: true })
    }, image)
    return () => context.revert()
  }, [open, imageSrc])
  return <div className="ai-chat-robot" aria-hidden="true"><img src={imageSrc || '/ai-robot.jpg'} alt="" /></div>
}
