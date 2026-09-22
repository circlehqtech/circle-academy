import { useMemo, useState } from 'react';
import { Icon } from '../components/Icon';
import { View } from '../components/View';
import { useToast } from '../contexts/ToastContext';
import { art, artTone, button, buttonGhost, buttonGhostSmall, buttonSmall, card, fieldLabel, heading, muted, progressBar, selectInput, table, tableWrap, tag, textInput, tile, tileBody, tiles } from '../styles';

interface AdminCoursesProps {
  createdCourses: string[];
  onCreate: () => void;
  onEdit: (title: string) => void;
}

const catalogue = [
  { title: 'Advanced React Patterns', code: 'ARP-07', status: 'Published', students: 24, modules: 5, progress: 68, tone: 'a1', glyph: 'Re' },
  { title: 'TypeScript for Product Teams', code: 'TSP-07', status: 'Published', students: 19, modules: 6, progress: 42, tone: 'a2', glyph: 'Ts' },
  { title: 'Design Systems with Tailwind', code: 'DST-06', status: 'Archived', students: 31, modules: 4, progress: 100, tone: 'a3', glyph: 'Ds' },
  { title: 'Product Discovery Sprint', code: 'PDS-D1', status: 'Draft', students: 0, modules: 2, progress: 0, tone: 'a2', glyph: 'Pd' },
];

export function AdminCourses({ createdCourses, onCreate, onEdit }: AdminCoursesProps) {
  const { toast } = useToast();
  const [query, setQuery] = useState('');
  const [view, setView] = useState<'table' | 'cards'>('table');
  const courses = useMemo(() => [...catalogue, ...createdCourses.map((title, index) => ({ title, code: `NEW-0${index + 1}`, status: 'Draft', students: 0, modules: 1, progress: 0, tone: 'a1', glyph: title.slice(0, 2) }))].filter((course) => course.title.toLowerCase().includes(query.toLowerCase())), [createdCourses, query]);

  return <View>
    <div className="mb-6 flex flex-wrap items-center justify-between gap-4"><p className="max-w-[62ch] text-muted">Create, arrange, publish, and independently configure every Academy course without developer changes.</p><button className={button} type="button" onClick={onCreate}><Icon name="plus" />Create course</button></div>
    <div className="mb-5 flex flex-wrap items-center gap-3"><label className="relative min-w-[240px] flex-1"><Icon name="search" className="absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-muted" /><input className={`${textInput} w-full pl-10`} placeholder="Search courses or codes" value={query} onChange={(e) => setQuery(e.target.value)} /></label><select className={`${selectInput} w-auto min-w-[150px]`}><option>All statuses</option><option>Published</option><option>Draft</option><option>Archived</option></select><div className="flex rounded-xl bg-surface-2 p-1"><button className="rounded-lg px-3 py-2 text-sm font-semibold aria-pressed:bg-background" type="button" aria-pressed={view === 'table'} onClick={() => setView('table')}>List</button><button className="rounded-lg px-3 py-2 text-sm font-semibold aria-pressed:bg-background" type="button" aria-pressed={view === 'cards'} onClick={() => setView('cards')}>Cards</button></div></div>

    {view === 'table' ? <div className={tableWrap}><table className={table}><thead><tr><th>Course</th><th>Status</th><th>Structure</th><th>Students</th><th>Average progress</th><th><span className="sr-only">Actions</span></th></tr></thead><tbody>{courses.map((course) => <tr key={course.code}><td><b className="block">{course.title}</b><span className="text-xs text-muted">{course.code}</span></td><td><CourseStatus status={course.status} /></td><td>{course.modules} modules</td><td>{course.students}</td><td><div className="flex items-center gap-3"><span className="w-9 text-sm font-semibold">{course.progress}%</span><span className={`${progressBar} w-24`} style={{ '--p': course.progress } as React.CSSProperties}><i /></span></div></td><td><div className="flex justify-end gap-2"><button className={buttonGhostSmall} type="button" onClick={() => onEdit(course.title)}>Edit</button><button className="grid size-9 place-items-center rounded-full hover:bg-surface-2" type="button" aria-label={`More actions for ${course.title}`} onClick={() => toast('Course actions opened.')}><Icon name="more" /></button></div></td></tr>)}</tbody></table></div> :
      <div className={tiles}>{courses.map((course) => <button key={course.code} className={tile} type="button" onClick={() => onEdit(course.title)}><span className={`${art} ${artTone[course.tone]}`}>{course.glyph}<span className={tag}>{course.status}</span></span><span className={tileBody}><b>{course.title}</b><span>{course.modules} modules · {course.students} students</span><span className={progressBar} style={{ '--p': course.progress } as React.CSSProperties}><i /></span></span></button>)}</div>}
  </View>;
}

function CourseStatus({ status }: { status: string }) {
  const tone = status === 'Published' ? 'bg-reward text-hq-ink' : status === 'Draft' ? 'bg-surface-2 text-muted' : 'bg-hq-red-ink text-hq-bone';
  return <span className={`rounded-[99px] px-2.5 py-1 text-xs font-semibold ${tone}`}>{status}</span>;
}

type BuilderStep = 'basics' | 'curriculum' | 'assessment' | 'delivery' | 'completion' | 'review';
interface BuilderModule { id: number; title: string; lessons: { id: number; title: string; type: string }[] }

const steps: { id: BuilderStep; label: string; hint: string }[] = [
  { id: 'basics', label: 'Basics', hint: 'Identity and overview' }, { id: 'curriculum', label: 'Curriculum', hint: 'Modules and lessons' }, { id: 'assessment', label: 'Assessments', hint: 'Tests and project' }, { id: 'delivery', label: 'Delivery', hint: 'Cohort and classes' }, { id: 'completion', label: 'Completion', hint: 'Rules and certificate' }, { id: 'review', label: 'Review', hint: 'Check and publish' },
];

export function CourseBuilder({ initialTitle = '', onBack, onPublish }: { initialTitle?: string; onBack: () => void; onPublish: (title: string) => void }) {
  const { toast } = useToast();
  const [stepIndex, setStepIndex] = useState(0);
  const [title, setTitle] = useState(initialTitle);
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('Engineering');
  const [modules, setModules] = useState<BuilderModule[]>([{ id: 1, title: 'Foundations', lessons: [{ id: 1, title: 'Welcome and course orientation', type: 'Video' }, { id: 2, title: 'Core concepts', type: 'Text + PDF' }] }]);
  const [passingScore, setPassingScore] = useState(80);
  const [finalProject, setFinalProject] = useState(true);
  const [published, setPublished] = useState(false);
  const current = steps[stepIndex];

  const next = () => {
    if (current.id === 'basics' && title.trim().length < 3) { toast('Add a clear course title before continuing.'); return; }
    setStepIndex((index) => Math.min(steps.length - 1, index + 1));
    window.scrollTo(0, 0);
  };
  const addModule = () => setModules((list) => [...list, { id: Date.now(), title: `Module ${list.length + 1}`, lessons: [] }]);
  const addLesson = (moduleId: number) => setModules((list) => list.map((module) => module.id === moduleId ? { ...module, lessons: [...module.lessons, { id: Date.now(), title: 'Untitled lesson', type: 'Video' }] } : module));

  return <View>
    <button className="mb-5 inline-flex items-center gap-1.5 font-semibold text-muted hover:text-foreground" type="button" onClick={onBack}><Icon name="back" />All courses</button>
    <div className="grid gap-8 min-[1021px]:grid-cols-[240px_minmax(0,1fr)]">
      <aside><ol className="grid gap-1">{steps.map((item, index) => <li key={item.id}><button className={`flex w-full items-start gap-3 rounded-xl p-3 text-left ${index === stepIndex ? 'bg-foreground text-background' : index < stepIndex ? 'text-foreground' : 'text-muted'}`} type="button" onClick={() => setStepIndex(index)}><span className={`grid size-7 shrink-0 place-items-center rounded-full border text-xs font-bold ${index < stepIndex ? 'border-reward bg-reward text-hq-ink' : 'border-current'}`}>{index < stepIndex ? <Icon name="check" className="size-3.5" /> : index + 1}</span><span><b className="block text-sm">{item.label}</b><span className="text-xs opacity-70">{item.hint}</span></span></button></li>)}</ol><div className={`${card} mt-5 p-4`}><p className="text-xs font-semibold text-muted">DRAFT STATUS</p><p className="mt-1 text-sm">Changes save automatically in this prototype.</p><button className="mt-3 text-sm font-semibold text-accent-text" type="button" onClick={() => toast('Draft saved.')}>Save and exit</button></div></aside>

      <section className="min-w-0">
        <div className="mb-6"><p className="text-sm font-semibold text-accent-text">STEP {stepIndex + 1} OF {steps.length}</p><h2 className="mt-1 text-2xl font-[700]">{current.label}</h2><p className={muted}>{current.hint}</p></div>

        {current.id === 'basics' && <div className="grid gap-5">
          <div><label className={fieldLabel} htmlFor="course-title">Course title</label><input id="course-title" className={`${textInput} w-full`} placeholder="e.g. Product Design Foundations" value={title} onChange={(e) => setTitle(e.target.value)} /></div>
          <div><label className={fieldLabel} htmlFor="course-description">Course description</label><textarea id="course-description" className="min-h-32 w-full rounded-2xl border-[1.5px] border-line bg-surface p-4 outline-none focus:border-accent" placeholder="What will students learn and who is this for?" value={description} onChange={(e) => setDescription(e.target.value)} /></div>
          <div className="grid gap-5 sm:grid-cols-2"><div><label className={fieldLabel}>Category</label><select className={selectInput} value={category} onChange={(e) => setCategory(e.target.value)}><option>Engineering</option><option>Product</option><option>Design</option><option>Leadership</option><option>Business</option></select></div><div><label className={fieldLabel}>Difficulty</label><select className={selectInput}><option>Beginner</option><option>Intermediate</option><option>Advanced</option></select></div></div>
          <div className="grid gap-5 sm:grid-cols-3"><div><label className={fieldLabel}>Estimated duration</label><input className={`${textInput} w-full`} placeholder="6 weeks" /></div><div><label className={fieldLabel}>Course code</label><input className={`${textInput} w-full`} placeholder="PDF-08" /></div><div><label className={fieldLabel}>Language</label><select className={selectInput}><option>English</option><option>French</option></select></div></div>
          <button type="button" className="grid min-h-40 place-items-center rounded-[18px] border-2 border-dashed border-line p-6 text-center hover:border-accent" onClick={() => toast('Cover image selected.')}><span><Icon name="upload" className="mx-auto mb-2 size-7 text-accent-text" /><b className="block">Upload course cover</b><span className="text-sm text-muted">PNG or JPG, ideally 1600 × 900</span></span></button>
        </div>}

        {current.id === 'curriculum' && <div>
          <div className="mb-5 flex flex-wrap items-center justify-between gap-3"><p className="max-w-[58ch] text-sm text-muted">Arrange modules, then add lessons, resources, recordings, links, and downloadable files.</p><button className={buttonSmall} type="button" onClick={addModule}><Icon name="plus" />Add module</button></div>
          <div className="grid gap-4">{modules.map((module, moduleIndex) => <div key={module.id} className={card}><div className="flex items-center gap-3"><Icon name="grip" className="text-muted" /><span className="grid size-7 place-items-center rounded-full bg-surface-2 text-xs font-bold">{moduleIndex + 1}</span><input className="min-w-0 flex-1 bg-transparent text-lg font-[650] outline-none" value={module.title} onChange={(e) => setModules((list) => list.map((entry) => entry.id === module.id ? { ...entry, title: e.target.value } : entry))} aria-label={`Module ${moduleIndex + 1} title`} /><button className="grid size-8 place-items-center rounded-full text-muted hover:bg-surface-2 hover:text-accent-text" type="button" onClick={() => setModules((list) => list.filter((entry) => entry.id !== module.id))}><Icon name="trash" className="size-4" /></button></div><div className="mt-4 grid gap-2">{module.lessons.map((lesson, lessonIndex) => <div key={lesson.id} className="grid items-center gap-2 rounded-xl border border-line p-3 sm:grid-cols-[auto_1fr_150px_auto]"><Icon name="grip" className="hidden size-4 text-muted sm:block" /><input className="min-w-0 bg-transparent font-semibold outline-none" value={lesson.title} onChange={(e) => setModules((list) => list.map((entry) => entry.id === module.id ? { ...entry, lessons: entry.lessons.map((item) => item.id === lesson.id ? { ...item, title: e.target.value } : item) } : entry))} aria-label={`Lesson ${lessonIndex + 1} title`} /><select className="rounded-lg border border-line bg-background px-2 py-1.5 text-sm" value={lesson.type} onChange={(e) => setModules((list) => list.map((entry) => entry.id === module.id ? { ...entry, lessons: entry.lessons.map((item) => item.id === lesson.id ? { ...item, type: e.target.value } : item) } : entry))}><option>Video</option><option>Audio</option><option>Text</option><option>PDF</option><option>External link</option><option>Class recording</option></select><button className="grid size-8 place-items-center text-muted" type="button" onClick={() => setModules((list) => list.map((entry) => entry.id === module.id ? { ...entry, lessons: entry.lessons.filter((item) => item.id !== lesson.id) } : entry))}><Icon name="trash" className="size-4" /></button></div>)}</div><button className="mt-3 inline-flex items-center gap-2 text-sm font-semibold text-accent-text" type="button" onClick={() => addLesson(module.id)}><Icon name="plus" className="size-4" />Add lesson or resource</button></div>)}</div>
        </div>}

        {current.id === 'assessment' && <div className="grid gap-5">
          <section className={card}><div className="flex items-start justify-between gap-4"><div><h3 className={heading}>Module checkpoint</h3><p className="text-sm text-muted">Multiple-choice, true/false, and written questions are supported.</p></div><label className="flex items-center gap-2 text-sm font-semibold"><input type="checkbox" defaultChecked className="accent-[var(--accent)]" />Required</label></div><div className="mt-5 grid gap-4 sm:grid-cols-3"><div><label className={fieldLabel}>Passing score</label><div className="relative"><input className={`${textInput} w-full pr-8`} type="number" min={0} max={100} value={passingScore} onChange={(e) => setPassingScore(Number(e.target.value))} /><span className="absolute top-1/2 right-3 -translate-y-1/2 text-muted">%</span></div></div><div><label className={fieldLabel}>Attempts</label><select className={selectInput}><option>Unlimited</option><option>3 attempts</option><option>1 attempt</option></select></div><div><label className={fieldLabel}>Question order</label><select className={selectInput}><option>Shuffle</option><option>Fixed</option></select></div></div><button className={`${buttonGhostSmall} mt-4`} type="button" onClick={() => toast('Question editor opened with three question types.')}>Edit 10 questions</button></section>
          <section className={card}><div className="flex items-start justify-between gap-4"><div><h3 className={heading}>Assignment</h3><p className="text-sm text-muted">Collect files, written responses, or project links for facilitator review.</p></div><input type="checkbox" defaultChecked className="mt-1 accent-[var(--accent)]" /></div><div className="mt-4"><label className={fieldLabel}>Assignment title</label><input className={`${textInput} w-full`} defaultValue="Apply the module in a working project" /></div></section>
          <section className={card}><div className="flex items-start justify-between gap-4"><div><h3 className={heading}>Final project</h3><p className="text-sm text-muted">A final submission reviewed and approved before completion.</p></div><input type="checkbox" checked={finalProject} onChange={(e) => setFinalProject(e.target.checked)} className="mt-1 accent-[var(--accent)]" /></div>{finalProject && <div className="mt-4 grid gap-4"><div><label className={fieldLabel}>Project title</label><input className={`${textInput} w-full`} defaultValue="Capstone project" /></div><div><label className={fieldLabel}>Project brief</label><textarea className="min-h-24 w-full rounded-2xl border-[1.5px] border-line bg-background p-4 outline-none focus:border-accent" placeholder="Describe the final outcome and evaluation criteria." /></div></div>}</section>
        </div>}

        {current.id === 'delivery' && <div className="grid gap-5">
          <div className="grid gap-5 sm:grid-cols-2"><div><label className={fieldLabel}>Assign cohort</label><select className={selectInput}><option>Cohort 8 · October 2026</option><option>Cohort 7 · September 2026</option><option>Self-paced</option></select></div><div><label className={fieldLabel}>Lead facilitator</label><select className={selectInput}><option>Kemi Adeyemi</option><option>Dr. Amaka Obi</option><option>Assign later</option></select></div></div>
          <section className={card}><div className="flex items-center justify-between gap-4"><div><h3 className={heading}>Live class schedule</h3><p className="text-sm text-muted">Students see the Zoom link only at the appropriate time.</p></div><button className={buttonSmall} type="button" onClick={() => toast('Another class slot added.')}><Icon name="plus" />Add class</button></div><div className="mt-4 grid gap-4 sm:grid-cols-3"><div><label className={fieldLabel}>First class</label><input className={`${textInput} w-full`} type="date" defaultValue="2026-10-05" /></div><div><label className={fieldLabel}>Time</label><input className={`${textInput} w-full`} type="time" defaultValue="16:00" /></div><div><label className={fieldLabel}>Repeats</label><select className={selectInput}><option>Weekly, 6 sessions</option><option>One time</option></select></div></div><div className="mt-4"><label className={fieldLabel}>Zoom meeting URL</label><input className={`${textInput} w-full`} type="url" placeholder="https://zoom.us/j/…" /></div></section>
          <section className={card}><h3 className={heading}>Enrolment</h3><div className="grid gap-4 sm:grid-cols-2"><div><label className={fieldLabel}>Opens</label><input className={`${textInput} w-full`} type="date" defaultValue="2026-09-22" /></div><div><label className={fieldLabel}>Closes</label><input className={`${textInput} w-full`} type="date" defaultValue="2026-10-03" /></div></div><label className="mt-4 flex items-center gap-3 text-sm"><input type="checkbox" defaultChecked className="accent-[var(--accent)]" />Allow admins to enrol students after the deadline.</label></section>
        </div>}

        {current.id === 'completion' && <div className="grid gap-5">
          <section className={card}><h3 className={heading}>Progression rules</h3><div className="grid gap-3">{['Complete each lesson before continuing', 'Complete the previous module before unlocking the next', `Pass every checkpoint with at least ${passingScore}%`, 'Receive facilitator approval for assignments', 'Receive facilitator approval for the final project'].map((rule, index) => <label key={rule} className="flex items-start gap-3"><input type="checkbox" className="mt-1 accent-[var(--accent)]" defaultChecked={index < 3 || finalProject} /><span>{rule}</span></label>)}</div></section>
          <section className={card}><h3 className={heading}>Certificate eligibility</h3><label className="flex items-start gap-3"><input type="checkbox" defaultChecked className="mt-1 accent-[var(--accent)]" /><span><b className="block">Issue a Circle HQ Academy certificate</b><span className="text-sm text-muted">Available only after every required condition is satisfied.</span></span></label><div className="mt-5 grid gap-4 sm:grid-cols-2"><div><label className={fieldLabel}>Certificate template</label><select className={selectInput}><option>Academy standard · Landscape</option><option>Professional programme</option></select></div><div><label className={fieldLabel}>Certificate signatory</label><select className={selectInput}><option>Dr. Amaka Obi</option><option>Programme facilitator</option></select></div></div></section>
        </div>}

        {current.id === 'review' && <div className="grid gap-5">
          <div className="rounded-[22px] bg-hq-red p-7 text-white"><span className="text-sm font-semibold text-white/75">COURSE PREVIEW</span><h2 className="mt-3 text-3xl font-[750]">{title || 'Untitled course'}</h2><p className="mt-2 max-w-[56ch] text-white/80">{description || 'Add a description so students understand the outcome of this course.'}</p><div className="mt-5 flex flex-wrap gap-2 text-xs font-semibold">{[category, `${modules.length} modules`, `${passingScore}% passing score`, finalProject ? 'Final project required' : 'No final project'].map((item) => <span key={item} className="rounded-[99px] bg-black/20 px-3 py-1.5">{item}</span>)}</div></div>
          <section className={card}><h3 className={heading}>Pre-publish check</h3><div className="grid gap-3">{[['Course details', title.trim().length > 2], ['At least one module', modules.length > 0], ['Lessons added', modules.some((module) => module.lessons.length > 0)], ['Completion rules configured', true], ['Facilitator and cohort selected', true], ['Certificate eligibility set', true]].map(([label, ok]) => <div key={String(label)} className="flex items-center justify-between gap-3 border-t border-line py-2 first:border-t-0"><span>{String(label)}</span><span className={`inline-flex items-center gap-1 text-sm font-semibold ${ok ? 'text-foreground' : 'text-accent-text'}`}><Icon name={ok ? 'check' : 'help'} className="size-4" />{ok ? 'Ready' : 'Needs attention'}</span></div>)}</div></section>
          <div className="flex flex-wrap gap-3"><button className={button} type="button" disabled={published} onClick={() => { setPublished(true); onPublish(title || 'Untitled course'); toast('Course published and enrolment is ready.'); }}><Icon name="graduate" />{published ? 'Published' : 'Publish course'}</button><button className={buttonGhost} type="button" onClick={() => toast('Student preview opened in a new prototype state.')}>Preview as student</button></div>
        </div>}

        <div className="mt-8 flex items-center justify-between gap-3 border-t border-line pt-5"><button className={buttonGhost} type="button" disabled={stepIndex === 0} onClick={() => setStepIndex((index) => Math.max(0, index - 1))}>Back</button>{stepIndex < steps.length - 1 && <button className={button} type="button" onClick={next}>Save and continue<Icon name="next" /></button>}</div>
      </section>
    </div>
  </View>;
}
