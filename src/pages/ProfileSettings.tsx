import { useRef, useState } from 'react';
import { lmsApi } from '../api/lmsApi';
import { Icon } from '../components/Icon';
import { CustomSelect } from '../components/ui/CustomSelect';
import { View } from '../components/View';
import { useToast } from '../contexts/ToastContext';
import { button, buttonGhost, card, fieldLabel, muted, selectInput, tabButton, tabs, textInput } from '../styles';
import type { Role } from '../types/lms';
import { useAuth } from '../features/auth/useAuth';
import { useChangePassword, useUpdateProfile } from '../api/auth';
import { useWorkspace } from '../features/workspace/useWorkspace';
import { EmptyState } from '../components/ui/EmptyState';

type ProfileTab = 'profile' | 'security' | 'notifications' | 'learning';

export function ProfileSettings({ role, onLogout }: { role: Role; onLogout: () => void }) {
  const { toast } = useToast();
  const { account, mustChangePassword } = useAuth();
  const { courses } = useWorkspace();
  const updateProfile = useUpdateProfile();
  const changePassword = useChangePassword();
  const [tab, setTab] = useState<ProfileTab>('profile');
  const [photoUrl, setPhotoUrl] = useState('');
  const [isPhotoUploading, setIsPhotoUploading] = useState(false);
  const photoInput = useRef<HTMLInputElement>(null);
  const profileName = `${account?.firstName ?? ''} ${account?.lastName ?? ''}`.trim() || 'HQ Learn user';
  const initials = profileName.split(/\s+/).map((part) => part[0]).join('').slice(0, 2).toUpperCase();
  const uploadPhoto = async (file?: File) => {
    if (!file) return;
    if (!file.type.startsWith('image/')) { toast('Choose an image file for your profile photo.'); return; }
    setIsPhotoUploading(true);
    try {
      const upload = await lmsApi.uploads.create(file, 'profile-image');
      setPhotoUrl(upload.url);
      toast('Profile image uploaded.');
    } catch (failure) { toast(failure instanceof Error ? failure.message : 'The profile image could not be uploaded.'); }
    finally { setIsPhotoUploading(false); if (photoInput.current) photoInput.current.value = ''; }
  };

  const save = (message: string) => (event: React.FormEvent) => {
    event.preventDefault();
    toast(message);
  };

  const saveProfile = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    try {
      await updateProfile.mutateAsync({ firstName: String(form.get('firstName')), lastName: String(form.get('lastName')), phoneNumber: String(form.get('phoneNumber')) });
      toast('Profile changes saved.');
    } catch (failure) { toast(failure instanceof Error ? failure.message : 'Unable to save profile.'); }
  };

  const savePassword = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const next = String(form.get('newPassword'));
    if (next !== String(form.get('confirmPassword'))) { toast('The new passwords do not match.'); return; }
    try {
      await changePassword.mutateAsync({ currentPassword: String(form.get('currentPassword')), newPassword: next });
      event.currentTarget.reset();
      toast('Password updated successfully.');
    } catch (failure) { toast(failure instanceof Error ? failure.message : 'Unable to update password.'); }
  };

  return (
    <View>
      <div className="mb-7 flex flex-wrap items-center gap-5">
        <input ref={photoInput} className="sr-only" type="file" accept="image/*" disabled={isPhotoUploading} onChange={(event) => void uploadPhoto(event.target.files?.[0])} />
        <button type="button" disabled={isPhotoUploading} className="relative grid size-20 place-items-center overflow-hidden rounded-full bg-hq-red-ink text-xl font-bold text-hq-bone disabled:cursor-wait disabled:opacity-70" onClick={() => photoInput.current?.click()} aria-label={isPhotoUploading ? 'Uploading profile photo' : 'Change profile photo'}>
          {photoUrl ? <img className="h-full w-full object-cover" src={photoUrl} alt={`${profileName} profile`} /> : isPhotoUploading ? <Icon name="upload" className="size-7" /> : initials}
          <span className="absolute -right-1 -bottom-1 grid size-7 place-items-center rounded-full bg-accent text-white ring-4 ring-background"><Icon name="pen" className="size-3.5" /></span>
        </button>
        <div><h2 className="text-2xl font-[700]">{profileName}</h2><p className={muted}>{account?.email ?? `${role} account`}</p><span className="mt-2 inline-flex rounded-[99px] bg-surface-2 px-3 py-1 text-xs font-semibold capitalize">{role} account</span></div>
      </div>

      <div className={tabs} role="tablist">
        {([['profile', 'Personal profile'], ['security', 'Account & security'], ['notifications', 'Notifications'], ['learning', 'Learning & enrolment']] as [ProfileTab, string][]).map(([id, label]) => <button key={id} className={tabButton} type="button" role="tab" aria-selected={tab === id} onClick={() => setTab(id)}>{label}</button>)}
      </div>

      <div className="mt-7 max-w-[760px]">
        {tab === 'profile' && <form className="grid gap-5" onSubmit={saveProfile}>
          <div className="grid gap-5 sm:grid-cols-2"><div><label className={fieldLabel} htmlFor="profile-first">First name</label><input id="profile-first" name="firstName" className={`${textInput} w-full`} defaultValue={account?.firstName} /></div><div><label className={fieldLabel} htmlFor="profile-last">Last name</label><input id="profile-last" name="lastName" className={`${textInput} w-full`} defaultValue={account?.lastName} /></div></div>
          <div><label className={fieldLabel} htmlFor="profile-email">Email address</label><input id="profile-email" className={`${textInput} w-full`} type="email" value={account?.email ?? ''} disabled /></div>
          <div className="grid gap-5 sm:grid-cols-2"><div><label className={fieldLabel} htmlFor="profile-phone">Phone number</label><input id="profile-phone" name="phoneNumber" className={`${textInput} w-full`} type="tel" defaultValue={account?.phoneNumber ?? ''} /></div><div><label className={fieldLabel} htmlFor="profile-timezone">Time zone</label><CustomSelect id="profile-timezone" className={selectInput} defaultValue="wat"><option value="wat">West Africa Time</option><option>Greenwich Mean Time</option><option>East Africa Time</option></CustomSelect></div></div>
          <div><label className={fieldLabel} htmlFor="profile-bio">Bio</label><textarea id="profile-bio" className="min-h-28 w-full rounded-2xl border-[1.5px] border-line bg-surface px-4 py-3.5 outline-none focus:border-accent" placeholder="Add a short professional bio" /></div>
          <div><button className={button} type="submit" disabled={updateProfile.isPending}><Icon name="save" />{updateProfile.isPending ? 'Saving…' : 'Save profile'}</button></div>
        </form>}

        {tab === 'security' && <div className="grid gap-5">
          <form className={`${card} grid gap-4`} onSubmit={savePassword}>{mustChangePassword ? <div role="alert" className="rounded-xl border border-accent bg-[color-mix(in_srgb,var(--accent)_8%,var(--surface))] p-4"><b className="text-accent-text">Password change required</b><p className="mt-1 text-sm text-muted">You signed in with the temporary password. Replace it before continuing to use the account.</p></div> : null}<div><h3 className="text-lg font-[650]">Change password</h3><p className="text-sm text-muted">Use a strong password you do not use elsewhere.</p></div><div><label className={fieldLabel}>Current password</label><input name="currentPassword" className={`${textInput} w-full`} type="password" required /></div><div className="grid gap-4 sm:grid-cols-2"><div><label className={fieldLabel}>New password</label><input name="newPassword" className={`${textInput} w-full`} type="password" minLength={8} required /></div><div><label className={fieldLabel}>Confirm password</label><input name="confirmPassword" className={`${textInput} w-full`} type="password" minLength={8} required /></div></div><div><button className={button} type="submit" disabled={changePassword.isPending}>{changePassword.isPending ? 'Updating…' : 'Update password'}</button></div></form>
          <section className={card}><div className="flex items-start gap-3"><Icon name="shield" className="mt-0.5 text-accent-text" /><div className="flex-1"><h3 className="font-[650]">Two-step verification</h3><p className="mt-1 text-sm text-muted">Add an extra layer of protection when you sign in.</p></div><button className={buttonGhost} type="button" onClick={() => toast('Authenticator setup opened.')}>Set up</button></div></section>
          <section className={card}><h3 className="font-[650]">Active sessions</h3><div className="mt-4 flex items-center justify-between gap-4 border-t border-line pt-4"><div><b className="block">Current session</b><span className="text-sm text-muted">This device</span></div><span className="text-xs font-semibold text-muted">Active now</span></div></section>
          <button className="flex items-center gap-2 font-semibold text-accent-text" type="button" onClick={onLogout}><Icon name="logout" />Sign out of HQ Learn</button>
        </div>}

        {tab === 'notifications' && <form className="grid gap-4" onSubmit={save('Notification preferences saved.')}>
          {[
            ['Learning reminders', 'Deadlines, next lessons, and weekly progress summaries.'],
            ['Live classes', 'Class reminders, schedule changes, and recording availability.'],
            ['Feedback and reviews', 'Facilitator comments, approvals, and revision requests.'],
            ['Community updates', 'Course announcements and Circle HQ Academy news.'],
          ].map(([title, description], index) => <label key={title} className={`${card} flex items-start gap-4`}><input className="mt-1 size-4 accent-[var(--accent)]" type="checkbox" defaultChecked={index < 3} /><span className="flex-1"><b className="block">{title}</b><span className="text-sm text-muted">{description}</span></span><CustomSelect className="rounded-lg border border-line bg-background px-2 py-1 text-xs" defaultValue="email"><option value="email">Email + in-app</option><option>In-app only</option><option>Off</option></CustomSelect></label>)}
          <div><button className={button} type="submit">Save preferences</button></div>
        </form>}

        {tab === 'learning' && <div className="grid gap-5">
          <section className={card}><h3 className="text-lg font-[650]">{role === 'student' ? 'Enrolled courses' : 'Workspace courses'}</h3>{courses.length ? <div className="mt-4 grid gap-4">{courses.map((course) => <div key={course.id} className="flex items-center justify-between gap-4 border-t border-line pt-4 first:border-t-0 first:pt-0"><div><b className="block">{course.title}</b><span className="text-sm text-muted">{course.status} · {course.modules.length} modules</span></div><span className="font-semibold">{course.progress}%</span></div>)}</div> : <EmptyState icon="book" title="No courses yet" description={role === 'student' ? 'Courses you are enrolled in will appear here.' : 'Courses available in this workspace will appear here.'} compact className="mt-4 border-0 bg-transparent" />}</section>
          <form className={card} onSubmit={save('Learning preferences saved.')}><h3 className="text-lg font-[650]">Study preferences</h3><div className="mt-4 grid gap-4 sm:grid-cols-2"><div><label className={fieldLabel}>Weekly goal</label><CustomSelect className={selectInput}><option>4 hours</option><option>2 hours</option><option>6+ hours</option></CustomSelect></div><div><label className={fieldLabel}>Preferred class time</label><CustomSelect className={selectInput}><option>Weekday evenings</option><option>Weekday mornings</option><option>Weekends</option></CustomSelect></div></div><button className={`${button} mt-5`} type="submit">Save preferences</button></form>
        </div>}
      </div>
    </View>
  );
}
