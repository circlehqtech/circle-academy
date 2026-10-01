import { useState } from 'react';
import { Icon } from '../components/Icon';
import { CustomSelect } from '../components/ui/CustomSelect';
import { EmptyState } from '../components/ui/EmptyState';
import { ProgressRing } from '../components/ProgressRing';
import { View } from '../components/View';
import { useToast } from '../contexts/ToastContext';
import { useWorkspace } from '../features/workspace/useWorkspace';
import { buttonGhostSmall, buttonSmall, card, heading, muted, selectInput, table, tableWrap, textInput } from '../styles';

export function FacilitatorStudents() {
  const { toast } = useToast();
  const { students, courses, submissions } = useWorkspace();
  const [selectedId, setSelectedId] = useState('');
  const [query, setQuery] = useState('');
  const [courseFilter, setCourseFilter] = useState('');
  const visible = students.filter((student) => student.name.toLowerCase().includes(query.toLowerCase()) && (!courseFilter || student.courseIds.includes(courseFilter)));
  const selected = visible.find((student) => student.id === selectedId) ?? visible[0];
  const assignedCourses = selected ? courses.filter((course) => selected.courseIds.includes(course.id)) : [];
  const progress = selected?.progress ?? 0;
  const studentSubmissions = selected ? submissions.filter((item) => item.student.toLowerCase() === selected.name.toLowerCase()) : [];

  return <View>
    <div className="mb-6 flex flex-wrap items-center gap-3">
      <label className="relative min-w-[240px] flex-1"><Icon name="search" className="absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-muted" /><input className={`${textInput} w-full pl-10`} placeholder="Search students" value={query} onChange={(event) => setQuery(event.target.value)} /></label>
      <CustomSelect className={`${selectInput} w-auto min-w-[170px]`} value={courseFilter} onChange={(event) => setCourseFilter(event.target.value)}><option value="">All assigned courses</option>{courses.map((course) => <option key={course.id} value={course.id}>{course.title}</option>)}</CustomSelect>
    </div>

    {!selected ? <EmptyState icon={query || courseFilter ? 'search' : 'users'} title={query || courseFilter ? 'No students match these filters' : 'No students assigned yet'} description={query || courseFilter ? 'Change the search or course filter to see other assigned students.' : 'Students enrolled in your assigned courses will appear here.'} /> : <div className="grid gap-8 min-[1021px]:grid-cols-[minmax(280px,380px)_minmax(0,1fr)]">
      <aside className="grid content-start gap-2">{visible.map((student) => {
        const studentCourses = courses.filter((course) => student.courseIds.includes(course.id));
        const studentProgress = student.progress ?? 0;
        return <button key={student.id} type="button" aria-pressed={student.id === selected.id} className="grid grid-cols-[auto_1fr] items-center gap-3 rounded-[14px] border border-transparent p-3 text-left hover:bg-surface aria-pressed:border-foreground aria-pressed:bg-surface" onClick={() => setSelectedId(student.id)}><ProgressRing value={studentProgress} /><span><b className="block">{student.name}</b><span className="block text-sm text-muted">{studentCourses.map((course) => course.title).join(', ') || 'No assigned course'}</span><span className="mt-1 block text-xs text-muted">{student.learningStatus} · {student.lastActive || 'No activity yet'}</span></span></button>;
      })}</aside>

      <section>
        <div className="flex flex-wrap items-start justify-between gap-4"><div className="flex items-center gap-3"><span className="grid size-12 place-items-center rounded-full bg-hq-red-ink font-bold text-hq-bone">{selected.name.split(/\s+/).map((part) => part[0]).join('').slice(0, 2).toUpperCase()}</span><div><h2 className="text-2xl font-[700]">{selected.name}</h2><p className={muted}>{assignedCourses.map((course) => course.title).join(', ') || 'No assigned course'}</p></div></div><button className={buttonSmall} type="button" onClick={() => toast(`Message prepared for ${selected.name.split(' ')[0]}.`)}><Icon name="mail" />Send note</button></div>
        <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">{[[`${progress}%`, 'Average progress'], [String(assignedCourses.length), 'Assigned courses'], [String(studentSubmissions.length), 'Submissions'], [selected.lastActive || '—', 'Last active']].map(([value, label]) => <div key={label} className="border-y border-line p-4"><b className="block text-2xl font-[730]">{value}</b><span className="text-xs text-muted">{label}</span></div>)}</div>
        <div className="mt-6 grid gap-5 md:grid-cols-2"><div className={card}><h3 className={heading}>Learning timeline</h3>{studentSubmissions.length ? <ul className="grid gap-4">{studentSubmissions.slice(0, 6).map((item) => <li key={item.id} className="flex gap-3"><span className={`mt-1.5 size-2.5 shrink-0 rounded-full ${item.status === 'approved' ? 'bg-reward' : item.status === 'revision' ? 'bg-accent' : 'bg-muted'}`} /><span><b className="block text-sm">{item.title}</b><span className="text-xs text-muted">{item.status} · {item.submitted}</span></span></li>)}</ul> : <EmptyState icon="inbox" title="No learning activity yet" description="Submissions and reviewed work will appear here." compact className="border-0 bg-transparent" />}</div><div className={card}><h3 className={heading}>Facilitator notes</h3><textarea className="min-h-28 w-full rounded-xl border border-line bg-background p-3 text-sm outline-none focus:border-accent" placeholder="Private note about this student's progress…" /><button className={`${buttonGhostSmall} mt-3`} type="button" onClick={() => toast('Private note saved.')}>Save private note</button></div></div>
      </section>
    </div>}
  </View>;
}

export function FacilitatorResults() {
  const { toast } = useToast();
  const { assessments, courses } = useWorkspace();
  const [courseFilter, setCourseFilter] = useState('');
  const visible = assessments.filter((assessment) => !courseFilter || assessment.courseId === courseFilter);
  const published = assessments.filter((assessment) => assessment.status === 'Published').length;
  const questions = assessments.reduce((total, assessment) => total + assessment.questions, 0);
  const averagePassMark = assessments.length ? Math.round(assessments.reduce((total, assessment) => total + assessment.passingScore, 0) / assessments.length) : 0;

  return <View>
    <div className="mb-7 grid grid-cols-2 gap-3 sm:grid-cols-4">{[[String(assessments.length), 'Assessments'], [String(published), 'Published'], [String(questions), 'Questions'], [`${averagePassMark}%`, 'Average pass mark']].map(([value, label]) => <div key={label} className="border-y border-line p-4"><b className="block text-3xl font-[740]">{value}</b><span className="text-sm text-muted">{label}</span></div>)}</div>
    <div className="mb-5 flex flex-wrap gap-3"><CustomSelect className={`${selectInput} w-auto`} value={courseFilter} onChange={(event) => setCourseFilter(event.target.value)}><option value="">All assigned courses</option>{courses.map((course) => <option key={course.id} value={course.id}>{course.title}</option>)}</CustomSelect><button className={buttonGhostSmall} type="button" disabled={!visible.length} onClick={() => toast('Assessment data exported as CSV.')}>Export results</button></div>
    <div className={tableWrap}><table className={`${table} ${visible.length ? '' : '!min-w-0'}`}><thead><tr><th>Assessment</th><th>Course</th><th className={visible.length ? undefined : 'hidden sm:table-cell'}>Questions</th><th className={visible.length ? undefined : 'hidden md:table-cell'}>Pass mark</th><th className={visible.length ? undefined : 'hidden lg:table-cell'}>Attempts</th><th className={visible.length ? undefined : 'hidden lg:table-cell'}>Status</th></tr></thead><tbody>{visible.length ? visible.map((assessment) => <tr key={assessment.id}><td><b>{assessment.title}</b></td><td>{courses.find((course) => course.id === assessment.courseId)?.title ?? 'Unassigned'}</td><td>{assessment.questions}</td><td className="font-bold">{assessment.passingScore}%</td><td>{assessment.attempts || '—'}</td><td><span className="rounded-[99px] bg-surface-2 px-2.5 py-1 text-xs font-semibold">{assessment.status}</span></td></tr>) : <tr><td colSpan={6} className="!p-0"><EmptyState icon={courseFilter ? 'search' : 'chart'} title={courseFilter ? 'No results for this course' : 'No assessment results yet'} description={courseFilter ? 'Choose another assigned course to view its assessment data.' : 'Assessment activity will appear here after a course has assessments and student attempts.'} className="border-0 bg-transparent" /></td></tr>}</tbody></table></div>
  </View>;
}
