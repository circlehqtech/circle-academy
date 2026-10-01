import { useMemo, useRef, useState } from 'react';
import { Icon } from '../components/Icon';
import { View } from '../components/View';
import { useToast } from '../contexts/ToastContext';
import { useWorkspace } from '../features/workspace/useWorkspace';
import { button, buttonGhost, card, fieldLabel, heading, muted, textInput } from '../styles';
import { EmptyState } from '../components/ui/EmptyState';
import { externalHttpUrl } from '../utils/externalMedia';
import { formatDateTime } from '../utils/dateTime';

type WorkStatus = 'due' | 'submitted' | 'revision' | 'approved';
type WorkKind = 'Assignment' | 'Checkpoint' | 'Final project';

interface StudentWorkItem {
  id: string;
  submissionId?: string;
  projectId?: string;
  courseId: string;
  lessonId?: string;
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

const statusLabel: Record<WorkStatus, string> = { due: 'Action required', submitted: 'In review', revision: 'Revision required', approved: 'Approved' };

export function StudentAssignments() {
  const { toast } = useToast();
  const { addSubmission, submissions } = useWorkspace();
  const [selectedId, setSelectedId] = useState('');
  const [filter, setFilter] = useState<'all' | WorkStatus>('all');
  const [submissionMode, setSubmissionMode] = useState<'link' | 'file' | 'written'>('link');
  const [draft, setDraft] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [confirmed, setConfirmed] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const submissionInput = useRef<HTMLInputElement>(null);
  const items = useMemo<StudentWorkItem[]>(() => submissions.map((submission) => {
    const workflow = submission.workflowStatus?.toUpperCase();
    const status: WorkStatus = !submission.submissionId || workflow === 'DRAFT' ? 'due' : submission.status === 'pending' ? 'submitted' : submission.status;
    return { id: submission.id, submissionId: submission.submissionId, projectId: submission.projectId, courseId: submission.courseId ?? '', lessonId: submission.lessonId, title: submission.title, course: submission.course, kind: submission.kind, due: submission.dueAt ? formatDateTime(submission.dueAt) : submission.submitted, status, attempt: submission.attempt, brief: submission.body || 'Open the assignment details for the full brief.', requirements: submission.requirements?.length ? submission.requirements : ['Submit the requested work in an accessible format'], feedback: submission.feedback };
  }), [submissions]);
  const selected = items.find((item) => item.id === selectedId) ?? items[0];
  const visible = useMemo(() => filter === 'all' ? items : items.filter((item) => item.status === filter), [filter, items]);
  const counts = useMemo(() => ({
    due: items.filter((item) => item.status === 'due').length,
    submitted: items.filter((item) => item.status === 'submitted').length,
    revision: items.filter((item) => item.status === 'revision').length,
    approved: items.filter((item) => item.status === 'approved').length,
  }), [items]);

  const chooseSubmissionFile = (file?: File) => {
    if (!file) return;
    if (file.type.startsWith('video/') || /\.(mp4|mov|mkv|avi|webm|m4v|mpeg|mpg)$/i.test(file.name)) {
      setSelectedFile(null);
      if (submissionInput.current) submissionInput.current.value = '';
      toast('Submit videos as an external link instead of uploading the file.');
      return;
    }
    setSelectedFile(file);
  };

  const submit = async () => {
    if (!selected) return;
    if (!selected.courseId) { toast('This assignment is missing its course connection.'); return; }
    if (selected.kind !== 'Checkpoint' && submissionMode === 'file' && !selectedFile) {
      toast('Choose a file before submitting.');
      return;
    }
    if (selected.kind !== 'Checkpoint' && submissionMode !== 'file' && draft.trim().length < 4) {
      toast('Add your work before submitting.');
      return;
    }
    const submittedLink = submissionMode === 'link' ? externalHttpUrl(draft) : '';
    if (submissionMode === 'link' && !submittedLink) {
      toast('Enter a valid http or https project link.');
      return;
    }
    if (selectedFile?.type.startsWith('video/') || (selectedFile && /\.(mp4|mov|mkv|avi|webm|m4v|mpeg|mpg)$/i.test(selectedFile.name))) {
      toast('Submit videos as an external link instead of uploading the file.');
      return;
    }
    if (!confirmed) { toast('Confirm that this is your work before submitting.'); return; }
    setIsSubmitting(true);
    try {
      const description = submissionMode === 'link'
        ? submittedLink
        : submissionMode === 'file'
          ? `File submission: ${selectedFile?.name}`
          : draft.trim();
      const saved = await addSubmission({
        submissionId: selected.submissionId,
        projectId: selected.projectId,
        courseId: selected.courseId,
        lessonId: selected.lessonId,
        title: selected.title,
        description,
        file: selectedFile ?? undefined,
      });
      if (!saved) return;
      setDraft('');
      setSelectedFile(null);
      setConfirmed(false);
      if (submissionInput.current) submissionInput.current.value = '';
    } catch (failure) { toast(failure instanceof Error ? failure.message : 'The submission could not be sent.'); }
    finally { setIsSubmitting(false); }
  };

  return (
    <View>
      <div className="mb-8 grid grid-cols-2 gap-3 sm:grid-cols-4">
        {[[counts.due, 'Action required'], [counts.submitted, 'In review'], [counts.revision, 'Revision'], [counts.approved, 'Approved']].map(([value, label]) => <div key={label} className="border-y border-line px-1 py-4 sm:px-4"><b className="block text-3xl font-[740]">{value}</b><span className="text-sm text-muted">{label}</span></div>)}
      </div>
      {!selected ? <EmptyState icon="inbox" title="No assignments yet" description="Assignments and projects for your enrolled courses will appear here." /> : <>
      <div className="grid gap-8 min-[1021px]:grid-cols-[minmax(280px,360px)_minmax(0,1fr)]">
        <aside>
          <div className="mb-4 flex flex-wrap gap-2">{(['all', 'due', 'submitted', 'revision', 'approved'] as const).map((id) => <button key={id} type="button" aria-pressed={filter === id} className="rounded-[99px] border border-line px-3 py-1.5 text-xs font-semibold capitalize text-muted aria-pressed:border-foreground aria-pressed:bg-foreground aria-pressed:text-background" onClick={() => setFilter(id)}>{id === 'all' ? 'All work' : statusLabel[id]}</button>)}</div>
          <div className="grid gap-2">{visible.map((item) => <button key={item.id} type="button" aria-pressed={item.id === selected.id} className="rounded-[16px] border border-transparent p-4 text-left transition-colors hover:bg-surface aria-pressed:border-foreground aria-pressed:bg-surface" onClick={() => setSelectedId(item.id)}><div className="flex items-start justify-between gap-3"><span className="text-xs font-semibold text-accent-text">{item.kind}</span><Status status={item.status} /></div><b className="mt-2 block leading-tight">{item.title}</b><span className="mt-1 block text-sm text-muted">{item.course}</span><span className="mt-3 block text-xs text-muted">{item.due}</span></button>)}</div>
        </aside>

        <section>
          <div className="flex flex-wrap items-start justify-between gap-4"><div><span className="text-sm font-semibold text-accent-text">{selected.kind}</span><h2 className="mt-1 text-2xl font-[700]">{selected.title}</h2><p className={`mt-1 ${muted}`}>{selected.course} · {selected.due}</p></div><Status status={selected.status} large /></div>
          <div className={`${card} mt-6`}><h3 className={heading}>Brief</h3><p>{selected.brief}</p><h4 className="mt-5 font-[650]">What to include</h4><ul className="mt-2 grid gap-2">{selected.requirements.map((requirement) => <li key={requirement} className="flex gap-2 text-sm"><Icon name="check" className="mt-0.5 size-4 text-reward" />{requirement}</li>)}</ul></div>

          {selected.feedback && <div className="mt-5 rounded-[16px_16px_16px_4px] bg-surface-2 p-5"><div className="flex items-center gap-2"><span className="grid size-8 place-items-center rounded-full bg-hq-red-ink text-hq-bone"><Icon name="user" className="size-4" /></span><b className="block">Facilitator feedback</b></div><p className="mt-3">{selected.feedback}</p></div>}

          {(selected.status === 'due' || selected.status === 'revision') && <div className="mt-7">
            <h3 className={heading}>{selected.status === 'revision' ? 'Submit your revision' : 'Submit your work'}</h3>
            <div className="mb-4 grid grid-cols-3 gap-2 rounded-xl bg-surface-2 p-1">{(['link', 'file', 'written'] as const).map((mode) => <button key={mode} type="button" disabled={isSubmitting} aria-pressed={submissionMode === mode} className="rounded-[9px] px-2 py-2 text-center text-sm font-semibold capitalize text-muted aria-pressed:bg-background aria-pressed:text-foreground disabled:opacity-50" onClick={() => { setSubmissionMode(mode); setDraft(''); setSelectedFile(null); }}>{mode}</button>)}</div>
            {submissionMode === 'link' && <div><label className={fieldLabel} htmlFor="project-link">Project link</label><input id="project-link" className={`${textInput} w-full`} type="url" placeholder="https://github.com/your-name/project" value={draft} onChange={(e) => setDraft(e.target.value)} /></div>}
            {submissionMode === 'file' && <><input ref={submissionInput} className="sr-only" type="file" accept="audio/*,image/*,.pdf,.doc,.docx,.ppt,.pptx,.xls,.xlsx,.txt,.csv,.zip" disabled={isSubmitting} onChange={(event) => chooseSubmissionFile(event.target.files?.[0])} /><button type="button" disabled={isSubmitting} className="grid w-full place-items-center rounded-[18px] border-2 border-dashed border-line p-8 text-center hover:border-accent disabled:cursor-wait disabled:opacity-60" onClick={() => submissionInput.current?.click()}><Icon name="upload" className="mb-2 size-7 text-accent-text" /><b>{selectedFile?.name || 'Choose a non-video file'}</b><span className="mt-1 text-sm text-muted">Documents, images, archives, and audio can be uploaded. Submit videos from the Link tab.</span></button></>}
            {submissionMode === 'written' && <div><label className={fieldLabel} htmlFor="written-response">Written response</label><textarea id="written-response" className="min-h-36 w-full rounded-2xl border-[1.5px] border-line bg-surface p-4 outline-none focus:border-accent" placeholder="Write your response here…" value={draft} onChange={(e) => setDraft(e.target.value)} /></div>}
            <label className="mt-4 flex items-start gap-3 text-sm"><input className="mt-1 accent-[var(--accent)]" type="checkbox" checked={confirmed} onChange={(event) => setConfirmed(event.target.checked)} /><span>I confirm this is my work and the links can be accessed by my facilitator.</span></label>
            <div className="mt-5 flex flex-wrap gap-3"><button className={button} type="button" disabled={isSubmitting} onClick={() => void submit()}>{isSubmitting ? 'Submitting…' : 'Submit for review'}</button><button className={buttonGhost} type="button" disabled={isSubmitting} onClick={() => toast('Draft saved to this device.')}>Save draft</button></div>
          </div>}

          {selected.status === 'submitted' && <div className="mt-6 rounded-[18px] border border-line p-6 text-center"><Icon name="shield" className="mx-auto size-8 text-accent-text" /><h3 className="mt-3 text-lg font-[650]">Your work is with the facilitator</h3><p className="mx-auto mt-1 max-w-[48ch] text-muted">You will receive a notification when it is approved or needs a revision. Attempt {selected.attempt} is safely recorded.</p><button className={`${buttonGhost} mt-4`} type="button" onClick={() => toast('Submission opened in read-only mode.')}>View submitted work</button></div>}

          {selected.status === 'approved' && <div className="mt-6 rounded-[18px] border border-reward bg-[color-mix(in_srgb,var(--reward)_10%,transparent)] p-6"><div className="flex items-center gap-3"><Icon name="graduate" className="size-7" /><div><h3 className="font-[650]">Approved and added to your progress</h3><p className="text-sm text-muted">This requirement is complete. Your next lesson is unlocked.</p></div></div></div>}
        </section>
      </div></>}
    </View>
  );
}

function Status({ status, large = false }: { status: WorkStatus; large?: boolean }) {
  const tone = status === 'approved' ? 'bg-reward text-hq-ink' : status === 'revision' ? 'bg-accent text-white' : status === 'submitted' ? 'bg-hq-red-ink text-hq-bone' : 'bg-surface-2 text-muted';
  return <span className={`inline-flex shrink-0 rounded-[99px] px-2.5 py-1 font-semibold ${large ? 'text-sm' : 'text-[11px]'} ${tone}`}>{statusLabel[status]}</span>;
}
