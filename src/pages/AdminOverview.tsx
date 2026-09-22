import { useState } from 'react';
import { View } from '../components/View';
import { NEEDS_NUDGE, WEEKS } from '../data/lms';
import { useToast } from '../contexts/ToastContext';
import { adminGrid, buttonGhostSmall, heading } from '../styles';

interface AdminOverviewProps {
  missingRecordings: number;
}

export function AdminOverview({ missingRecordings }: AdminOverviewProps) {
  const { toast } = useToast();
  const [sent, setSent] = useState<string[]>([]);

  return (
    <View>
      <div className="mb-10 grid grid-cols-2 border-y border-line min-[821px]:grid-cols-4 [&>div]:border-line [&>div]:px-[22px] [&>div]:py-5 [&>div:nth-child(odd)]:pl-1 [&>div:nth-child(even)]:border-l min-[821px]:[&>div]:border-l min-[821px]:[&>div:first-child]:border-l-0 min-[821px]:[&>div:first-child]:pl-1 [&>div:nth-child(n+3)]:border-t min-[821px]:[&>div:nth-child(n+3)]:border-t-0 [&_b]:block [&_b]:text-[34px] [&_b]:leading-[1.1] [&_b]:font-[740] [&_b]:tracking-[-0.03em] [&_b]:[font-variant-numeric:tabular-nums] [&_span]:text-sm [&_span]:text-muted">
        <div>
          <b>248</b>
          <span>Active students</span>
        </div>
        <div>
          <b>86%</b>
          <span>Class attendance</span>
        </div>
        <div>
          <b>74%</b>
          <span>Average quiz score</span>
        </div>
        <div>
          <b>{missingRecordings}</b>
          <span>Recordings missing</span>
        </div>
      </div>

      <div className={adminGrid}>
        <section>
          <h3 className={heading}>Attendance by week</h3>
          <div className="flex h-[220px] items-end gap-3 border-b border-line pt-2.5">
            {WEEKS.map((v, i) =>
            <div
              key={i}
              className="flex h-full flex-1 flex-col items-center justify-end gap-1.5"
              title={`Week ${i + 1}: ${v}% attended`}>
              
                <i className={`block w-full rounded-[8px_8px_3px_3px] ${i === WEEKS.length - 1 ? 'bg-accent' : 'bg-surface-2'}`} style={{ height: `${v}%` }} />
              </div>
            )}
          </div>
          <div className="mt-2 flex gap-3 text-[13px] text-muted [&>span]:flex-1 [&>span]:text-center">
            {WEEKS.map((_, i) =>
            <span key={i}>W{i + 1}</span>
            )}
          </div>
        </section>

        <section>
          <h3 className={heading}>Needs a nudge</h3>
          <ul className="[&_li]:flex [&_li]:items-center [&_li]:justify-between [&_li]:gap-3 [&_li]:border-t [&_li]:border-line [&_li]:py-3.5 [&_li:first-child]:border-t-0 [&_b]:block [&_b]:font-[620] [&_span]:text-sm [&_span]:text-muted">
            {NEEDS_NUDGE.map((s) => {
              const done = sent.includes(s.name);
              return (
                <li key={s.name}>
                  <div>
                    <b>{s.name}</b>
                    <span>{s.note}</span>
                  </div>
                  <button
                    type="button"
                    className={buttonGhostSmall}
                    disabled={done}
                    onClick={() => {
                      setSent((prev) => [...prev, s.name]);
                      toast('Reminder sent.');
                    }}>
                    
                    {done ? 'Sent' : 'Send reminder'}
                  </button>
                </li>);

            })}
          </ul>
        </section>
      </div>
    </View>);

}
