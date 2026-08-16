import { lazy, Suspense, useEffect, useRef, useState } from 'react'
import {
  ArrowLeft, ArrowUpLeft, Bot, Check, ChevronDown, FileSearch, FileText,
  LockKeyhole, Menu, Search, ShieldCheck, Sparkles, Upload, X, Zap
} from 'lucide-react'
const LegalAIHeroScene = lazy(() => import('./components/3d/LegalAIHeroScene').then(module => ({ default: module.LegalAIHeroScene })))
const LegalProductScene = lazy(() => import('./components/3d/LegalAIHeroScene').then(module => ({ default: module.LegalProductScene })))
const SecurityScene = lazy(() => import('./components/3d/LegalAIHeroScene').then(module => ({ default: module.SecurityScene })))
function SceneLoader({ children }: { children: React.ReactNode }) { return <Suspense fallback={<div className="scene-skeleton" aria-hidden="true" />}>{children}</Suspense> }

const features = [
  { icon: FileSearch, title: 'تحليل المستندات', text: 'ارفع المستندات ودع الذكاء الاصطناعي يستخرج البنود والمعلومات المهمة.' },
  { icon: Bot, title: 'المساعد القانوني الذكي', text: 'اسأل بلغة طبيعية واحصل على إجابات مرتبطة بمراجع المستند.' },
  { icon: FileText, title: 'صياغة المستندات', text: 'أنشئ مسودات قانونية واضحة مع الحفاظ على السياق الأساسي.' },
  { icon: ShieldCheck, title: 'اكتشاف المخاطر', text: 'حدّد البنود التي تستحق المراجعة قبل أن تصبح مصدر قلق.' },
  { icon: Search, title: 'البحث الذكي', text: 'اعثر على المعلومة الصحيحة دون التنقل بين عشرات الصفحات.' },
  { icon: LockKeyhole, title: 'إدارة المعرفة', text: 'نظّم مستنداتك لتصبح المعرفة في متناول فريقك وقت الحاجة.' },
]

const faqs = [
  ['ما هي منصة Counsel AI؟', 'منصة عمل قانوني ذكية تساعد الفرق على تحليل المستندات والبحث فيها وصياغة مسودات أولية بشكل أكثر تنظيماً.'],
  ['هل يمكنني رفع مستنداتي القانونية؟', 'صُممت واجهات المنصة لتدعم العمل بالمستندات القانونية مع ضوابط وصول واضحة ضمن بيئة العمل.'],
  ['كيف يتم تحليل المستندات؟', 'تستخرج المنصة البنود والنقاط المهمة وتعرضها في سياقها لتراجعها وتتخذ قرارك المهني.'],
  ['هل بياناتي آمنة؟', 'نضع أمن البيانات والخصوصية في صميم التصميم، مع خيارات لإدارة الوصول وسجل قابل للمراجعة.'],
  ['هل يدعم فريقاً كاملاً؟', 'نعم، صُممت التجربة لتناسب العمل الفردي والفرق القانونية، مع أدوار وصلاحيات قابلة للتوسّع.'],
  ['هل يحل الذكاء الاصطناعي محل المحامي؟', 'لا. المخرجات تساعد في تسريع العمل وتحتاج دائماً إلى مراجعة وحكم مهني من مختص قانوني مؤهل.'],
]

function Logo() { return <a className="logo" href="#الرئيسية" aria-label="سَنَد - الصفحة الرئيسية"><span className="logo-image-wrap"><img src="/sanad-logo.jpg" alt="شعار سَنَد" /></span><span className="brand-name" lang="ar">سَنَد</span></a> }

function Button({ children, secondary = false }: { children: React.ReactNode, secondary?: boolean }) {
  return <a href="#ابدأ" className={`button ${secondary ? 'button-secondary' : ''}`}>{children}{!secondary && <ArrowLeft size={17} aria-hidden="true" />}</a>
}

function Nav() {
  const [open, setOpen] = useState(false)
  const links = ['الرئيسية', 'المميزات', 'كيف يعمل', 'حلول المحامين', 'الأمان', 'الأسئلة الشائعة']
  return <header className="nav-wrap"><nav className="nav" aria-label="التنقل الرئيسي"><Logo />
    <div className={`nav-links ${open ? 'open' : ''}`}>{links.map(x => <a key={x} onClick={() => setOpen(false)} href={`#${x}`}>{x}</a>)}</div>
    <div className="nav-actions"><a className="login" href="#ابدأ">تسجيل الدخول</a><a className="language" href="#english" lang="en">English</a><Button>ابدأ الآن</Button></div>
    <button className="menu" onClick={() => setOpen(!open)} aria-expanded={open} aria-label={open ? 'إغلاق القائمة' : 'فتح القائمة'}>{open ? <X /> : <Menu />}</button>
  </nav></header>
}

function ProductVisual() { return <div className="product-wrap" aria-label="نموذج توضيحي لواجهة تحليل عقد قانوني">
  <div className="product-glow" /><div className="product">
    <aside className="app-side"><div className="app-logo"><span className="logo-mark"><span /></span></div><div className="side-icon active"><FileText size={16}/></div><div className="side-icon"><Search size={16}/></div><div className="side-icon"><Bot size={16}/></div><div className="side-bottom"><div className="avatar">ن</div></div></aside>
    <section className="document"><div className="app-header"><div><span className="crumb">المستندات / عقود</span><strong>اتفاقية خدمات استشارية</strong></div><button aria-label="مشاركة المستند"><ArrowUpLeft size={16}/></button></div>
      <div className="doc-body"><div className="doc-label">مسودة · ١٢ صفحة</div><h3>اتفاقية تقديم خدمات</h3><p>تم إبرام هذه الاتفاقية في تاريخ <i /> بين الطرف الأول والطرف الثاني، وفقاً للشروط والأحكام الموضحة أدناه.</p><h4>٤. بند المسؤولية</h4><p className="highlight">لا تتجاوز مسؤولية أي طرف عن الأضرار غير المباشرة أو التبعية قيمة المقابل المالي المدفوع خلال الاثني عشر شهراً السابقة.</p><p>ويتحمل كل طرف مسؤولية التزاماته النظامية والتعاقدية المنصوص عليها في هذه الاتفاقية.</p><div className="doc-lines"><span/><span/><span/></div></div>
    </section>
    <aside className="insights"><div className="insight-head"><span>رؤى المستند</span><Sparkles size={16}/></div><div className="score"><span>مستوى المخاطر</span><strong>متوسط</strong><div><i /></div></div><div className="insight-card"><span className="eyebrow">البند المحدد</span><b>بند المسؤولية</b><p>يتضمن سقفاً للمسؤولية. يُنصح بالتحقق من توافقه مع نطاق العمل.</p><a href="#المميزات">عرض الاقتراح <ArrowLeft size={13}/></a></div><div className="processing"><span className="pulse"/> اكتمل التحليل <Check size={14}/></div></aside>
  </div></div> }

function ReferenceHeroVisual() {
  return <div className="reference-visual" role="img" aria-label="مساحة عمل لتحليل مستند قانوني بالذكاء الاصطناعي">
    <div className="reference-glow" />
    <img src="/reference-legal-workspace.png" alt="مساحة عمل قانونية تعرض عقداً وتحليل المخاطر والمساعد القانوني" />
    <span className="reference-scan" aria-hidden="true" />
    <span className="reference-pulse pulse-one" aria-hidden="true" />
    <span className="reference-pulse pulse-two" aria-hidden="true" />
    <div className="reference-status"><span className="status-dot" /> جاري تحليل المستند</div>
  </div>
}

function Hero() { return <section id="الرئيسية" className="hero hero-3d"><div className="hero-copy"><div className="eyebrow top"><span/> ذكاء قانوني مصمم للعمل الاحترافي</div><h1>حوّل مستنداتك القانونية إلى<br/><em>قرارات أكثر ذكاءً.</em></h1><p>من تحليل العقود واكتشاف المخاطر إلى المساعدة القانونية الذكية، اجعل الذكاء الاصطناعي جزءاً موثوقاً من فريقك القانوني.</p><div className="hero-actions"><Button>ابدأ الآن</Button><Button secondary>استكشف المنصة</Button></div><div className="designed"><ShieldCheck size={17}/> مصمم للمحامين والمهنيين القانونيين</div></div><ReferenceHeroVisual /></section> }

function Trust() { return <section className="trust"><p>مصمم لبيئات العمل القانونية الحديثة</p><div>{[['خصوصية عالية', LockKeyhole], ['تشفير البيانات', ShieldCheck], ['صلاحيات مرنة', Check], ['بنية مؤسسية', Zap]].map(([t, Icon]) => { const I = Icon as typeof LockKeyhole; return <span key={t as string}><I size={16}/>{t as string}</span> })}</div></section> }

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
  return <>
    <RevealSection className="reference-services" id="المميزات"><div className="reference-services-inner"><img src="/legal-workspace-section-clean.png" alt="مساحة عمل قانونية متكاملة تعرض تحليل المستندات والمخاطر والمساعد القانوني" /><a className="reference-image-cta" href="#ابدأ" aria-label="استكشف المنصة"><span>استكشف المنصة</span><ArrowLeft size={17} aria-hidden="true" /></a></div></RevealSection>
    <RevealSection className="reference-laptop"><div className="reference-laptop-copy"><span className="eyebrow">رؤية أوضح للمستند</span><h2>راجع البنود المهمة<br/>في مساحة واحدة.</h2><p>تظهر الملاحظات، البنود التي تحتاج إلى مراجعة، ومستوى المخاطر بجوار المستند مباشرة.</p><a className="button" href="#ابدأ">استكشف تجربة التحليل <ArrowLeft size={17} aria-hidden="true" /></a></div><div className="reference-laptop-art"><img src="/smart-legal-laptop-cutout-new.png" alt="حاسوب محمول يعرض المساعد القانوني وتحليل عقد خدمات" /></div></RevealSection>
  </>
}

function Workflow() {
  const stages = [
    ['01', Upload, 'ارفع مستندك', 'ابدأ من عقد أو ملف قانوني، مع الحفاظ على بنية المستند وسياقه.'],
    ['02', FileSearch, 'يحلل الذكاء الاصطناعي المستند', 'يستخرج البنود الجوهرية ويجمع الإشارات التي تستحق انتباهك.'],
    ['03', ShieldCheck, 'اكتشف البنود التي تستحق المراجعة', 'تظهر المخاطر بصرياً مع مستوى واضح وإشارة إلى النص الأصلي.'],
    ['04', Bot, 'اتخذ قراراً أكثر وضوحاً', 'اسأل المساعد القانوني واحصل على إجابات مرتبطة بمستنداتك.'],
  ] as const
  return <section className="workflow" id="حلول المحامين"><div className="workflow-intro"><span className="eyebrow">من المستند إلى القرار</span><h2>تدفق عمل يتحرك<br/><em>مع طريقة تفكيرك.</em></h2><p>من أول صفحة إلى آخر قرار، تبقى كل إشارة في سياقها وتحت مراجعتك المهنية.</p><div className="workflow-orbit"><div className="workflow-paper"><FileText size={28}/><span>عقد اتفاقية خدمات</span><small>جاري التحليل</small></div><div className="workflow-ring"/><div className="workflow-dot"/></div></div><div className="workflow-steps">{stages.map(([number, Icon, title, text]) => <article key={number} className="workflow-step"><div className="workflow-step-top"><span>{number}</span><Icon size={20}/></div><h3>{title}</h3><p>{text}</p><i/></article>)}</div></section>
}

function Problems() { const items = ['قراءة مئات الصفحات', 'البحث الطويل عن المعلومات', 'مراجعة العقود يدوياً', 'تكرار الأعمال الروتينية', 'صعوبة تنظيم المستندات', 'وقت أقل للعمل عالي القيمة']; return <section className="section problem" id="كيف يعمل"><div className="section-intro"><span className="eyebrow">تحديات مألوفة</span><h2>العمل القانوني لا يحتاج إلى<br/>مزيد من التعقيد.</h2><p>الوقت الذي يضيع في المهام المتكررة هو وقت كان يمكن أن يذهب للحكم القانوني والاستراتيجية.</p></div><div className="problem-grid">{items.map((item,i) => <div className="problem-card" key={item}><span>0{i+1}</span><p>{item}</p><div className="line"/></div>)}</div></section> }

function Features() { return <section className="section features" id="المميزات"><div className="section-intro centered"><span className="eyebrow">منصة واحدة، تدفق عمل أوضح</span><h2>كل ما تحتاجه للعمل<br/>القانوني الذكي.</h2></div><div className="feature-grid">{features.map(({icon: Icon,title,text}) => <article className="feature" key={title}><div className="feature-icon"><Icon size={22}/></div><h3>{title}</h3><p>{text}</p><a href="#ابدأ">استكشف الميزة <ArrowLeft size={15}/></a></article>)}</div></section> }

function ProductShowcase() { return <section className="section product-showcase"><div className="product-showcopy"><span className="eyebrow">تجربة المنتج</span><h2>شاهد الذكاء القانوني<br/>أثناء العمل.</h2><p>تتحول المستندات إلى مساحة عمل تضع البنود المهمة، مستوى المخاطر، والإجراء المقترح في متناولك.</p><div className="showcase-stats"><span><b>٤</b> بنود للمراجعة</span><span><b>متوسط</b> مستوى المخاطر</span></div><Button secondary>استكشف تجربة التحليل</Button></div><div className="product-3d-shell"><video className="product-demo-video" autoPlay muted loop playsInline preload="metadata" aria-label="عرض توضيحي لمساحة العمل القانونية"><source src="/create-video-demo.mp4" type="video/mp4" /></video><div className="product-status"><span className="status-dot"/> اكتمل التحليل</div><div className="product-clause">بند المسؤولية <b>يحتاج إلى مراجعة</b></div></div></section> }

function AnalysisShowcase() { return <section className="section showcase"><div className="showcase-copy"><span className="eyebrow">تحليل المستندات</span><h2>افهم ما بين السطور قبل اتخاذ القرار.</h2><p>تقرأ Counsel AI المستند معك، وتساعدك على الوصول إلى البنود الجوهرية والمخاطر المحتملة في سياقها.</p><ul><li><Check/> ملخصات منظمة لكل مستند</li><li><Check/> تحديد البنود والمخاطر للمراجعة</li><li><Check/> اقتراحات مرتبطة بالنص الأصلي</li></ul><Button secondary>شاهد كيف يعمل</Button></div><div className="analysis-card"><div className="analysis-title"><FileText size={18}/><b>مراجعة العقد</b><span>تم التحليل</span></div><div className="clause"><span>البند ٤.٢</span><p>يلتزم مقدم الخدمة بتعويض الطرف الآخر عن الأضرار المباشرة الناتجة عن الإخلال الجوهري.</p></div><div className="risk"><div><i/><span><b>مستوى المخاطر: متوسط</b><small>سقف المسؤولية يحتاج إلى مراجعة</small></span></div><button>عرض التوصية <ArrowLeft size={14}/></button></div><div className="analysis-note"><Sparkles size={16}/><p><b>ملاحظة الذكاء الاصطناعي</b>تحقق من توافق الاستثناءات مع التزاماتك التجارية.</p></div></div></section> }

function AssistantShowcase() { return <section className="section assistant-show"><div className="chat-card"><div className="chat-header"><span className="online"/> المساعد القانوني <button aria-label="المزيد">•••</button></div><div className="messages"><div className="user-message">ما أهم البنود التي تحتاج إلى مراجعة في هذا العقد؟</div><div className="ai-message"><div className="ai-avatar"><Bot size={16}/></div><p>وجدت <b>٤ بنود</b> تستحق المراجعة. أهمها بند المسؤولية وحدود التعويض.</p><div className="source"><FileText size={14}/> اتفاقية الخدمات · البند ٤.٢</div></div><div className="demo-insights"><div className="demo-insights-head"><span>ملخص التحليل</span><b>محدث الآن</b></div><div className="demo-insight-row"><span><i className="risk-dot high"/> بند المسؤولية</span><strong>مراجعة مهمة</strong></div><div className="demo-insight-row"><span><i className="risk-dot medium"/> حدود التعويض</span><strong>متوسط</strong></div><div className="demo-insight-row"><span><i className="risk-dot low"/> مدة الاتفاقية</span><strong>واضح</strong></div></div></div><div className="suggestions"><button>اشرح بند المسؤولية</button><button>اقترح تعديلاً</button></div><div className="chat-input">اكتب سؤالك عن المستند… <ArrowLeft size={16}/></div></div><div className="assistant-copy"><span className="eyebrow">المساعد القانوني</span><h2>إجابات تستند إلى<br/>مستنداتك.</h2><p>تحاور مع مساعد يفهم سياق ملفك ويعيدك دائماً إلى المرجع المناسب، لتبقى أنت صاحب القرار.</p><div className="callout"><Bot size={19}/><span>اسأل، راجع، ثم اتخذ قرارك بثقة.</span></div></div></section> }

function Security() { return <section className="security" id="الأمان"><div><span className="eyebrow light">الأمن والخصوصية</span><h2>بياناتك القانونية تستحق<br/>أعلى درجات العناية.</h2><p>صُممت المنصة مع وضع أمن البيانات والخصوصية في الاعتبار، حتى تتمكن من العمل بثقة ووضوح.</p><a className="light-link" href="#ابدأ">تعرف على نهجنا في الأمان <ArrowLeft size={16}/></a></div><div className="security-3d security-gemini" aria-label="رمز أمان المنصة" role="img"><img src="/gemini-security.svg" alt="رمز أمان قانوني" /></div><div className="security-grid">{[['تشفير البيانات', 'حماية للمعلومات أثناء النقل والمعالجة'],['وصول مضبوط', 'أدوار وصلاحيات تتوافق مع فريقك'],['سجل قابل للمراجعة', 'وضوح أكبر في أنشطة مساحة العمل'],['خصوصية المستندات', 'بيئة عمل تحترم حساسية ملفاتك']].map(([a,b]) => <article key={a}><LockKeyhole size={19}/><b>{a}</b><p>{b}</p></article>)}</div></section> }

function Steps() { return <section className="section steps"><div className="section-intro centered"><span className="eyebrow">بساطة في كل خطوة</span><h2>من المستند إلى الرؤية<br/>في تدفق عمل واضح.</h2></div><div className="steps-grid">{['ارفع مستنداتك','دع الذكاء الاصطناعي يحللها','راجع النتائج والرؤى','اتخذ القرار بثقة'].map((x,i) => <div className="step" key={x}><strong>0{i+1}</strong><span>{x}</span>{i<3 && <i/>}</div>)}</div></section> }

function FAQ() { const [active,setActive] = useState<number | null>(0); return <section className="section faq" id="الأسئلة الشائعة"><div className="faq-title"><span className="eyebrow">الأسئلة الشائعة</span><h2>أسئلة واضحة.<br/>إجابات مباشرة.</h2><p>إذا لم تجد ما تبحث عنه، يسعدنا أن نساعدك.</p><a href="#ابدأ">تواصل معنا <ArrowLeft size={15}/></a></div><div className="faq-list">{faqs.map(([q,a],i) => <article className={active===i?'expanded':''} key={q}><button onClick={() => setActive(active===i?null:i)} aria-expanded={active===i}>{q}<ChevronDown size={19}/></button>{active===i && <p>{a}</p>}</article>)}</div></section> }

function CTA() { return <section className="cta" id="ابدأ"><div className="cta-brand"><span className="cta-brand-mark"><img src="/sanad-logo.jpg" alt="شعار سَنَد" /></span><span className="cta-brand-name" lang="ar">سَنَد</span></div><h2>ابدأ مستقبل العمل<br/>القانوني اليوم.</h2><p>قلل الأعمال المتكررة، وافهم مستنداتك بشكل أسرع، وامنح فريقك مساحة أكبر للعمل عالي القيمة.</p><Button>ابدأ الآن</Button><small>لا تتخذ المنصة قرارات قانونية نيابةً عنك.</small></section> }

function Footer() { return <footer><div><Logo/><p>ذكاء قانوني مصمم للمهنيين.</p></div><div className="footer-links"><a href="#المميزات">المميزات</a><a href="#الأمان">الأمان</a><a href="#الأسئلة الشائعة">الأسئلة الشائعة</a><a href="#english" lang="en">English</a></div><small>© ٢٠٢٦ Counsel AI. جميع الحقوق محفوظة.</small></footer> }

export default function App() { return <><a className="skip" href="#main">انتقل إلى المحتوى</a><Nav/><main id="main"><Hero/><Trust/><ReferenceScrollVisuals/><Workflow/><Problems/><Features/><ProductShowcase/><AnalysisShowcase/><AssistantShowcase/><Security/><Steps/><FAQ/><CTA/></main><Footer/></> }
