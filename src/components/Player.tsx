import React from 'react';
import { Icon } from './Icon';
import { usePlayer } from '../contexts/PlayerContext';
import { fmt } from '../utils/format';

export function Player() {
  const { replay, time, playing, speed, toggle, cycleSpeed, seek } = usePlayer();
  const pct = `${time / replay.dur * 100}%`;

  return (
    <div className="overflow-hidden rounded-[20px] bg-[#0b0b0d] text-hq-bone">
      <div className="group relative grid aspect-video w-full cursor-pointer place-items-center bg-[radial-gradient(120%_130%_at_15%_0%,var(--hq-red-ink),#0b0b0d_68%)]" onClick={toggle}>
        <p className="absolute right-6 bottom-[18px] left-[22px] max-w-[16ch] text-left text-[clamp(18px,2.6vw,30px)] leading-[1.05] font-[720] tracking-[-0.015em] [font-stretch:88%]">{replay.title}</p>
        <span className={`grid size-[76px] place-items-center rounded-full bg-hq-red text-white transition-[opacity,transform] duration-200 ease-hq group-hover:scale-[1.07] ${playing ? 'scale-[0.7] opacity-0' : ''}`} aria-hidden="true">
          <Icon name="play" filled className="ml-[3px] size-7" />
        </span>
      </div>
      <div className="flex items-center gap-3 bg-hq-ink px-4 py-3">
        <button type="button" className="grid size-[34px] shrink-0 place-items-center rounded-full bg-hq-bone text-hq-ink" onClick={toggle} aria-label="Play or pause">
          <Icon name={playing ? 'pause' : 'play'} filled className="size-4" />
        </button>
        <span className="min-w-[38px] text-[13px] text-[#b9b4aa] [font-variant-numeric:tabular-nums]">{fmt(time)}</span>
        <input
          type="range"
          className="media-scrub h-1.5 min-w-0 flex-1 cursor-pointer appearance-none rounded-[99px] bg-[linear-gradient(90deg,var(--hq-red)_var(--pct,0%),#2c2c33_var(--pct,0%))]"
          min={0}
          max={replay.dur}
          step={1}
          value={Math.floor(time)}
          aria-label="Seek"
          style={{ '--pct': pct } as React.CSSProperties}
          onChange={(e) => seek(Number(e.target.value))} />
        
        <span className="min-w-[38px] text-[13px] text-[#b9b4aa] [font-variant-numeric:tabular-nums]">{fmt(replay.dur)}</span>
        <button type="button" className="rounded-lg bg-[#26262c] px-2.5 py-1 text-[13px] font-[650] text-hq-bone" onClick={cycleSpeed} aria-label="Playback speed">
          {speed}×
        </button>
      </div>
    </div>);

}
