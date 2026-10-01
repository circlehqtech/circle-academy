import { useEffect, useState } from 'react';
import { View } from '../components/View';
import { ProgressRing } from '../components/ProgressRing';
import type { Course } from '../types/lms';
import { useToast } from '../contexts/ToastContext';
import { fmt } from '../utils/format';
import { buttonGhostSmall, card, heading, homeGrid, linkButton, muted, pin, row } from '../styles';
import { EmptyState } from '../components/ui/EmptyState';
import { useWorkspace } from '../features/workspace/useWorkspace';
import { formatClockTime, formatDate } from '../utils/dateTime';

interface StudentHomeProps {
  courses: Course[];
  nextClass?: {
    title: string;
    course: string;
    host: string;
    startsAt: string;
    time: string;
    duration: number;
    meetingUrl: string;
    status: string;
  };
  onOpenCourse: (id: string) => void;
  onOpenAnnouncements: () => void;
  onOpenAssignments: () => void;
}

export function StudentHome({ courses, nextClass, onOpenCourse, onOpenAnnouncements, onOpenAssignments }: StudentHomeProps) {
  const { toast } = useToast();
  const { announcements, submissions } = useWorkspace();
  const [countdown, setCountdown] = useState(() => nextClass ? Math.max(0, Math.floor((new Date(nextClass.startsAt).getTime() - Date.now()) / 1000)) : 0);

  useEffect(() => {
    const id = window.setInterval(() => setCountdown((c) => Math.max(0, c - 1)), 1000);
    return () => window.clearInterval(id);
  }, []);

  const inProgress = courses.filter((c) => c.p < 100);
  const nextActions = submissions.filter((item) => item.status === 'revision' || item.workflowStatus?.toUpperCase() === 'DRAFT').slice(0, 3);

  return (
    <View>
      {nextClass ? <div className="ticket">
        <div className="ticket-main">
          <p className="inline-flex items-center gap-[9px] text-[15px] font-[650]">
            <i className="size-2.5 animate-live-pulse rounded-full bg-white" aria-hidden="true" />
            {nextClass.status === 'Live' ? 'Class is live' : 'Next live class'}
          </p>
          <h2 className="ticket-title">{nextClass.title}</h2>
          <p className="max-w-[44ch] opacity-90">
            {nextClass.course}, with {nextClass.host}. The recording link is attached after class.
          </p>
          <div className="mt-5 flex flex-wrap gap-2 [&>span]:rounded-[99px] [&>span]:bg-black/20 [&>span]:px-[13px] [&>span]:py-1.5 [&>span]:text-[13.5px] [&>span]:font-[550]">
            <span>{formatClockTime(nextClass.time)}</span><span>{nextClass.duration} minutes</span><span>Zoom</span>
          </div>
        </div>
        <div className="ticket-stub">
          <div className="text-[52px] leading-none font-[750] tracking-[-0.03em] [font-variant-numeric:tabular-nums]">{nextClass.status === 'Live' || !countdown ? 'Live' : fmt(countdown)}</div>
          <p className="mb-3 opacity-90">{nextClass.status === 'Live' || !countdown ? 'join your class now' : 'until class starts'}</p>
          <button
            type="button"
            className="inline-flex items-center justify-center gap-2 rounded-[99px] bg-hq-bone px-5 py-[11px] font-[650] text-hq-red-deep transition-colors hover:bg-white"
            onClick={() => {
              if (nextClass.meetingUrl) window.open(nextClass.meetingUrl, '_blank', 'noopener,noreferrer');
              else toast('The facilitator has not added a meeting link yet.');
            }}>
            
            Join on Zoom
          </button>
        </div>
      </div> : null}

      <div className={homeGrid}>
        <section>
          <h3 className={heading}>Continue learning</h3>
          {inProgress.length ? <div>
            {inProgress.map((c) =>
            <button key={c.id} type="button" className={row} onClick={() => onOpenCourse(c.id)}>
                <ProgressRing value={c.p} />
                <span>
                  <b className="block text-base font-[620]">{c.name}</b>
                  <span className="secondary">Next: {c.next}</span>
                </span>
                <span className={`${buttonGhostSmall} row-action`}>Resume</span>
              </button>
            )}
          </div> : <EmptyState icon="book" title="No active courses" description="Your enrolled courses will appear here when learning access is assigned." compact />}
          {courses.length ? <span className="mt-4 inline-flex items-center gap-2 rounded-[99px] border border-reward px-3.5 py-2 text-sm font-semibold">
            <i className="size-2.5 rounded-full bg-reward" aria-hidden="true" />{inProgress.length} {inProgress.length === 1 ? 'course' : 'courses'} in progress
          </span> : null}
        </section>

        <section>
          <h3 className={heading}>This week</h3>
          {nextClass ? <ul className="relative mt-1.5 [&_li]:relative [&_li]:pb-[22px] [&_li]:pl-8 [&_li]:before:absolute [&_li]:before:top-2 [&_li]:before:bottom-[-8px] [&_li]:before:left-[5px] [&_li]:before:w-0.5 [&_li]:before:bg-line [&_li:last-child]:before:hidden [&_li>i]:absolute [&_li>i]:top-[5px] [&_li>i]:left-0 [&_li>i]:size-3 [&_li>i]:rounded-full [&_li>i]:border-2 [&_li>i]:border-muted [&_li>i]:bg-background [&_b]:block [&_b]:font-[620] [&_span]:text-sm [&_span]:text-muted"><li><i className="!border-accent !bg-accent" aria-hidden="true" /><b>Live class: {nextClass.title}</b><span>{formatDate(nextClass.startsAt)}, {formatClockTime(nextClass.time)}</span></li></ul> : <EmptyState icon="video" title="Nothing scheduled this week" description="Upcoming live classes and deadlines will appear here." compact />}
          {announcements[0] ? <div className={pin}>
            <b>{announcements[0].t}</b>
            <span className={muted}>{announcements[0].m}</span>
            <div className="mt-2.5">
              <button
                type="button"
                className={linkButton}
                onClick={(e) => {
                  e.stopPropagation();
                  onOpenAnnouncements();
                }}>
                
                See all announcements
              </button>
            </div>
          </div> : null}
        </section>
      </div>

      <section className="mt-10">
        <h3 className={heading}>Your next actions</h3>
        {nextActions.length ? <div className="grid gap-4 md:grid-cols-3">{nextActions.map((item) => <button key={item.id} className={`${card} text-left hover:border-foreground`} type="button" onClick={onOpenAssignments}><span className="text-xs font-semibold text-accent-text">{item.status === 'revision' ? 'REVISION REQUESTED' : 'ACTION REQUIRED'}</span><b className="mt-2 block text-base">{item.title}</b><span className="mt-1 block text-sm text-muted">{item.course} · {item.kind}</span><span className="mt-4 inline-flex items-center gap-1 text-sm font-semibold">Open assignment →</span></button>)}</div> : <EmptyState icon="check" title="You are all caught up" description="Assignments, revisions, and other required actions will appear here." compact />}
      </section>
    </View>);

}
