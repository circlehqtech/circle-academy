import { useCallback, useEffect, useRef, useState } from 'react';
import { View } from '../components/View';
import { Player } from '../components/Player';
import { usePlayer } from '../contexts/PlayerContext';
import { useToast } from '../contexts/ToastContext';
import { fmt } from '../utils/format';
import type { Note } from '../types/lms';
import { button, buttonGhostSmall, buttonSmall, chip, heading, muted, studyGrid, textarea } from '../styles';
import { useWorkspace } from '../features/workspace/useWorkspace';
import { lmsApi } from '../api/lmsApi';
import { extractId } from '../api/adapters';
import { EmptyState } from '../components/ui/EmptyState';

const TOTAL = 1500;
const CIRC = 260.7;

export function Study() {
  const { time, seek, replays } = usePlayer();
  const { toast } = useToast();
  const { courses } = useWorkspace();
  const [notes, setNotes] = useState<Note[]>([]);
  const [draft, setDraft] = useState('');
  const [newest, setNewest] = useState<number | null>(null);
  const [left, setLeft] = useState(TOTAL);
  const [running, setRunning] = useState(false);
  const toastRef = useRef(toast);
  const sessionIdRef = useRef<string | null>(null);
  useEffect(() => { toastRef.current = toast; }, [toast]);

  const completeFocus = useCallback(async (durationSeconds: number) => {
    const sessionId = sessionIdRef.current;
    if (!sessionId) return;
    sessionIdRef.current = null;
    try { await lmsApi.student.completeStudySession(sessionId, { endedAt: new Date().toISOString(), durationSeconds }); }
    catch (failure) { toastRef.current(failure instanceof Error ? failure.message : 'Could not save this study session.'); }
  }, []);

  const toggleFocus = useCallback(async () => {
    if (running) { setRunning(false); return; }
    if (!sessionIdRef.current) {
      const courseId = courses[0]?.id;
      if (!courseId) { toast('Open an enrolled course before starting a focus session.'); return; }
      try {
        const response = await lmsApi.student.startStudySession({ courseId, startedAt: new Date().toISOString() });
        sessionIdRef.current = extractId(response);
        if (!sessionIdRef.current) throw new Error('The API did not return the study session ID.');
      } catch (failure) { toast(failure instanceof Error ? failure.message : 'Could not start a study session.'); return; }
    }
    setRunning(true);
  }, [courses, running, toast]);

  useEffect(() => {
    if (!running) return;
    const id = window.setInterval(() => {
      setLeft((l) => {
        if (l <= 1) {
          setRunning(false);
          toastRef.current('Focus session done. Take a 5 minute break.');
          void completeFocus(TOTAL);
          return TOTAL;
        }
        return l - 1;
      });
    }, 1000);
    return () => window.clearInterval(id);
  }, [completeFocus, running]);

  const addNote = () => {
    const text = draft.trim();
    if (!text) return;
    const next = [...notes, { t: Math.floor(time), text }].sort((a, b) => a.t - b.t);
    setNotes(next);
    setNewest(next.findIndex((n) => n.text === text));
    setDraft('');
  };

  return (
    <View>
      <div className={studyGrid}>
        <div>
          {replays.length ? <Player /> : <EmptyState icon="play" title="No study recording selected" description="Linked course recordings will appear here for focused study." compact />}
          <div className="mt-[22px] flex items-center gap-[22px] rounded-[20px] bg-surface-2 px-[22px] py-[18px]">
            <div className="relative size-[92px] shrink-0">
              <svg className="size-[92px] -rotate-90" viewBox="0 0 92 92" aria-hidden="true">
                <circle className="fill-none stroke-line stroke-[7]" cx="46" cy="46" r="41.5" />
                <circle
                  className="fill-none stroke-accent stroke-[7] [stroke-linecap:round] transition-[stroke-dashoffset] duration-1000 ease-linear"
                  cx="46"
                  cy="46"
                  r="41.5"
                  style={{ strokeDasharray: CIRC, strokeDashoffset: CIRC * (1 - left / TOTAL) }} />
                
              </svg>
              <b className="absolute inset-0 grid place-items-center text-[19px] font-bold [font-variant-numeric:tabular-nums]">{fmt(left)}</b>
            </div>
            <div>
              <p className="mb-2.5">
                <b className="block text-[17px]">Focus timer</b>
                <span className={muted}>25 minutes, then a short break.</span>
              </p>
              <div className="flex flex-wrap gap-2">
                <button type="button" className={buttonSmall} onClick={() => void toggleFocus()}>
                  {running ? 'Pause' : left < TOTAL ? 'Resume focus' : 'Start focus'}
                </button>
                <button
                  type="button"
                  className={buttonGhostSmall}
                  onClick={() => {
                    setRunning(false);
                    void completeFocus(TOTAL - left);
                    setLeft(TOTAL);
                  }}>
                  
                  Reset
                </button>
              </div>
            </div>
          </div>
        </div>

        <div>
          <h3 className={heading}>Notes</h3>
          {replays.length ? <><div className="grid gap-2.5">
            <textarea
              className={textarea}
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              aria-label="New note"
              placeholder="Write what you just learned. It links to this moment in the recording." />
            
            <div>
              <button type="button" className={button} disabled={!draft.trim()} onClick={addNote}>
                Add note at {fmt(time)}
              </button>
            </div>
          </div>

          <div className="mt-[22px]">
            {notes.map((n, i) =>
            <div key={`${n.t}-${n.text}`} className={`grid grid-cols-[auto_1fr] items-start gap-3.5 border-t border-line px-1 py-3.5 ${i === newest ? 'animate-highlight' : ''}`}>
                <button
                type="button"
                className={chip}
                onClick={() => {
                  seek(n.t);
                  toast(`Jumped to ${fmt(n.t)}`);
                }}>
                
                  <b>{fmt(n.t)}</b>
                </button>
                <p>{n.text}</p>
              </div>
            )}
          </div></> : <EmptyState icon="pen" title="No recording notes yet" description="Select an available recording to create timestamped notes." compact />}
        </div>
      </div>
    </View>);

}
