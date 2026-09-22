import { useMemo, useState } from 'react';
import { Icon } from '../components/Icon';
import { View } from '../components/View';
import { useToast } from '../contexts/ToastContext';
import { useWorkspace } from '../features/workspace/useWorkspace';
import { button, buttonGhost, card, fieldLabel, heading, muted, textInput } from '../styles';
import { createEntityId } from '../utils/id';

type WorkStatus = 'due' | 'submitted' | 'revision' | 'approved';
type WorkKind = 'Assignment' | 'Checkpoint' | 'Final project';

interface StudentWorkItem {
  id: string;
  title: string;
  course: string;
  kind: WorkKind;
  due: string;
  status: WorkStatus;
  attempt: number;
  brief: string;
  requirements: string[];
  feedback?: string;
}

const initialWork: StudentWorkItem[] = [
  { id: 'a6', title: 'Compound component API', course: 'Advanced React Patterns', kind: 'Assignment', due: 'Thursday, 11:59 pm', status: 'due', attempt: 0, brief: 'Design and document a compound-component API for an accessible tabs interface.', requirements: ['A working project link or ZIP file', 'Keyboard interaction notes', 'A short explanation of the public API'] },
  { id: 'c6', title: 'Module 3 knowledge check', course: 'Advanced React Patterns', kind: 'Checkpoint', due: 'Friday, 9:00 am', status: 'submitted', attempt: 1, brief: 'Your checkpoint is submitted and awaiting automatic grading.', requirements: ['10 questions', '80% passing score', 'One remaining attempt'] },
  { id: 'a4', title: 'Reducer refactor', course: 'Advanced React Patterns', kind: 'Assignment', due: 'Resubmit by Friday', status: 'revision', attempt: 1, brief: 'Refactor the request state to remove impossible combinations.', requirements: ['Upload the updated source', 'Include a short change log'], feedback: 'The states are clearer. Please move the retry transition into the reducer and add one test for the error path.' },
  { id: 'fp', title: 'Headless data table', course: 'Advanced React Patterns', kind: 'Final project', due: '28 September', status: 'due', attempt: 0, brief: 'Build a reusable headless data-table package using the patterns taught in this course.', requirements: ['Public repository or project link', 'README with API decisions', 'Sorting, selection, and keyboard navigation', 'Five-minute walkthrough video'] },
  { id: 'ts2', title: 'Type-safe form model', course: 'TypeScript for Product Teams', kind: 'Assignment', due: 'Submitted 12 September', status: 'approved', attempt: 1, brief: 'Model a multi-step form using discriminated unions.', requirements: ['Written response'], feedback: 'Excellent use of exhaustive checks. Approved.' },
];

const statusLabel: Record<WorkStatus, string> = { due: 'Action required', submitted: 'In review', revision: 'Revision required', approved: 'Approved' };

export function StudentAssignments() {
  const { toast } = useToast();
  const { addSubmission, submissions } = useWorkspace();
  const [baseItems, setBaseItems] = useState(initialWork);
  const [selectedId, setSelectedId] = useState(initialWork[0].id);
  const [filter, setFilter] = useState<'all' | WorkStatus>('all');
  const [submissionMode, setSubmissionMode] = useState<'link' | 'file' | 'written'>('link');
  const [draft, setDraft] = useState('');
  const items = useMemo<StudentWorkItem[]>(() => baseItems.map((item) => {
    const review = submissions.find((submission) =>
      submission.student === 'Ngozi Eze' &&
      submission.course === item.course &&
      submission.title === item.title,
    );

    if (!review) return item;

    const reviewStatus: WorkStatus = review.status === 'pending' ? 'submitted' : review.status;

    return {
      ...item,
      status: reviewStatus,
      attempt: review.attempt,
      feedback: review.feedback,
    };
  }), [baseItems, submissions]);
  const selected = items.find((item) => item.id === selectedId) ?? items[0];
  const visible = useMemo(() => filter === 'all' ? items : items.filter((item) => item.status === filter), [filter, items]);
  const counts = useMemo(() => ({
    due: items.filter((item) => item.status === 'due').length,
    submitted: items.filter((item) => item.status === 'submitted').length,
    revision: items.filter((item) => item.status === 'revision').length,
    approved: items.filter((item) => item.status === 'approved').length,
  }), [items]);

  const submit = () => {
    if (selected.kind !== 'Checkpoint' && draft.trim().length < 4) {
      toast('Add your work before submitting.');
      return;
    }
    const attempt = selected.attempt + 1;
    setBaseItems((current) => current.map((item) => item.id === selected.id ? { ...item, status: 'submitted', attempt } : item));
    addSubmission({
      id: createEntityId('submission'),
      student: 'Ngozi Eze',
      initials: 'NE',
      course: selected.course,
      title: selected.title,
      kind: selected.kind === 'Final project' ? 'Final project' : 'Assignment',
      submitted: 'Just now',
      attempt,
      format: submissionMode === 'link' ? 'Project link' : submissionMode === 'file' ? `File, ${draft}` : 'Written response',
      body: draft,
      status: 'pending',
    });
    setDraft('');
    toast(`${selected.kind} submitted for review.`);
  };

  return (
    <View>
      <div className="mb-8 grid grid-cols-2 gap-3 sm:grid-cols-4">
        {[[counts.due, 'Action required'], [counts.submitted, 'In review'], [counts.revision, 'Revision'], [counts.approved, 'Approved']].map(([value, label]) => <div key={label} className="border-y border-line px-1 py-4 sm:px-4"><b className="block text-3xl font-[740]">{value}</b><span className="text-sm text-muted">{label}</span></div>)}
      </div>
      <div className="grid gap-8 min-[1021px]:grid-cols-[minmax(280px,360px)_minmax(0,1fr)]">
        <aside>
          <div className="mb-4 flex flex-wrap gap-2">{(['all', 'due', 'submitted', 'revision', 'approved'] as const).map((id) => <button key={id} type="button" aria-pressed={filter === id} className="rounded-[99px] border border-line px-3 py-1.5 text-xs font-semibold capitalize text-muted aria-pressed:border-foreground aria-pressed:bg-foreground aria-pressed:text-background" onClick={() => setFilter(id)}>{id === 'all' ? 'All work' : statusLabel[id]}</button>)}</div>
          <div className="grid gap-2">{visible.map((item) => <button key={item.id} type="button" aria-pressed={item.id === selected.id} className="rounded-[16px] border border-transparent p-4 text-left transition-colors hover:bg-surface aria-pressed:border-foreground aria-pressed:bg-surface" onClick={() => setSelectedId(item.id)}><div className="flex items-start justify-between gap-3"><span className="text-xs font-semibold text-accent-text">{item.kind}</span><Status status={item.status} /></div><b className="mt-2 block leading-tight">{item.title}</b><span className="mt-1 block text-sm text-muted">{item.course}</span><span className="mt-3 block text-xs text-muted">{item.due}</span></button>)}</div>
        </aside>

        <section>
          <div className="flex flex-wrap items-start justify-between gap-4"><div><span className="text-sm font-semibold text-accent-text">{selected.kind}</span><h2 className="mt-1 text-2xl font-[700]">{selected.title}</h2><p className={`mt-1 ${muted}`}>{selected.course} · {selected.due}</p></div><Status status={selected.status} large /></div>
          <div className={`${card} mt-6`}><h3 className={heading}>Brief</h3><p>{selected.brief}</p><h4 className="mt-5 font-[650]">What to include</h4><ul className="mt-2 grid gap-2">{selected.requirements.map((requirement) => <li key={requirement} className="flex gap-2 text-sm"><Icon name="check" className="mt-0.5 size-4 text-reward" />{requirement}</li>)}</ul></div>

          {selected.feedback && <div className="mt-5 rounded-[16px_16px_16px_4px] bg-surface-2 p-5"><div className="flex items-center gap-2"><span className="grid size-8 place-items-center rounded-full bg-hq-red-ink text-xs font-bold text-hq-bone">KA</span><div><b className="block">Feedback from Kemi</b><span className="text-xs text-muted">Yesterday, 4:18 pm</span></div></div><p className="mt-3">{selected.feedback}</p></div>}

          {(selected.status === 'due' || selected.status === 'revision') && <div className="mt-7">
            <h3 className={heading}>{selected.status === 'revision' ? 'Submit your revision' : 'Submit your work'}</h3>
            <div className="mb-4 grid grid-cols-3 gap-2 rounded-xl bg-surface-2 p-1">{(['link', 'file', 'written'] as const).map((mode) => <button key={mode} type="button" aria-pressed={submissionMode === mode} className="rounded-[9px] px-2 py-2 text-center text-sm font-semibold capitalize text-muted aria-pressed:bg-background aria-pressed:text-foreground" onClick={() => setSubmissionMode(mode)}>{mode}</button>)}</div>
            {submissionMode === 'link' && <div><label className={fieldLabel} htmlFor="project-link">Project link</label><input id="project-link" className={`${textInput} w-full`} type="url" placeholder="https://github.com/your-name/project" value={draft} onChange={(e) => setDraft(e.target.value)} /></div>}
            {submissionMode === 'file' && <button type="button" className="grid w-full place-items-center rounded-[18px] border-2 border-dashed border-line p-8 text-center hover:border-accent" onClick={() => setDraft('compound-components.zip')}><Icon name="upload" className="mb-2 size-7 text-accent-text" /><b>{draft || 'Choose a file or drop it here'}</b><span className="mt-1 text-sm text-muted">PDF, DOCX, ZIP, PNG, or MP4 up to 200 MB</span></button>}
            {submissionMode === 'written' && <div><label className={fieldLabel} htmlFor="written-response">Written response</label><textarea id="written-response" className="min-h-36 w-full rounded-2xl border-[1.5px] border-line bg-surface p-4 outline-none focus:border-accent" placeholder="Write your response here…" value={draft} onChange={(e) => setDraft(e.target.value)} /></div>}
            <label className="mt-4 flex items-start gap-3 text-sm"><input className="mt-1 accent-[var(--accent)]" type="checkbox" required /><span>I confirm this is my work and the links can be accessed by my facilitator.</span></label>
            <div className="mt-5 flex flex-wrap gap-3"><button className={button} type="button" onClick={submit}>Submit for review</button><button className={buttonGhost} type="button" onClick={() => toast('Draft saved to this device.')}>Save draft</button></div>
          </div>}

          {selected.status === 'submitted' && <div className="mt-6 rounded-[18px] border border-line p-6 text-center"><Icon name="shield" className="mx-auto size-8 text-accent-text" /><h3 className="mt-3 text-lg font-[650]">Your work is with the facilitator</h3><p className="mx-auto mt-1 max-w-[48ch] text-muted">You will receive a notification when it is approved or needs a revision. Attempt {selected.attempt} is safely recorded.</p><button className={`${buttonGhost} mt-4`} type="button" onClick={() => toast('Submission opened in read-only mode.')}>View submitted work</button></div>}

          {selected.status === 'approved' && <div className="mt-6 rounded-[18px] border border-reward bg-[color-mix(in_srgb,var(--reward)_10%,transparent)] p-6"><div className="flex items-center gap-3"><Icon name="graduate" className="size-7" /><div><h3 className="font-[650]">Approved and added to your progress</h3><p className="text-sm text-muted">This requirement is complete. Your next lesson is unlocked.</p></div></div></div>}
        </section>
      </div>
    </View>
  );
}

function Status({ status, large = false }: { status: WorkStatus; large?: boolean }) {
  const tone = status === 'approved' ? 'bg-reward text-hq-ink' : status === 'revision' ? 'bg-accent text-white' : status === 'submitted' ? 'bg-hq-red-ink text-hq-bone' : 'bg-surface-2 text-muted';
  return <span className={`inline-flex shrink-0 rounded-[99px] px-2.5 py-1 font-semibold ${large ? 'text-sm' : 'text-[11px]'} ${tone}`}>{statusLabel[status]}</span>;
}
