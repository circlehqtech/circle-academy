import { useMemo, useRef, useState } from 'react';
import { lmsApi } from '../api/lmsApi';
import { asRecord, collection, extractId, unwrap } from '../api/adapters';
import { Icon } from '../components/Icon';
import { CustomSelect } from '../components/ui/CustomSelect';
import { Modal } from '../components/ui/Modal';
import { View } from '../components/View';
import { PageHeader } from '../components/ui/PageHeader';
import { useToast } from '../contexts/ToastContext';
import { createEntityId } from '../utils/id';
import { EmptyState } from '../components/ui/EmptyState';
import type { CohortRecord, CourseInput, FacilitatorRecord, ManagedCourse, ManagedModule, ManagedResource } from '../types/workspace';
import { art, artTone, button, buttonGhost, buttonGhostSmall, buttonSmall, card, fieldLabel, heading, muted, progressBar, selectInput, table, tableWrap, tag, textInput, tile, tileBody, tiles } from '../styles';

interface AdminCoursesProps {
  courses: ManagedCourse[];
  onCreate: () => void;
  onEdit: (courseId: string) => void;
  onDuplicate: (courseId: string) => void;
  onArchive: (courseId: string) => void;
}

export function AdminCourses({ courses, onCreate, onEdit, onDuplicate, onArchive }: AdminCoursesProps) {
  const { toast } = useToast();
  const [query, setQuery] = useState('');
  const [view, setView] = useState<'table' | 'cards'>('table');
  const [status, setStatus] = useState('All statuses');
  const visibleCourses = useMemo(
    () => courses.filter((course) => {
      const matchesQuery = `${course.title} ${course.code}`.toLowerCase().includes(query.toLowerCase());
      const matchesStatus = status === 'All statuses' || course.status === status;
      return matchesQuery && matchesStatus;
    }),
    [courses, query, status],
  );
  const isFiltered = Boolean(query.trim()) || status !== 'All statuses';
  const clearFilters = () => { setQuery(''); setStatus('All statuses'); };

  return <View>
    <PageHeader description="Create, arrange, publish, and independently configure every Academy course without developer changes." actionLabel="Create course" onAction={onCreate} />
    <div className="mb-5 flex flex-wrap items-center gap-3"><label className="relative min-w-[240px] flex-1"><Icon name="search" className="absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-muted" /><input className={`${textInput} w-full pl-10`} placeholder="Search courses or codes" value={query} onChange={(e) => setQuery(e.target.value)} /></label><CustomSelect className={`${selectInput} w-auto min-w-[150px]`} value={status} onChange={(event) => setStatus(event.target.value)}><option>All statuses</option><option>Published</option><option>Draft</option><option>Archived</option></CustomSelect><div className="flex rounded-xl bg-surface-2 p-1"><button className="rounded-lg px-3 py-2 text-sm font-semibold aria-pressed:bg-background" type="button" aria-pressed={view === 'table'} onClick={() => setView('table')}>List</button><button className="rounded-lg px-3 py-2 text-sm font-semibold aria-pressed:bg-background" type="button" aria-pressed={view === 'cards'} onClick={() => setView('cards')}>Cards</button></div></div>

    {view === 'table' ? <div className={tableWrap}><table className={`${table} ${visibleCourses.length ? '' : '!min-w-0'}`}><thead><tr><th>Course</th><th>Status</th><th className={visibleCourses.length ? undefined : 'hidden sm:table-cell'}>Structure</th><th className={visibleCourses.length ? undefined : 'hidden md:table-cell'}>Students</th><th className={visibleCourses.length ? undefined : 'hidden lg:table-cell'}>Average progress</th><th className={visibleCourses.length ? undefined : 'hidden lg:table-cell'}><span className="sr-only">Actions</span></th></tr></thead><tbody>{visibleCourses.length ? visibleCourses.map((course) => <tr key={course.id}><td><b className="block">{course.title}</b><span className="text-xs text-muted">{course.code}</span></td><td><CourseStatus status={course.status} /></td><td>{course.modules.length} modules</td><td>{course.students}</td><td><div className="flex items-center gap-3"><span className="w-9 text-sm font-semibold">{course.progress}%</span><span className={`${progressBar} w-24`} style={{ '--p': course.progress } as React.CSSProperties}><i /></span></div></td><td><div className="flex flex-wrap justify-end gap-2"><button className={buttonGhostSmall} type="button" onClick={() => onEdit(course.id)}>Edit</button><button className={buttonGhostSmall} type="button" onClick={() => { onDuplicate(course.id); toast('Course duplicated as a draft.'); }}>Duplicate</button>{course.status !== 'Archived' && <button className={buttonGhostSmall} type="button" onClick={() => { onArchive(course.id); toast('Course archived.'); }}>Archive</button>}</div></td></tr>) : <tr><td colSpan={6}><CourseEmptyState filtered={isFiltered} onAction={isFiltered ? clearFilters : onCreate} /></td></tr>}</tbody></table></div> :
      visibleCourses.length ? <div className={tiles}>{visibleCourses.map((course) => <button key={course.id} className={tile} type="button" onClick={() => onEdit(course.id)}><span className={`${art} ${artTone[course.tone]}`}>{course.glyph}<span className={tag}>{course.status}</span></span><span className={tileBody}><b>{course.title}</b><span>{course.modules.length} modules · {course.students} students</span><span className={progressBar} style={{ '--p': course.progress } as React.CSSProperties}><i /></span></span></button>)}</div> : <div className="rounded-[18px] border border-dashed border-line bg-surface"><CourseEmptyState filtered={isFiltered} onAction={isFiltered ? clearFilters : onCreate} /></div>}
  </View>;
}

function CourseEmptyState({ filtered, onAction }: { filtered: boolean; onAction: () => void }) {
  return <div className="grid min-h-52 place-items-center p-6 text-center"><div className="grid max-w-sm justify-items-center gap-3"><span className="grid size-12 place-items-center rounded-full bg-surface-2"><Icon name={filtered ? 'search' : 'book'} className="size-5 text-muted" /></span><div><b className="text-base">{filtered ? 'No courses match these filters' : 'No courses created yet'}</b><p className="mt-1 text-sm text-muted">{filtered ? 'Clear the search and status filters to see every course.' : 'Create your first course to add curriculum, enrol students, and track progress.'}</p></div><button className={buttonGhostSmall} type="button" onClick={onAction}><Icon name={filtered ? 'x' : 'plus'} />{filtered ? 'Clear filters' : 'Create course'}</button></div></div>;
}

function CourseStatus({ status }: { status: string }) {
  const tone = status === 'Published' ? 'bg-reward text-hq-ink' : status === 'Draft' ? 'bg-surface-2 text-muted' : 'bg-hq-red-ink text-hq-bone';
  return <span className={`rounded-[99px] px-2.5 py-1 text-xs font-semibold ${tone}`}>{status}</span>;
}

const resourceTypeHelp: Record<ManagedResource['type'], string> = {
  Video: 'Paste a YouTube, Vimeo, Zoom, or other hosted video URL. Videos are never uploaded here.',
  Audio: 'Upload an audio file or paste a public link to one already hosted elsewhere.',
  PDF: 'Upload a PDF document or paste its public URL.',
  Text: 'Write the lesson notes or supporting copy students should read.',
  Download: 'Attach a downloadable document, archive, or supporting file.',
  'External link': 'Paste a public webpage or tool students should open in a new tab.',
};

function ResourceEditor({
  resource,
  index,
  onChange,
  onRemove,
}: {
  resource: ManagedResource;
  index: number;
  onChange: (values: Partial<ManagedResource>) => void;
  onRemove: () => void;
}) {
  const fieldId = `resource-${resource.id}`;
  const linkOnly = resource.type === 'Video' || resource.type === 'External link';
  const accept = resource.type === 'Audio' ? 'audio/*' : resource.type === 'PDF' ? 'application/pdf' : undefined;

  return <article className="rounded-2xl border border-line bg-surface-2 p-4 sm:p-5">
    <div className="flex flex-wrap items-start justify-between gap-3 border-b border-line pb-4">
      <div>
        <p className="text-xs font-bold uppercase tracking-wide text-muted">Resource {index + 1}</p>
        <p className="mt-1 text-sm text-muted">{resourceTypeHelp[resource.type]}</p>
      </div>
      <div className="flex items-center gap-3">
        <label className="flex min-h-10 cursor-pointer items-center gap-2 rounded-full border border-line bg-background px-3 text-sm font-semibold">
          <input className="size-4 accent-[var(--accent)]" type="checkbox" checked={resource.required} onChange={(event) => onChange({ required: event.target.checked })} />
          Required
        </label>
        <button className="grid size-10 place-items-center rounded-full border border-line bg-background text-muted transition-colors hover:border-accent hover:text-accent-text" type="button" aria-label={`Delete ${resource.title || `resource ${index + 1}`}`} onClick={onRemove}><Icon name="trash" className="size-4" /></button>
      </div>
    </div>

    <div className="mt-4 grid gap-4 md:grid-cols-[minmax(0,1fr)_220px]">
      <div>
        <label className={fieldLabel} htmlFor={`${fieldId}-title`}>Resource title</label>
        <input id={`${fieldId}-title`} className={`${textInput} w-full bg-background`} placeholder="e.g. Lesson notes" value={resource.title} onChange={(event) => onChange({ title: event.target.value })} />
      </div>
      <div>
        <label className={fieldLabel} htmlFor={`${fieldId}-type`}>Resource type</label>
        <CustomSelect id={`${fieldId}-type`} className={`${selectInput} bg-background`} value={resource.type} onChange={(event) => { const type = event.target.value as ManagedResource['type']; onChange({ type, file: type === 'Video' || type === 'External link' ? undefined : resource.file }); }}><option>Video</option><option>Audio</option><option>PDF</option><option>Text</option><option>Download</option><option>External link</option></CustomSelect>
      </div>
    </div>

    {resource.type === 'Text' ? <div className="mt-4">
      <label className={fieldLabel} htmlFor={`${fieldId}-text`}>Resource content</label>
      <textarea id={`${fieldId}-text`} className="min-h-32 w-full resize-y rounded-2xl border-[1.5px] border-line bg-background px-4 py-3.5 outline-none transition-colors focus:border-accent" placeholder="Write the notes, instructions, or supporting content students will read…" value={resource.textContent ?? ''} onChange={(event) => onChange({ textContent: event.target.value })} />
    </div> : linkOnly ? <div className="mt-4">
      <label className={fieldLabel} htmlFor={`${fieldId}-url`}>{resource.type === 'Video' ? 'Video URL' : 'External URL'}</label>
      <div className="relative"><Icon name="link" className="pointer-events-none absolute top-1/2 left-4 size-4 -translate-y-1/2 text-muted" /><input id={`${fieldId}-url`} className={`${textInput} w-full bg-background pl-11`} type="url" inputMode="url" placeholder={resource.type === 'Video' ? 'https://youtube.com/watch?v=…' : 'https://example.com/resource'} required value={resource.url ?? ''} onChange={(event) => onChange({ url: event.target.value, file: undefined })} /></div>
      <p className="mt-2 text-xs text-muted">Only public http or https links can be opened by students.</p>
    </div> : <div className="mt-4 grid gap-4 lg:grid-cols-2">
      <div>
        <label className={fieldLabel} htmlFor={`${fieldId}-url`}>Public URL <span className="font-normal text-muted">(optional)</span></label>
        <div className="relative"><Icon name="link" className="pointer-events-none absolute top-1/2 left-4 size-4 -translate-y-1/2 text-muted" /><input id={`${fieldId}-url`} className={`${textInput} w-full bg-background pl-11`} type="url" inputMode="url" placeholder="https://example.com/file" value={resource.url ?? ''} onChange={(event) => onChange({ url: event.target.value, file: undefined })} /></div>
        <p className="mt-2 text-xs text-muted">Use this when the resource is already hosted online.</p>
      </div>
      <div>
        <span className={fieldLabel}>Upload file</span>
        <label className="flex min-h-[52px] cursor-pointer items-center gap-3 rounded-2xl border-2 border-dashed border-line bg-background px-4 py-3 transition-colors hover:border-accent">
          <Icon name="upload" className="size-5 shrink-0 text-accent-text" />
          <span className="min-w-0"><b className="block truncate text-sm">{resource.file?.name ?? 'Choose a file'}</b><span className="block text-xs text-muted">{resource.file ? 'Choose another file to replace it' : `Upload a ${resource.type.toLowerCase()} resource`}</span></span>
          <input className="sr-only" type="file" accept={accept} onChange={(event) => onChange({ file: event.target.files?.[0], url: undefined })} />
        </label>
      </div>
    </div>}
  </article>;
}

type BuilderStep = 'basics' | 'curriculum' | 'assessment' | 'delivery' | 'completion' | 'review';
type AssessmentQuestionType = 'MULTIPLE_CHOICE' | 'TRUE_FALSE' | 'WRITTEN';
type BuilderQuestion = {
  localId: string;
  id?: string;
  prompt: string;
  type: AssessmentQuestionType;
  points: number;
  options: Array<{ id?: string; label: string; isCorrect: boolean }>;
};
type BuilderProjectDraft = {
  id?: string;
  enabled: boolean;
  type: 'ASSIGNMENT' | 'FINAL_PROJECT';
  title: string;
  brief: string;
  moduleId: string;
  lessonId: string;
  dueAt: string;
  allowedFormats: string[];
  approvalRequired: boolean;
};

const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function existingAssessmentContentId(value: string | undefined) {
  return value && UUID_PATTERN.test(value) ? value : undefined;
}

const steps: { id: BuilderStep; label: string; hint: string }[] = [
  { id: 'basics', label: 'Basics', hint: 'Identity and overview' }, { id: 'curriculum', label: 'Curriculum', hint: 'Modules and lessons' }, { id: 'assessment', label: 'Assessments', hint: 'Tests and project' }, { id: 'delivery', label: 'Delivery', hint: 'Cohort and classes' }, { id: 'completion', label: 'Completion', hint: 'Rules and certificate' }, { id: 'review', label: 'Review', hint: 'Check and publish' },
];

interface CourseBuilderProps {
  initialCourse?: ManagedCourse;
  facilitators: FacilitatorRecord[];
  cohorts: CohortRecord[];
  onBack: () => void;
  onSaveDetails: (course: CourseInput) => Promise<string>;
  onSaveCurriculum: (courseId: string, modules: ManagedModule[], previousModules: ManagedModule[], course: CourseInput) => Promise<{ courseId: string; modules: ManagedModule[] } | null>;
  onSaveFacilitators: (courseId: string, facilitatorIds: string[]) => Promise<boolean>;
  onSetStatus: (courseId: string, status: CourseInput['status']) => Promise<boolean>;
}

const copyModules = (modules: ManagedModule[]) => modules.map((module) => ({ ...module, lessons: module.lessons.map((lesson) => ({ ...lesson, resources: lesson.resources?.map((resource) => ({ ...resource })) ?? [] })) }));
const newQuestionDraft = (): BuilderQuestion => ({ localId: createEntityId('question'), prompt: '', type: 'MULTIPLE_CHOICE', points: 1, options: [{ label: '', isCorrect: true }, { label: '', isCorrect: false }] });
const newProjectDraft = (type: BuilderProjectDraft['type'], enabled: boolean): BuilderProjectDraft => ({ type, enabled, title: '', brief: '', moduleId: '', lessonId: '', dueAt: '', allowedFormats: ['PDF', 'ZIP', 'LINK'], approvalRequired: true });

function ProjectRequirementEditor({ draft, modules, onChange }: { draft: BuilderProjectDraft; modules: ManagedModule[]; onChange: (draft: BuilderProjectDraft) => void }) {
  const isFinal = draft.type === 'FINAL_PROJECT';
  const selectedModule = modules.find((module) => module.id === draft.moduleId);
  const prefix = isFinal ? 'final-project' : 'assignment';
  const patchDraft = (values: Partial<BuilderProjectDraft>) => onChange({ ...draft, ...values });
  return <section className={card}>
    <div className="flex flex-wrap items-start justify-between gap-4"><div><h3 className={heading}>{isFinal ? 'Final project' : 'Assignment'}</h3><p className="text-sm text-muted">{isFinal ? 'Create a final submission brief reviewed before course completion.' : 'Create an assignment brief for file, written, or link submissions.'}</p></div><label className="flex min-h-10 cursor-pointer items-center gap-2 rounded-full border border-line px-3 text-sm font-semibold"><input type="checkbox" checked={draft.enabled} onChange={(event) => patchDraft({ enabled: event.target.checked })} className="size-4 accent-[var(--accent)]" />{draft.enabled ? 'Included' : 'Not included'}</label></div>
    {draft.enabled ? <div className="mt-5 grid gap-5">
      <div><label className={fieldLabel} htmlFor={`${prefix}-title`}>{isFinal ? 'Project title' : 'Assignment title'}</label><input id={`${prefix}-title`} className={`${textInput} w-full`} value={draft.title} onChange={(event) => patchDraft({ title: event.target.value })} placeholder={isFinal ? 'Build the final course project' : 'Complete the module assignment'} /></div>
      <div><label className={fieldLabel} htmlFor={`${prefix}-brief`}>Brief and submission instructions</label><textarea id={`${prefix}-brief`} className="min-h-32 w-full resize-y rounded-2xl border-[1.5px] border-line bg-background p-4 outline-none transition-colors focus:border-accent" value={draft.brief} onChange={(event) => patchDraft({ brief: event.target.value })} placeholder="Describe the expected outcome, requirements, and evaluation criteria." /></div>
      <div className="grid gap-4 md:grid-cols-3"><div><label className={fieldLabel} htmlFor={`${prefix}-module`}>Attach to module</label><CustomSelect id={`${prefix}-module`} className={selectInput} value={draft.moduleId} onChange={(event) => { const module = modules.find((item) => item.id === event.target.value); patchDraft({ moduleId: event.target.value, lessonId: module?.lessons[0]?.id ?? '' }); }}><option value="">Select module</option>{modules.map((module) => <option key={module.id} value={module.id}>{module.title}</option>)}</CustomSelect></div><div><label className={fieldLabel} htmlFor={`${prefix}-lesson`}>Attach to lesson</label><CustomSelect id={`${prefix}-lesson`} className={selectInput} value={draft.lessonId} disabled={!selectedModule?.lessons.length} onChange={(event) => patchDraft({ lessonId: event.target.value })}><option value="">Select lesson</option>{selectedModule?.lessons.map((lesson) => <option key={lesson.id} value={lesson.id}>{lesson.title}</option>)}</CustomSelect></div><div><label className={fieldLabel} htmlFor={`${prefix}-due`}>Submission deadline</label><input id={`${prefix}-due`} className={`${textInput} w-full`} type="datetime-local" value={draft.dueAt} onChange={(event) => patchDraft({ dueAt: event.target.value })} /></div></div>
      <fieldset><legend className={fieldLabel}>Accepted submission formats</legend><div className="flex flex-wrap gap-2">{['PDF', 'ZIP', 'LINK'].map((format) => <label key={format} className="flex min-h-10 cursor-pointer items-center gap-2 rounded-full border border-line bg-background px-3 text-sm font-semibold"><input className="size-4 accent-[var(--accent)]" type="checkbox" checked={draft.allowedFormats.includes(format)} onChange={(event) => patchDraft({ allowedFormats: event.target.checked ? [...draft.allowedFormats, format] : draft.allowedFormats.filter((item) => item !== format) })} />{format}</label>)}</div><p className="mt-2 text-xs text-muted">Students upload supported files through the submission flow or paste a link when LINK is allowed.</p></fieldset>
      <label className="flex items-start gap-3 rounded-2xl bg-surface-2 p-4"><input className="mt-1 size-4 accent-[var(--accent)]" type="checkbox" checked={draft.approvalRequired} onChange={(event) => patchDraft({ approvalRequired: event.target.checked })} /><span><b className="block">Facilitator approval required</b><span className="text-sm text-muted">Completion remains pending until a facilitator reviews and approves the submission.</span></span></label>
    </div> : <p className="mt-4 rounded-xl border border-dashed border-line p-3 text-sm text-muted">This course will not include {isFinal ? 'a final project' : 'an assignment'}.</p>}
  </section>;
}

export function CourseBuilder({ initialCourse, facilitators, cohorts, onBack, onSaveDetails, onSaveCurriculum, onSaveFacilitators, onSetStatus }: CourseBuilderProps) {
  const { toast } = useToast();
  const [stepIndex, setStepIndex] = useState(0);
  const [title, setTitle] = useState(initialCourse?.title ?? '');
  const [code, setCode] = useState(initialCourse?.code ?? '');
  const [description, setDescription] = useState(initialCourse?.description ?? '');
  const [category, setCategory] = useState(initialCourse?.category ?? 'Engineering');
  const [difficulty, setDifficulty] = useState(initialCourse?.difficulty ?? 'Intermediate');
  const [durationWeeks, setDurationWeeks] = useState(initialCourse?.durationWeeks ?? 6);
  const [cohortId, setCohortId] = useState(initialCourse?.cohortId ?? '');
  const [facilitatorIds, setFacilitatorIds] = useState<string[]>(initialCourse?.facilitatorIds ?? []);
  const initialModules = useMemo(() => copyModules(initialCourse?.modules ?? []), [initialCourse]);
  const [modules, setModules] = useState<ManagedModule[]>(initialModules);
  const [persistedModules, setPersistedModules] = useState<ManagedModule[]>(initialModules);
  const [courseId, setCourseId] = useState(initialCourse?.id ?? '');
  const [coverUrl, setCoverUrl] = useState(initialCourse?.coverUrl ?? '');
  const [isCoverUploading, setIsCoverUploading] = useState(false);
  const [coverError, setCoverError] = useState('');
  const coverInputRef = useRef<HTMLInputElement>(null);
  const [passingScore, setPassingScore] = useState(80);
  const [attemptLimit, setAttemptLimit] = useState(0);
  const [assessmentId, setAssessmentId] = useState('');
  const [questions, setQuestions] = useState<BuilderQuestion[]>([]);
  const [questionDraft, setQuestionDraft] = useState<BuilderQuestion>(() => newQuestionDraft());
  const [questionEditorOpen, setQuestionEditorOpen] = useState(false);
  const [assignmentDraft, setAssignmentDraft] = useState<BuilderProjectDraft>(() => newProjectDraft('ASSIGNMENT', true));
  const [finalProjectDraft, setFinalProjectDraft] = useState<BuilderProjectDraft>(() => newProjectDraft('FINAL_PROJECT', true));
  const finalProject = finalProjectDraft.enabled;
  const [published, setPublished] = useState(initialCourse?.status === 'Published');
  const [isSaving, setIsSaving] = useState(false);
  const current = steps[stepIndex];
  const isBusy = isSaving || isCoverUploading;

  const addModule = () => setModules((list) => [...list, { id: createEntityId('module'), title: `Module ${list.length + 1}`, description: '', lessons: [] }]);
  const addLesson = (moduleId: string) => setModules((list) => list.map((module) => module.id === moduleId ? { ...module, lessons: [...module.lessons, { id: createEntityId('lesson'), title: 'Untitled lesson', description: '', type: 'Video', resources: [{ id: createEntityId('resource'), title: 'Video link', type: 'Video', url: '', required: true }] }] } : module));
  const addResource = (moduleId: string, lessonId: string) => setModules((list) => list.map((module) => module.id === moduleId ? { ...module, lessons: module.lessons.map((lesson) => lesson.id === lessonId ? { ...lesson, resources: [...(lesson.resources ?? []), { id: createEntityId('resource'), title: 'Untitled resource', type: 'PDF', required: true }] } : lesson) } : module));
  const updateLessonType = (moduleId: string, lessonId: string, type: ManagedModule['lessons'][number]['type']) => setModules((list) => list.map((module) => module.id === moduleId ? { ...module, lessons: module.lessons.map((lesson) => {
    if (lesson.id !== lessonId) return lesson;
    const resources = lesson.resources ?? [];
    const needsVideoLink = (type === 'Video' || type === 'Class recording') && !resources.some((resource) => resource.type === 'Video');
    return { ...lesson, type, resources: needsVideoLink ? [...resources, { id: createEntityId('resource'), title: type === 'Class recording' ? 'Recording link' : 'Video link', type: 'Video', url: '', required: true }] : resources };
  }) } : module));
  const updateResource = (moduleId: string, lessonId: string, resourceId: string, values: Partial<ManagedResource>) => setModules((list) => list.map((module) => module.id === moduleId ? { ...module, lessons: module.lessons.map((lesson) => lesson.id === lessonId ? { ...lesson, resources: (lesson.resources ?? []).map((resource) => resource.id === resourceId ? { ...resource, ...values } : resource) } : lesson) } : module));
  const removeResource = (moduleId: string, lessonId: string, resourceId: string) => setModules((list) => list.map((module) => module.id === moduleId ? { ...module, lessons: module.lessons.map((lesson) => lesson.id === lessonId ? { ...lesson, resources: (lesson.resources ?? []).filter((resource) => resource.id !== resourceId) } : lesson) } : module));
  const uploadCover = async (file?: File) => {
    if (!file) return;
    if (!file.type.startsWith('image/')) { setCoverError('Choose an image file for the course cover.'); return; }
    setIsCoverUploading(true);
    setCoverError('');
    try {
      const upload = await lmsApi.uploads.create(file, 'course-cover');
      setCoverUrl(upload.url);
      toast('Course cover uploaded. Its URL will be saved with the course.');
    } catch (failure) {
      setCoverError(failure instanceof Error ? failure.message : 'The course cover could not be uploaded.');
    } finally {
      setIsCoverUploading(false);
      if (coverInputRef.current) coverInputRef.current.value = '';
    }
  };

  const details = (id = courseId): CourseInput => ({
    id: id || undefined,
    title: title.trim() || 'Untitled course',
    coverUrl: coverUrl.trim() || undefined,
    code: code.trim() || `HQ-${Math.max(1, Date.now() % 1000)}`,
    status: initialCourse?.status ?? 'Draft',
    description,
    category,
    difficulty,
    durationWeeks,
    cohortId: cohortId || null,
    facilitatorIds,
    modules,
  });
  const persistDetails = async () => {
    if (title.trim().length < 3) { toast('Add a clear course title before continuing.'); return ''; }
    const id = await onSaveDetails(details());
    if (id) setCourseId(id);
    return id;
  };
  const ensureCourse = async () => courseId || persistDetails();
  const openQuestionEditor = () => {
    setQuestionDraft(newQuestionDraft());
    setQuestionEditorOpen(true);
  };
  const saveQuestionDraft = () => {
    const prompt = questionDraft.prompt.trim();
    if (!prompt) { toast('Add the question prompt before saving.'); return; }
    const options = questionDraft.type === 'WRITTEN'
      ? []
      : questionDraft.options.filter((option) => option.label.trim()).map((option) => ({ ...option, label: option.label.trim() }));
    if (questionDraft.type !== 'WRITTEN' && options.length < 2) { toast('Add at least two answer options.'); return; }
    if (questionDraft.type !== 'WRITTEN' && !options.some((option) => option.isCorrect)) { toast('Mark one correct answer.'); return; }
    setQuestions((current) => [...current, { ...questionDraft, prompt, options }]);
    setQuestionEditorOpen(false);
  };
  const persistAssessment = async (id: string) => {
    if (!questions.length) return true;
    let savedAssessmentId = assessmentId;
    if (!savedAssessmentId) {
      const response = await lmsApi.admin.createAssessment(id, {
        title: `${title.trim() || 'Course'} checkpoint`,
        passPercentage: passingScore,
        attemptLimit: attemptLimit || undefined,
      });
      savedAssessmentId = extractId(response);
      if (!savedAssessmentId) throw new Error('The API did not return the assessment ID.');
      setAssessmentId(savedAssessmentId);
    } else {
      await lmsApi.admin.updateAssessment(savedAssessmentId, {
        title: `${title.trim() || 'Course'} checkpoint`,
        passPercentage: passingScore,
        attemptLimit,
      });
    }
    await lmsApi.admin.saveAssessmentContent(savedAssessmentId, questions.map((question, index) => ({
      id: existingAssessmentContentId(question.id),
      prompt: question.prompt,
      type: question.type === 'WRITTEN' ? 'WRITTEN_RESPONSE' : question.type,
      position: index + 1,
      points: question.points,
      options: question.options.map((option, optionIndex) => ({
        id: existingAssessmentContentId(option.id),
        label: option.label,
        isCorrect: option.isCorrect,
        position: optionIndex + 1,
      })),
    })));
    const detail = asRecord(unwrap(await lmsApi.admin.assessment(savedAssessmentId)));
    const savedQuestions = collection(detail.questions).map((value, index) => {
      const question = asRecord(value);
      const type = String(question.type ?? 'MULTIPLE_CHOICE');
      return {
        localId: String(question.id ?? questions[index]?.localId ?? createEntityId('question')),
        id: String(question.id ?? '') || undefined,
        prompt: String(question.prompt ?? ''),
        type: (type === 'WRITTEN_RESPONSE' ? 'WRITTEN' : type) as AssessmentQuestionType,
        points: Number(question.points ?? 1),
        options: collection(question.options).map((optionValue) => {
          const option = asRecord(optionValue);
          return { id: String(option.id ?? '') || undefined, label: String(option.label ?? ''), isCorrect: option.isCorrect === true };
        }),
      };
    });
    setQuestions(savedQuestions);
    return true;
  };
  const persistProjectDraft = async (id: string, draft: BuilderProjectDraft, update: (draft: BuilderProjectDraft) => void) => {
    if (!draft.enabled) {
      if (draft.id) await lmsApi.admin.setProjectStatus(draft.id, 'ARCHIVED');
      return;
    }
    if (!draft.title.trim() || !draft.brief.trim() || !draft.moduleId || !draft.lessonId || !draft.dueAt || !draft.allowedFormats.length) {
      throw new Error(`Complete the ${draft.type === 'ASSIGNMENT' ? 'assignment' : 'final project'} title, brief, module, lesson, deadline, and allowed formats.`);
    }
    const payload = {
      type: draft.type,
      title: draft.title.trim(),
      brief: draft.brief.trim(),
      moduleId: draft.moduleId,
      lessonId: draft.lessonId,
      dueAt: new Date(draft.dueAt).toISOString(),
      allowedFormats: draft.allowedFormats,
      approvalRequired: draft.approvalRequired,
    };
    let projectId = draft.id;
    if (projectId) await lmsApi.admin.updateProject(projectId, payload);
    else {
      projectId = extractId(await lmsApi.admin.createProject(id, payload));
      if (!projectId) throw new Error(`The API did not return the ${draft.type === 'ASSIGNMENT' ? 'assignment' : 'final project'} ID.`);
      update({ ...draft, id: projectId });
    }
    await lmsApi.admin.setProjectStatus(projectId, published ? 'PUBLISHED' : 'DRAFT');
  };
  const persistProjects = async (id: string) => {
    await Promise.all([
      persistProjectDraft(id, assignmentDraft, setAssignmentDraft),
      persistProjectDraft(id, finalProjectDraft, setFinalProjectDraft),
    ]);
  };
  const persistCurrentStep = async () => {
    if (isSaving || isCoverUploading) return false;
    setIsSaving(true);
    try {
      if (current.id === 'basics') return Boolean(await persistDetails());
      if (current.id === 'curriculum') {
        const id = await ensureCourse();
        if (!id) return false;
        const saved = await onSaveCurriculum(id, modules, persistedModules, details(id));
        if (!saved) return false;
        setCourseId(saved.courseId);
        setModules(saved.modules);
        setPersistedModules(copyModules(saved.modules));
        return true;
      }
      if (current.id === 'assessment') {
        const id = await ensureCourse();
        if (!id) return false;
        await Promise.all([persistAssessment(id), persistProjects(id)]);
        toast('Assessment, assignment, and project requirements saved.');
        return true;
      }
      if (current.id === 'delivery') {
        const id = await ensureCourse();
        return Boolean(id && await onSaveFacilitators(id, facilitatorIds));
      }
      return true;
    } catch (failure) {
      toast(failure instanceof Error ? failure.message : 'This step could not be saved.');
      return false;
    } finally {
      setIsSaving(false);
    }
  };
  const saveAndContinue = async () => {
    if (!await persistCurrentStep()) return;
    setStepIndex((index) => Math.min(steps.length - 1, index + 1));
    window.scrollTo(0, 0);
  };
  const publish = async () => {
    if (isSaving) return;
    setIsSaving(true);
    try {
      const id = await ensureCourse();
      if (id && await onSetStatus(id, 'Published')) {
        await Promise.all([assessmentId ? lmsApi.admin.setAssessmentStatus(assessmentId, 'PUBLISHED') : Promise.resolve(), ...[assignmentDraft, finalProjectDraft].filter((draft) => draft.enabled && draft.id).map((draft) => lmsApi.admin.setProjectStatus(draft.id!, 'PUBLISHED'))]);
        setPublished(true);
      }
    } catch (failure) {
      toast(failure instanceof Error ? failure.message : 'The course could not be published.');
    } finally {
      setIsSaving(false);
    }
  };

  return <View>
    <button className="mb-5 inline-flex items-center gap-1.5 font-semibold text-muted hover:text-foreground" type="button" onClick={onBack}><Icon name="back" />All courses</button>
    <div className="grid gap-8 min-[1021px]:grid-cols-[240px_minmax(0,1fr)]">
      <aside><ol className="grid gap-1">{steps.map((item, index) => <li key={item.id}><button className={`flex w-full items-start gap-3 rounded-xl p-3 text-left ${index === stepIndex ? 'bg-foreground text-background' : index < stepIndex ? 'text-foreground' : 'text-muted'}`} type="button" disabled={isBusy} onClick={() => setStepIndex(index)}><span className={`grid size-7 shrink-0 place-items-center rounded-full border text-xs font-bold ${index < stepIndex ? 'border-reward bg-reward text-hq-ink' : 'border-current'}`}>{index < stepIndex ? <Icon name="check" className="size-3.5" /> : index + 1}</span><span><b className="block text-sm">{item.label}</b><span className="text-xs opacity-70">{item.hint}</span></span></button></li>)}</ol><div className={`${card} mt-5 p-4`}><p className="text-xs font-semibold text-muted">{published ? 'PUBLISHED' : 'DRAFT'} STATUS</p><p className="mt-1 text-sm">Each step saves to its matching endpoint before you continue.</p><button className="mt-3 text-sm font-semibold text-accent-text disabled:opacity-50" type="button" disabled={isBusy} onClick={async () => { if (await persistCurrentStep()) onBack(); }}>{isCoverUploading ? 'Uploading cover…' : isSaving ? 'Saving…' : 'Save and exit'}</button></div></aside>

      <section className="min-w-0">
        <div className="mb-6"><p className="text-sm font-semibold text-accent-text">STEP {stepIndex + 1} OF {steps.length}</p><h2 className="mt-1 text-2xl font-[700]">{current.label}</h2><p className={muted}>{current.hint}</p></div>

        {current.id === 'basics' && <div className="grid gap-5">
          <div><label className={fieldLabel} htmlFor="course-title">Course title</label><input id="course-title" className={`${textInput} w-full`} placeholder="e.g. Product Design Foundations" value={title} onChange={(e) => setTitle(e.target.value)} /></div>
          <div><label className={fieldLabel} htmlFor="course-description">Course description</label><textarea id="course-description" className="min-h-32 w-full rounded-2xl border-[1.5px] border-line bg-surface p-4 outline-none focus:border-accent" placeholder="What will students learn and who is this for?" value={description} onChange={(e) => setDescription(e.target.value)} /></div>
          <div className="grid gap-5 sm:grid-cols-2"><div><label className={fieldLabel} htmlFor="course-category">Category</label><input id="course-category" className={`${textInput} w-full`} type="text" placeholder="e.g. Engineering" value={category} onChange={(event) => setCategory(event.target.value)} /></div><div><label className={fieldLabel}>Difficulty</label><CustomSelect className={selectInput} value={difficulty} onChange={(event) => setDifficulty(event.target.value)}><option>Beginner</option><option>Intermediate</option><option>Advanced</option></CustomSelect></div></div>
          <div className="grid gap-5 sm:grid-cols-2"><div><label className={fieldLabel} htmlFor="course-duration">Duration in weeks</label><input id="course-duration" className={`${textInput} w-full`} type="number" min={1} value={durationWeeks} onChange={(event) => setDurationWeeks(Math.max(1, Number(event.target.value) || 1))} /></div><div><label className={fieldLabel} htmlFor="course-code">Course code</label><input id="course-code" className={`${textInput} w-full`} placeholder="PDF-08" value={code} onChange={(event) => setCode(event.target.value.toUpperCase())} /></div></div>
          <div><label className={fieldLabel} htmlFor="course-cover-file">Course cover</label><input ref={coverInputRef} id="course-cover-file" className="sr-only" type="file" accept="image/*" disabled={isCoverUploading} onChange={(event) => void uploadCover(event.target.files?.[0])} /><button className="grid min-h-40 w-full place-items-center overflow-hidden rounded-[18px] border-2 border-dashed border-line p-5 text-center transition-colors hover:border-accent disabled:cursor-wait disabled:opacity-70" type="button" disabled={isCoverUploading} onClick={() => coverInputRef.current?.click()}>{coverUrl ? <span className="flex w-full flex-col items-center gap-4 sm:flex-row sm:text-left"><img className="aspect-[16/9] w-full max-w-60 rounded-xl object-cover" src={coverUrl} alt={`${title || 'Course'} cover preview`} /><span><b className="block">{isCoverUploading ? 'Uploading cover…' : 'Course cover uploaded'}</b><span className="mt-1 block text-sm text-muted">{isCoverUploading ? 'Please keep this page open.' : 'Choose another image to replace it.'}</span></span></span> : <span><Icon name="upload" className="mx-auto mb-2 size-7 text-accent-text" /><b className="block">{isCoverUploading ? 'Uploading cover…' : 'Upload course cover'}</b><span className="text-sm text-muted">The image is uploaded first, then its URL is saved with the course.</span></span>}</button>{coverUrl ? <button className="mt-2 text-sm font-semibold text-accent-text hover:underline" type="button" disabled={isCoverUploading} onClick={() => setCoverUrl('')}>Remove cover</button> : null}{coverError ? <p className="mt-2 text-sm font-semibold text-accent-text" role="alert">{coverError}</p> : null}</div>
        </div>}

        {current.id === 'curriculum' && <div>
          <div className="mb-5 flex flex-wrap items-center justify-between gap-3"><p className="max-w-[58ch] text-sm text-muted">Arrange modules, then add lessons and resources. Videos and class recordings use external links; documents can still be uploaded.</p><button className={buttonSmall} type="button" onClick={addModule}><Icon name="plus" />Add module</button></div>
          {modules.length ? <div className="grid gap-4">{modules.map((module, moduleIndex) => <div key={module.id} className={card}>
            <div className="flex items-center gap-3"><Icon name="grip" className="text-muted" /><span className="grid size-7 shrink-0 place-items-center rounded-full bg-surface-2 text-xs font-bold">{moduleIndex + 1}</span><input className="min-w-0 flex-1 bg-transparent text-lg font-[650] outline-none" value={module.title} onChange={(event) => setModules((list) => list.map((entry) => entry.id === module.id ? { ...entry, title: event.target.value } : entry))} aria-label={`Module ${moduleIndex + 1} title`} /><button className="grid size-8 place-items-center rounded-full text-muted hover:bg-surface-2 hover:text-accent-text" type="button" aria-label={`Delete ${module.title}`} onClick={() => setModules((list) => list.filter((entry) => entry.id !== module.id))}><Icon name="trash" className="size-4" /></button></div>
            <input className="mt-3 w-full rounded-xl border border-line bg-background px-3 py-2 text-sm outline-none focus:border-accent" placeholder="Module description (optional)" value={module.description ?? ''} onChange={(event) => setModules((list) => list.map((entry) => entry.id === module.id ? { ...entry, description: event.target.value } : entry))} aria-label={`${module.title} description`} />
            <div className="mt-4 grid gap-2">{module.lessons.map((lesson, lessonIndex) => <div key={lesson.id} className="grid items-center gap-2 rounded-xl border border-line p-3 sm:grid-cols-[auto_minmax(0,1fr)_150px_100px_auto]">
              <Icon name="grip" className="hidden size-4 text-muted sm:block" />
              <input className="min-w-0 bg-transparent font-semibold outline-none" value={lesson.title} onChange={(event) => setModules((list) => list.map((entry) => entry.id === module.id ? { ...entry, lessons: entry.lessons.map((item) => item.id === lesson.id ? { ...item, title: event.target.value } : item) } : entry))} aria-label={`Lesson ${lessonIndex + 1} title`} />
              <CustomSelect className="rounded-lg border border-line bg-background px-2 py-1.5 text-sm" value={lesson.type} onChange={(event) => updateLessonType(module.id, lesson.id, event.target.value as ManagedModule['lessons'][number]['type'])}><option>Video</option><option>Audio</option><option>Text</option><option>PDF</option><option>External link</option><option>Class recording</option></CustomSelect>
              <input className="w-full rounded-lg border border-line bg-background px-2 py-1.5 text-sm outline-none focus:border-accent" type="number" min={1} placeholder="Minutes" value={lesson.durationMinutes ?? ''} onChange={(event) => setModules((list) => list.map((entry) => entry.id === module.id ? { ...entry, lessons: entry.lessons.map((item) => item.id === lesson.id ? { ...item, durationMinutes: event.target.value ? Math.max(1, Number(event.target.value)) : undefined } : item) } : entry))} aria-label={`${lesson.title} duration in minutes`} />
              <button className="grid size-8 place-items-center text-muted" type="button" aria-label={`Delete ${lesson.title}`} onClick={() => setModules((list) => list.map((entry) => entry.id === module.id ? { ...entry, lessons: entry.lessons.filter((item) => item.id !== lesson.id) } : entry))}><Icon name="trash" className="size-4" /></button>
              <input className="min-w-0 rounded-lg border border-line bg-background px-2 py-1.5 text-sm outline-none focus:border-accent sm:col-start-2 sm:col-span-3" placeholder="Lesson description (optional)" value={lesson.description ?? ''} onChange={(event) => setModules((list) => list.map((entry) => entry.id === module.id ? { ...entry, lessons: entry.lessons.map((item) => item.id === lesson.id ? { ...item, description: event.target.value } : item) } : entry))} aria-label={`${lesson.title} description`} />
              <div className="mt-2 grid gap-2 border-t border-line pt-3 sm:col-span-5">
                <div className="flex items-center justify-between gap-3"><p className="text-xs font-bold uppercase tracking-wide text-muted">Resources</p><button className="inline-flex items-center gap-1 text-sm font-semibold text-accent-text" type="button" onClick={() => addResource(module.id, lesson.id)}><Icon name="plus" className="size-3.5" />Add resource</button></div>
                {(lesson.resources ?? []).map((resource, resourceIndex) => <ResourceEditor key={resource.id} resource={resource} index={resourceIndex} onChange={(values) => updateResource(module.id, lesson.id, resource.id, values)} onRemove={() => removeResource(module.id, lesson.id, resource.id)} />)}
                {(lesson.resources ?? []).length === 0 ? <p className="rounded-xl border border-dashed border-line p-3 text-sm text-muted">No resources attached to this lesson yet.</p> : null}
              </div>
            </div>)}</div>
            <button className="mt-3 inline-flex items-center gap-2 text-sm font-semibold text-accent-text" type="button" onClick={() => addLesson(module.id)}><Icon name="plus" className="size-4" />Add lesson</button>
          </div>)}</div> : <EmptyState icon="book" title="No modules yet" description="Add the first module, then create lessons and attach learning resources." actionLabel="Add module" onAction={addModule} />}
        </div>}

        {current.id === 'assessment' && <div className="grid gap-5">
          <section className={card}><div className="flex items-start justify-between gap-4"><div><h3 className={heading}>Module checkpoint</h3><p className="text-sm text-muted">Multiple-choice, true/false, and written questions are supported.</p></div><label className="flex items-center gap-2 text-sm font-semibold"><input type="checkbox" defaultChecked className="accent-[var(--accent)]" />Required</label></div><div className="mt-5 grid gap-4 sm:grid-cols-3"><div><label className={fieldLabel}>Passing score</label><div className="relative"><input className={`${textInput} w-full pr-8`} type="number" min={0} max={100} value={passingScore} onChange={(e) => setPassingScore(Number(e.target.value))} /><span className="absolute top-1/2 right-3 -translate-y-1/2 text-muted">%</span></div></div><div><label className={fieldLabel}>Attempts</label><CustomSelect className={selectInput} value={String(attemptLimit)} onChange={(event) => setAttemptLimit(Number(event.target.value))}><option value="0">Unlimited</option><option value="3">3 attempts</option><option value="1">1 attempt</option></CustomSelect></div><div><label className={fieldLabel}>Question order</label><CustomSelect className={selectInput}><option>Shuffle</option><option>Fixed</option></CustomSelect></div></div><button className={`${buttonGhostSmall} mt-4`} type="button" onClick={openQuestionEditor}><Icon name="plus" />Add question</button>{questions.length ? <div className="mt-4 grid gap-2">{questions.map((question, index) => <article key={question.localId} className="rounded-xl border border-line bg-surface-2 p-3"><div className="flex items-start justify-between gap-3"><div><p className="text-xs font-bold uppercase tracking-wide text-muted">Question {index + 1} · {question.type === 'MULTIPLE_CHOICE' ? 'Multiple choice' : question.type === 'TRUE_FALSE' ? 'True / false' : 'Written response'}</p><p className="mt-1 font-semibold">{question.prompt}</p>{question.options.length ? <p className="mt-1 text-xs text-muted">{question.options.length} answer options</p> : null}</div><button className="text-sm font-semibold text-accent-text" type="button" onClick={() => setQuestions((current) => current.filter((item) => item.localId !== question.localId))}>Remove</button></div></article>)}</div> : <p className="mt-4 rounded-xl border border-dashed border-line p-3 text-sm text-muted">No questions added yet. Add at least one before saving this assessment.</p>}</section>
          <ProjectRequirementEditor draft={assignmentDraft} modules={modules} onChange={setAssignmentDraft} />
          <ProjectRequirementEditor draft={finalProjectDraft} modules={modules} onChange={setFinalProjectDraft} />
        </div>}

        {current.id === 'delivery' && <div className="grid gap-5">
          <div className="grid gap-5 sm:grid-cols-2"><div><label className={fieldLabel} htmlFor="course-cohort">Assign cohort</label><CustomSelect id="course-cohort" className={selectInput} value={cohortId} onChange={(event) => setCohortId(event.target.value)}><option value="">Self-paced / assign later</option>{cohorts.filter((cohort) => cohort.status !== 'Archived').map((cohort) => <option key={cohort.id} value={cohort.id}>{cohort.name}</option>)}</CustomSelect></div><div><label className={fieldLabel} htmlFor="course-facilitators">Course facilitators</label><CustomSelect id="course-facilitators" className={selectInput} multiple size={Math.min(4, Math.max(2, facilitators.length))} value={facilitatorIds} onChange={(event) => setFacilitatorIds(Array.from(event.target.selectedOptions, (option) => option.value))}>{facilitators.filter((facilitator) => facilitator.status !== 'Suspended').map((facilitator) => <option key={facilitator.id} value={facilitator.id}>{facilitator.name} · {facilitator.status}</option>)}</CustomSelect><p className="mt-1.5 text-xs text-muted">Use Ctrl/Cmd to select more than one facilitator.</p></div></div>
          <section className={card}><div className="flex items-center justify-between gap-4"><div><h3 className={heading}>Live class schedule</h3><p className="text-sm text-muted">Students see the Zoom link only at the appropriate time.</p></div><button className={buttonSmall} type="button" onClick={() => toast('Another class slot added.')}><Icon name="plus" />Add class</button></div><div className="mt-4 grid gap-4 sm:grid-cols-3"><div><label className={fieldLabel}>First class</label><input className={`${textInput} w-full`} type="date" /></div><div><label className={fieldLabel}>Time</label><input className={`${textInput} w-full`} type="time" /></div><div><label className={fieldLabel}>Repeats</label><CustomSelect className={selectInput}><option>One time</option><option>Weekly, 6 sessions</option></CustomSelect></div></div><div className="mt-4"><label className={fieldLabel}>Zoom meeting URL</label><input className={`${textInput} w-full`} type="url" placeholder="https://zoom.us/j/…" /></div></section>
          <section className={card}><h3 className={heading}>Enrolment</h3><div className="grid gap-4 sm:grid-cols-2"><div><label className={fieldLabel}>Opens</label><input className={`${textInput} w-full`} type="date" /></div><div><label className={fieldLabel}>Closes</label><input className={`${textInput} w-full`} type="date" /></div></div><label className="mt-4 flex items-center gap-3 text-sm"><input type="checkbox" defaultChecked className="accent-[var(--accent)]" />Allow admins to enrol students after the deadline.</label></section>
        </div>}

        {current.id === 'completion' && <div className="grid gap-5">
          <section className={card}><h3 className={heading}>Progression rules</h3><div className="grid gap-3">{['Complete each lesson before continuing', 'Complete the previous module before unlocking the next', `Pass every checkpoint with at least ${passingScore}%`, 'Receive facilitator approval for assignments', 'Receive facilitator approval for the final project'].map((rule, index) => <label key={rule} className="flex items-start gap-3"><input type="checkbox" className="mt-1 accent-[var(--accent)]" defaultChecked={index < 3 || finalProject} /><span>{rule}</span></label>)}</div></section>
          <section className={card}><h3 className={heading}>Certificate eligibility</h3><label className="flex items-start gap-3"><input type="checkbox" defaultChecked className="mt-1 accent-[var(--accent)]" /><span><b className="block">Issue a Circle HQ Academy certificate</b><span className="text-sm text-muted">Available only after every required condition is satisfied.</span></span></label><div className="mt-5 grid gap-4 sm:grid-cols-2"><div><label className={fieldLabel}>Certificate template</label><CustomSelect className={selectInput}><option>Academy standard · Landscape</option></CustomSelect></div><div><label className={fieldLabel}>Certificate signatory</label><CustomSelect className={selectInput}><option>Authorized signatory</option><option>Programme facilitator</option></CustomSelect></div></div></section>
        </div>}

        {current.id === 'review' && <div className="grid gap-5">
          <div className="rounded-[22px] bg-hq-red p-7 text-white"><span className="text-sm font-semibold text-white/75">COURSE PREVIEW</span><h2 className="mt-3 text-3xl font-[750]">{title || 'Untitled course'}</h2><p className="mt-2 max-w-[56ch] text-white/80">{description || 'Add a description so students understand the outcome of this course.'}</p><div className="mt-5 flex flex-wrap gap-2 text-xs font-semibold">{[category, `${modules.length} modules`, `${passingScore}% passing score`, finalProject ? 'Final project required' : 'No final project'].map((item) => <span key={item} className="rounded-[99px] bg-black/20 px-3 py-1.5">{item}</span>)}</div></div>
          <section className={card}><h3 className={heading}>Pre-publish check</h3><div className="grid gap-3">{[['Course details', title.trim().length > 2], ['At least one module', modules.length > 0], ['Lessons added', modules.some((module) => module.lessons.length > 0)], ['Completion rules configured', true], ['Facilitator selected', facilitatorIds.length > 0], ['Delivery selected', Boolean(cohortId)], ['Certificate eligibility set', true]].map(([label, ok]) => <div key={String(label)} className="flex items-center justify-between gap-3 border-t border-line py-2 first:border-t-0"><span>{String(label)}</span><span className={`inline-flex items-center gap-1 text-sm font-semibold ${ok ? 'text-foreground' : 'text-accent-text'}`}><Icon name={ok ? 'check' : 'help'} className="size-4" />{ok ? 'Ready' : 'Needs attention'}</span></div>)}</div></section>
          <div className="flex flex-wrap gap-3"><button className={button} type="button" disabled={published || isBusy} onClick={publish}><Icon name="graduate" />{isSaving ? 'Publishing…' : published ? 'Published' : 'Publish course'}</button><button className={buttonGhost} type="button" disabled={isBusy} onClick={() => toast('Use the Student development tab to inspect the published course flow.')}>Preview as student</button></div>
        </div>}

        <div className="mt-8 flex items-center justify-between gap-3 border-t border-line pt-5"><button className={buttonGhost} type="button" disabled={stepIndex === 0 || isBusy} onClick={() => setStepIndex((index) => Math.max(0, index - 1))}>Back</button>{stepIndex < steps.length - 1 && <button className={button} type="button" disabled={isBusy} onClick={saveAndContinue}>{isCoverUploading ? 'Uploading cover…' : isSaving ? 'Saving…' : 'Save and continue'}{!isBusy && <Icon name="next" />}</button>}</div>
      </section>
    </div>
    {questionEditorOpen ? <Modal title="Add question" subtitle="This question will be sent to the assessment question endpoint when you save this step." onClose={() => setQuestionEditorOpen(false)}><form className="grid gap-4" onSubmit={(event) => { event.preventDefault(); saveQuestionDraft(); }}><div><label className={fieldLabel} htmlFor="question-prompt">Question prompt</label><textarea id="question-prompt" className="min-h-24 w-full rounded-2xl border-[1.5px] border-line bg-surface p-4 outline-none focus:border-accent" placeholder="Which value best describes Circle HQ?" value={questionDraft.prompt} onChange={(event) => setQuestionDraft((current) => ({ ...current, prompt: event.target.value }))} required /></div><div className="grid gap-4 sm:grid-cols-2"><div><label className={fieldLabel} htmlFor="question-type">Question type</label><CustomSelect id="question-type" className={selectInput} value={questionDraft.type} onChange={(event) => { const type = event.target.value as AssessmentQuestionType; setQuestionDraft((current) => ({ ...current, type, options: type === 'WRITTEN' ? [] : type === 'TRUE_FALSE' ? [{ label: 'True', isCorrect: true }, { label: 'False', isCorrect: false }] : current.options.length ? current.options : [{ label: '', isCorrect: true }, { label: '', isCorrect: false }] })); }}><option value="MULTIPLE_CHOICE">Multiple choice</option><option value="TRUE_FALSE">True / false</option><option value="WRITTEN">Written response</option></CustomSelect></div><div><label className={fieldLabel} htmlFor="question-points">Points</label><input id="question-points" className={`${textInput} w-full`} type="number" min={1} value={questionDraft.points} onChange={(event) => setQuestionDraft((current) => ({ ...current, points: Math.max(1, Number(event.target.value) || 1) }))} /></div></div>{questionDraft.type !== 'WRITTEN' ? <fieldset className="grid gap-2"><legend className={fieldLabel}>Answer options</legend>{questionDraft.options.map((option, index) => <div key={`${questionDraft.localId}-${index}`} className="flex items-center gap-2"><input className={`${textInput} min-w-0 flex-1`} placeholder={`Option ${index + 1}`} value={option.label} readOnly={questionDraft.type === 'TRUE_FALSE'} onChange={(event) => setQuestionDraft((current) => ({ ...current, options: current.options.map((item, itemIndex) => itemIndex === index ? { ...item, label: event.target.value } : item) }))} required /><label className="flex shrink-0 items-center gap-1 text-xs font-semibold"><input type="radio" name="correct-option" checked={option.isCorrect} onChange={() => setQuestionDraft((current) => ({ ...current, options: current.options.map((item, itemIndex) => ({ ...item, isCorrect: itemIndex === index })) }))} />Correct</label>{questionDraft.type === 'MULTIPLE_CHOICE' && questionDraft.options.length > 2 ? <button className="text-sm text-accent-text" type="button" onClick={() => setQuestionDraft((current) => ({ ...current, options: current.options.filter((_, itemIndex) => itemIndex !== index) }))} aria-label={`Remove option ${index + 1}`}>Remove</button> : null}</div>)}{questionDraft.type === 'MULTIPLE_CHOICE' ? <button className="justify-self-start text-sm font-semibold text-accent-text" type="button" onClick={() => setQuestionDraft((current) => ({ ...current, options: [...current.options, { label: '', isCorrect: false }] }))}><Icon name="plus" className="size-4" />Add option</button> : null}</fieldset> : <p className="rounded-xl border border-dashed border-line p-3 text-sm text-muted">Students will enter a written response. No answer options are required.</p>}<div className="flex justify-end gap-2"><button className={buttonGhostSmall} type="button" onClick={() => setQuestionEditorOpen(false)}>Cancel</button><button className={button} type="submit">Add question</button></div></form></Modal> : null}
  </View>;
}
