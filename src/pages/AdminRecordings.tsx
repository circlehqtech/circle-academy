import { useMemo, useState, type FormEvent } from 'react';
import { View } from '../components/View';
import { Icon } from '../components/Icon';
import type { Session } from '../types/lms';
import { button, buttonGhostSmall, buttonSmall, fieldLabel, heading, selectInput, status, statusMiss, textInput } from '../styles';
import { EmptyState } from '../components/ui/EmptyState';
import { Modal } from '../components/ui/Modal';
import { CustomSelect } from '../components/ui/CustomSelect';

interface AdminRecordingsProps {
  sessions: Session[];
  onAttach: (index: number, recordingUrl: string, recordingDurationSeconds?: number) => Promise<boolean>;
}

export function AdminRecordings({ sessions, onAttach }: AdminRecordingsProps) {
  const firstMissingIndex = useMemo(() => {
    const index = sessions.findIndex((session) => !session.ok);
    return index >= 0 ? index : 0;
  }, [sessions]);
  const [editorIndex, setEditorIndex] = useState<number | null>(null);
  const [recordingUrl, setRecordingUrl] = useState('');
  const [durationMinutes, setDurationMinutes] = useState('');
  const [saving, setSaving] = useState(false);
  const [savedUrls, setSavedUrls] = useState<Record<string, string>>({});

  const sessionKey = (session: Session, index: number) => session.id ?? `${session.t}-${index}`;
  const displayUrl = (session: Session, index: number) => savedUrls[sessionKey(session, index)] ?? session.recordingUrl;

  const openEditor = (index = firstMissingIndex) => {
    const session = sessions[index];
    if (!session) return;
    setEditorIndex(index);
    setRecordingUrl(displayUrl(session, index) ?? '');
    setDurationMinutes('');
  };

  const selectSession = (index: number) => {
    const session = sessions[index];
    setEditorIndex(index);
    setRecordingUrl(session ? displayUrl(session, index) ?? '' : '');
    setDurationMinutes('');
  };

  const saveRecording = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (editorIndex == null) return;
    const minutes = Number(durationMinutes);
    setSaving(true);
    const saved = await onAttach(
      editorIndex,
      recordingUrl,
      Number.isFinite(minutes) && minutes > 0 ? Math.round(minutes * 60) : undefined,
    );
    setSaving(false);
    if (!saved) return;
    const session = sessions[editorIndex];
    if (session) setSavedUrls((current) => ({ ...current, [sessionKey(session, editorIndex)]: recordingUrl.trim() }));
    setEditorIndex(null);
  };

  return (
    <View>
      <button
        type="button"
        className="mb-[34px] block w-full rounded-[22px_22px_22px_6px] border-2 border-dashed border-line px-5 py-[28px] text-center transition-colors hover:border-accent hover:bg-surface disabled:cursor-not-allowed disabled:opacity-60"
        onClick={() => openEditor()}
        disabled={!sessions.length}
      >
        <Icon name="video" className="mx-auto mb-2 size-7 text-accent" />
        <b className="block text-[17px]">Add a class recording</b>
        <span className="block text-sm text-muted">Choose a live class and attach its Zoom, YouTube, Vimeo, or hosted recording link.</span>
        {sessions.length ? <span className="mt-3 inline-flex items-center gap-1.5 text-sm font-semibold text-accent-text"><Icon name="plus" className="size-4" />Attach recording</span> : null}
      </button>

      <h3 className={heading}>Sessions</h3>
      {sessions.length ? <div>
        {sessions.map((s, i) => {
          const url = displayUrl(s, i);
          const attached = Boolean(url);
          return <div key={sessionKey(s, i)} className="grid grid-cols-[minmax(0,1fr)] items-center gap-4 border-t border-line px-2 py-[15px] first:border-t-0 min-[821px]:grid-cols-[minmax(0,1fr)_110px_190px]">
            <div>
              <b className="block font-[620]">{s.t}</b>
              <span className="text-sm text-muted">{s.d}</span>
            </div>
            <span className={attached ? status : statusMiss}>
              <i aria-hidden="true" />
              {attached ? 'Attached' : 'Missing'}
            </span>
            <div className="flex flex-wrap items-center gap-3">
              {attached ? <a className="text-sm font-semibold text-accent-text hover:underline" href={url} target="_blank" rel="noopener noreferrer">Open recording</a> : null}
              <button type="button" className={attached ? buttonGhostSmall : buttonSmall} onClick={() => openEditor(i)}><Icon name={attached ? 'pen' : 'link'} />{attached ? 'Replace' : 'Attach link'}</button>
            </div>
          </div>
        })}
      </div> : <EmptyState icon="video" title="No class sessions yet" description="Scheduled live classes will appear here so their recordings can be attached after each session." compact />}

      {editorIndex != null ? <Modal busy={saving} title={displayUrl(sessions[editorIndex], editorIndex) ? 'Replace class recording' : 'Attach class recording'} subtitle="Recordings are stored as external links; no video file is uploaded to the platform." onClose={() => { if (!saving) setEditorIndex(null); }}>
        <form className="grid gap-4" onSubmit={saveRecording}>
          <div>
            <label className={fieldLabel} htmlFor="recording-session">Live class</label>
            <CustomSelect id="recording-session" className={selectInput} value={String(editorIndex)} onChange={(event) => selectSession(Number(event.target.value))}>
              {sessions.map((session, index) => <option key={sessionKey(session, index)} value={String(index)}>{session.t} · {displayUrl(session, index) ? 'Attached' : 'Missing'}</option>)}
            </CustomSelect>
          </div>
          <div>
            <label className={fieldLabel} htmlFor="recording-url">Recording URL</label>
            <input id="recording-url" className={`${textInput} w-full`} type="url" inputMode="url" placeholder="https://youtube.com/watch?v=…" value={recordingUrl} onChange={(event) => setRecordingUrl(event.target.value)} required autoFocus />
            <p className="mt-1.5 text-xs text-muted">Use an external Zoom, YouTube, Vimeo, or hosted video link.</p>
          </div>
          <div>
            <label className={fieldLabel} htmlFor="recording-duration">Duration in minutes <span className="font-normal text-muted">(optional)</span></label>
            <input id="recording-duration" className={`${textInput} w-full`} type="number" min="1" step="1" placeholder="90" value={durationMinutes} onChange={(event) => setDurationMinutes(event.target.value)} />
          </div>
          <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
            <button className={buttonGhostSmall} type="button" disabled={saving} onClick={() => setEditorIndex(null)}>Cancel</button>
            <button className={button} type="submit" disabled={saving || !recordingUrl.trim()}>{saving ? 'Saving…' : displayUrl(sessions[editorIndex], editorIndex) ? 'Replace recording' : 'Attach recording'}</button>
          </div>
        </form>
      </Modal> : null}
    </View>);

}
