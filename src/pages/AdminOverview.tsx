import { useState } from 'react';
import { View } from '../components/View';
import { Icon } from '../components/Icon';
import { useToast } from '../contexts/ToastContext';
import { adminGrid, buttonGhostSmall, heading } from '../styles';
import { useWorkspace } from '../features/workspace/useWorkspace';

interface AdminOverviewProps {
  missingRecordings: number;
}

export function AdminOverview({ missingRecordings }: AdminOverviewProps) {
  const { toast } = useToast();
  const { students, courses } = useWorkspace();
  const [sent, setSent] = useState<string[]>([]);
  const chartCourses = courses.slice(0, 6);
  const chartValues = chartCourses.length ? chartCourses.map((course) => course.progress) : Array<number>(6).fill(0);
  const needsNudge = students.filter((student) => student.learningStatus.toLowerCase() !== 'on track').slice(0, 5).map((student) => ({ name: student.name, note: student.learningStatus }));
  const averageProgress = courses.length ? Math.round(courses.reduce((total, course) => total + course.progress, 0) / courses.length) : 0;

  return (
    <View>
      <div className="mb-10 grid grid-cols-2 border-y border-line min-[821px]:grid-cols-4 [&>div]:border-line [&>div]:px-[22px] [&>div]:py-5 [&>div:nth-child(odd)]:pl-1 [&>div:nth-child(even)]:border-l min-[821px]:[&>div]:border-l min-[821px]:[&>div:first-child]:border-l-0 min-[821px]:[&>div:first-child]:pl-1 [&>div:nth-child(n+3)]:border-t min-[821px]:[&>div:nth-child(n+3)]:border-t-0 [&_b]:block [&_b]:text-[34px] [&_b]:leading-[1.1] [&_b]:font-[740] [&_b]:tracking-[-0.03em] [&_b]:[font-variant-numeric:tabular-nums] [&_span]:text-sm [&_span]:text-muted">
        <div>
          <b>{students.length}</b>
          <span>Active students</span>
        </div>
        <div>
          <b>{courses.filter((course) => course.status === 'Published').length}</b>
          <span>Published courses</span>
        </div>
        <div>
          <b>{averageProgress}%</b>
          <span>Average course progress</span>
        </div>
        <div>
          <b>{missingRecordings}</b>
          <span>Recordings missing</span>
        </div>
      </div>

      <div className={adminGrid}>
        <section>
          <h3 className={heading}>Progress by course</h3>
          <div className="relative h-[220px] border-b border-line pt-2.5">
            <div className="pointer-events-none absolute inset-0 grid grid-rows-4" aria-hidden="true">{Array.from({ length: 4 }, (_, index) => <span key={index} className="border-t border-line/60 first:border-t-0" />)}</div>
            <div className="relative flex h-full items-end gap-3">
              {chartValues.map((value, index) => <div key={index} className="flex h-full flex-1 flex-col items-center justify-end gap-1.5" title={`${chartCourses[index]?.title ?? 'No course'}: ${value}% progress`}><span className="text-xs font-semibold text-muted">{value}%</span><i className={`block w-full rounded-[8px_8px_3px_3px] ${chartCourses.length && index === chartValues.length - 1 ? 'bg-accent' : 'bg-surface-2'}`} style={{ height: value ? `${value}%` : '2px' }} /></div>)}
            </div>
            {!chartCourses.length ? <div className="pointer-events-none absolute inset-0 grid place-items-center"><span className="rounded-full border border-line bg-background px-3 py-1.5 text-xs font-semibold text-muted">No courses yet · progress is 0%</span></div> : null}
          </div>
          <div className="mt-2 flex gap-3 text-[13px] text-muted [&>span]:flex-1 [&>span]:text-center">
            {chartValues.map((_, index) => <span key={index}>{chartCourses[index] ? `C${index + 1}` : '—'}</span>)}
          </div>
        </section>

        <section>
          <h3 className={heading}>Needs a nudge</h3>
          {needsNudge.length ? <ul className="[&_li]:flex [&_li]:items-center [&_li]:justify-between [&_li]:gap-3 [&_li]:border-t [&_li]:border-line [&_li]:py-3.5 [&_li:first-child]:border-t-0 [&_b]:block [&_b]:font-[620] [&_span]:text-sm [&_span]:text-muted">
            {needsNudge.map((s) => {
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
          </ul> : <div className="flex min-h-[220px] items-center justify-center rounded-[18px] border border-dashed border-line p-6 text-center"><div><span className="mx-auto mb-3 grid size-11 place-items-center rounded-full bg-surface-2"><Icon name={students.length ? 'check' : 'users'} className="size-5 text-muted" /></span><b className="block">{students.length ? 'Everyone is on track' : 'No student activity yet'}</b><p className="mt-1 text-sm text-muted">{students.length ? 'Students who fall behind will appear here.' : 'Student progress alerts will appear after learners begin their courses.'}</p></div></div>}
        </section>
      </div>
    </View>);

}
