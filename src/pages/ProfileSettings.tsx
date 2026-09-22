import { useState } from 'react';
import { Icon } from '../components/Icon';
import { View } from '../components/View';
import { PEOPLE } from '../data/lms';
import { useToast } from '../contexts/ToastContext';
import { button, buttonGhost, card, fieldLabel, muted, selectInput, tabButton, tabs, textInput } from '../styles';
import type { Role } from '../types/lms';

type ProfileTab = 'profile' | 'security' | 'notifications' | 'learning';

export function ProfileSettings({ role, onLogout }: { role: Role; onLogout: () => void }) {
  const { toast } = useToast();
  const [tab, setTab] = useState<ProfileTab>('profile');
  const person = PEOPLE[role];
  const [photo, setPhoto] = useState(false);
  const profileName = role === 'student' ? 'Ngozi Eze' : role === 'facilitator' ? 'Kemi Adeyemi' : 'Dr. Amaka Obi';

  const save = (message: string) => (event: React.FormEvent) => {
    event.preventDefault();
    toast(message);
  };

  return (
    <View>
      <div className="mb-7 flex flex-wrap items-center gap-5">
        <button type="button" className="relative grid size-20 place-items-center rounded-full bg-hq-red-ink text-xl font-bold text-hq-bone" onClick={() => setPhoto(true)} aria-label="Change profile photo">
          {photo ? <Icon name="user" className="size-8" /> : person.initials}
          <span className="absolute -right-1 -bottom-1 grid size-7 place-items-center rounded-full bg-accent text-white ring-4 ring-background"><Icon name="pen" className="size-3.5" /></span>
        </button>
        <div><h2 className="text-2xl font-[700]">{profileName}</h2><p className={muted}>{person.sub}</p><span className="mt-2 inline-flex rounded-[99px] bg-surface-2 px-3 py-1 text-xs font-semibold capitalize">{role} account</span></div>
      </div>

      <div className={tabs} role="tablist">
        {([['profile', 'Personal profile'], ['security', 'Account & security'], ['notifications', 'Notifications'], ['learning', 'Learning & enrolment']] as [ProfileTab, string][]).map(([id, label]) => <button key={id} className={tabButton} type="button" role="tab" aria-selected={tab === id} onClick={() => setTab(id)}>{label}</button>)}
      </div>

      <div className="mt-7 max-w-[760px]">
        {tab === 'profile' && <form className="grid gap-5" onSubmit={save('Profile changes saved.')}>
          <div className="grid gap-5 sm:grid-cols-2"><div><label className={fieldLabel} htmlFor="profile-first">First name</label><input id="profile-first" className={`${textInput} w-full`} defaultValue={profileName.split(' ')[0]} /></div><div><label className={fieldLabel} htmlFor="profile-last">Last name</label><input id="profile-last" className={`${textInput} w-full`} defaultValue={profileName.split(' ').slice(1).join(' ')} /></div></div>
          <div><label className={fieldLabel} htmlFor="profile-email">Email address</label><input id="profile-email" className={`${textInput} w-full`} type="email" defaultValue={`${profileName.toLowerCase().replace(/\s+/g, '.')}@circlehq.co`} /></div>
          <div className="grid gap-5 sm:grid-cols-2"><div><label className={fieldLabel} htmlFor="profile-phone">Phone number</label><input id="profile-phone" className={`${textInput} w-full`} type="tel" defaultValue="+234 803 555 0192" /></div><div><label className={fieldLabel} htmlFor="profile-timezone">Time zone</label><select id="profile-timezone" className={selectInput} defaultValue="wat"><option value="wat">West Africa Time</option><option>Greenwich Mean Time</option><option>East Africa Time</option></select></div></div>
          <div><label className={fieldLabel} htmlFor="profile-bio">Bio</label><textarea id="profile-bio" className="min-h-28 w-full rounded-2xl border-[1.5px] border-line bg-surface px-4 py-3.5 outline-none focus:border-accent" defaultValue="Frontend engineer focused on building thoughtful, accessible product experiences." /></div>
          <div><button className={button} type="submit"><Icon name="save" />Save profile</button></div>
        </form>}

        {tab === 'security' && <div className="grid gap-5">
          <form className={`${card} grid gap-4`} onSubmit={save('Password updated successfully.')}><div><h3 className="text-lg font-[650]">Change password</h3><p className="text-sm text-muted">Your last password change was 42 days ago.</p></div><div><label className={fieldLabel}>Current password</label><input className={`${textInput} w-full`} type="password" required /></div><div className="grid gap-4 sm:grid-cols-2"><div><label className={fieldLabel}>New password</label><input className={`${textInput} w-full`} type="password" minLength={8} required /></div><div><label className={fieldLabel}>Confirm password</label><input className={`${textInput} w-full`} type="password" minLength={8} required /></div></div><div><button className={button} type="submit">Update password</button></div></form>
          <section className={card}><div className="flex items-start gap-3"><Icon name="shield" className="mt-0.5 text-accent-text" /><div className="flex-1"><h3 className="font-[650]">Two-step verification</h3><p className="mt-1 text-sm text-muted">Add an extra layer of protection when you sign in.</p></div><button className={buttonGhost} type="button" onClick={() => toast('Authenticator setup opened.')}>Set up</button></div></section>
          <section className={card}><h3 className="font-[650]">Active sessions</h3><div className="mt-4 flex items-center justify-between gap-4 border-t border-line pt-4"><div><b className="block">Chrome on Windows</b><span className="text-sm text-muted">Lagos, Nigeria · This device</span></div><span className="text-xs font-semibold text-muted">Active now</span></div></section>
          <button className="flex items-center gap-2 font-semibold text-accent-text" type="button" onClick={onLogout}><Icon name="logout" />Sign out of HQ Learn</button>
        </div>}

        {tab === 'notifications' && <form className="grid gap-4" onSubmit={save('Notification preferences saved.')}>
          {[
            ['Learning reminders', 'Deadlines, next lessons, and weekly progress summaries.'],
            ['Live classes', 'Class reminders, schedule changes, and recording availability.'],
            ['Feedback and reviews', 'Facilitator comments, approvals, and revision requests.'],
            ['Community updates', 'Course announcements and Circle HQ Academy news.'],
          ].map(([title, description], index) => <label key={title} className={`${card} flex items-start gap-4`}><input className="mt-1 size-4 accent-[var(--accent)]" type="checkbox" defaultChecked={index < 3} /><span className="flex-1"><b className="block">{title}</b><span className="text-sm text-muted">{description}</span></span><select className="rounded-lg border border-line bg-background px-2 py-1 text-xs" defaultValue="email"><option value="email">Email + in-app</option><option>In-app only</option><option>Off</option></select></label>)}
          <div><button className={button} type="submit">Save preferences</button></div>
        </form>}

        {tab === 'learning' && <div className="grid gap-5">
          <section className={card}><h3 className="text-lg font-[650]">Enrolled courses</h3><div className="mt-4 grid gap-4">{[['Advanced React Patterns', '68%', 'Cohort 7'], ['TypeScript for Product Teams', '42%', 'Cohort 7'], ['Design Systems with Tailwind', 'Completed', 'Cohort 6']].map(([course, progress, cohort]) => <div key={course} className="flex items-center justify-between gap-4 border-t border-line pt-4 first:border-t-0 first:pt-0"><div><b className="block">{course}</b><span className="text-sm text-muted">{cohort}</span></div><span className="font-semibold">{progress}</span></div>)}</div></section>
          <form className={card} onSubmit={save('Learning preferences saved.')}><h3 className="text-lg font-[650]">Study preferences</h3><div className="mt-4 grid gap-4 sm:grid-cols-2"><div><label className={fieldLabel}>Weekly goal</label><select className={selectInput}><option>4 hours</option><option>2 hours</option><option>6+ hours</option></select></div><div><label className={fieldLabel}>Preferred class time</label><select className={selectInput}><option>Weekday evenings</option><option>Weekday mornings</option><option>Weekends</option></select></div></div><button className={`${button} mt-5`} type="submit">Save preferences</button></form>
        </div>}
      </div>
    </View>
  );
}
