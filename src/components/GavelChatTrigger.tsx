import { useEffect, useRef } from 'react'
import { ArrowLeft } from 'lucide-react'
import gsap from 'gsap'

type GavelChatTriggerProps = { onOpen: () => void; floating?: boolean }

export function GavelChatTrigger({ onOpen, floating = false }: GavelChatTriggerProps) {
  const triggerRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    const trigger = triggerRef.current
    if (!trigger || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    const context = gsap.context(() => {
      gsap.fromTo(trigger, { autoAlpha: 0, y: 18, scale: 0.96 }, { autoAlpha: 1, y: 0, scale: 1, duration: 0.7, delay: 0.2, ease: 'power3.out' })
      gsap.to(trigger, { y: -4, duration: 2.6, delay: 1, repeat: -1, yoyo: true, ease: 'sine.inOut' })
    }, trigger)
    return () => context.revert()
  }, [])

  const animateHover = (scale: number, rotation = 0) => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches || !triggerRef.current) return
    gsap.to(triggerRef.current, { scale, rotation, duration: 0.28, ease: 'power2.out', overwrite: 'auto' })
  }

  return <button ref={triggerRef} className={`gavel-chat-trigger ${floating ? 'gavel-chat-trigger-floating' : ''}`} type="button" onClick={onOpen} onMouseEnter={() => animateHover(1.025, -0.6)} onMouseLeave={() => animateHover(1, 0)} onFocus={() => animateHover(1.02)} onBlur={() => animateHover(1)} aria-label="فتح المساعد القانوني">
    <span className="gavel-chat-visual" aria-hidden="true"><img src="/robot-chatbot-v2.png" alt="" /><span className="gavel-chat-glow" /></span>
    {floating && <span className="gavel-chat-bubble-art" aria-hidden="true"><i /><i /><i /><b /><b /><b /></span>}
    {floating && <span className="gavel-chat-floating-label"><b>المساعد القانوني الذكي</b><small>اضغط لبدء المحادثة</small></span>}
    <span className="gavel-chat-copy"><b>اسأل المساعد القانوني</b><small>اضغط لبدء محادثة حول حقوقك</small></span>
    <ArrowLeft size={17} aria-hidden="true" />
  </button>
}
