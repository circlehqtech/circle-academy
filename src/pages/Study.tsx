import { useEffect, useRef, useState } from 'react';
import { View } from '../components/View';
import { Player } from '../components/Player';
import { INITIAL_NOTES } from '../data/lms';
import { usePlayer } from '../contexts/PlayerContext';
import { useToast } from '../contexts/ToastContext';
import { fmt } from '../utils/format';
import type { Note } from '../types/lms';
import { button, buttonGhostSmall, buttonSmall, chip, heading, muted, studyGrid, textarea } from '../styles';

const TOTAL = 1500;
const CIRC = 260.7;

export function Study() {
  const { time, seek } = usePlayer();
  const { toast } = useToast();
  const [notes, setNotes] = useState<Note[]>(INITIAL_NOTES);
  const [draft, setDraft] = useState('');
  const [newest, setNewest] = useState<number | null>(null);
  const [left, setLeft] = useState(TOTAL);
  const [running, setRunning] = useState(false);
  const toastRef = useRef(toast);
  toastRef.current = toast;

  useEffect(() => {
    if (!running) return;
    const id = window.setInterval(() => {
      setLeft((l) => {
        if (l <= 1) {
          setRunning(false);
          toastRef.current('Focus session done. Take a 5 minute break.');
          return TOTAL;
        }
        return l - 1;
      });
    }, 1000);
    return () => window.clearInterval(id);
  }, [running]);

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
          <Player />
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
                <button type="button" className={buttonSmall} onClick={() => setRunning((r) => !r)}>
                  {running ? 'Pause' : left < TOTAL ? 'Resume focus' : 'Start focus'}
                </button>
                <button
                  type="button"
                  className={buttonGhostSmall}
                  onClick={() => {
                    setRunning(false);
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
          <div className="grid gap-2.5">
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
          </div>
        </div>
      </div>
    </View>);

}
