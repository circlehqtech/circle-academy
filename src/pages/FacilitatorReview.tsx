import { useState } from 'react';
import { View } from '../components/View';
import { Icon } from '../components/Icon';
import { useToast } from '../contexts/ToastContext';
import type { Submission, SubmissionStatus } from '../types/lms';
import { button, buttonGhost, courseGrid, courseListButton, heading, infoList, muted, panel, status, statusMiss, statusSoft, textarea } from '../styles';

interface FacilitatorReviewProps {
  submissions: Submission[];
  onDecide: (id: string, status: SubmissionStatus, feedback: string) => void;
}

const STATUS_LABEL: Record<SubmissionStatus, string> = {
  pending: 'Waiting for review',
  approved: 'Approved',
  revision: 'Revision requested'
};

export function FacilitatorReview({ submissions, onDecide }: FacilitatorReviewProps) {
  const { toast } = useToast();
  const firstPending = submissions.find((s) => s.status === 'pending') ?? submissions[0];
  const [selectedId, setSelectedId] = useState(firstPending?.id ?? '');
  const current = submissions.find((s) => s.id === selectedId) ?? submissions[0];
  const [feedback, setFeedback] = useState(current?.feedback ?? '');

  if (!current) return null;

  const decide = (status: SubmissionStatus) => {
    const text = feedback.trim();
    if (status === 'revision' && !text) {
      toast('Add feedback so the student knows what to change.');
      return;
    }
    onDecide(current.id, status, text);
    toast(
      status === 'approved' ?
      `Approved. ${current.student.split(' ')[0]} has been notified.` :
      `Revision requested. ${current.student.split(' ')[0]} can resubmit.`
    );
  };

  const pending = submissions.filter((s) => s.status === 'pending').length;

  return (
    <View>
      <div className={courseGrid}>
        <div>
          <h3 className={heading}>
            {pending > 0 ? `${pending} waiting` : 'All clear'}
            <span className={`font-normal ${muted}`}>
              {' '}
              of {submissions.length}
            </span>
          </h3>
          <div>
            {submissions.map((s) =>
            <button
              key={s.id}
              type="button"
              className={courseListButton}
              aria-pressed={s.id === current.id}
              onClick={() => {
                setSelectedId(s.id);
                setFeedback(s.feedback ?? '');
              }}>
              
                <b>{s.student}</b>
                <span className={s.status === 'pending' ? undefined : '!text-foreground'}>
                  <Icon name={s.status === 'approved' ? 'check' : s.status === 'revision' ? 'back' : 'inbox'} />
                  {s.title}
                </span>
                <span className={s.status === 'approved' ? status : s.status === 'revision' ? statusMiss : statusSoft}>
                  <i aria-hidden="true" />
                  {STATUS_LABEL[s.status]}
                </span>
              </button>
            )}
          </div>
        </div>

        <div>
          <div className="mb-1.5 flex flex-wrap items-start gap-4 min-[481px]:flex-nowrap [&_h3]:mb-0.5">
            <span className="grid size-[42px] shrink-0 place-items-center rounded-full bg-hq-red-ink text-sm font-bold text-hq-bone" aria-hidden="true">
              {current.initials}
            </span>
            <div className="min-w-0 flex-1">
              <h3 className={heading}>{current.title}</h3>
              <p className={muted}>
                {current.student} · {current.course}
              </p>
            </div>
            <span className={`inline-flex items-center whitespace-nowrap rounded-[99px] px-3 py-[5px] text-[13px] font-[650] ${current.kind === 'Final project' ? 'bg-hq-red-ink text-hq-bone' : 'bg-surface-2 text-muted'}`}>
              {current.kind}
            </span>
          </div>

          <div className={`${panel} mt-4 max-w-none`}>
            <dl className={infoList}>
              <dt>Submitted</dt>
              <dd>{current.submitted}</dd>
              <dt>Attempt</dt>
              <dd>
                {current.attempt} of 3 allowed
              </dd>
              <dt>Format</dt>
              <dd>{current.format}</dd>
            </dl>
          </div>

          <div className="mt-3.5 max-w-[62ch] rounded-[16px_16px_16px_4px] bg-surface-2 px-5 py-[18px]">
            <p>{current.body}</p>
          </div>

          {current.status !== 'pending' &&
          <div className="mt-[18px] flex items-center gap-2.5 rounded-2xl border border-line px-[18px] py-3.5">
              <span className={current.status === 'approved' ? status : statusMiss}>
                <i aria-hidden="true" />
                {STATUS_LABEL[current.status]}
              </span>
              <span className={muted}>
                {current.status === 'approved' ?
              'Counts towards course completion.' :
              'The student can resubmit this work.'}
              </span>
            </div>
          }

          <div className="mt-[22px]">
            <h3 className={heading}>Feedback</h3>
            <div className="grid gap-2.5">
              <textarea
                className={textarea}
                value={feedback}
                aria-label="Feedback for the student"
                placeholder="Tell the student what works and what to change. They see this in their course."
                onChange={(e) => setFeedback(e.target.value)} />
              
            </div>
            <div className="mt-3.5 flex flex-wrap gap-2.5">
              <button type="button" className={button} onClick={() => decide('approved')}>
                <Icon name="check" />
                {current.status === 'approved' ? 'Update approval' : 'Approve submission'}
              </button>
              <button type="button" className={buttonGhost} onClick={() => decide('revision')}>
                Request revision
              </button>
              <span className={`text-[13.5px] ${muted}`}>
                {current.kind === 'Final project' ?
                'Approving unlocks this student’s certificate.' :
                'Feedback is optional when you approve.'}
              </span>
            </div>
          </div>
        </div>
      </div>
    </View>);

}
