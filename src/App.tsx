import { lazy, Suspense, useEffect, useRef, useState } from 'react'
import {
  ArrowLeft, ArrowUpLeft, Bot, Check, ChevronDown, Copy, FileSearch, FileText,
  Eye, EyeOff, KeyRound, LockKeyhole, Mail, Menu, Moon, Plus, RotateCcw, Search, Send, ShieldCheck, Sparkles, Square, Sun, Upload, UserRound, X, Zap
} from 'lucide-react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useGSAP } from '@gsap/react'
import { useI18n } from './i18n'
import { useTheme } from './theme'
import { GavelChatTrigger } from './components/GavelChatTrigger'
import { LegalRobotHero } from './components/3d/LegalRobotHero'
gsap.registerPlugin(useGSAP, ScrollTrigger)
const AUTH_APP_URL = (import.meta.env.VITE_AUTH_APP_URL || 'http://localhost:5174').replace(/\/$/, '')

function openAuthFlow(path = '/login') {
  const url = new URL(path, `${AUTH_APP_URL}/`)
  url.searchParams.set('theme', document.documentElement.dataset.theme === 'dark' ? 'dark' : 'light')
  window.location.assign(url.toString())
}

const GUEST_AI_API_BASE = (import.meta.env.VITE_API_BASE_URL || 'http://localhost:5290/api/v1').replace(/\/$/, '')
const GUEST_AI_REQUEST_LIMIT = 5
type GuestMessage = { id: string; role: 'user' | 'assistant'; content: string; time: string; sources?: string[] }
type GuestConversation = { id: string; title: string; updatedAt: string; messages: GuestMessage[] }
class GuestAIError extends Error { constructor(public status: number, message: string) { super(message) } }
const guestId = () => typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function' ? crypto.randomUUID() : `${Date.now()}-${Math.random().toString(36).slice(2)}`
const guestTime = () => new Intl.DateTimeFormat('ar-EG', { timeStyle: 'short' }).format(new Date())

const LegalAIHeroScene = lazy(() => import('./components/3d/LegalAIHeroScene').then(module => ({ default: module.LegalAIHeroScene })))
const LegalProductScene = lazy(() => import('./components/3d/LegalAIHeroScene').then(module => ({ default: module.LegalProductScene })))
const SecurityScene = lazy(() => import('./components/3d/LegalAIHeroScene').then(module => ({ default: module.SecurityScene })))
const AIAssistantImage = lazy(() => import('./components/AIAssistantImage').then(module => ({ default: module.AIAssistantImage })))
function SceneLoader({ children }: { children: React.ReactNode }) { return <Suspense fallback={<div className="scene-skeleton" aria-hidden="true" />}>{children}</Suspense> }

function Logo() { const { lang, locale } = useI18n(); return <a className="logo" href="#الرئيسية" aria-label={lang.brand.homeAria}><span className="logo-image-wrap"><img src="/sanad-logo.jpg" alt={lang.brand.logoAlt} /></span><span className="brand-name" lang={locale}>{lang.brand.name}</span></a> }

function Button({ children, secondary = false, href = '#ابدأ' }: { children: React.ReactNode, secondary?: boolean, href?: string }) {
  return <a href={href} className={`button ${secondary ? 'button-secondary' : ''}`}>{children}{!secondary && <ArrowLeft size={17} aria-hidden="true" />}</a>
}

function Nav() {
  const { lang, locale, setLocale } = useI18n()
  const { theme, setTheme } = useTheme()
  const [open, setOpen] = useState(false)
  const links = [['#الرئيسية', lang.nav.home], ['#المميزات', lang.nav.features], ['#كيف يعمل', lang.nav.how], ['#حلول المحامين', lang.nav.lawyers], ['#الأمان', lang.nav.security], ['#الأسئلة الشائعة', lang.nav.faq]]
  const switchLanguage = () => setLocale(locale === 'ar' ? 'en' : 'ar')
  const switchTheme = () => setTheme(theme === 'light' ? 'dark' : 'light')
  return <header className="nav-wrap"><nav className="nav" aria-label={lang.nav.aria}><Logo />
    <div className={`nav-links ${open ? 'open' : ''}`}>{links.map(([href,label]) => <a key={label} onClick={() => setOpen(false)} href={href}>{label}</a>)}</div>
    <div className="nav-actions"><button className="login" type="button" onClick={() => openAuthFlow()}>{lang.nav.login}</button><button className="language" type="button" onClick={switchLanguage} aria-label={locale === 'ar' ? 'Switch to English' : 'التبديل إلى العربية'}>{lang.nav.language}</button><button className="theme-toggle" type="button" onClick={switchTheme} aria-pressed={theme === 'dark'} aria-label={theme === 'dark' ? lang.theme.switchToLight : lang.theme.switchToDark} title={theme === 'dark' ? lang.theme.switchToLight : lang.theme.switchToDark}><Sun size={15} aria-hidden="true"/><Moon size={15} aria-hidden="true"/><span>{theme === 'dark' ? lang.theme.dark : lang.theme.light}</span></button><Button href="#الاشتراك">{lang.nav.start}</Button></div>
    <button className="menu" onClick={() => setOpen(!open)} aria-expanded={open} aria-label={open ? lang.nav.menuClose : lang.nav.menuOpen}>{open ? <X /> : <Menu />}</button>
  </nav></header>
}

function ProductVisual() { const { lang } = useI18n(); return <div className="product-wrap" aria-label={lang.productVisual.aria}>
  <div className="product-glow" /><div className="product">
    <aside className="app-side"><div className="app-logo"><span className="logo-mark"><span /></span></div><div className="side-icon active"><FileText size={16}/></div><div className="side-icon"><Search size={16}/></div><div className="side-icon"><Bot size={16}/></div><div className="side-bottom"><div className="avatar">ن</div></div></aside>
    <section className="document"><div className="app-header"><div><span className="crumb">{lang.productVisual.crumb}</span><strong>{lang.productVisual.title}</strong></div><button aria-label={lang.productVisual.share}><ArrowUpLeft size={16}/></button></div>
      <div className="doc-body"><div className="doc-label">{lang.productVisual.draft}</div><h3>{lang.productVisual.documentTitle}</h3><p>{lang.productVisual.body1} <i /> {lang.productVisual.body2}</p><h4>{lang.productVisual.clause}</h4><p className="highlight">{lang.productVisual.highlight}</p><p>{lang.productVisual.body3}</p><div className="doc-lines"><span/><span/><span/></div></div>
    </section>
    <aside className="insights"><div className="insight-head"><span>{lang.productVisual.insights}</span><Sparkles size={16}/></div><div className="score"><span>{lang.productVisual.risk}</span><strong>{lang.hero.riskMedium}</strong><div><i /></div></div><div className="insight-card"><span className="eyebrow">{lang.productVisual.selected}</span><b>{lang.productVisual.liability}</b><p>{lang.productVisual.insight}</p><a href="#المميزات">{lang.productVisual.suggestion} <ArrowLeft size={13}/></a></div><div className="processing"><span className="pulse"/> {lang.productVisual.complete} <Check size={14}/></div></aside>
  </div></div> }

function ReferenceHeroVisual() {
  const { lang } = useI18n()
  return <div className="reference-visual" role="img" aria-label={lang.reference.aria}>
    <div className="reference-glow" />
    <LegalRobotHero />
    <span className="reference-scan" aria-hidden="true" />
    <span className="reference-pulse pulse-one" aria-hidden="true" />
    <span className="reference-pulse pulse-two" aria-hidden="true" />
    <div className="reference-status"><span className="status-dot" /> {lang.reference.status}</div>
  </div>
}

function Hero() {
  const { lang } = useI18n()
  const heroRef = useRef<HTMLElement | null>(null)
  const glowRef = useRef<HTMLDivElement | null>(null)

  useGSAP(() => {
    const hero = heroRef.current
    const glow = glowRef.current
    if (!hero || !glow) return

    const media = gsap.matchMedia()
    media.add({
      canHover: '(hover: hover) and (pointer: fine)',
      reduceMotion: '(prefers-reduced-motion: reduce)'
    }, context => {
      const canHover = Boolean(context.conditions?.canHover)
      const reduceMotion = Boolean(context.conditions?.reduceMotion)
      const initial = hero.getBoundingClientRect()

      gsap.set(glow, {
        x: initial.width * .68,
        y: initial.height * .38,
        xPercent: -50,
        yPercent: -50,
        opacity: canHover && !reduceMotion ? .58 : .34
      })

      if (!canHover || reduceMotion) return

      const moveX = gsap.quickTo(glow, 'x', { duration: .72, ease: 'power3.out' })
      const moveY = gsap.quickTo(glow, 'y', { duration: .72, ease: 'power3.out' })
      const fade = gsap.quickTo(glow, 'opacity', { duration: .32, ease: 'power2.out' })
      const onPointerMove = (event: PointerEvent) => {
        const bounds = hero.getBoundingClientRect()
        moveX(event.clientX - bounds.left)
        moveY(event.clientY - bounds.top)
      }
      const onPointerMoveWithFade = (event: PointerEvent) => {
        onPointerMove(event)
        fade(.8)
      }
      const onPointerOut = (event: PointerEvent) => {
        if (!event.relatedTarget) fade(.46)
      }

      window.addEventListener('pointermove', onPointerMoveWithFade, { passive: true })
      window.addEventListener('pointerout', onPointerOut, { passive: true })

      return () => {
        window.removeEventListener('pointermove', onPointerMoveWithFade)
        window.removeEventListener('pointerout', onPointerOut)
        gsap.killTweensOf(glow)
      }
    }, hero)

    return () => media.revert()
  }, { scope: heroRef })

  return <section ref={heroRef} id="الرئيسية" className="hero hero-3d">
    <div ref={glowRef} className="hero-mouse-glow" aria-hidden="true" />
    <div className="hero-copy"><div className="eyebrow top"><span/> {lang.hero.eyebrow}</div><h1>{lang.hero.title}<br/><em>{lang.hero.titleAccent}</em></h1><p>{lang.hero.description}</p><div className="hero-actions"><Button href="#الاشتراك">{lang.nav.start}</Button><Button secondary>{lang.reference.cta}</Button></div><div className="designed"><ShieldCheck size={17}/> {lang.hero.designed}</div></div>
    <ReferenceHeroVisual />
  </section>
}

function Trust() {
  const { lang } = useI18n()
  const trustRef = useRef<HTMLElement | null>(null)
  const entries = [
    { text: lang.trust.intro, Icon: Sparkles },
    ...lang.trust.items.map((text, index) => ({ text, Icon: [LockKeyhole, ShieldCheck, Check, Zap][index] }))
  ]

  useGSAP(() => {
    const section = trustRef.current
    const track = section?.querySelector<HTMLElement>('.trust-track')
    const firstGroup = section?.querySelector<HTMLElement>('.trust-group')
    if (!section || !track || !firstGroup) return

    const media = gsap.matchMedia()
    media.add('(prefers-reduced-motion: no-preference)', () => {
      const tween = gsap.fromTo(track, { x: 0 }, {
        x: () => -firstGroup.offsetWidth,
        duration: () => Math.max(24, firstGroup.offsetWidth / 62),
        ease: 'none',
        repeat: -1,
        repeatRefresh: true
      })
      const pause = () => tween.pause()
      const resume = () => tween.resume()
      section.addEventListener('pointerenter', pause)
      section.addEventListener('pointerleave', resume)
      section.addEventListener('focusin', pause)
      section.addEventListener('focusout', resume)

      return () => {
        section.removeEventListener('pointerenter', pause)
        section.removeEventListener('pointerleave', resume)
        section.removeEventListener('focusin', pause)
        section.removeEventListener('focusout', resume)
        tween.kill()
      }
    })
    return () => media.revert()
  }, { scope: trustRef, dependencies: [lang.trust.intro, ...lang.trust.items] })

  return <section ref={trustRef} className="trust trust-marquee-section" aria-label={lang.trust.intro}>
    <div className="trust-marquee">
      <div className="trust-track">
        {[0, 1].map(copy => <div className="trust-group" aria-hidden={copy === 1} key={copy}>
          {[0, 1, 2].flatMap(round => entries.map(({ text, Icon }, index) => <span className="trust-chip" key={`${copy}-${round}-${index}`}>
            <Icon size={16} aria-hidden="true"/><b>{text}</b>
          </span>))}
        </div>)}
      </div>
    </div>
  </section>
}

function RevealSection({ children, className, id }: { children: React.ReactNode, className: string, id?: string }) {
  const ref = useRef<HTMLElement | null>(null)
  const [visible, setVisible] = useState(false)
  useEffect(() => {
    const node = ref.current
    if (!node) return
    const observer = new IntersectionObserver(([entry]) => { if (entry.isIntersecting) { setVisible(true); observer.disconnect() } }, { threshold: .18 })
    observer.observe(node)
    return () => observer.disconnect()
  }, [])
  return <section id={id} ref={ref} className={`${className} reveal-section ${visible ? 'is-visible' : ''}`}>{children}</section>
}

function ReferenceScrollVisuals() {
  const { lang } = useI18n()
  return <>
    <RevealSection className="reference-services" id="المميزات"><div className="reference-services-inner"><div className="reference-services-copy"><span className="eyebrow">{lang.reference.laptopEyebrow}</span><h2>{lang.reference.laptopTitle}<br/>{lang.reference.laptopTitle2}</h2><p>{lang.reference.laptopText}</p><a className="button reference-services-cta" href="#ابدأ">{lang.reference.cta}<ArrowLeft size={17} aria-hidden="true" /></a></div><div className="reference-services-art"><img src="/smart-legal-laptop-cutout-new.png" alt={lang.reference.alt} /></div></div></RevealSection>
  </>
}

function Workflow() {
  const { lang } = useI18n(); const icons = [Upload, FileSearch, ShieldCheck, Bot]
  return <section className="workflow" id="حلول المحامين"><div className="workflow-intro"><span className="eyebrow">{lang.workflow.eyebrow}</span><h2>{lang.workflow.title}<br/><em>{lang.workflow.titleAccent}</em></h2><p>{lang.workflow.text}</p><div className="workflow-orbit"><div className="workflow-document-3d"><img src="/agreement-contract-3d.jpg" alt={lang.workflow.paper}/></div><span className="workflow-document-label">{lang.workflow.paper}</span><div className="workflow-ring"/><div className="workflow-dot"/></div></div><div className="workflow-steps">{lang.workflow.stages.map(([title,text], index) => { const Icon = icons[index]; const number = `0${index + 1}`; return <article key={number} className="workflow-step"><div className="workflow-step-top"><span>{number}</span><Icon size={20}/></div><h3>{title}</h3><p>{text}</p><i/></article>})}</div></section>
}

function Problems() { const { lang } = useI18n(); return <section className="section problem" id="كيف يعمل"><div className="section-intro"><span className="eyebrow">{lang.problems.eyebrow}</span><h2>{lang.problems.title}<br/>{lang.problems.title2}</h2><p>{lang.problems.text}</p></div><div className="problem-grid">{lang.problems.items.map((item,i) => <div className="problem-card" key={item}><span>0{i+1}</span><p>{item}</p><div className="line"/></div>)}</div></section> }

function Features() {
  const { lang } = useI18n()
  const icons = [FileSearch, Bot, FileText, ShieldCheck, Search, LockKeyhole]
  const sectionRef = useRef<HTMLElement | null>(null)

  useGSAP(() => {
    const section = sectionRef.current
    if (!section) return
    const cards = gsap.utils.toArray<HTMLElement>('.feature', section)
    const media = gsap.matchMedia()

    media.add({
      interactive: '(min-width: 701px) and (hover: hover) and (pointer: fine)',
      reduceMotion: '(prefers-reduced-motion: reduce)'
    }, context => {
      const reduceMotion = Boolean(context.conditions?.reduceMotion)
      const interactive = Boolean(context.conditions?.interactive)

      if (!reduceMotion) {
        gsap.from(cards, {
          autoAlpha: 0,
          y: 42,
          rotationY: -5,
          duration: .72,
          stagger: { each: .07, from: 'start' },
          ease: 'power3.out',
          scrollTrigger: { trigger: section, start: 'top 78%', once: true }
        })
      }

      if (!interactive || reduceMotion) return

      const controls = cards.map(card => ({
        x: gsap.quickTo(card, 'x', { duration: .5, ease: 'power3.out' }),
        y: gsap.quickTo(card, 'y', { duration: .5, ease: 'power3.out' }),
        scale: gsap.quickTo(card, '--card-scale', { duration: .5, ease: 'power3.out' }),
        rotationY: gsap.quickTo(card, 'rotationY', { duration: .5, ease: 'power3.out' })
      }))

      const resetDeck = () => cards.forEach((card, index) => {
        controls[index].x(0)
        controls[index].y(0)
        controls[index].scale(1)
        controls[index].rotationY(0)
        card.style.zIndex = String(index + 1)
      })
      const activateCard = (activeIndex: number) => cards.forEach((card, index) => {
        const distance = index - activeIndex
        const direction = Math.sign(distance)
        controls[index].x(distance === 0 ? 0 : direction * -20)
        controls[index].y(distance === 0 ? -28 : Math.min(10, Math.abs(distance) * 3))
        controls[index].scale(distance === 0 ? 1.065 : Math.max(.94, .982 - Math.abs(distance) * .012))
        controls[index].rotationY(distance === 0 ? 0 : direction * -3.5)
        card.style.zIndex = distance === 0 ? '30' : String(20 - Math.abs(distance))
      })

      const listeners = cards.map((card, index) => {
        const activate = () => activateCard(index)
        card.addEventListener('pointerenter', activate, { passive: true })
        card.addEventListener('focusin', activate)
        return { card, activate }
      })
      const onFocusOut = (event: FocusEvent) => {
        if (!section.contains(event.relatedTarget as Node | null)) resetDeck()
      }
      section.addEventListener('pointerleave', resetDeck, { passive: true })
      section.addEventListener('focusout', onFocusOut)
      resetDeck()

      return () => {
        listeners.forEach(({ card, activate }) => {
          card.removeEventListener('pointerenter', activate)
          card.removeEventListener('focusin', activate)
        })
        section.removeEventListener('pointerleave', resetDeck)
        section.removeEventListener('focusout', onFocusOut)
        gsap.killTweensOf(cards)
      }
    }, section)

    return () => media.revert()
  }, { scope: sectionRef })

  return <section ref={sectionRef} className="section features" id="المميزات"><div className="section-intro centered"><span className="eyebrow">{lang.features.eyebrow}</span><h2>{lang.features.title}<br/>{lang.features.title2}</h2></div><div className="feature-grid">{lang.features.items.map(([title,text], index) => { const Icon = icons[index]; return <article className="feature" key={title}><div className="feature-surface"><div className="feature-icon"><Icon size={22}/></div><h3>{title}</h3><p>{text}</p><a href="#ابدأ">{lang.features.explore} <ArrowLeft size={15}/></a></div></article>})}</div></section>
}

function ProductShowcase() { const { lang, locale } = useI18n(); return <section className="section product-showcase"><div className="product-showcopy"><span className="eyebrow">{lang.product.eyebrow}</span><h2>{lang.product.title}<br/>{lang.product.title2}</h2><p>{lang.product.text}</p><div className="showcase-stats"><span><b>{locale === 'ar' ? '٤' : '4'}</b> {lang.product.stats[0]}</span><span><b>{locale === 'ar' ? 'متوسط' : 'Medium'}</b> {lang.product.stats[1]}</span></div><Button secondary>{lang.reference.laptopCta}</Button></div><div className="product-3d-shell"><video className="product-demo-video" autoPlay muted loop playsInline preload="metadata" aria-label={lang.product.aria}><source src="/create-video-demo.mp4" type="video/mp4" /></video><div className="product-status"><span className="status-dot"/> {lang.product.status}</div><div className="product-clause">{lang.product.clause} <b>{lang.product.needsReview}</b></div></div></section> }

function AnalysisShowcase() { const { lang } = useI18n(); return <section className="section showcase"><div className="showcase-copy"><span className="eyebrow">{lang.analysis.eyebrow}</span><h2>{lang.analysis.title}</h2><p>{lang.analysis.text}</p><ul>{lang.analysis.bullets.map(item => <li key={item}><Check/> {item}</li>)}</ul><Button secondary>{lang.analysis.cta}</Button></div><div className="analysis-card"><div className="analysis-title"><FileText size={18}/><b>{lang.analysis.review}</b><span>{lang.analysis.analyzed}</span></div><div className="clause"><span>{lang.analysis.clauseNo}</span><p>{lang.analysis.clause}</p></div><div className="risk"><div><i/><span><b>{lang.analysis.risk}</b><small>{lang.analysis.ceiling}</small></span></div><button>{lang.analysis.recommendation} <ArrowLeft size={14}/></button></div><div className="analysis-note"><Sparkles size={16}/><p><b>{lang.analysis.noteTitle}</b>{lang.analysis.note}</p></div></div></section> }

function AssistantShowcase() { const { lang } = useI18n(); const [demoOpen, setDemoOpen] = useState(false); useEffect(() => { if (!demoOpen) return; const closeOnEscape = (event: KeyboardEvent) => { if (event.key === 'Escape') setDemoOpen(false) }; document.body.style.overflow = 'hidden'; window.addEventListener('keydown', closeOnEscape); return () => { document.body.style.overflow = ''; window.removeEventListener('keydown', closeOnEscape) } }, [demoOpen]); return <section className={`section assistant-show ${demoOpen ? 'demo-open' : ''}`}><div className="chat-card"><div className="chat-header"><span className="online"/> {lang.assistant.header} <button aria-label={lang.assistant.more}>•••</button></div><div className="messages"><div className="user-message">{lang.assistant.question}</div><div className="ai-message"><div className="ai-avatar"><Bot size={16}/></div><p>{lang.assistant.answer}</p><div className="source"><FileText size={14}/> {lang.assistant.source}</div></div><div className="demo-insights"><div className="demo-insights-head"><span>{lang.assistant.summary}</span><b>{lang.assistant.updated}</b></div>{lang.assistant.rows.map(([name,status], index) => <div className="demo-insight-row" key={name}><span><i className={`risk-dot ${index === 0 ? 'high' : index === 1 ? 'medium' : 'low'}`}/> {name}</span><strong>{status}</strong></div>)}</div></div><div className="suggestions">{lang.assistant.suggestions.map(item => <button key={item}>{item}</button>)}</div><div className="chat-input">{lang.assistant.input} <ArrowLeft size={16}/></div></div><div className="assistant-copy"><span className="eyebrow">{lang.assistant.eyebrow}</span><h2>{lang.assistant.title}<br/>{lang.assistant.title2}</h2><p>{lang.assistant.text}</p><div className="callout"><Bot size={19}/><span>{lang.assistant.callout}</span></div><button className="button assistant-demo-trigger" type="button" onClick={() => setDemoOpen(true)}>{lang.assistant.demo} <ArrowLeft size={17} aria-hidden="true"/></button></div>{demoOpen && <div className="demo-modal-backdrop" role="presentation" onClick={() => setDemoOpen(false)}><div className="demo-modal" role="dialog" aria-modal="true" aria-labelledby="demo-modal-title" onClick={event => event.stopPropagation()}><div className="demo-modal-header"><div><span className="eyebrow">{lang.assistant.demoEyebrow}</span><h3 id="demo-modal-title">{lang.assistant.demoTitle}</h3></div><button className="demo-modal-close" type="button" aria-label={lang.assistant.demoClose} onClick={() => setDemoOpen(false)}><X size={19}/></button></div><video className="demo-modal-video" src="/legal-ai-demo.mp4" autoPlay muted controls playsInline /></div></div>}</section> }

function Security() { const { lang } = useI18n(); return <section className="security" id="الأمان"><div><span className="eyebrow light">{lang.security.eyebrow}</span><h2>{lang.security.title}<br/>{lang.security.title2}</h2><p>{lang.security.text}</p><a className="light-link" href="#ابدأ">{lang.security.cta} <ArrowLeft size={16}/></a></div><div className="security-3d security-gemini" aria-label={lang.security.alt} role="img"><img src="/gemini-security.svg" alt={lang.security.alt} /></div><div className="security-grid">{lang.security.items.map(([title,text]) => <article key={title}><LockKeyhole size={19}/><b>{title}</b><p>{text}</p></article>)}</div></section> }

function Steps() { const { lang } = useI18n(); return <section className="section steps"><div className="section-intro centered"><span className="eyebrow">{lang.steps.eyebrow}</span><h2>{lang.steps.title}<br/>{lang.steps.title2}</h2></div><div className="steps-grid">{lang.steps.items.map((text,i) => <div className="step" key={text}><strong>0{i+1}</strong><span>{text}</span>{i<3 && <i/>}</div>)}</div></section> }

function FAQ() { const { lang } = useI18n(); const [active,setActive] = useState<number | null>(0); return <section className="section faq" id="الأسئلة الشائعة"><div className="faq-title"><span className="eyebrow">{lang.faq.eyebrow}</span><h2>{lang.faq.title}<br/>{lang.faq.title2}</h2><p>{lang.faq.text}</p><a href="#ابدأ">{lang.faq.contact} <ArrowLeft size={15}/></a></div><div className="faq-list">{lang.faq.items.map(([question,answer],i) => <article className={active===i?'expanded':''} key={question}><button onClick={() => setActive(active===i?null:i)} aria-expanded={active===i}>{question}<ChevronDown size={19}/></button>{active===i && <p>{answer}</p>}</article>)}</div></section> }

function SubscriptionPlans({ open, onClose, onStartTrial }: { open: boolean, onClose: () => void, onStartTrial: () => void }) { const { lang, locale } = useI18n(); if (!open) return null; const planTitles = locale === 'ar' ? ['التجربة المجانية', 'الخطة الشخصية', 'الخطة المهنية', 'خطة الفريق'] : ['Free trial', 'Personal plan', 'Professional plan', 'Team plan']; return <div className="subscription-modal-backdrop" role="presentation" onClick={onClose}><section className="subscription-plans subscription-modal" id="الاشتراك" role="dialog" aria-modal="true" aria-labelledby="subscription-title" onClick={event => event.stopPropagation()}><button className="subscription-modal-close" type="button" aria-label={lang.plans.close} onClick={onClose}><X size={19}/></button><div className="section-intro centered"><span className="eyebrow">{lang.plans.eyebrow}</span><h2 id="subscription-title">{lang.plans.title}<br/>{lang.plans.title2}</h2><p>{lang.plans.text}</p></div><div className="plan-grid">{lang.plans.plans.map(([name,description,price,items], index) => <article className={`plan-card ${index===2?'featured':''} ${index===0?'trial':''}`} key={name}>{index===2 && <span className="plan-badge">{lang.plans.badge}</span>}{index===0 && <span className="plan-badge trial-badge">{lang.plans.trialBadge}</span>}<span className="plan-audience">{name}</span><h3>{planTitles[index]}</h3><p>{description}</p><div className="plan-price"><b>{price}</b><span>{index===0 ? lang.plans.trialPrice : lang.plans.monthly}</span></div>{index===0 && <div className="trial-limit"><b>{lang.plans.trialLimit}</b><small>{lang.plans.trialNotice}</small></div>}<ul>{items.map(item => <li key={item}><Check size={16}/>{item}</li>)}</ul>{index===0 ? <button className="button" type="button" onClick={onStartTrial}>{lang.plans.trialCta} <ArrowLeft size={17} aria-hidden="true"/></button> : <a className="button" href="#ابدأ">{lang.plans.subscribe} <ArrowLeft size={17} aria-hidden="true"/></a>}</article>)}</div></section></div> }

function AIWorkspace({ open, onClose }: { open: boolean, onClose: () => void }) {
  const onlineDotRef = useRef<HTMLSpanElement>(null)
  const guestSessionRef = useRef(guestId())
  const abortController = useRef<AbortController | null>(null)
  const [conversations, setConversations] = useState<GuestConversation[]>([])
  const [activeConversationId, setActiveConversationId] = useState<string | null>(null)
  const [message, setMessage] = useState('')
  const [conversationSearch, setConversationSearch] = useState('')
  const [remainingRequests, setRemainingRequests] = useState(GUEST_AI_REQUEST_LIMIT)
  const [sending, setSending] = useState(false)
  const [requestError, setRequestError] = useState('')
  const [copiedMessageId, setCopiedMessageId] = useState<string | null>(null)
  useEffect(() => {
    if (!open || !onlineDotRef.current || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    const context = gsap.context(() => {
      gsap.to(onlineDotRef.current, { scale: 1.22, boxShadow: '0 0 0 6px rgba(78,151,122,.2)', duration: .9, ease: 'sine.inOut', repeat: -1, yoyo: true })
    }, onlineDotRef)
    return () => context.revert()
  }, [open])
  if (!open) return null
  const activeConversation = conversations.find(item => item.id === activeConversationId)
  const visibleConversations = conversations.filter(item => item.title.toLocaleLowerCase().includes(conversationSearch.trim().toLocaleLowerCase()))
  const startNewConversation = () => { setActiveConversationId(null); setMessage(''); setRequestError('') }
  const selectConversation = (id: string) => { setActiveConversationId(id); setMessage(''); setRequestError('') }
  const updateConversation = (id: string, update: (conversation: GuestConversation) => GuestConversation) => setConversations(current => current.map(item => item.id === id ? update(item) : item))
  const sendQuestion = async (question: string) => {
    const trimmed = question.trim()
    if (!trimmed || sending) return
    if (remainingRequests <= 0) { setRequestError('انتهت الطلبات المجانية لهذه الجلسة. حاول مرة أخرى لاحقًا.'); return }
    const existing = activeConversation
    const conversationId = existing?.id ?? guestId()
    const history = existing?.messages ?? []
    const userMessage: GuestMessage = { id: guestId(), role: 'user', content: trimmed, time: guestTime() }
    const conversation: GuestConversation = existing
      ? { ...existing, title: existing.title || trimmed.slice(0, 80), updatedAt: userMessage.time, messages: [...existing.messages, userMessage] }
      : { id: conversationId, title: trimmed.slice(0, 80), updatedAt: userMessage.time, messages: [userMessage] }
    setActiveConversationId(conversationId)
    setConversations(current => existing ? current.map(item => item.id === conversationId ? conversation : item) : [conversation, ...current])
    setMessage('')
    setRequestError('')
    setSending(true)
    setRemainingRequests(current => Math.max(0, current - 1))
    const controller = new AbortController()
    abortController.current = controller
    try {
      const response = await fetch(`${GUEST_AI_API_BASE}/ai/guest-chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'X-Guest-Session': guestSessionRef.current },
        body: JSON.stringify({ message: trimmed, history: history.map(item => ({ role: item.role, content: item.content })) }),
        signal: controller.signal,
      })
      const payload = await response.json().catch(() => ({})) as { answer?: string; sources?: { title?: string }[]; detail?: string }
      if (!response.ok) throw new GuestAIError(response.status, payload.detail || 'تعذر الوصول إلى المساعد حاليًا.')
      if (!payload.answer?.trim()) throw new GuestAIError(503, 'لم تُرجع خدمة المساعد إجابة صالحة.')
      const assistantMessage: GuestMessage = { id: guestId(), role: 'assistant', content: payload.answer, time: guestTime(), sources: payload.sources?.map(source => source.title || 'مصدر قانوني') ?? [] }
      updateConversation(conversationId, current => ({ ...current, updatedAt: assistantMessage.time, messages: [...current.messages, assistantMessage] }))
    } catch (error) {
      const cancelled = error instanceof DOMException && error.name === 'AbortError'
      const status = error instanceof GuestAIError ? error.status : 0
      setRequestError(cancelled ? 'تم إيقاف توليد الإجابة.' : status === 429 ? 'انتهت الطلبات المجانية لهذه الجلسة. حاول مرة أخرى لاحقًا.' : error instanceof Error ? error.message : 'تعذر الوصول إلى المساعد حاليًا.')
      if (status === 429) setRemainingRequests(0)
    } finally {
      abortController.current = null
      setSending(false)
    }
  }
  const copyMessage = async (item: GuestMessage) => { try { await navigator.clipboard.writeText(item.content); setCopiedMessageId(item.id); window.setTimeout(() => setCopiedMessageId(current => current === item.id ? null : current), 1400) } catch { setRequestError('تعذر نسخ الإجابة.') } }
  const retryLastQuestion = () => { const lastQuestion = [...(activeConversation?.messages ?? [])].reverse().find(item => item.role === 'user'); if (lastQuestion) void sendQuestion(lastQuestion.content) }
  const stopGeneration = () => abortController.current?.abort()
  return <div className="ai-workspace-backdrop" role="presentation"><div className="ai-workspace" dir="rtl" role="dialog" aria-modal="true" aria-labelledby="ai-workspace-title">
    <aside className="ai-sidebar"><div className="ai-sidebar-top"><div><span className="eyebrow">المساعد القانوني</span><h2>محادثاتك</h2></div></div><button className="ai-new-chat" type="button" onClick={startNewConversation}><Plus size={17}/> محادثة جديدة</button><label className="ai-search"><Search size={16}/><input value={conversationSearch} onChange={event => setConversationSearch(event.target.value)} placeholder="ابحث في المحادثات" aria-label="ابحث في المحادثات"/></label><span className="ai-group-label">هذه الجلسة</span>{visibleConversations.map(item => <button className={activeConversationId === item.id ? 'ai-conversation active' : 'ai-conversation'} type="button" key={item.id} onClick={() => selectConversation(item.id)}>{item.title}<small>{item.updatedAt}</small></button>)}{!visibleConversations.length && <p className="ai-history-empty">ابدأ أول سؤال لعرض محادثتك هنا.</p>}<div className="ai-guest-usage"><span>الطلبات المجانية</span><b>{remainingRequests} من {GUEST_AI_REQUEST_LIMIT}</b><small>يتجدد الحد كل ساعة</small></div></aside>
    <section className="ai-chat-panel"><header className="ai-chat-header"><div><span ref={onlineDotRef} className="ai-online-dot" aria-hidden="true"/> <strong id="ai-workspace-title">المساعد القانوني الذكي</strong><small>معلومات عامة بدون تسجيل دخول · {GUEST_AI_REQUEST_LIMIT} طلبات مجانية كل ساعة</small></div><button className="ai-icon-button" type="button" aria-label="إغلاق المساعد" onClick={onClose}><X size={19}/></button></header><div className="ai-message-scroll">{activeConversation?.messages.length ? <div className="ai-conversation-view">{activeConversation.messages.map((item, index) => <div className={item.role === 'user' ? 'ai-chat-message ai-chat-message--user' : 'ai-chat-message ai-chat-message--assistant'} key={item.id}>{item.role === 'user' ? <div className="ai-user-bubble">{item.content}<small>{item.time}</small></div> : <div className="ai-answer"><div className="ai-answer-avatar"><Bot size={17}/></div><div><span className="ai-answer-label">الإجابة المختصرة</span><p>{item.content}</p><small className="ai-message-time">{item.time}</small>{item.sources?.length ? <div className="ai-sources"><strong>المصادر</strong>{item.sources.map(source => <span key={`${item.id}-${source}`}><FileText size={14}/> {source}</span>)}</div> : null}<div className="ai-answer-actions"><button type="button" aria-label="نسخ الإجابة" onClick={() => void copyMessage(item)}>{copiedMessageId === item.id ? <Check size={15}/> : <Copy size={15}/>}</button>{index === activeConversation.messages.length - 1 && <button type="button" aria-label="إعادة إنشاء الإجابة" onClick={retryLastQuestion} disabled={sending || remainingRequests <= 0}><RotateCcw size={15}/></button>}</div></div></div>}</div>)}{sending && <div className="ai-answer ai-answer--loading"><div className="ai-answer-avatar"><Bot size={17}/></div><div className="ai-typing"><i/><i/><i/></div></div>}</div> : <div className="ai-empty"><Suspense fallback={<div className="ai-empty-icon"><Bot size={28}/></div>}><AIAssistantImage open={open}/></Suspense><h3>كيف يمكنني مساعدتك؟</h3><p>اكتب سؤالك القانوني وسأساعدك في فهمه، بدون تسجيل دخول، ضمن عدد الطلبات المجانية المتاح.</p><div className="ai-suggestion-grid">{['ما هي شروط رفع الدعوى المدنية؟','ما الفرق بين الدعوى والطلب؟','ما هي إجراءات الاستئناف؟','ما هي شروط صحة عقد البيع؟'].map(item => <button key={item} type="button" onClick={() => setMessage(item)} disabled={remainingRequests <= 0}>{item}<ArrowLeft size={14}/></button>)}</div></div>}{requestError && <p className="ai-request-error" role="alert">{requestError}</p>}</div><div className="ai-composer-wrap"><form className="ai-composer" onSubmit={event => { event.preventDefault(); void sendQuestion(message) }}><textarea value={message} onChange={event => setMessage(event.target.value)} onKeyDown={event => { if (event.key === 'Enter' && !event.shiftKey) { event.preventDefault(); void sendQuestion(message) } }} placeholder={remainingRequests > 0 ? 'اكتب سؤالك القانوني هنا...' : 'انتهت الطلبات المجانية لهذه الجلسة'} aria-label="اكتب سؤالك القانوني هنا..." rows={1} disabled={sending || remainingRequests <= 0}/>{sending ? <button className="ai-send" type="button" aria-label="إيقاف التوليد" onClick={stopGeneration}><Square size={17}/></button> : <button className="ai-send" type="submit" aria-label="إرسال السؤال" disabled={!message.trim() || remainingRequests <= 0}><Send size={17}/></button>}</form><small>{remainingRequests > 0 ? `متبقي ${remainingRequests} طلبات مجانية لهذه الجلسة.` : 'انتهت الطلبات المجانية. حاول مرة أخرى لاحقًا.'}</small></div></section>
  </div></div>
}

type AuthView = 'login' | 'register' | 'forgot' | 'reset' | 'success'

function LoginFlow({ open, onClose }: { open: boolean, onClose: () => void }) {
  const { lang } = useI18n()
  const [view, setView] = useState<AuthView>('login')
  const [email, setEmail] = useState('')
  const [fullName, setFullName] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [resetToken, setResetToken] = useState('')
  const [error, setError] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const isPasswordView = view === 'login' || view === 'register' || view === 'reset'
  const close = () => { setView('login'); setError(''); setPassword(''); setConfirmPassword(''); onClose() }
  const changeView = (next: AuthView) => { setError(''); setView(next) }

  useEffect(() => {
    if (!open) return
    const escape = (event: KeyboardEvent) => { if (event.key === 'Escape') close() }
    window.addEventListener('keydown', escape)
    return () => window.removeEventListener('keydown', escape)
  }, [open])

  if (!open) return null
  const validateEmail = () => /^\S+@\S+\.\S+$/.test(email)
  const submit = async () => {
    if (!validateEmail()) return setError(lang.auth.invalidEmail)
    if (view === 'register' && !fullName.trim()) return setError(lang.auth.fullName)
    if (isPasswordView && password.length < 8) return setError(lang.auth.passwordShort)
    if ((view === 'register' || view === 'reset') && password !== confirmPassword) return setError(lang.auth.passwordMismatch)
    setSubmitting(true); setError('')
    const endpoint = view === 'login' ? 'login' : view === 'register' ? 'register' : view === 'forgot' ? 'forgot-password' : 'reset-password'
    const payload = view === 'login' ? { email, password } : view === 'register' ? { displayName: fullName, email, password } : view === 'forgot' ? { email } : { email, token: resetToken, password }
    try {
      const response = await fetch(`http://localhost:5103/api/v1/auth/${endpoint}`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) })
      const data = await response.json().catch(() => null)
      if (!response.ok) {
        const validationMessage = data?.errors ? Object.values(data.errors).flat().find((message): message is string => typeof message === 'string') : undefined
        const message = data?.error === 'invalid_credentials' ? 'البريد الإلكتروني أو كلمة المرور غير صحيحة.'
          : data?.error === 'email_already_registered' ? 'هذا البريد مسجل بالفعل. سجّل الدخول أو استخدم بريدًا آخر.'
          : data?.error === 'invalid_or_expired_reset_token' ? 'رمز الاستعادة غير صالح أو انتهت صلاحيته. اطلب رمزًا جديدًا.'
          : validationMessage ?? data?.title ?? 'تعذر إتمام الطلب. تحقق من البيانات وحاول مرة أخرى.'
        throw new Error(message)
      }
      if (view === 'forgot') { setResetToken(data?.developmentToken ?? ''); setView('reset'); return }
      if (view === 'reset') { setView('login'); setError('تم تغيير كلمة المرور. يمكنك تسجيل الدخول الآن.'); return }
      sessionStorage.setItem('sanad-access-token', data.accessToken); sessionStorage.setItem('sanad-user', JSON.stringify(data)); setView('success')
    } catch (requestError) { setError(requestError instanceof TypeError ? 'تعذر الاتصال بالخدمة. تأكد أن الـBackend يعمل ثم حاول مرة أخرى.' : requestError instanceof Error ? requestError.message : 'تعذر الاتصال بالخدمة.') }
    finally { setSubmitting(false) }
  }
  const title = view === 'register' ? lang.auth.createAccount : view === 'forgot' ? lang.auth.resetTitle : view === 'reset' ? lang.auth.resetPassword : view === 'success' ? lang.auth.successTitle : lang.auth.title
  const subtitle = view === 'forgot' ? lang.auth.resetText : view === 'reset' ? lang.auth.resetPasswordText : view === 'success' ? lang.auth.successText : lang.auth.subtitle
  const submitLabel = view === 'register' ? lang.auth.createAccount : view === 'forgot' ? lang.auth.sendLink : view === 'reset' ? lang.auth.savePassword : lang.auth.login

  return <div className="auth-backdrop" role="presentation" onMouseDown={close}><section className="auth-card" role="dialog" aria-modal="true" aria-labelledby="auth-title" onMouseDown={event => event.stopPropagation()}><button className="auth-close" type="button" aria-label={lang.auth.close} onClick={close}><X size={19}/></button>{view === 'success' ? <div className="auth-success"><span className="auth-success-icon"><Check size={28}/></span><h2 id="auth-title">{title}</h2><p>{subtitle}</p><button className="button auth-submit" type="button" onClick={close}>{lang.auth.continue}<ArrowLeft size={17} aria-hidden="true"/></button></div> : <><div className="auth-heading"><span className="eyebrow"><KeyRound size={14}/>{view === 'register' ? lang.auth.register : lang.nav.login}</span><h2 id="auth-title">{title}</h2><p>{subtitle}</p></div><form className="auth-form" onSubmit={event => { event.preventDefault(); void submit() }}>{view === 'register' && <label className="auth-field"><span>{lang.auth.fullName}</span><div><UserRound size={17}/><input autoComplete="name" value={fullName} onChange={event => setFullName(event.target.value)} required /></div></label>}<label className="auth-field"><span>{lang.auth.email}</span><div><Mail size={17}/><input type="email" autoComplete="email" value={email} onChange={event => setEmail(event.target.value)} required /></div></label>{view === 'reset' && <label className="auth-field"><span>{lang.auth.resetCode}</span><div><KeyRound size={17}/><input value={resetToken} onChange={event => setResetToken(event.target.value)} required /></div></label>}{isPasswordView && <label className="auth-field"><span>{lang.auth.password}</span><div><KeyRound size={17}/><input type={showPassword ? 'text' : 'password'} autoComplete={view === 'login' ? 'current-password' : 'new-password'} value={password} onChange={event => setPassword(event.target.value)} required /><button className="auth-password-toggle" type="button" aria-label={showPassword ? 'Hide password' : 'Show password'} onClick={() => setShowPassword(!showPassword)}>{showPassword ? <EyeOff size={17}/> : <Eye size={17}/>}</button></div></label>}{(view === 'register' || view === 'reset') && <label className="auth-field"><span>{lang.auth.confirmPassword}</span><div><KeyRound size={17}/><input type={showPassword ? 'text' : 'password'} autoComplete="new-password" value={confirmPassword} onChange={event => setConfirmPassword(event.target.value)} required /></div></label>}{error && <p className="auth-error" role="alert">{error}</p>}<button className="button auth-submit" type="submit" disabled={submitting}>{submitting ? 'جارٍ المعالجة…' : submitLabel}<ArrowLeft size={17} aria-hidden="true"/></button></form>{view === 'login' && <button className="auth-text-button" type="button" onClick={() => changeView('forgot')}>{lang.auth.forgot}</button>}{view === 'forgot' || view === 'reset' ? <button className="auth-text-button" type="button" onClick={() => changeView('login')}>{lang.auth.back}</button> : view !== 'login' && <p className="auth-switch">{lang.auth.haveAccount} <button type="button" onClick={() => changeView('login')}>{lang.auth.login}</button></p>}{view === 'login' && <p className="auth-switch">{lang.auth.noAccount} <button type="button" onClick={() => changeView('register')}>{lang.auth.register}</button></p>}<p className="auth-notice">{lang.auth.demoNotice}</p></>}</section></div>
}
function CTA() { const { lang, locale } = useI18n(); return <section className="cta" id="ابدأ"><div className="cta-brand"><span className="cta-brand-mark"><img src="/sanad-logo.jpg" alt={lang.brand.logoAlt} /></span><span className="cta-brand-name" lang={locale}>{lang.brand.name}</span></div><h2>{lang.cta.title}<br/>{lang.cta.title2}</h2><p>{lang.cta.text}</p><Button href="#الاشتراك">{lang.nav.start}</Button><small>{lang.cta.disclaimer}</small></section> }

function Footer() { const { lang, locale, setLocale } = useI18n(); return <footer><div><Logo/><p>{lang.footer.tagline}</p></div><div className="footer-links">{lang.footer.links.map((label, index) => <a key={label} href={['#المميزات','#الأمان','#الأسئلة الشائعة'][index]}>{label}</a>)}<button className="footer-language" type="button" onClick={() => setLocale(locale === 'ar' ? 'en' : 'ar')}>{lang.nav.language}</button></div><small>{lang.footer.copyright}</small></footer> }

export default function App() {
  const { lang } = useI18n()
  const [plansOpen, setPlansOpen] = useState(false)
  const [aiOpen, setAiOpen] = useState(false)
  const motionScope = useRef<HTMLElement | null>(null)

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger)
    const scope = motionScope.current
    if (!scope || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

    let mediaContext: gsap.MatchMedia | undefined
    const context = gsap.context(() => {
      const reveal = (target: string, trigger?: string, options: gsap.TweenVars = {}) => {
        const vars = { autoAlpha: 0, y: 20, duration: 0.55, ease: 'power2.out', stagger: 0.05, ...options }
        if (trigger) return gsap.from(target, { ...vars, scrollTrigger: { trigger, start: 'top 84%', once: true } })
        return gsap.utils.toArray<HTMLElement>(target).map((element) => gsap.from(element, { ...vars, stagger: 0, scrollTrigger: { trigger: element, start: 'top 84%', once: true } }))
      }

      gsap.from('.hero-copy > *', { y: 22, duration: 0.65, stagger: 0.08, ease: 'power2.out', delay: 0.1, clearProps: 'transform' })
      gsap.from('.reference-visual', { x: 30, scale: 0.98, duration: 0.8, ease: 'power2.out', delay: 0.2, clearProps: 'transform' })
      gsap.to('.reference-services-art', { y: -16, rotate: -0.7, duration: 3.2, ease: 'sine.inOut', repeat: -1, yoyo: true })

      reveal('.reference-services-inner', '.reference-services')
      reveal('.workflow-intro', '.workflow')
      reveal('.section-intro, .product-showcopy, .showcase-copy, .assistant-copy, .faq-title, .security > div:first-child')
      reveal('.workflow-step', '.workflow')
      reveal('.problem-card', '.problem')
      reveal('.analysis-card', '.showcase')
      reveal('.chat-card', '.assistant-show')
      reveal('.security-grid article', '.security')
      reveal('.step', '.steps')
      reveal('.faq-list article', '.faq')
      reveal('.cta > *', '.cta', { y: 14, duration: 0.45 })

      mediaContext = gsap.matchMedia()
      mediaContext.add('(min-width: 701px)', () => {
        gsap.to('.reference-visual', {
          yPercent: -6,
          ease: 'none',
          scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: 0.7 }
        })
        gsap.to('.workflow-orbit', {
          yPercent: -10,
          rotate: 4,
          ease: 'none',
          scrollTrigger: { trigger: '.workflow', start: 'top bottom', end: 'bottom top', scrub: 0.7 }
        })
      })
    }, scope)

    return () => {
      mediaContext?.revert()
      context.revert()
    }
  }, [])

  useEffect(() => { const syncPlans = () => { const hash = decodeURIComponent(window.location.hash.slice(1)); setPlansOpen(hash === 'الاشتراك') }; syncPlans(); window.addEventListener('hashchange', syncPlans); return () => window.removeEventListener('hashchange', syncPlans) }, [])
  useEffect(() => { document.body.style.overflow = plansOpen || aiOpen ? 'hidden' : ''; return () => { document.body.style.overflow = '' } }, [plansOpen, aiOpen])
  const closePlans = () => { setPlansOpen(false); if (decodeURIComponent(window.location.hash.slice(1)) === 'الاشتراك') window.history.pushState({}, '', '#الرئيسية') }
  return <><a className="skip" href="#main">{lang.a11y.skip}</a><Nav/><main id="main" ref={motionScope}><Hero/><Trust/><ReferenceScrollVisuals/><Workflow/><Problems/><Features/><ProductShowcase/><AnalysisShowcase/><AssistantShowcase/><Security/><Steps/><FAQ/><CTA/></main><GavelChatTrigger floating onOpen={() => setAiOpen(true)}/><SubscriptionPlans open={plansOpen} onClose={closePlans} onStartTrial={() => { closePlans(); setAiOpen(true) }}/><AIWorkspace open={aiOpen} onClose={() => setAiOpen(false)}/><Footer/></>
}
