import { useMemo, useState } from 'react';
import { Icon } from '../components/Icon';
import { View } from '../components/View';
import { useToast } from '../contexts/ToastContext';
import { button, buttonGhostSmall, fieldLabel, selectInput, table, tableWrap, tabButton, tabs, textInput } from '../styles';

type PeopleTab = 'students' | 'facilitators';

const students = [
  ['Ngozi Eze', 'ngozi@circlehq.co', 'Cohort 7', '2 active', 'On track', 'Today'],
  ['Chidera Nwosu', 'chidera@circlehq.co', 'Cohort 7', '1 active', 'At risk', '3 days ago'],
  ['Femi Balogun', 'femi@circlehq.co', 'Cohort 7', '1 active', 'Behind', 'Yesterday'],
  ['Amina Yusuf', 'amina@circlehq.co', 'Cohort 7', '2 active', 'Revision due', 'Today'],
  ['Tunde Bakare', 'tunde@circlehq.co', 'Cohort 7', '1 active', 'On track', 'Today'],
];

const facilitators = [
  ['Kemi Adeyemi', 'kemi@circlehq.co', '2 courses', '43 students', '3 reviews', 'Today'],
  ['Dr. Amaka Obi', 'amaka@circlehq.co', '3 courses', '61 students', '0 reviews', 'Today'],
  ['Ife Okoro', 'ife@circlehq.co', '1 course', '18 students', '1 review', 'Yesterday'],
];

export function AdminPeople() {
  const { toast } = useToast();
  const [tab, setTab] = useState<PeopleTab>('students');
  const [query, setQuery] = useState('');
  const [inviteOpen, setInviteOpen] = useState(false);
  const rows = useMemo(() => (tab === 'students' ? students : facilitators).filter((row) => row[0].toLowerCase().includes(query.toLowerCase()) || row[1].includes(query.toLowerCase())), [query, tab]);

  return <View>
    <div className="mb-5 flex flex-wrap items-center justify-between gap-4"><p className="max-w-[62ch] text-muted">Manage access, enrolment, course assignments, progress visibility, and account status.</p><button className={button} type="button" onClick={() => setInviteOpen(true)}><Icon name="plus" />Invite {tab === 'students' ? 'student' : 'facilitator'}</button></div>
    <div className={tabs} role="tablist"><button className={tabButton} type="button" role="tab" aria-selected={tab === 'students'} onClick={() => setTab('students')}>Students · 248</button><button className={tabButton} type="button" role="tab" aria-selected={tab === 'facilitators'} onClick={() => setTab('facilitators')}>Facilitators · 12</button></div>
    <div className="my-5 flex flex-wrap gap-3"><label className="relative min-w-[240px] flex-1"><Icon name="search" className="absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-muted" /><input className={`${textInput} w-full pl-10`} placeholder={`Search ${tab}`} value={query} onChange={(e) => setQuery(e.target.value)} /></label><select className={`${selectInput} w-auto min-w-[150px]`}><option>All cohorts</option><option>Cohort 7</option><option>Cohort 6</option><option>Self-paced</option></select><button className={buttonGhostSmall} type="button" onClick={() => toast('People list exported as CSV.')}>Export</button></div>

    <div className={tableWrap}><table className={table}><thead><tr><th>{tab === 'students' ? 'Student' : 'Facilitator'}</th><th>Email</th><th>{tab === 'students' ? 'Cohort' : 'Courses'}</th><th>{tab === 'students' ? 'Enrolment' : 'Students'}</th><th>{tab === 'students' ? 'Learning status' : 'Review queue'}</th><th>Last active</th><th><span className="sr-only">Actions</span></th></tr></thead><tbody>{rows.map((row) => <tr key={row[1]}><td><div className="flex items-center gap-3"><span className="grid size-9 shrink-0 place-items-center rounded-full bg-hq-red-ink text-xs font-bold text-hq-bone">{row[0].split(' ').map((part) => part[0]).join('')}</span><b>{row[0]}</b></div></td><td>{row[1]}</td><td>{row[2]}</td><td>{row[3]}</td><td><span className="rounded-[99px] bg-surface-2 px-2.5 py-1 text-xs font-semibold">{row[4]}</span></td><td>{row[5]}</td><td><button className="grid size-9 place-items-center rounded-full hover:bg-surface-2" type="button" aria-label={`Manage ${row[0]}`} onClick={() => toast(`${row[0]}'s profile opened.`)}><Icon name="more" /></button></td></tr>)}</tbody></table></div>

    {inviteOpen && <div className="fixed inset-0 z-50 grid place-items-center bg-black/45 p-4" role="dialog" aria-modal="true" aria-label={`Invite ${tab === 'students' ? 'student' : 'facilitator'}`}><form className="w-full max-w-[520px] rounded-[22px] bg-background p-6 shadow-2xl" onSubmit={(e) => { e.preventDefault(); setInviteOpen(false); toast('Invitation sent.'); }}><div className="flex items-start justify-between gap-4"><div><h2 className="text-2xl font-[700]">Invite {tab === 'students' ? 'a student' : 'a facilitator'}</h2><p className="mt-1 text-sm text-muted">They receive a secure link to create their account.</p></div><button className="grid size-9 place-items-center rounded-full hover:bg-surface-2" type="button" aria-label="Close" onClick={() => setInviteOpen(false)}><Icon name="x" /></button></div><div className="mt-6 grid gap-4"><div><label className={fieldLabel}>Full name</label><input className={`${textInput} w-full`} required /></div><div><label className={fieldLabel}>Email address</label><input className={`${textInput} w-full`} type="email" required /></div>{tab === 'students' ? <><div><label className={fieldLabel}>Cohort</label><select className={selectInput}><option>Cohort 7</option><option>Cohort 8</option><option>Self-paced</option></select></div><div><label className={fieldLabel}>Enrol in courses</label><select className={selectInput} multiple size={3}><option>Advanced React Patterns</option><option>TypeScript for Product Teams</option><option>Design Systems with Tailwind</option></select></div></> : <><div><label className={fieldLabel}>Assign courses</label><select className={selectInput} multiple size={3}><option>Advanced React Patterns</option><option>TypeScript for Product Teams</option><option>Product Discovery Sprint</option></select></div><label className="flex gap-3 text-sm"><input type="checkbox" defaultChecked className="accent-[var(--accent)]" />Allow assessment grading and submission approval.</label></>}<button className={`${button} mt-2 w-full`} type="submit"><Icon name="mail" />Send invitation</button></div></form></div>}
  </View>;
}
