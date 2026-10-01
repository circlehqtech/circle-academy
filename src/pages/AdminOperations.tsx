import { useRef, useState } from 'react';
import { useQueries, useQuery, useQueryClient } from '@tanstack/react-query';
import { asRecord, collection } from '../api/adapters';
import { queryKeys } from '../api/endpoints';
import { lmsApi } from '../api/lmsApi';
import { Icon } from '../components/Icon';
import { CustomSelect } from '../components/ui/CustomSelect';
import { EmptyState } from '../components/ui/EmptyState';
import { Modal } from '../components/ui/Modal';
import { PageHeader } from '../components/ui/PageHeader';
import { View } from '../components/View';
import { useToast } from '../contexts/ToastContext';
import { useWorkspace } from '../features/workspace/useWorkspace';
import { button, buttonGhost, buttonGhostSmall, buttonSmall, card, fieldLabel, heading, selectInput, table, tableWrap, textInput } from '../styles';
import { externalHttpUrl } from '../utils/externalMedia';
import { formatDate, toDateTimeLocalValue } from '../utils/dateTime';
import { CertificateManager } from './admin/CertificateManager';

export type AdminSection = 'content' | 'projects' | 'adminCerts';

export function AdminOperations({ section }: { section: AdminSection }) {
  if (section === 'content') return <ContentLibrary />;
  if (section === 'projects') return <Projects />;
  return <CertificateManager />;
}

function ContentLibrary() {
  const { toast } = useToast();
  const { courses } = useWorkspace();
  const fileInput = useRef<HTMLInputElement>(null);
  const [pendingFile, setPendingFile] = useState<File | null>(null);
  const [videoUrl, setVideoUrl] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [addedItems, setAddedItems] = useState<string[][]>([]);
  const courseItems = courses.flatMap((course) => course.modules.flatMap((module) => module.lessons.map((lesson) => [lesson.title, lesson.type, '—', course.title, '—'])));
  const items = [...courseItems, ...addedItems];

  const chooseFile = (file?: File) => {
    if (!file) return;
    if (file.type.startsWith('video/') || /\.(mp4|mov|mkv|avi|webm|m4v|mpeg|mpg)$/i.test(file.name)) {
      setPendingFile(null);
      if (fileInput.current) fileInput.current.value = '';
      toast('Videos are not uploaded. Add the external video link instead.');
      return;
    }
    setPendingFile(file);
  };

  const addPendingFile = async () => {
    if (!pendingFile) return;
    if (pendingFile.type.startsWith('video/') || /\.(mp4|mov|mkv|avi|webm|m4v|mpeg|mpg)$/i.test(pendingFile.name)) {
      toast('Videos are not uploaded. Add the external video link instead.');
      return;
    }
    setIsUploading(true);
    try {
      const upload = await lmsApi.uploads.create(pendingFile, 'course-resource');
      const extension = pendingFile.name.split('.').pop()?.toUpperCase() || 'File';
      const size = pendingFile.size >= 1_000_000 ? `${(pendingFile.size / 1_000_000).toFixed(1)} MB` : `${Math.max(1, Math.round(pendingFile.size / 1000))} KB`;
      setAddedItems((list) => [...list, [pendingFile.name, extension, size, 'Shared library', 'Just now', upload.url]]);
      setPendingFile(null);
      if (fileInput.current) fileInput.current.value = '';
      toast('Content uploaded. The returned URL is ready to attach to a course resource.');
    } catch (failure) {
      toast(failure instanceof Error ? failure.message : 'The content could not be uploaded.');
    } finally {
      setIsUploading(false);
    }
  };
  const addVideoLink = () => {
    const url = externalHttpUrl(videoUrl);
    if (!url) { toast('Enter a valid http or https video URL.'); return; }
    setAddedItems((list) => [...list, ['Video link', 'Video', 'Link', 'Shared library', 'Just now', url]]);
    setVideoUrl('');
    toast('Video link added to the content library.');
  };

  return <View><PageHeader description="Link externally hosted videos and upload smaller documents, audio, images, and downloadable resources." actionLabel="Upload a file" onAction={() => fileInput.current?.click()} />
    <input ref={fileInput} className="sr-only" type="file" accept="audio/*,image/*,.pdf,.doc,.docx,.ppt,.pptx,.xls,.xlsx,.txt,.csv,.zip" disabled={isUploading} onChange={(event) => chooseFile(event.target.files?.[0])} />
    {pendingFile ? <div className="mb-5 rounded-[18px] border-2 border-dashed border-accent bg-[color-mix(in_srgb,var(--accent)_6%,transparent)] p-6"><div className="flex flex-wrap items-center gap-4"><Icon name="file" className="size-8 text-accent-text" /><div className="flex-1"><b className="block">{pendingFile.name}</b><span className="text-sm text-muted">{pendingFile.size >= 1_000_000 ? `${(pendingFile.size / 1_000_000).toFixed(1)} MB` : `${Math.max(1, Math.round(pendingFile.size / 1000))} KB`} · {isUploading ? 'Uploading…' : 'Ready to add'}</span></div><CustomSelect className={`${selectInput} w-auto`} disabled={isUploading}><option>Shared library</option>{courses.map((course) => <option key={course.id}>{course.title}</option>)}</CustomSelect><button className={buttonSmall} type="button" disabled={isUploading} onClick={() => void addPendingFile()}>{isUploading ? 'Uploading…' : 'Add to library'}</button></div></div> : null}
    <div className="mb-6 grid gap-3 sm:grid-cols-2"><button className="grid min-h-36 place-items-center rounded-[20px] border-2 border-dashed border-line p-8 text-center hover:border-accent" type="button" onClick={() => fileInput.current?.click()}><span><Icon name="upload" className="mx-auto mb-2 size-7 text-accent-text" /><b className="block">Choose a non-video file</b><span className="text-sm text-muted">Audio, PDF, documents, images, and ZIP resources</span></span></button><form className="grid gap-3 rounded-[20px] border-2 border-dashed border-line p-6" onSubmit={(event) => { event.preventDefault(); addVideoLink(); }}><div><b className="block">Attach a video link</b><span className="text-sm text-muted">Videos stay on Zoom, YouTube, Vimeo, or your host to save platform storage.</span></div><input className={`${textInput} w-full`} type="url" placeholder="https://…" value={videoUrl} onChange={(event) => setVideoUrl(event.target.value)} required /><button className={buttonSmall} type="submit"><Icon name="link" />Attach video link</button></form></div>
    <div className={tableWrap}><table className={`${table} ${items.length ? '' : '!min-w-0'}`}><thead><tr><th>Content</th><th>Type</th><th className={items.length ? undefined : 'hidden sm:table-cell'}>Size / duration</th><th className={items.length ? undefined : 'hidden md:table-cell'}>Used in</th><th className={items.length ? undefined : 'hidden lg:table-cell'}>Added</th><th className={items.length ? undefined : 'hidden lg:table-cell'} /></tr></thead><tbody>{items.length ? items.map((item) => <tr key={`${item[0]}-${item[3]}`}><td><div className="flex items-center gap-3"><span className="grid size-9 place-items-center rounded-lg bg-surface-2"><Icon name={item[1] === 'Video' ? 'video' : item[1] === 'Audio' ? 'play' : item[1] === 'ZIP' ? 'folder' : 'file'} className="size-4" /></span><b>{item[0]}</b></div></td><td>{item[1]}</td><td>{item[2]}</td><td>{item[3]}</td><td>{item[4]}</td><td><button type="button" className="grid size-8 place-items-center" aria-label={`More options for ${item[0]}`}><Icon name="more" /></button></td></tr>) : <tr><td colSpan={6} className="!p-0"><EmptyState icon="folder" title="Content library is empty" description="Attached video links and uploaded non-video resources will appear in this table." actionLabel="Choose a file" onAction={() => fileInput.current?.click()} className="border-0 bg-transparent" /></td></tr>}</tbody></table></div>
  </View>;
}

type AdminProject = {
  id: string;
  courseId: string;
  courseTitle: string;
  type: string;
  title: string;
  brief: string;
  moduleId: string;
  lessonId: string;
  dueAt: string;
  allowedFormats: string[];
  approvalRequired: boolean;
  status: string;
};

type ProjectDraft = Omit<AdminProject, 'id' | 'courseTitle' | 'status'>;

function toProject(value: unknown, course: { id: string; title: string }): AdminProject {
  const outer = asRecord(value);
  const record = asRecord(outer.project ?? value);
  const formats = Array.isArray(record.allowedFormats) ? record.allowedFormats.map(String) : [];
  return {
    id: String(record.id ?? outer.id ?? ''),
    courseId: String(record.courseId ?? course.id),
    courseTitle: course.title,
    type: String(record.type ?? 'ASSIGNMENT'),
    title: String(record.title ?? 'Untitled project'),
    brief: String(record.brief ?? record.description ?? ''),
    moduleId: String(record.moduleId ?? ''),
    lessonId: String(record.lessonId ?? ''),
    dueAt: String(record.dueAt ?? ''),
    allowedFormats: formats,
    approvalRequired: record.approvalRequired !== false,
    status: String(record.status ?? 'DRAFT'),
  };
}

function projectDate(value: string) {
  return value ? formatDate(value) : 'No deadline';
}

async function fetchProjects(courseId: string, status: ProjectStatus) {
  return collection(await lmsApi.admin.projects(courseId, status), 'projects');
}

type ProjectStatus = 'DRAFT' | 'PUBLISHED' | 'ARCHIVED';

function Projects() {
  const { toast } = useToast();
  const { courses } = useWorkspace();
  const queryClient = useQueryClient();
  const [createOpen, setCreateOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<AdminProject | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [pendingId, setPendingId] = useState('');
  const [courseFilter, setCourseFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState<ProjectStatus>('DRAFT');
  const [draft, setDraft] = useState<ProjectDraft>({ courseId: '', type: 'ASSIGNMENT', title: '', brief: '', moduleId: '', lessonId: '', dueAt: '', allowedFormats: ['PDF', 'ZIP'], approvalRequired: true });
  const filteredCourseId = courseFilter || courses[0]?.id || '';
  const filteredCourse = courses.find((course) => course.id === filteredCourseId);
  const projectQuery = useQuery({ queryKey: queryKeys.admin.projects(filteredCourseId, statusFilter), queryFn: () => fetchProjects(filteredCourseId, statusFilter), enabled: Boolean(filteredCourseId), retry: false, refetchOnWindowFocus: false });
  const projects = collection(projectQuery.data, 'projects').map((value) => toProject(value, filteredCourse ?? { id: filteredCourseId, title: 'Course' })).filter((project) => project.id);
  const selectedCourse = courses.find((course) => course.id === draft.courseId) ?? courses[0];
  const selectedModule = selectedCourse?.modules.find((module) => module.id === draft.moduleId);
  const isLoading = projectQuery.isPending && Boolean(filteredCourseId);
  const invalidateProjectList = (courseId: string, status: ProjectStatus) => queryClient.invalidateQueries({ queryKey: queryKeys.admin.projects(courseId, status) });

  const openCreate = () => {
    const course = courses[0];
    const module = course?.modules[0];
    setDraft({ courseId: course?.id ?? '', type: 'ASSIGNMENT', title: '', brief: '', moduleId: module?.id ?? '', lessonId: module?.lessons[0]?.id ?? '', dueAt: '', allowedFormats: ['PDF', 'ZIP'], approvalRequired: true });
    setEditingProject(null);
    setCreateOpen(true);
  };
  const openEdit = (project: AdminProject) => {
    setDraft({ courseId: project.courseId, type: project.type, title: project.title, brief: project.brief, moduleId: project.moduleId, lessonId: project.lessonId, dueAt: toDateTimeLocalValue(project.dueAt), allowedFormats: project.allowedFormats, approvalRequired: project.approvalRequired });
    setEditingProject(project);
    setCreateOpen(true);
  };
  const saveProject = async () => {
    if (!draft.courseId || !draft.title.trim() || !draft.brief.trim() || !draft.moduleId || !draft.lessonId || !draft.dueAt || !draft.allowedFormats.length) { toast('Choose a course, module, lesson, due date, title, brief, and at least one allowed format.'); return; }
    setIsSaving(true);
    try {
      const payload = { type: draft.type, title: draft.title.trim(), brief: draft.brief.trim(), moduleId: draft.moduleId, lessonId: draft.lessonId, dueAt: draft.dueAt ? new Date(draft.dueAt).toISOString() : undefined, allowedFormats: draft.allowedFormats, approvalRequired: draft.approvalRequired };
      if (editingProject) await lmsApi.admin.updateProject(editingProject.id, payload);
      else await lmsApi.admin.createProject(draft.courseId, payload);
      await invalidateProjectList(draft.courseId, editingProject ? editingProject.status as ProjectStatus : 'DRAFT');
      setCourseFilter(draft.courseId);
      if (!editingProject) setStatusFilter('DRAFT');
      setCreateOpen(false);
      toast(editingProject ? 'Project brief updated.' : 'Project brief created.');
    } catch (failure) { toast(failure instanceof Error ? failure.message : 'The project could not be saved.'); }
    finally { setIsSaving(false); }
  };
  const setProjectStatus = async (project: AdminProject, status: ProjectStatus) => {
    setPendingId(project.id);
    try {
      await lmsApi.admin.setProjectStatus(project.id, status);
      await invalidateProjectList(project.courseId, project.status as ProjectStatus);
      setCourseFilter(project.courseId);
      setStatusFilter(status);
      toast(status === 'ARCHIVED' ? 'Project archived.' : status === 'PUBLISHED' ? 'Project published.' : 'Project moved to draft.');
    } catch (failure) { toast(failure instanceof Error ? failure.message : 'The project status could not be updated.'); }
    finally { setPendingId(''); }
  };

  return <View><PageHeader description="Create and manage assignment and final-project briefs attached to a course lesson." actionLabel="Create project brief" onAction={openCreate} />
    <div className="mb-5 grid gap-3 sm:grid-cols-2"><div><label className={fieldLabel} htmlFor="project-course-filter">Course</label><CustomSelect id="project-course-filter" className={selectInput} value={filteredCourseId} onChange={(event) => setCourseFilter(event.target.value)}>{courses.map((course) => <option key={course.id} value={course.id}>{course.title}</option>)}</CustomSelect></div><div><label className={fieldLabel} htmlFor="project-status-filter">Status</label><CustomSelect id="project-status-filter" className={selectInput} value={statusFilter} onChange={(event) => setStatusFilter(event.target.value as ProjectStatus)}><option value="DRAFT">Draft</option><option value="PUBLISHED">Published</option><option value="ARCHIVED">Archived</option></CustomSelect></div></div>
    {isLoading ? <div className={`${card} grid gap-3`} aria-label="Loading projects">{[1, 2, 3].map((item) => <div key={item} className="h-14 animate-pulse rounded-xl bg-surface-2" />)}</div> : projects.length ? <div className={tableWrap}><table className={table}><thead><tr><th>Project</th><th>Course</th><th>Type</th><th>Due</th><th>Status</th><th><span className="sr-only">Actions</span></th></tr></thead><tbody>{projects.map((project) => <tr key={project.id}><td><b className="block">{project.title}</b><span className="text-xs text-muted">{project.brief}</span></td><td>{project.courseTitle}</td><td>{project.type.replaceAll('_', ' ')}</td><td>{projectDate(project.dueAt)}</td><td><span className="rounded-[99px] bg-surface-2 px-2.5 py-1 text-xs font-semibold">{project.status.replaceAll('_', ' ')}</span></td><td><div className="flex flex-wrap justify-end gap-2"><button className={buttonGhostSmall} type="button" disabled={pendingId === project.id} onClick={() => openEdit(project)}>Edit</button>{project.status !== 'PUBLISHED' ? <button className={buttonGhostSmall} type="button" disabled={pendingId === project.id} onClick={() => void setProjectStatus(project, 'PUBLISHED')}>Publish</button> : <button className={buttonGhostSmall} type="button" disabled={pendingId === project.id} onClick={() => void setProjectStatus(project, 'DRAFT')}>Unpublish</button>}{project.status !== 'ARCHIVED' ? <button className={buttonGhostSmall} type="button" disabled={pendingId === project.id} onClick={() => void setProjectStatus(project, 'ARCHIVED')}>{pendingId === project.id ? 'Saving…' : 'Archive'}</button> : null}</div></td></tr>)}</tbody></table></div> : <EmptyState icon="inbox" title="No project briefs yet" description="Create a project brief and attach it to a course lesson. Projects will appear here after the API returns them." actionLabel="Create project brief" onAction={openCreate} />}
    {createOpen ? <Modal title={editingProject ? `Edit ${editingProject.title}` : 'Create project brief'} subtitle="Attach an assignment or final project to a specific course lesson." onClose={() => setCreateOpen(false)}><form className="grid gap-4" onSubmit={(event) => { event.preventDefault(); void saveProject(); }}><div><label className={fieldLabel}>Course</label><CustomSelect className={selectInput} value={draft.courseId} disabled={Boolean(editingProject)} onChange={(event) => { const course = courses.find((item) => item.id === event.target.value); const module = course?.modules[0]; setDraft((current) => ({ ...current, courseId: event.target.value, moduleId: module?.id ?? '', lessonId: module?.lessons[0]?.id ?? '' })); }}><option value="">Select a course</option>{courses.filter((course) => course.status !== 'Archived').map((course) => <option key={course.id} value={course.id}>{course.title}</option>)}</CustomSelect></div><div className="grid gap-4 sm:grid-cols-2"><div><label className={fieldLabel}>Project type</label><CustomSelect className={selectInput} value={draft.type} onChange={(event) => setDraft((current) => ({ ...current, type: event.target.value }))}><option value="ASSIGNMENT">Assignment</option><option value="FINAL_PROJECT">Final project</option></CustomSelect></div><div><label className={fieldLabel}>Due date</label><input className={`${textInput} w-full`} type="datetime-local" value={draft.dueAt} onChange={(event) => setDraft((current) => ({ ...current, dueAt: event.target.value }))} required /></div></div><div><label className={fieldLabel}>Module</label><CustomSelect className={selectInput} value={draft.moduleId} disabled={!selectedCourse?.modules.length} onChange={(event) => { const module = selectedCourse?.modules.find((item) => item.id === event.target.value); setDraft((current) => ({ ...current, moduleId: event.target.value, lessonId: module?.lessons[0]?.id ?? '' })); }}><option value="">Select a module</option>{selectedCourse?.modules.map((module) => <option key={module.id} value={module.id}>{module.title}</option>)}</CustomSelect></div><div><label className={fieldLabel}>Lesson</label><CustomSelect className={selectInput} value={draft.lessonId} disabled={!selectedModule?.lessons.length} onChange={(event) => setDraft((current) => ({ ...current, lessonId: event.target.value }))}><option value="">Select a lesson</option>{selectedModule?.lessons.map((lesson) => <option key={lesson.id} value={lesson.id}>{lesson.title}</option>)}</CustomSelect></div><div><label className={fieldLabel}>Title</label><input className={`${textInput} w-full`} value={draft.title} onChange={(event) => setDraft((current) => ({ ...current, title: event.target.value }))} placeholder="Build the course landing page" required /></div><div><label className={fieldLabel}>Brief</label><textarea className="min-h-28 w-full rounded-2xl border-[1.5px] border-line bg-surface p-4 outline-none focus:border-accent" value={draft.brief} onChange={(event) => setDraft((current) => ({ ...current, brief: event.target.value }))} placeholder="Submit a working implementation and explain your decisions." required /></div><fieldset className="grid gap-2"><legend className={fieldLabel}>Allowed formats</legend><div className="flex flex-wrap gap-4">{['PDF', 'ZIP', 'LINK'].map((format) => <label key={format} className="flex items-center gap-2 text-sm"><input type="checkbox" checked={draft.allowedFormats.includes(format)} onChange={(event) => setDraft((current) => ({ ...current, allowedFormats: event.target.checked ? [...current.allowedFormats, format] : current.allowedFormats.filter((item) => item !== format) }))} />{format}</label>)}</div></fieldset><label className="flex items-center gap-2 text-sm font-semibold"><input type="checkbox" checked={draft.approvalRequired} onChange={(event) => setDraft((current) => ({ ...current, approvalRequired: event.target.checked }))} />Facilitator approval required</label><div className="flex justify-end gap-2"><button className={buttonGhostSmall} type="button" onClick={() => setCreateOpen(false)}>Cancel</button><button className={button} type="submit" disabled={isSaving}>{isSaving ? 'Saving…' : editingProject ? 'Save changes' : 'Create project'}</button></div></form></Modal> : null}
  </View>;
}

export function LegacyCertificateManager() {
  const { toast } = useToast();
  const { courses } = useWorkspace();
  const [selectedCourseId, setSelectedCourseId] = useState('');
  const [previewUrl, setPreviewUrl] = useState('');
  const [isUploadingTemplate, setIsUploadingTemplate] = useState(false);
  const [isSavingTemplate, setIsSavingTemplate] = useState(false);
  const templateInput = useRef<HTMLInputElement>(null);
  const selectedCourse = courses.find((course) => course.id === selectedCourseId) ?? courses[0];
  const certificateQueries = useQueries({ queries: courses.map((course) => ({ queryKey: queryKeys.admin.certificates(course.id), queryFn: () => lmsApi.admin.certificates(course.id), retry: false, refetchOnWindowFocus: false })) });
  const issued = certificateQueries.flatMap((query, index) => collection(query.data, 'certificates').map((value) => {
    const record = asRecord(value);
    const account = asRecord(record.account ?? record.student);
    const name = `${String(account.firstName ?? '')} ${String(account.lastName ?? '')}`.trim() || String(record.studentName ?? record.name ?? 'Student');
    return { id: String(record.id ?? record.certificateNumber ?? `${courses[index]?.id}-${name}`), number: String(record.certificateNumber ?? '—'), student: name, course: courses[index]?.title ?? 'Course', issuedAt: String(record.issuedAt ?? record.createdAt ?? '—') };
  }));
  const uploadTemplate = async (file?: File) => {
    if (!file) return;
    if (!file.type.startsWith('image/')) { toast('Choose an image file for the certificate template.'); return; }
    setIsUploadingTemplate(true);
    try {
      const upload = await lmsApi.uploads.create(file, 'certificate-template');
      setPreviewUrl(upload.url);
      toast('Certificate template uploaded. Save the template to attach its URL to this course.');
    } catch (failure) { toast(failure instanceof Error ? failure.message : 'The certificate template could not be uploaded.'); }
    finally { setIsUploadingTemplate(false); if (templateInput.current) templateInput.current.value = ''; }
  };
  const saveTemplate = async () => {
    if (!selectedCourse) return;
    setIsSavingTemplate(true);
    try {
      await lmsApi.admin.upsertCertificateTemplate(selectedCourse.id, { name: `${selectedCourse.title} completion certificate`, previewUrl: previewUrl || undefined, version: 1 });
      toast('Certificate template saved for this course.');
    } catch (failure) { toast(failure instanceof Error ? failure.message : 'The certificate template could not be saved.'); }
    finally { setIsSavingTemplate(false); }
  };

  return <View><PageHeader description="Configure branded certificate presentation by course and review immutable issued records." />
    {selectedCourse ? <div className="grid gap-7 min-[1021px]:grid-cols-[minmax(260px,360px)_minmax(0,1fr)]"><aside><h2 className={heading}>Course templates</h2>{courses.map((course) => <button key={course.id} className="mb-2 block w-full rounded-[14px] border border-line p-4 text-left aria-pressed:border-foreground aria-pressed:bg-surface" type="button" aria-pressed={selectedCourse.id === course.id} onClick={() => { setSelectedCourseId(course.id); setPreviewUrl(''); }}><b className="block">{course.title}</b><span className="text-sm text-muted">Landscape · Circle HQ branding</span></button>)}</aside><section><div className="relative aspect-[1.414/1] max-w-[680px] overflow-hidden rounded-lg bg-[#f7f2e7] p-[5%] text-center text-hq-ink shadow-[0_24px_60px_-30px_rgb(0_0_0/.5)] before:absolute before:inset-[3%] before:z-10 before:border-[3px] before:border-hq-red after:absolute after:inset-[4.5%] after:z-10 after:border after:border-hq-amber">{previewUrl ? <img className="absolute inset-0 h-full w-full object-cover" src={previewUrl} alt={`${selectedCourse.title} certificate template preview`} /> : <div className="relative z-10 flex h-full flex-col items-center justify-center"><small>Circle HQ Academy certificate of completion</small><h3 className="mt-3 text-[clamp(18px,3vw,30px)] font-bold">{selectedCourse.title}</h3><p className="mt-3 text-sm text-[#6f685d]">Awarded when all configured course conditions are complete.</p><div className="mt-5 h-px w-1/2 bg-hq-amber" /><b className="mt-2 text-lg">Student name</b><span className="absolute right-[4%] bottom-[2%] grid size-[13%] rotate-[-8deg] place-items-center rounded-full bg-hq-amber text-[clamp(7px,1.2vw,12px)] font-extrabold text-hq-red-ink">HQ<br />VERIFIED</span></div>}</div><input ref={templateInput} className="sr-only" type="file" accept="image/*" disabled={isUploadingTemplate} onChange={(event) => void uploadTemplate(event.target.files?.[0])} /><div className="mt-5 flex flex-wrap gap-3"><button className={buttonGhost} type="button" disabled={isUploadingTemplate || isSavingTemplate} onClick={() => templateInput.current?.click()}><Icon name="upload" />{isUploadingTemplate ? 'Uploading…' : 'Upload template image'}</button><button className={button} type="button" disabled={isUploadingTemplate || isSavingTemplate} onClick={() => void saveTemplate()}><Icon name="save" />{isSavingTemplate ? 'Saving…' : 'Save template'}</button><button className={buttonGhost} type="button" disabled={isUploadingTemplate || isSavingTemplate} onClick={() => toast('Test certificate preview generated.')}>Generate test certificate</button></div></section></div> : <EmptyState icon="award" title="No certificate templates yet" description="Create a course first; each course can then have its own certificate template and eligibility rules." />}
    <h2 className={`${heading} mt-10`}>Recently issued</h2><div className={tableWrap}><table className={`${table} ${issued.length ? '' : '!min-w-0'}`}><thead><tr><th>Student</th><th>Course</th><th className={issued.length ? undefined : 'hidden sm:table-cell'}>Completion date</th><th className={issued.length ? undefined : 'hidden md:table-cell'}>Certificate ID</th><th className={issued.length ? undefined : 'hidden lg:table-cell'} /></tr></thead><tbody>{issued.length ? issued.map((record) => <tr key={record.id}><td><b>{record.student}</b></td><td>{record.course}</td><td>{formatDate(record.issuedAt)}</td><td className="font-mono text-xs">{record.number}</td><td><button className={buttonGhostSmall} type="button" onClick={() => toast('Certificate record opened.')}>View</button></td></tr>) : <tr><td colSpan={5} className="!p-0"><EmptyState icon="award" title="No certificates issued yet" description="Issued certificates will appear here after students complete every required course condition." compact className="border-0 bg-transparent" /></td></tr>}</tbody></table></div>
  </View>;
}
