import { useState } from 'react';
import { EmptyState } from '../components/ui/EmptyState';
import { Icon } from '../components/Icon';
import { ReplayList } from '../components/ReplayList';
import { View } from '../components/View';
import { lmsApi } from '../api/lmsApi';
import { useToast } from '../contexts/ToastContext';
import type { AssessmentRecord, ManagedModule } from '../types/workspace';
import { buttonGhostSmall, card, courseGrid, heading, muted } from '../styles';
import { externalHttpUrl, isDirectVideoUrl, videoEmbedUrl } from '../utils/externalMedia';
import { CourseQuizPanel } from './student/AssessmentsPage';

interface CourseDetailProps {
  courseId: string;
  progress: number;
  modules: ManagedModule[];
  assessments: AssessmentRecord[];
  onBack: () => void;
  onSelectReplay: (id: string) => void;
}

type CourseTab = 'lesson' | 'quiz' | 'recordings';

export function CourseDetail({ courseId, progress, modules, assessments, onBack, onSelectReplay }: CourseDetailProps) {
  const lessons = modules.flatMap((module) => module.lessons.map((lesson) => ({ ...lesson, moduleTitle: module.title })));
  const [selectedLessonId, setSelectedLessonId] = useState('');
  const [completedLessonIds, setCompletedLessonIds] = useState<string[]>(() => progress >= 100 ? lessons.map((lesson) => lesson.id) : []);
  const [savingLessonId, setSavingLessonId] = useState('');
  const [tab, setTab] = useState<CourseTab>('lesson');
  const { toast } = useToast();
  const selectedLesson = lessons.find((lesson) => lesson.id === selectedLessonId) ?? lessons[0];

  const markLessonComplete = async () => {
    if (!selectedLesson || completedLessonIds.includes(selectedLesson.id) || savingLessonId) return;
    setSavingLessonId(selectedLesson.id);
    try {
      await lmsApi.courses.recordProgress(courseId, {
        lessonId: selectedLesson.id,
        type: 'LESSON_COMPLETED',
      });
      setCompletedLessonIds((current) => [...current, selectedLesson.id]);
      toast('Lesson marked complete.');
    } catch (error) {
      toast(error instanceof Error ? error.message : 'Could not update lesson progress.');
    } finally {
      setSavingLessonId('');
    }
  };

  return <View>
    <button type="button" className="mb-4 inline-flex items-center gap-1.5 font-semibold text-muted hover:text-foreground" onClick={onBack}><Icon name="back" />All courses</button>
    <div className={`${card} mb-5 flex flex-wrap items-center justify-between gap-4 p-4`}>
      <div><b className="block">{progress >= 100 ? 'Course completed' : 'Course progress'}</b><span className="text-sm text-muted">{progress >= 100 ? 'Every lesson has been completed.' : `${progress}% of the course completed.`}</span></div>
      <div className="flex items-center gap-3"><div className="h-2 w-36 overflow-hidden rounded-full bg-surface-2" role="progressbar" aria-label="Course progress" aria-valuemin={0} aria-valuemax={100} aria-valuenow={progress}><div className={`h-full rounded-full ${progress >= 100 ? 'bg-reward' : 'bg-accent'}`} style={{ width: `${progress}%` }} /></div><b>{progress}%</b>{progress >= 100 ? <Icon name="check" className="text-reward" /> : null}</div>
    </div>
    {!modules.length ? <EmptyState icon="book" title="This course has no content yet" description="Modules and lessons will appear here after the course team publishes them." /> : <div className={courseGrid}>
      <aside>
        <h2 className={heading}>Modules</h2>
        <div className="grid gap-3">{modules.map((module, index) => <section key={module.id} className={card}><div className="flex items-start gap-3"><span className="grid size-7 shrink-0 place-items-center rounded-full bg-surface-2 text-xs font-bold">{index + 1}</span><div className="min-w-0 flex-1"><b className="block">{module.title}</b><span className="text-xs text-muted">{module.lessons.length} {module.lessons.length === 1 ? 'lesson' : 'lessons'}</span></div></div>{module.lessons.length ? <div className="mt-3 grid gap-1">{module.lessons.map((lesson) => <button key={lesson.id} type="button" aria-pressed={selectedLesson?.id === lesson.id} className="rounded-xl px-3 py-2 text-left text-sm text-muted hover:bg-background aria-pressed:bg-background aria-pressed:font-semibold aria-pressed:text-foreground" onClick={() => { setSelectedLessonId(lesson.id); setTab('lesson'); }}><span className="flex items-center justify-between gap-2"><span>{lesson.title}<span className="mt-0.5 block text-xs font-normal text-muted">{lesson.type}</span></span>{completedLessonIds.includes(lesson.id) ? <Icon name="check" className="shrink-0 text-reward" /> : null}</span></button>)}</div> : <p className="mt-3 rounded-xl border border-dashed border-line p-3 text-sm text-muted">No lessons in this module yet.</p>}</section>)}</div>
      </aside>

      <section>
        <div className="mb-6 flex gap-1.5 overflow-x-auto border-b border-line" role="tablist" aria-label="Course sections"><button type="button" role="tab" aria-selected={tab === 'lesson'} className="-mb-px min-h-11 shrink-0 border-b-2 border-transparent px-4 py-2.5 font-semibold text-muted aria-selected:border-accent aria-selected:text-foreground" onClick={() => setTab('lesson')}>Learn</button><button type="button" role="tab" aria-selected={tab === 'quiz'} className="-mb-px min-h-11 shrink-0 border-b-2 border-transparent px-4 py-2.5 font-semibold text-muted aria-selected:border-accent aria-selected:text-foreground" onClick={() => setTab('quiz')}>Quiz</button><button type="button" role="tab" aria-selected={tab === 'recordings'} className="-mb-px min-h-11 shrink-0 border-b-2 border-transparent px-4 py-2.5 font-semibold text-muted aria-selected:border-accent aria-selected:text-foreground" onClick={() => setTab('recordings')}>Recordings</button></div>
        {tab === 'lesson' ? selectedLesson ? <div><p className="text-sm font-semibold text-accent-text">{selectedLesson.moduleTitle.toUpperCase()}</p><h2 className="mt-1 text-2xl font-[700]">{selectedLesson.title}</h2><p className={`mt-1 ${muted}`}>{selectedLesson.type}</p>{selectedLesson.description ? <p className="mt-4 max-w-[68ch] text-muted">{selectedLesson.description}</p> : null}<LessonMaterial lesson={selectedLesson} /><div className="mt-6 flex justify-end"><button type="button" className={buttonGhostSmall} disabled={savingLessonId === selectedLesson.id || completedLessonIds.includes(selectedLesson.id)} onClick={markLessonComplete}>{completedLessonIds.includes(selectedLesson.id) ? <><Icon name="check" />Completed</> : savingLessonId === selectedLesson.id ? 'Saving…' : <><Icon name="check" />Mark lesson complete</>}</button></div></div> : <EmptyState icon="book" title="No lessons available" description="Add lessons to a module before learning content can be shown." /> : tab === 'quiz' ? <CourseQuizPanel assessments={assessments} /> : <div><p className={`mb-3 ${muted}`}>Published class recordings for this course appear here.</p><ReplayList onSelect={onSelectReplay} /></div>}
      </section>
    </div>}
  </View>;
}

function LessonMaterial({ lesson }: { lesson: ManagedModule['lessons'][number] }) {
  const resources = lesson.resources ?? [];
  const video = resources.find((resource) => resource.type === 'Video' && externalHttpUrl(resource.url));
  const videoUrl = externalHttpUrl(video?.url);
  const embedUrl = videoEmbedUrl(videoUrl);
  if (!resources.length) return <EmptyState icon={lesson.type === 'Video' || lesson.type === 'Class recording' ? 'video' : lesson.type === 'Audio' ? 'play' : 'file'} title="Lesson material is not available yet" description="The lesson has been created, but its learning resource has not been added or published." compact className="mt-6" />;

  return <div className="mt-6 grid gap-4">
    {videoUrl ? <div className="overflow-hidden rounded-[20px] bg-hq-ink text-hq-bone">{embedUrl ? <iframe className="aspect-video w-full border-0" src={embedUrl} title={video?.title ?? lesson.title} allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowFullScreen /> : isDirectVideoUrl(videoUrl) ? <video className="aspect-video w-full bg-black" src={videoUrl} controls preload="metadata">Your browser cannot play this linked video.</video> : <div className="grid aspect-video place-items-center p-8 text-center"><div><Icon name="video" className="mx-auto mb-3 size-8 text-hq-amber" /><b className="block text-xl">{video?.title}</b><p className="mt-1 text-sm text-white/70">This lesson video is hosted externally.</p><a className="mt-4 inline-flex items-center gap-2 rounded-full bg-accent px-5 py-2.5 font-semibold text-white" href={videoUrl} target="_blank" rel="noopener noreferrer"><Icon name="play" filled className="size-4" />Open video</a></div></div>}<div className="flex items-center justify-between gap-3 px-4 py-3"><span className="text-sm">Externally hosted video</span><a className="inline-flex items-center gap-1.5 text-sm font-semibold text-hq-amber hover:underline" href={videoUrl} target="_blank" rel="noopener noreferrer"><Icon name="link" className="size-4" />Open in new tab</a></div></div> : null}
    {resources.filter((resource) => resource.id !== video?.id).map((resource) => {
      const url = externalHttpUrl(resource.url);
      return <article key={resource.id} className={`${card} flex flex-wrap items-start justify-between gap-4`}><div><b className="block">{resource.title}</b><span className="text-sm text-muted">{resource.type}{resource.required ? ' · Required' : ''}</span>{resource.textContent ? <p className="mt-3 whitespace-pre-wrap">{resource.textContent}</p> : null}</div>{url ? <a className="inline-flex items-center gap-2 text-sm font-semibold text-accent-text hover:underline" href={url} target="_blank" rel="noopener noreferrer"><Icon name="link" className="size-4" />Open resource</a> : null}</article>;
    })}
  </div>;
}
