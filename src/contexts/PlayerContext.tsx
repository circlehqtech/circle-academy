import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import type { Replay } from '../types/lms';
import { useWorkspace } from '../features/workspace/useWorkspace';

export const SPEEDS = [1, 1.25, 1.5, 2] as const;

interface PlayerValue {
  replay: Replay;
  replays: Replay[];
  time: number;
  playing: boolean;
  speed: number;
  marks: number[];
  toggle: () => void;
  cycleSpeed: () => void;
  seek: (t: number) => void;
  addMark: (t: number) => boolean;
  selectReplay: (id: string) => void;
}

const Ctx = createContext<PlayerValue | null>(null);

export function usePlayer(): PlayerValue {
  const value = useContext(Ctx);
  if (!value) throw new Error('usePlayer must be used inside PlayerProvider');
  return value;
}

export function PlayerProvider({ children }: {children: React.ReactNode;}) {
  const { sessions } = useWorkspace();
  const replays = useMemo<Replay[]>(() => sessions.filter((session) => session.ok).map((session, index) => {
    const value = session as typeof session & { id?: string; duration?: number; seen?: number };
    return { id: value.id ?? `replay-${index}`, title: session.t, dur: value.duration || 1, seen: value.seen ?? 0, date: session.d, url: session.recordingUrl };
  }), [sessions]);
  const [replayId, setReplayId] = useState('');
  const replay = useMemo(() => replays.find((item) => item.id === replayId) ?? replays[0] ?? { id: 'no-replay', title: 'No recording selected', dur: 1, seen: 0, date: '' }, [replayId, replays]);
  const [time, setTime] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [speed, setSpeed] = useState<number>(1);
  const [marks, setMarks] = useState<number[]>([]);
  const speedRef = useRef(speed);
  useEffect(() => { speedRef.current = speed; }, [speed]);

  useEffect(() => {
    if (!playing) return;
    const id = window.setInterval(() => {
      setTime((t) => {
        const next = t + 0.25 * speedRef.current;
        if (next >= replay.dur) {
          setPlaying(false);
          return replay.dur;
        }
        return next;
      });
    }, 250);
    return () => window.clearInterval(id);
  }, [playing, replay.dur]);

  const toggle = useCallback(() => setPlaying((p) => !p), []);
  const cycleSpeed = useCallback(
    () =>
    setSpeed((s) => {
      const list: number[] = [...SPEEDS];
      return list[(list.indexOf(s) + 1) % list.length];
    }),
    []
  );
  const seek = useCallback((t: number) => setTime(t), []);

  const addMark = useCallback((t: number) => {
    let added = false;
    setMarks((prev) => {
      if (prev.includes(t)) return prev;
      added = true;
      return [...prev, t].sort((a, b) => a - b);
    });
    return added;
  }, []);

  const selectReplay = useCallback((id: string) => {
    const selected = replays.find((item) => item.id === id);
    if (!selected) return;
    setReplayId(id);
    setTime(selected.seen < 1 ? selected.dur * selected.seen : 0);
    setPlaying(false);
  }, [replays]);

  const value = useMemo(
    () => ({ replay, replays, time, playing, speed, marks, toggle, cycleSpeed, seek, addMark, selectReplay }),
    [replay, replays, time, playing, speed, marks, toggle, cycleSpeed, seek, addMark, selectReplay]
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}
