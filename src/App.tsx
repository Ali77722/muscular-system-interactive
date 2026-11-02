import { useLayoutEffect, useRef, useState } from 'react'
import {
  Activity,
  ArrowLeft,
  ArrowRight,
  ArrowUpRight,
  Crosshair,
  BookOpen,
  Check,
  Eye,
  EyeOff,
  Focus,
  Info,
  Layers,
  Minus,
  PanelRightClose,
  PanelRightOpen,
  Plus,
  RotateCcw,
  X,
} from 'lucide-react'
import Viewer, { type ViewerHandle } from './Viewer'
import ViewMenu from './ViewMenu'
import ChapterGuide from './ChapterGuide'
import { muscleArabic, groupArabic } from './arabic'
import { AnatomyTree } from './components/ui/anatomy-tree'
import { anatomySource, byId, defaultView, structures, tour, type View } from './anatomy'
import {
  anatomyTree,
  hiddenFromVisibility,
  isStructureId,
  visibilityFromHidden,
} from './anatomy-adapter'

export default function App() {
  const [selected, setSelected] = useState<string | null>(null)
  const [hidden, setHidden] = useState<Set<string>>(new Set())
  const [view, setView] = useState<View | 'Custom view'>(defaultView)
  const [ready, setReady] = useState(false)
  const [step, setStep] = useState<number | null>(null)
  const [announcement, setAnnouncement] = useState('')
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [panelTab, setPanelTab] = useState<'anatomy' | 'chapter'>('anatomy')
  const controls = useRef<ViewerHandle | null>(null)
  const about = useRef<HTMLDialogElement>(null)
  const anatomyPanel = useRef<HTMLElement>(null)
  const sidebarToggle = useRef<HTMLButtonElement>(null)
  const focusPanel = useRef(false)
  // Remounting the registry tree clears its internal search and disclosure state.
  const [treeKey, setTreeKey] = useState(0)
  const current = selected ? byId[selected] : null
  const currentArabic = current ? muscleArabic[current.id] : null
  const visibleCount = structures.length - hidden.size
  // The tree reveals selections made while it is shown. One made while the
  // panel was closed (hidden tree, nothing to scroll) is brought into the tree's
  // own scroll area when the panel opens, without moving the page.
  useLayoutEffect(() => {
    if (!sidebarOpen) return
    const tree = anatomyPanel.current?.querySelector<HTMLElement>('[role="tree"]')
    const row = tree?.querySelector<HTMLElement>('[role="treeitem"][aria-selected="true"]')
    if (!tree || !row) return
    const bounds = tree.getBoundingClientRect(),
      item = row.getBoundingClientRect()
    if (item.top < bounds.top) tree.scrollTop += item.top - bounds.top
    else if (item.bottom > bounds.bottom) tree.scrollTop += item.bottom - bounds.bottom
  }, [sidebarOpen])

  useLayoutEffect(() => {
    if (!sidebarOpen || !focusPanel.current) return
    focusPanel.current = false
    anatomyPanel.current?.focus({ preventScroll: true })
    if (matchMedia('(max-width: 760px)').matches) {
      anatomyPanel.current?.scrollIntoView({ behavior: 'instant', block: 'start' })
    }
  }, [sidebarOpen])

  function openAnatomy() {
    if (sidebarOpen) {
      anatomyPanel.current?.focus()
      return
    }
    focusPanel.current = true
    setSidebarOpen(true)
  }

  function closeAnatomy() {
    setSidebarOpen(false)
    sidebarToggle.current?.focus()
  }

  function select(id: string) {
    setSelected(id)
    setPanelTab('anatomy')
    setSidebarOpen(true)
    setAnnouncement(
      `${muscleArabic[id]?.name ?? byId[id].name} تم تحديدها${hidden.has(id) ? '. العضلة مخفية حالياً؛ أظهرها من أدوات العرض.' : ''}.`,
    )
  }
  // Selection stays a single structure: the renderer, detail card, and chip
  // describe one structure. Group rows are not selectable (they expand or
  // collapse); the guard only drops unknown IDs.
  function choose(id: string) {
    if (isStructureId(id)) select(id)
  }
  function changeVisibility(visibility: Record<string, boolean>) {
    const next = hiddenFromVisibility(visibility)
    const changed = structures.filter((s) => next.has(s.id) !== hidden.has(s.id))
    setHidden(next)
    setAnnouncement(
      changed.length === 1
        ? `${muscleArabic[changed[0].id]?.name ?? changed[0].name} ${next.has(changed[0].id) ? 'مخفية' : 'ظاهرة'}.`
        : `${structures.length - next.size} من ${structures.length} بنية ظاهرة.`,
    )
  }
  function restore() {
    setHidden(new Set())
    setAnnouncement(`تم إظهار جميع التراكيب وعددها ${structures.length}.`)
  }
  function reset() {
    setSelected(null)
    setHidden(new Set())
    setTreeKey((key) => key + 1)
    setStep(null)
    controls.current?.preset(defaultView)
    setView(defaultView)
    setAnnouncement(`تمت إعادة ضبط المستكشف. جميع العضلات ظاهرة.`)
  }
  function preset(next: View) {
    controls.current?.preset(next)
    setView(next)
  }
  // Muscles range from the face to the toes, so a selection can be framed on
  // its own from the current named view (anterior when the view is custom).
  function zoomTo(id: string) {
    const next = view === 'Custom view' ? defaultView : view
    controls.current?.preset(next, [id])
    setView(next)
    setAnnouncement(`تم تقريب العرض إلى ${muscleArabic[id]?.name ?? byId[id].name}.`)
  }
  function toggle(id: string) {
    const next = new Set(hidden)
    if (next.has(id)) next.delete(id)
    else next.add(id)
    setHidden(next)
    setAnnouncement(`${muscleArabic[id]?.name ?? byId[id].name} ${next.has(id) ? 'مخفية' : 'ظاهرة'}.`)
  }
  function isolate(id: string) {
    setHidden(new Set(structures.filter((s) => s.id !== id).map((s) => s.id)))
    setAnnouncement(`تم عزل ${muscleArabic[id]?.name ?? byId[id].name}. أظهر الكل لرؤية بقية العضلات.`)
  }
  function goToStep(index: number) {
    const next = tour[index]
    setStep(index)
    setSelected(next.id)
    setHidden(
      next.isolate
        ? new Set(structures.filter((s) => s.id !== next.id).map((s) => s.id))
        : new Set(),
    )
    controls.current?.preset(next.view, next.focus ? [next.id] : undefined)
    setView(next.view)
    setAnnouncement(
      `المحطة ${index + 1} من ${tour.length}: ${next.title}. تم تحديد ${muscleArabic[next.id]?.name ?? byId[next.id].name}.`,
    )
  }
  function endTour() {
    setStep(null)
    restore()
  }

  return (
    <>
      <a
        href="#anatomy"
        className="skip-link"
        onClick={(event) => {
          event.preventDefault()
          openAnatomy()
        }}
      >
        انتقل إلى قائمة العضلات
      </a>
      <header className="site-header">
        <a className="brand" href="./" aria-label="مختبر الجهاز العضلي">
          <span className="brand-icon">
            <Activity size={21} strokeWidth={1.6} />
          </span>
          <span>
            Organ<span className="brand-light">UI</span>
          </span>
          <span className="brand-slash">/</span>
          <span className="brand-product">مختبر الجهاز العضلي</span>
        </a>
        <nav aria-label="التنقل الرئيسي">
          <button
            className="text-button about-button"
            aria-label="عن النموذج"
            onClick={() => about.current?.showModal()}
          >
            <Info size={15} />
            <span>عن النموذج</span>
          </button>
          <button
            ref={sidebarToggle}
            className="sidebar-toggle"
            aria-label={sidebarOpen ? 'إغلاق لوحة التشريح' : 'فتح لوحة التشريح'}
            aria-expanded={sidebarOpen}
            aria-controls="anatomy"
            onClick={sidebarOpen ? closeAnatomy : openAnatomy}
          >
            {sidebarOpen ? <PanelRightClose size={17} /> : <PanelRightOpen size={17} />}
            <span>التشريح</span>
          </button>
        </nav>
      </header>

      <main className={`explorer ${sidebarOpen ? 'sidebar-open' : ''}`}>
        <section className="stage" aria-labelledby="page-title">
          <div className="stage-caption" aria-hidden="true">
            <span>مختبر تشريحي تفاعلي</span>
            <strong>الجهاز العضلي</strong>
            <small>حرّك المجسّم واختر أي عضلة لاستكشافها</small>
          </div>
          <h1 id="page-title" className="sr-only">
            مستكشف الجهاز العضلي ثلاثي الأبعاد
          </h1>
          <Viewer
            selected={selected}
            hidden={hidden}
            onSelect={select}
            onReady={setReady}
            onFreeView={() => setView('Custom view')}
            controlsRef={controls}
          />
          <div className="scene-status">
            <span className={`status-dot ${ready ? '' : 'pending'}`} />
            {ready
              ? `${visibleCount} من ${structures.length} بنية ظاهرة`
              : 'المعلومات النصية متاحة دائماً'}
            {hidden.size > 0 && <button onClick={restore}>إظهار الكل</button>}
          </div>
          {current && (
            <div className="selection-chip">
              <span className="color-dot" style={{ background: current.color }} />
              <button className="selection-name" onClick={openAnatomy}>
                {muscleArabic[current.id]?.name ?? current.name}
              </button>
              {hidden.has(current.id) ? <EyeOff size={13} /> : <Check size={13} />}
              <button aria-label="إلغاء التحديد" onClick={() => setSelected(null)}>
                <X size={14} />
              </button>
            </div>
          )}
          {hidden.size === structures.length && (
            <div className="empty-scene">
              <Layers size={24} />
              <p>جميع التراكيب مخفية حالياً.</p>
              <button className="button" onClick={restore}>
                إظهار جميع التراكيب
              </button>
            </div>
          )}
          <div className="stage-bottom">
            <div className="camera-toolbar" aria-label="أدوات الكاميرا">
              <ViewMenu view={view} disabled={!ready} onChange={preset} />
              <div className="camera-actions" role="group" aria-label="التكبير وإعادة الضبط">
                <button
                  className="icon-button"
                  aria-label="تكبير"
                  title="تكبير"
                  disabled={!ready}
                  onClick={() => controls.current?.zoom(0.85)}
                >
                  <Plus size={17} />
                </button>
                <button
                  className="icon-button"
                  aria-label="تصغير"
                  title="تصغير"
                  disabled={!ready}
                  onClick={() => controls.current?.zoom(1.18)}
                >
                  <Minus size={17} />
                </button>
                <button
                  className="icon-button reset-button"
                  aria-label="إعادة ضبط المستكشف"
                  title="إعادة ضبط العرض والتحديد"
                  onClick={reset}
                >
                  <RotateCcw size={16} />
                </button>
              </div>
            </div>
            <p id="model-instructions" className="sr-only">
              اسحب بإصبع أو بالفأرة لتدوير الجسم، واستخدم عجلة الفأرة أو ضمّ إصبعين للتكبير والتصغير. اسحب بإصبعين للتحريك. اختر العضلات من القائمة لعرض شرحها.
            </p>
          </div>
        </section>

        <aside
          className="anatomy-panel"
          id="anatomy"
          hidden={!sidebarOpen}
          tabIndex={-1}
          ref={anatomyPanel}
          aria-label="التشريح والتعلم"
          onKeyDown={(event) => {
            if (event.key === 'Escape') {
              event.stopPropagation()
              closeAnatomy()
            }
          }}
        >
          <div className="panel-heading">
            <div>
              <h2>مستكشف العضلات</h2>
              <span className="count-tag">١٧٧ عضلة وبنية</span>
            </div>
            <button
              className="icon-button"
              aria-label="إغلاق لوحة التشريح"
              onClick={closeAnatomy}
            >
              <X size={18} />
            </button>
          </div>
          <div className="panel-tabs" role="tablist" aria-label="طريقة الاستكشاف">
            <button role="tab" aria-selected={panelTab === 'anatomy'} className={panelTab === 'anatomy' ? 'active' : ''} onClick={() => setPanelTab('anatomy')}>استكشف العضلات</button>
            <button role="tab" aria-selected={panelTab === 'chapter'} className={panelTab === 'chapter' ? 'active' : ''} onClick={() => setPanelTab('chapter')}>دروس الفصل</button>
          </div>
          {panelTab === 'anatomy' ? <>
          <AnatomyTree
            key={treeKey}
            data={anatomyTree}
            selectedId={selected}
            onSelectionChange={choose}
            visibility={visibilityFromHidden(hidden)}
            onVisibilityChange={changeVisibility}
            defaultExpandedIds={["group-shoulder", "group-upper-arm", "group-chest"]}
            label="العضلات"
            className="registry-tree"
          />

          <section
            className={`detail-card ${current ? 'has-selection' : ''}`}
            aria-label="تفاصيل العضلة"
          >
            {current ? (
              <>
                <div className="detail-eyebrow">
                  <span className="eyebrow">{groupArabic[current.group] ?? current.group}</span>
                  <span>{current.fma ?? 'عدة أجزاء تشريحية'}</span>
                </div>
                <h2>{currentArabic?.name ?? current.name}</h2>
                <p className="latin-name">{current.name}</p>
                <p>{currentArabic?.description ?? current.description}</p>
                <span className="source-note">شرح الوظيفة مترجم من قاعدة بيانات التشريح · الدروس الدراسية من كتاب الأحياء</span>
                <div className="detail-actions">
                  <button className="button primary" onClick={() => isolate(current.id)}>
                    <Focus size={15} />
                    اعزل العضلة
                  </button>
                  <button
                    className="button"
                    disabled={!ready || hidden.has(current.id)}
                    onClick={() => zoomTo(current.id)}
                  >
                    <Crosshair size={15} />
                    قرّب العرض
                  </button>
                  <button className="button" onClick={() => toggle(current.id)}>
                    {hidden.has(current.id) ? <Eye size={15} /> : <EyeOff size={15} />}
                    {hidden.has(current.id) ? 'إظهار العضلة' : 'إخفاء العضلة'}
                  </button>
                  {hidden.size > 0 && (
                    <button className="text-button restore-detail" onClick={restore}>
                      إظهار الكل
                    </button>
                  )}
                </div>
                <button className="text-button mobile-return" onClick={closeAnatomy}>
                  عرض العضلة ثلاثياً <ArrowUpRight size={14} />
                </button>
                <details className="model-note">
                  <summary>ملاحظات عن المجسّم والمصدر</summary>
                  <p>قد يجمع النموذج العضلات اليمنى واليسرى في اختيار واحد، كما تُبسّط بعض الأجزاء التشريحية. الألوان للتوضيح فقط.</p>
                  <p>الاسم الإنجليزي في قاعدة بيانات النموذج: {current.sourceName}{current.fma ? ` · ${current.fma}` : ''}.</p>
                  <a href={anatomySource} target="_blank" rel="noreferrer">
                    مرجع تشريحي · NCI SEER <ArrowUpRight size={12} />
                  </a>
                </details>
              </>
            ) : (
              <>
                <h2>اختر عضلة من المجسّم</h2>
                <p>اضغط على عضلة في الجسم أو اختر اسمها من قائمة المناطق لعرض شرحها.</p>
                <span className="small-note">
                  الألوان تميّز التراكيب، وهي ألوان توضيحية فقط.
                </span>
              </>
            )}
          </section>

          <section
            className={`tour-card ${step !== null ? 'tour-active' : ''}`}
            aria-label="جولة استكشافية"
          >
            {step === null ? (
              <>
                <div className="tour-icon">
                  <BookOpen size={18} />
                </div>
                <div>
                  <h3>جولة في العضلات</h3>
                  <p>{tour.length} محطات · حسب سرعتك</p>
                </div>
                <button
                  aria-label="ابدأ الجولة"
                  className="tour-start"
                  disabled={!ready}
                  onClick={() => goToStep(0)}
                >
                  <ArrowRight size={19} />
                </button>
              </>
            ) : (
              <>
                <div className="tour-top">
                  <span className="eyebrow">
                    جولة استكشافية · {step + 1} / {tour.length}
                  </span>
                  <button
                    className="icon-button"
                    aria-label="إنهاء الجولة"
                    onClick={endTour}
                  >
                    <X size={15} />
                  </button>
                </div>
                <div className="tour-progress">
                  {tour.map((_, i) => (
                    <span className={i <= step ? 'complete' : ''} key={i} />
                  ))}
                </div>
                <h3>{tour[step].title}</h3>
                <p>{tour[step].text}</p>
                <div className="tour-controls">
                  <button
                    className="text-button"
                    disabled={step === 0}
                    onClick={() => goToStep(step - 1)}
                  >
                    <ArrowLeft size={14} />
                    السابق
                  </button>
                  <button
                    className="text-button"
                    onClick={() => (step === tour.length - 1 ? endTour() : goToStep(step + 1))}
                  >
                    {step === tour.length - 1 ? 'إنهاء الجولة' : 'المحطة التالية'}
                    <ArrowRight size={14} />
                  </button>
                </div>
              </>
            )}
          </section>
          <p className="review-note">
            <span className="status-dot" />
            نموذج تعليمي · لا يغني عن الكتاب أو مراجعة المختص
          </p>
          </> : <ChapterGuide onExploreMuscle={(id) => { select(id); zoomTo(id) }} />}
        </aside>
      </main>

      <footer className="site-footer">
        <span>مختبر تعليمي تفاعلي</span>
        <span>
          النموذج:{' '}
          <a
            href="https://creativecommons.org/licenses/by-sa/2.1/jp/deed.en"
            target="_blank"
            rel="noreferrer"
          >
            BodyParts3D / DBCLS · CC BY-SA 2.1 JP <ArrowUpRight size={11} />
          </a>
        </span>
      </footer>
      <div className="sr-only" role="status" aria-live="polite" aria-atomic="true">
        {announcement}
      </div>

      <dialog
        ref={about}
        aria-labelledby="model-about-title"
        className="about-dialog"
        onClick={(e) => {
          if (e.target === e.currentTarget) about.current?.close()
        }}
      >
        <div className="dialog-top">
          <span className="eyebrow">عن المجسّم</span>
          <button
            className="icon-button"
            aria-label="إغلاق نافذة المعلومات"
            onClick={() => about.current?.close()}
            autoFocus
          >
            <X size={20} />
          </button>
        </div>
        <h2 id="model-about-title">
          تشريح ثلاثي الأبعاد
          <br />
          للتعلّم والاستكشاف.
        </h2>
        <p>
          هذا المستكشف التعليمي يستخدم نموذجاً تشريحياً مبنياً على مجموعة بيانات BodyParts3D 3.0.
        </p>
        <h3>ماذا يعرض المجسّم؟</h3>
        <p>
          يحتوي على ١٧٧ عضلة وبنية وترية موزّعة على ١٥ منطقة من الجسم. قد تُعرض العضلات اليمنى واليسرى معاً، وقد تُجمع بعض الرؤوس والأجزاء في اختيار واحد. العظام والأربطة ومعظم الأوتار غير معروضة، وقد تغيب بعض العضلات العميقة أو الصغيرة. المجسّم مبسّط والألوان توضيحية، كما أنه نموذج مرجعي لرجل بالغ وليس تمثيلاً كاملاً لكل الأجسام.
        </p>
        <h3>حدود النموذج</h3>
        <p>
          هذا نموذج تعليمي للاستكشاف، ولم تكتمل مراجعته من خبير تشريح سريري. لا يُستخدم للتشخيص أو اتخاذ قرارات طبية. ارجع إلى كتاب الأحياء عند الدراسة للامتحان.
        </p>
        <h3>المصدر والترخيص</h3>
        <p>
          BodyParts3D، حقوق النشر لمركز قواعد بيانات علوم الحياة (DBCLS)، بموجب ترخيص المشاع الإبداعي: النسب إلى المصنّف – المشاركة بالمثل 2.1 اليابان (CC BY-SA 2.1 Japan).
        </p>
        <p>
          عدّل مشروع OrganUI النموذج باختيار ودمج بعض المجسّمات وتبسيط هندستها وتحويلها إلى GLB؛ ويُشارك النموذج المشتق بالترخيص نفسه:{' '}
          <a
            href="https://creativecommons.org/licenses/by-sa/2.1/jp/deed.en"
            target="_blank"
            rel="noreferrer"
          >
            CC BY-SA 2.1 JP
          </a>
          . أما كود التطبيق الأصلي فمرخّص MIT.
        </p>
        <p className="small-note">
          المجسّم مشتق من بيانات BodyParts3D 3.0. يجب الإبقاء على نسب المصدر والترخيص وإشعار التعديلات عند إعادة توزيع النموذج.
        </p>
        <a
          className="button primary"
          href="https://github.com/organui/muscles-3d"
          target="_blank"
          rel="noreferrer"
        >
          استعرض المشروع الأصلي <ArrowUpRight size={15} />
        </a>
      </dialog>
    </>
  )
}
