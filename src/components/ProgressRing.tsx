import React from 'react';

interface ProgressRingProps {
  value: number;
  done?: boolean;
}

export function ProgressRing({ value, done = false }: ProgressRingProps) {
  return (
    <span
      className="relative block size-14"
      style={{ '--p': value } as React.CSSProperties}>
      
      <svg className="size-14 -rotate-90" viewBox="0 0 56 56" aria-hidden="true">
        <circle className="fill-none stroke-line stroke-[5]" cx="28" cy="28" r="25" />
        <circle
          className={`fill-none stroke-[5] [stroke-dasharray:157px] [stroke-dashoffset:calc(157px*(1-var(--p)/100))] [stroke-linecap:round] transition-[stroke-dashoffset] duration-1000 ease-hq ${done ? 'stroke-reward' : 'stroke-accent'}`}
          cx="28" cy="28" r="25" />
      </svg>
      <b className="absolute inset-0 grid place-items-center text-[13px] font-bold">{value}%</b>
    </span>);

}
