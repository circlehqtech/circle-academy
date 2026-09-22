import React from 'react';
import { View } from '../components/View';
import { ProgressRing } from '../components/ProgressRing';
import { ASSIGNED_COURSES, CLASS_ACTIVITIES, ROSTER } from '../data/lms';
import { useToast } from '../contexts/ToastContext';
import type { RosterStudent } from '../types/lms';
import { agenda, art, artTone, buttonGhostSmall, buttonSmall, heading, homeGrid, linkButton, muted, pin, progressBar, row, status as baseStatus, statusMiss, statusSoft, tile, tileBody, tiles } from '../styles';

interface FacilitatorTeachingProps {
  pending: number;
  finalProjects: number;
  onOpenReview: () => void;
}

function statusClass(status: RosterStudent['status']) {
  if (status === 'on track') return baseStatus;
  if (status === 'behind') return statusSoft;
  return statusMiss;
}

export function FacilitatorTeaching({
  pending,
  finalProjects,
  onOpenReview
}: FacilitatorTeachingProps) {
  const { toast } = useToast();
  const students = ASSIGNED_COURSES.reduce((n, c) => n + c.students, 0);

  return (
    <View>
      <div className="ticket">
        <div className="ticket-main">
          <p className="inline-flex items-center gap-[9px] text-[15px] font-[650]">
            <i className="size-2.5 animate-live-pulse rounded-full bg-white" aria-hidden="true" />
            Waiting on you
          </p>
          <h2 className="ticket-title">{pending === 1 ? '1 submission to review' : `${pending} submissions to review`}</h2>
          <p className="max-w-[44ch] opacity-90">
            {finalProjects > 0 ?
            `${finalProjects} of them are final projects, so approving one completes that student's course.` :
            'Every final project is cleared. What is left are assignments and checkpoints.'}
          </p>
          <div className="mt-5 flex flex-wrap gap-2 [&>span]:rounded-[99px] [&>span]:bg-black/20 [&>span]:px-[13px] [&>span]:py-1.5 [&>span]:text-[13.5px] [&>span]:font-[550]">
            <span>{ASSIGNED_COURSES.length} assigned courses</span>
            <span>{students} students</span>
            <span>Cohort 7</span>
          </div>
        </div>
        <div className="ticket-stub">
          <div className="text-[52px] leading-none font-[750] tracking-[-0.03em] [font-variant-numeric:tabular-nums]">{pending}</div>
          <p className="mb-3 opacity-90">in your queue</p>
          <button type="button" className="inline-flex items-center justify-center gap-2 rounded-[99px] bg-hq-bone px-5 py-[11px] font-[650] text-hq-red-deep transition-colors hover:bg-white" onClick={onOpenReview}>
            Open review queue
          </button>
        </div>
      </div>

      <div className={homeGrid}>
        <section>
          <h3 className={heading}>Assigned courses</h3>
          <div className={`${tiles} mb-9`}>
            {ASSIGNED_COURSES.map((c) =>
            <div key={c.id} className={tile}>
                <span className={`${art} ${artTone[c.art]}`} aria-hidden="true">
                  {c.g}
                </span>
                <span className={tileBody}>
                  <b>{c.name}</b>
                  <span>
                    {c.cohort}. {c.students} students, {c.p}% average progress.
                  </span>
                  <span
                  className={progressBar}
                  style={{ '--p': c.p, display: 'block' } as React.CSSProperties}>
                  
                    <i />
                  </span>
                </span>
              </div>
            )}
          </div>

          <h3 className={heading}>Student progress</h3>
          <div>
            {ROSTER.map((s) =>
            <div key={s.name} className={row}>
                <ProgressRing value={s.p} />
                <span>
                  <b className="block text-base font-[620]">{s.name}</b>
                  <span className="secondary">
                    {s.course} · {s.detail}
                  </span>
                  <span className={`${statusClass(s.status)} mt-1`}>
                    <i aria-hidden="true" />
                    {s.status === 'on track' ?
                  'On track' :
                  s.status === 'behind' ?
                  'Behind' :
                  'Needs attention'}
                  </span>
                </span>
                <button
                type="button"
                className={`${buttonGhostSmall} row-action`}
                onClick={() => toast(`Feedback note sent to ${s.name.split(' ')[0]}.`)}>
                
                  Send note
                </button>
              </div>
            )}
          </div>
        </section>

        <section>
          <h3 className={heading}>Class activities</h3>
          <ul className={agenda}>
            {CLASS_ACTIVITIES.map((a) =>
            <li key={a.title}>
                <div>
                  <b>{a.title}</b>
                  <span>{a.when}</span>
                </div>
                <button
                type="button"
                className={a.state === 'today' ? buttonSmall : buttonGhostSmall}
                onClick={() => toast(a.toast)}>
                
                  {a.action}
                </button>
              </li>
            )}
          </ul>

          <div className={pin}>
            <b>Amina Yusuf resubmitted assignment 4</b>
            <span className={muted}>Second attempt, after your revision request</span>
            <div className="mt-2.5">
              <button type="button" className={linkButton} onClick={onOpenReview}>
                Review it now
              </button>
            </div>
          </div>
        </section>
      </div>
    </View>);

}
