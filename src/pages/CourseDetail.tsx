import { useState } from 'react';
import { View } from '../components/View';
import { Icon } from '../components/Icon';
import { Quiz } from '../components/Quiz';
import { ReplayList } from '../components/ReplayList';
import { Player } from '../components/Player';
import type { ManagedModule } from '../types/workspace';
import { useToast } from '../contexts/ToastContext';
import { button, buttonGhost, card, courseGrid, heading, infoList, muted, panel } from '../styles';

type Tab = 'lesson' | 'rec' | 'quiz' | 'assignment' | 'project' | 'exam';

interface CourseDetailProps {
  modules: ManagedModule[];
  onBack: () => void;
  onSelectReplay: (id: string) => void;
  onOpenAssignments: () => void;
}

const TABS: {id: Tab;label: string;}[] = [
{ id: 'lesson', label: 'Learn' },
{ id: 'rec', label: 'Recordings' },
{ id: 'quiz', label: 'Quiz 6' },
{ id: 'assignment', label: 'Assignment' },
{ id: 'project', label: 'Final project' },
{ id: 'exam', label: 'Exam' }];


export function CourseDetail({ modules, onBack, onSelectReplay, onOpenAssignments }: CourseDetailProps) {
  const { toast } = useToast();
  const [tab, setTab] = useState<Tab>('lesson');
  const [complete, setComplete] = useState(false);

  return (
    <View>
      <button type="button" className="mb-4 inline-flex items-center gap-1.5 font-semibold text-muted hover:text-foreground" onClick={onBack}>
        <Icon name="back" />
        All courses
      </button>

      <div className={courseGrid}>
        <div>
          <h3 className={heading}>Modules</h3>
          <div>
            {modules.map((module, moduleIndex) => {
              const state = moduleIndex === 0 ? 'now' : 'lock';

              return <details key={module.id} className={`relative pb-[18px] pl-[34px] before:absolute before:top-[22px] before:bottom-[-4px] before:left-2 before:w-0.5 before:bg-line last:before:hidden ${state === 'lock' ? 'opacity-60' : ''}`} open={moduleIndex === 0}>
                <summary className="cursor-pointer list-none text-base font-[650] [&::-webkit-details-marker]:hidden">
                  <span className={`absolute top-0.5 left-0 grid size-[19px] place-items-center rounded-full border-2 bg-background text-muted [&_.i]:size-[11px] [&_.i]:stroke-[3] ${state === 'now' ? 'border-accent shadow-[0_0_0_4px_color-mix(in_srgb,var(--accent)_22%,transparent)]' : 'border-muted'}`} aria-hidden="true">
                    {state === 'lock' && <Icon name="lock" />}
                  </span>
                  {module.title}
                  <small className="block text-[13.5px] font-normal text-muted">{module.lessons.length} lessons</small>
                </summary>
                {module.lessons.length > 0 &&
                  <ul className="mt-2">
                    {module.lessons.map((lesson) =>
                      <li key={lesson.id} className="py-[5px] text-[14.5px] text-muted first:font-semibold first:text-foreground first:before:text-accent-text first:before:content-['Current:_']">
                        {lesson.title}
                      </li>
                    )}
                  </ul>
                }
              </details>;
            })}
          </div>
        </div>

        <div>
          <div className="mb-[22px] flex gap-1.5 border-b border-line" role="tablist">
            {TABS.map((t) =>
            <button
              key={t.id}
              type="button"
              role="tab"
              className="-mb-px border-b-2 border-transparent px-4 py-2.5 font-semibold text-muted transition-colors duration-200 aria-selected:border-accent aria-selected:text-foreground"
              aria-selected={tab === t.id}
              onClick={() => setTab(t.id)}>
              
                {t.label}
              </button>
            )}
          </div>

          {tab === 'lesson' && <div className="animate-pane">
            <div className="mb-5 flex flex-wrap items-start justify-between gap-4"><div><p className="text-sm font-semibold text-accent-text">MODULE 3 · LESSON 2</p><h2 className="mt-1 text-2xl font-[700]">Compound components</h2><p className={`mt-1 ${muted}`}>18 minutes · Video and text · 2 resources</p></div><span className={`rounded-[99px] px-3 py-1 text-xs font-semibold ${complete ? 'bg-reward text-hq-ink' : 'bg-surface-2 text-muted'}`}>{complete ? 'Completed' : 'In progress'}</span></div>
            <Player />
            <article className="mt-7 max-w-[72ch]"><h3 className={heading}>Build flexible APIs without prop drilling</h3><p className="text-muted">Compound components let related UI pieces share state while consumers keep control of composition. In this lesson, you will build a tabs API that remains accessible when panels are reordered or wrapped.</p><div className={`${card} mt-5`}><h4 className="font-[650]">By the end of this lesson, you can</h4><ul className="mt-3 grid gap-2 text-sm">{['Recognise when a compound API improves usability', 'Share state safely through context', 'Preserve keyboard and screen-reader behaviour'].map((item) => <li key={item} className="flex gap-2"><Icon name="check" className="size-4 text-reward" />{item}</li>)}</ul></div><h3 className={`${heading} mt-7`}>Lesson notes</h3><p className="text-muted">Keep the provider responsible for state and behaviour, but let child components own their markup. Memoise the shared value when it contains objects or callbacks, and always design the keyboard model before exposing the API.</p></article>
            <div className="mt-7 grid gap-3 sm:grid-cols-3">{[['file', 'Lesson transcript', 'PDF · 184 KB'], ['folder', 'Starter project', 'ZIP · 32 KB'], ['link', 'React accessibility guide', 'External link']].map(([icon, title, meta]) => <button key={title} type="button" className={`${card} flex items-start gap-3 text-left hover:border-foreground`} onClick={() => toast(`${title} opened.`)}><Icon name={icon as 'file' | 'folder' | 'link'} className="mt-0.5 text-accent-text" /><span><b className="block">{title}</b><span className="text-xs text-muted">{meta}</span></span></button>)}</div>
            <div className="mt-7 flex flex-wrap items-center justify-between gap-3 border-t border-line pt-5"><button className={buttonGhost} type="button" onClick={() => toast('Previous lesson opened.')}>Previous lesson</button><button className={button} type="button" onClick={() => { setComplete(true); toast('Lesson complete. Slots and polymorphic props is unlocked.'); }}><Icon name="check" />{complete ? 'Completed' : 'Mark complete and continue'}</button></div>
          </div>}

          {tab === 'rec' &&
          <div className="animate-pane">
              <p className={`mb-3 ${muted}`}>
                Every live class is recorded and added here within a few hours.
              </p>
              <ReplayList onSelect={onSelectReplay} />
            </div>
          }

          {tab === 'assignment' && <div className="animate-pane"><div className={panel}><span className="text-sm font-semibold text-accent-text">ASSIGNMENT 6</span><h3 className={`${heading} mt-2`}>Design a compound-component API</h3><p className={muted}>Apply this module to an accessible tabs interface. Submit a project link, source file, or written response by Thursday at 11:59 pm.</p><dl className={`${infoList} my-5`}><dt>Attempts</dt><dd>3 allowed</dd><dt>Approval</dt><dd>Facilitator review required</dd><dt>Unlocks</dt><dd>Module 4</dd></dl><button className={button} type="button" onClick={onOpenAssignments}>Open assignment</button></div></div>}

          {tab === 'project' && <div className="animate-pane"><div className={panel}><span className="text-sm font-semibold text-accent-text">FINAL PROJECT</span><h3 className={`${heading} mt-2`}>Build a headless data table</h3><p className={muted}>Create a reusable compound-component data table with sorting, selection, and keyboard navigation. Facilitator approval is required for course completion and certificate eligibility.</p><div className="my-5 grid gap-2">{['All lessons completed', 'Quiz score at least 80%', 'Assignment 6 approved', 'Project approved'].map((item, index) => <div key={item} className="flex items-center gap-2 text-sm"><Icon name={index < 2 ? 'check' : 'lock'} className={`size-4 ${index < 2 ? 'text-reward' : 'text-muted'}`} />{item}</div>)}</div><button className={button} type="button" onClick={onOpenAssignments}>View project brief</button></div></div>}

          {tab === 'quiz' &&
          <div className="animate-pane">
              <Quiz />
            </div>
          }

          {tab === 'exam' &&
          <div className="animate-pane">
              <div className={`${panel} max-w-[560px]`}>
                <h3 className={heading}>Mid-course exam</h3>
                <p className={muted}>
                  Covers modules 1 to 3. Answers save automatically, so a dropped connection will not
                  lose your work.
                </p>
                <dl className={`${infoList} my-3.5 mb-5`}>
                  <dt>Opens</dt>
                  <dd>Friday, 9:00 am</dd>
                  <dt>Duration</dt>
                  <dd>60 minutes</dd>
                  <dt>Attempts</dt>
                  <dd>1</dd>
                </dl>
                <button type="button" className={button} disabled>
                  Opens in 4 days
                </button>
              </div>
            </div>
          }
        </div>
      </div>
    </View>);

}
