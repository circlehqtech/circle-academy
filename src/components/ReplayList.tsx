import React from 'react';
import { Icon } from './Icon';
import { REPLAYS } from '../data/lms';
import { usePlayer } from '../contexts/PlayerContext';
import { fmt } from '../utils/format';
import { muted } from '../styles';

interface ReplayListProps {
  onSelect: (id: string) => void;
}

export function ReplayList({ onSelect }: ReplayListProps) {
  const { replay } = usePlayer();

  return (
    <div>
      {REPLAYS.map((r) =>
      <button
        key={r.id}
        type="button"
        className={`grid w-full grid-cols-[96px_minmax(0,1fr)] items-center gap-[18px] border-t border-line px-2.5 py-3.5 text-left transition-colors duration-200 hover:bg-surface min-[821px]:grid-cols-[130px_minmax(0,1fr)_120px] ${r.id === replay.id ? 'bg-surface' : ''}`}
        onClick={() => onSelect(r.id)}>
        
          <span className="relative grid h-16 place-items-center overflow-hidden rounded-[10px] bg-[linear-gradient(135deg,var(--hq-red-ink),var(--hq-red))] text-white" style={{ '--p': Math.round(r.seen * 100) } as React.CSSProperties}>
            <Icon name="play" filled className="size-5" />
            <u className="absolute bottom-0 left-0 h-1 w-[calc(var(--p)*1%)] bg-hq-amber" />
          </span>
          <span>
            <b className="block font-[620]">{r.title}</b>
            <span className={`text-sm ${muted}`}>
              {r.date}, {fmt(r.dur)}
            </span>
          </span>
          <em className="hidden text-right text-[13.5px] not-italic text-muted min-[821px]:block">
            {r.seen >= 1 ? 'Watched' : r.seen > 0 ? `${Math.round(r.seen * 100)}% watched` : 'New'}
          </em>
        </button>
      )}
    </div>);

}
