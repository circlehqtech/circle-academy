import { useEffect, useState } from 'react';
import { View } from '../components/View';
import { ProgressRing } from '../components/ProgressRing';
import { COURSES } from '../data/lms';
import { useToast } from '../contexts/ToastContext';
import { fmt } from '../utils/format';
import { buttonGhostSmall, card, heading, homeGrid, linkButton, muted, pin, row } from '../styles';

interface StudentHomeProps {
  onOpenCourse: (id: string) => void;
  onOpenAnnouncements: () => void;
  onOpenAssignments: () => void;
  onOpenCertificates: () => void;
}

export function StudentHome({ onOpenCourse, onOpenAnnouncements, onOpenAssignments, onOpenCertificates }: StudentHomeProps) {
  const { toast } = useToast();
  const [countdown, setCountdown] = useState(754);

  useEffect(() => {
    const id = window.setInterval(() => setCountdown((c) => Math.max(0, c - 1)), 1000);
    return () => window.clearInterval(id);
  }, []);

  const inProgress = COURSES.filter((c) => c.p < 100);

  return (
    <View>
      <div className="ticket">
        <div className="ticket-main">
          <p className="inline-flex items-center gap-[9px] text-[15px] font-[650]">
            <i className="size-2.5 animate-live-pulse rounded-full bg-white" aria-hidden="true" />
            Live class today
          </p>
          <h2 className="ticket-title">Compound components</h2>
          <p className="max-w-[44ch] opacity-90">
            Week 6 of Advanced React Patterns, with Dr. Amaka Obi. Recording is uploaded after class.
          </p>
          <div className="mt-5 flex flex-wrap gap-2 [&>span]:rounded-[99px] [&>span]:bg-black/20 [&>span]:px-[13px] [&>span]:py-1.5 [&>span]:text-[13.5px] [&>span]:font-[550]">
            <span>4:00 pm</span><span>90 minutes</span><span>Zoom</span>
          </div>
        </div>
        <div className="ticket-stub">
          <div className="text-[52px] leading-none font-[750] tracking-[-0.03em] [font-variant-numeric:tabular-nums]">{countdown ? fmt(countdown) : 'Live'}</div>
          <p className="mb-3 opacity-90">until class starts</p>
          <button
            type="button"
            className="inline-flex items-center justify-center gap-2 rounded-[99px] bg-hq-bone px-5 py-[11px] font-[650] text-hq-red-deep transition-colors hover:bg-white"
            onClick={() => toast('Opening Zoom. This is a preview.')}>
            
            Join on Zoom
          </button>
        </div>
      </div>

      <div className={homeGrid}>
        <section>
          <h3 className={heading}>Continue learning</h3>
          <div>
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
          </div>
          <span className="mt-4 inline-flex items-center gap-2 rounded-[99px] border border-reward px-3.5 py-2 text-sm font-semibold">
            <i className="size-2.5 rounded-full bg-reward" aria-hidden="true" />6 day study streak
          </span>
        </section>

        <section>
          <h3 className={heading}>This week</h3>
          <ul className="relative mt-1.5 [&_li]:relative [&_li]:pb-[22px] [&_li]:pl-8 [&_li]:before:absolute [&_li]:before:top-2 [&_li]:before:bottom-[-8px] [&_li]:before:left-[5px] [&_li]:before:w-0.5 [&_li]:before:bg-line [&_li:last-child]:before:hidden [&_li>i]:absolute [&_li>i]:top-[5px] [&_li>i]:left-0 [&_li>i]:size-3 [&_li>i]:rounded-full [&_li>i]:border-2 [&_li>i]:border-muted [&_li>i]:bg-background [&_b]:block [&_b]:font-[620] [&_span]:text-sm [&_span]:text-muted">
            <li>
              <i className="!border-accent !bg-accent" aria-hidden="true" /><b>Live class: Compound components</b><span>Today, 4:00 pm</span>
            </li>
            <li>
              <i aria-hidden="true" />
              <b>Quiz 6</b>
              <span>Thursday, closes 11:59 pm</span>
            </li>
            <li>
              <i aria-hidden="true" />
              <b>Mid-course exam</b>
              <span>Friday, 9:00 am, 60 minutes</span>
            </li>
          </ul>
          <div className={pin}>
            <b>Thursday&apos;s TypeScript class moves to 5:00 pm</b>
            <span className={muted}>Posted today by Dr. Amaka Obi</span>
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
          </div>
        </section>
      </div>

      <section className="mt-10">
        <h3 className={heading}>Your next actions</h3>
        <div className="grid gap-4 md:grid-cols-3">
          <button className={`${card} text-left hover:border-foreground`} type="button" onClick={onOpenAssignments}><span className="text-xs font-semibold text-accent-text">DUE THURSDAY</span><b className="mt-2 block text-base">Submit Assignment 6</b><span className="mt-1 block text-sm text-muted">Compound component API · Facilitator review required</span><span className="mt-4 inline-flex items-center gap-1 text-sm font-semibold">Open assignment →</span></button>
          <button className={`${card} text-left hover:border-foreground`} type="button" onClick={onOpenAssignments}><span className="text-xs font-semibold text-accent-text">REVISION REQUESTED</span><b className="mt-2 block text-base">Reducer refactor</b><span className="mt-1 block text-sm text-muted">Kemi left feedback on your first attempt.</span><span className="mt-4 inline-flex items-center gap-1 text-sm font-semibold">Read feedback →</span></button>
          <button className={`${card} text-left hover:border-foreground`} type="button" onClick={onOpenCertificates}><span className="text-xs font-semibold text-reward">CERTIFICATE READY</span><b className="mt-2 block text-base">Design Systems with Tailwind</b><span className="mt-1 block text-sm text-muted">Completed 21 September · Verified ID included</span><span className="mt-4 inline-flex items-center gap-1 text-sm font-semibold">View certificate →</span></button>
        </div>
      </section>
    </View>);

}
