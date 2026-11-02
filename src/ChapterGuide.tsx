import { useState } from 'react'

type Props = { onExploreMuscle: (id: string) => void }
type Lesson = 'types' | 'movement' | 'health'

const typeCards = [
  {
    id: 'skeletal', icon: '01', title: 'العضلات الهيكلية', tag: 'إرادية', color: 'coral',
    detail: 'ترتبط بالهيكل العظمي، وتحرك الجسم كله أو أجزاء منه مثل الذراعين. نستطيع التحكم بحركتها بإرادتنا.',
    structure: 'ألياف طويلة أسطوانية ومخططة، تحتوي عدة أنوية، وقد يصل طول الليفة إلى ١٣٠ ملم. تتجمع الألياف في حزم تكوّن العضلة.',
    place: 'عضلات الذراعين والساقين',
  },
  {
    id: 'smooth', icon: '02', title: 'العضلات الملساء', tag: 'لا إرادية', color: 'teal',
    detail: 'توجد في جدران القناة الهضمية وأعضاء الجسم الداخلية، وتعمل من دون تحكم إرادي مباشر.',
    structure: 'خلايا مغزلية طويلة، غير مخططة، ولكل خلية نواة بيضوية واحدة في الوسط.',
    place: 'المعدة والأمعاء والأوعية الدموية',
  },
  {
    id: 'cardiac', icon: '03', title: 'العضلة القلبية', tag: 'لا إرادية', color: 'violet',
    detail: 'تكوّن جدار القلب، وتعمل بصورة لا إرادية للمحافظة على ضخ الدم.',
    structure: 'ألياف حمراء مخططة ومتفرعة، وتحتوي نواة واحدة أو أكثر، وتظهر بينها أقراص بينية.',
    place: 'جدار القلب فقط',
  },
]

export default function ChapterGuide({ onExploreMuscle }: Props) {
  const [lesson, setLesson] = useState<Lesson>('types')
  const [motion, setMotion] = useState<'flex' | 'extend'>('flex')

  return (
    <div className="chapter-guide" dir="rtl">
      <header className="chapter-hero">
        <div className="chapter-kicker"><span /> أحياء · الثالث المتوسط · الفصل الثالث</div>
        <h2>الجهاز العضلي</h2>
        <p>تعرّف إلى أنواع العضلات، وشاهد كيف تتعاون لإحداث الحركة، ثم استكشف أمثلة حقيقية على النموذج ثلاثي الأبعاد.</p>
        <div className="chapter-stats"><span><b>03</b> أنواع رئيسية</span><span><b>3D</b> تشريح تفاعلي</span><span><b>01</b> فصل دراسي</span></div>
      </header>

      <nav className="chapter-tabs" aria-label="موضوعات الفصل">
        <button className={lesson === 'types' ? 'active' : ''} onClick={() => setLesson('types')}>أنواع العضلات</button>
        <button className={lesson === 'movement' ? 'active' : ''} onClick={() => setLesson('movement')}>آلية الحركة</button>
        <button className={lesson === 'health' ? 'active' : ''} onClick={() => setLesson('health')}>صحة العضلات</button>
      </nav>

      {lesson === 'types' && (
        <section className="lesson-content">
          <div className="lesson-heading"><span>01 / التصنيف</span><h3>ثلاثة أنواع، ووظائف مختلفة</h3><p>اضغط على كل بطاقة لقراءة تركيب العضلة ومكان وجودها.</p><small className="chapter-ref">كتاب الأحياء · الصفحات ٣٢–٣٣</small></div>
          <div className="type-grid">
            {typeCards.map((item) => (
              <article className={`type-card ${item.color}`} key={item.id}>
                <div className="type-top"><span className="type-index">{item.icon}</span><span className="type-tag">{item.tag}</span></div>
                <h4>{item.title}</h4>
                <p>{item.detail}</p>
                <div className="type-fact"><span>التركيب</span>{item.structure}</div>
                <div className="type-fact"><span>مكان وجودها</span>{item.place}</div>
                <div className="type-shape" aria-hidden="true">
                  {item.id === 'skeletal' ? <svg viewBox="0 0 150 38"><path d="M6 10 Q20 3 35 10 L115 10 Q130 3 144 10 L144 28 Q130 35 115 28 L35 28 Q20 35 6 28Z"/><path d="M22 10V28 M37 10V28 M52 10V28 M67 10V28 M82 10V28 M97 10V28 M112 10V28 M127 10V28"/></svg> : item.id === 'smooth' ? <svg viewBox="0 0 150 38"><path d="M5 19 Q27 -2 75 19 Q123 40 145 19 Q123 -2 75 19 Q27 40 5 19Z"/><ellipse cx="75" cy="19" rx="7" ry="3"/></svg> : <svg viewBox="0 0 150 38"><path d="M75 35V18 M75 18L38 4 M75 18L112 4 M75 18L49 34 M75 18L101 34"/><path d="M38 4L30 2 M112 4L120 2"/></svg>}
                </div>
              </article>
            ))}
          </div>
          <div className="chapter-note"><b>تذكّر:</b> العضلات الهيكلية إرادية، أما العضلات الملساء والقلبية فتعملان لا إرادياً.</div>
          <div className="lesson-heading compact"><span>من الكتاب</span><h3>تركيب العضلة الهيكلية</h3></div>
          <div className="structure-flow"><div>ألياف عضلية</div><i>←</i><div>حزم من الألياف</div><i>←</i><div>عضلة كاملة</div></div>
        </section>
      )}

      {lesson === 'movement' && (
        <section className="lesson-content">
          <div className="lesson-heading"><span>02 / الحركة</span><h3>العضلات تعمل في أزواج</h3><p>عند ثني المرفق تنقبض العضلة ذات الرأسين، وعند بسطه تنقبض العضلة ثلاثية الرؤوس.</p><small className="chapter-ref">كتاب الأحياء · الصفحات ٣٤–٣٥</small></div>
          <div className="movement-demo">
            <div className="motion-toggle"><button className={motion === 'flex' ? 'active' : ''} onClick={() => setMotion('flex')}>ثني المرفق</button><button className={motion === 'extend' ? 'active' : ''} onClick={() => setMotion('extend')}>بسط المرفق</button></div>
            <svg className={`arm-diagram ${motion}`} viewBox="0 0 280 180" role="img" aria-label={motion === 'flex' ? 'رسم توضيحي لثني المرفق' : 'رسم توضيحي لبسط المرفق'}>
              <path className="arm-upper" d="M104 18 C112 42 117 63 122 86" />
              <path className="arm-fore" d={motion === 'flex' ? 'M122 86 Q170 65 210 35' : 'M122 86 Q145 120 174 153'} />
              <circle className="elbow" cx="122" cy="86" r="10" />
              <path className="arm-joint" d="M102 18 Q105 40 122 86" />
              <path className="motion-arrow" d={motion === 'flex' ? 'M195 66 Q220 49 208 24' : 'M149 120 Q174 146 207 128'} />
              <text x="22" y="165">رسم مبسّط للمفصل</text>
            </svg>
            <div className="motion-result">
              <span className="motion-label">{motion === 'flex' ? 'عند الثني' : 'عند البسط'}</span>
              <h4>{motion === 'flex' ? 'تنقبض ذات الرأسين العضدية' : 'تنقبض ثلاثية الرؤوس العضدية'}</h4>
              <p>{motion === 'flex' ? 'تقرب الساعد من العضد، بينما ترتخي العضلة المقابلة.' : 'تُبعد الساعد عن العضد وتعيد المرفق إلى وضع الاستقامة.'}</p>
              <button className="explore-muscle" onClick={() => onExploreMuscle(motion === 'flex' ? 'biceps-brachii' : 'triceps-brachii')}>شاهد العضلة على المجسّم ثلاثي الأبعاد <span>←</span></button>
            </div>
          </div>
          <div className="example-list">
            <h4>أمثلة أخرى وردت في الفصل</h4>
            <button onClick={() => onExploreMuscle('deltoid')}><b>الدالية</b><span>تُبعد الذراع عن خط منتصف الجسم</span><span>استكشف ←</span></button>
            <button onClick={() => onExploreMuscle('pectoralis-major')}><b>الصدرية الكبرى</b><span>تُقرّب الذراع نحو خط منتصف الجسم</span><span>استكشف ←</span></button>
            <button onClick={() => onExploreMuscle('rectus-femoris')}><b>المستقيمة الفخذية</b><span>جزء من رباعية الفخذ، وتساعد على بسط الساق</span><span>استكشف ←</span></button>
          </div>
          <div className="chapter-note"><b>مبدأ الرافعة:</b> يوضح الكتاب أن حركة الجسم تنتج من تعاون العضلات مع الهيكل العظمي وفق مبدأ الرافعة.</div>
          <div className="nerve-chain"><h4>كيف تصل إشارة الحركة إلى العضلة؟</h4><div className="nerve-steps"><span>الدماغ</span><i>←</i><span>النخاع الشوكي</span><i>←</i><span>الأعصاب الطرفية</span><i>←</i><span>الوصلة العصبية العضلية</span><i>←</i><span className="last">انقباض أو انبساط</span></div><p>وفق تسلسل الكتاب، تنتقل إشارة الحركة عبر الجهاز العصبي حتى تصل إلى العضلة فتستجيب لها.</p></div>
        </section>
      )}

      {lesson === 'health' && (
        <section className="lesson-content">
          <div className="lesson-heading"><span>03 / الصحة</span><h3>حافظ على سلامة العضلات</h3><p>يعرض الكتاب حالات صحية مرتبطة بموضوع الفصل وطرقاً عامة للوقاية.</p><small className="chapter-ref">كتاب الأحياء · الصفحات ٣٦–٣٩</small></div>
          <article className="health-card"><div className="health-number">01</div><div><h4>الإعياء العضلي</h4><p>تحتاج العضلة إلى الأوكسجين والغلوكوز لإنتاج الطاقة. ويذكر الكتاب أن نقص الأوكسجين والطاقة أو الراحة قد يؤدي إلى الإعياء، ويربط تفسيره بتراكم حامض اللاكتيك.</p><div className="health-tags"><span>زيادة نبض القلب</span><span>ارتفاع الحرارة</span><span>تعب شديد</span><span>تعرّق</span><span>قلة التركيز</span></div><small>ملاحظة دراسية: هذا تلخيص لتفسير الكتاب كما ورد في الفصل.</small></div></article>
          <article className="health-card"><div className="health-number">02</div><div><h4>ضمور العضلات</h4><p>ضعف العضلة وتناقص نسيجها تدريجياً، وقد يرتبط بقلة الحركة مدة طويلة. ومن العلامات المذكورة في الكتاب صعوبة الوقوف أو المشي مع الألم أو التيبّس.</p><h5>مما يؤكد عليه الكتاب</h5><ul><li>تجنب الجلوس وقلة الحركة لفترات طويلة.</li><li>ممارسة النشاط البدني الملائم.</li><li>اتباع العلاج الطبيعي وتوجيهات المختص عند الحاجة.</li></ul></div></article>
          <article className="health-card context-note"><div className="health-number">03</div><div><h4>فقرة سرطان الثدي في الكتاب</h4><p>أدرج الكتاب هذه الفقرة ضمن موضوع أمراض الفصل وشرح أنها ترتبط بانقسام غير طبيعي للخلايا في أنسجة الثدي.</p><div className="fact-check"><b>توضيح علمي:</b> سرطان الثدي ينشأ في أنسجة الثدي، وليس مرضاً في العضلات الهيكلية. أُبقيت الفقرة هنا احتراماً لترتيب الكتاب مع بيان هذا الفرق.</div><a href="https://www.cancer.gov/publications/dictionaries/cancer-terms/def/breast-cancer" target="_blank" rel="noreferrer">مصدر طبي للتوضيح ←</a></div></article>
          <div className="chapter-note"><b>الفكرة الأساسية:</b> الحركة المنتظمة والراحة المناسبة تساعدان على المحافظة على كفاءة العضلات.</div>
        </section>
      )}
    </div>
  )
}
