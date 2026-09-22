import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { REPLAYS } from '../data/lms';
import type { Replay } from '../types/lms';

export const SPEEDS = [1, 1.25, 1.5, 2] as const;

interface PlayerValue {
  replay: Replay;
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
  const [replay, setReplay] = useState<Replay>(REPLAYS[0]);
  const [time, setTime] = useState(REPLAYS[0].dur * REPLAYS[0].seen);
  const [playing, setPlaying] = useState(false);
  const [speed, setSpeed] = useState<number>(1);
  const [marks, setMarks] = useState<number[]>([]);
  const speedRef = useRef(speed);
  speedRef.current = speed;

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
    const r = REPLAYS.find((x) => x.id === id);
    if (!r) return;
    setReplay(r);
    setTime(r.seen < 1 ? r.dur * r.seen : 0);
    setPlaying(false);
  }, []);

  const value = useMemo(
    () => ({ replay, time, playing, speed, marks, toggle, cycleSpeed, seek, addMark, selectReplay }),
    [replay, time, playing, speed, marks, toggle, cycleSpeed, seek, addMark, selectReplay]
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}