import { useState } from 'react';
import { Icon } from './Icon';
import { QUIZ } from '../data/lms';
import { button, heading, muted } from '../styles';

export function Quiz() {
  const [index, setIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [picked, setPicked] = useState<number | null>(null);
  const [results, setResults] = useState<(boolean | undefined)[]>([]);

  const done = index >= QUIZ.length;

  const dots =
  <div className="mb-[18px] flex gap-1.5" aria-hidden="true">
      {QUIZ.map((_, k) =>
    <i
      key={k}
      className={`h-[5px] flex-1 rounded-[9px] transition-colors duration-300 ${results[k] === true ? 'bg-reward' : results[k] === false || k === index && !done ? 'bg-accent' : 'bg-surface-2'}`} />

    )}
    </div>;


  if (done) {
    return (
      <div>
        {dots}
        <h3 className={heading}>
          You got {score} of {QUIZ.length}
        </h3>
        <p className={`my-4 max-w-[56ch] ${muted}`}>
          Your score is saved to your gradebook. You can retry as many times as you like before Thursday.
        </p>
        <button
          type="button"
          className={button}
          onClick={() => {
            setIndex(0);
            setScore(0);
            setPicked(null);
            setResults([]);
          }}>
          
          Retry quiz
        </button>
      </div>);

  }

  const q = QUIZ[index];
  const answered = picked !== null;

  const pick = (k: number) => {
    if (answered) return;
    setPicked(k);
    const ok = k === q.a;
    if (ok) setScore((s) => s + 1);
    setResults((prev) => {
      const next = [...prev];
      next[index] = ok;
      return next;
    });
  };

  return (
    <div>
      {dots}
      <p className="mb-[18px] max-w-[34ch] text-[clamp(20px,2.4vw,26px)] leading-[1.2] font-[650] tracking-[-0.01em]">{q.q}</p>
      <div className="grid max-w-[560px] gap-2.5">
        {q.o.map((o, k) => {
          const state = answered ? k === q.a ? 'right' : k === picked ? 'wrong' : '' : '';
          return (
            <button
              key={o}
              type="button"
              className={`flex items-center gap-3 rounded-[14px] border-[1.5px] bg-surface px-4 py-3.5 font-[550] transition-[border-color,transform,background] duration-200 ease-hq enabled:hover:translate-x-1 enabled:hover:border-foreground [&_.i]:size-[18px] [&_.i]:transition-opacity [&_.i]:duration-200 ${state === 'right' ? 'animate-pop border-reward bg-[color-mix(in_srgb,var(--reward)_18%,var(--surface))] [&_.i]:opacity-100' : state === 'wrong' ? 'animate-shake border-accent bg-[color-mix(in_srgb,var(--accent)_10%,var(--surface))] [&_.i]:opacity-100' : 'border-line [&_.i]:opacity-0'}`}
              disabled={answered}
              onClick={() => pick(k)}>
              
              <Icon name={state === 'wrong' ? 'x' : 'check'} />
              <span>{o}</span>
            </button>);

        })}
      </div>
      {answered &&
      <>
          <p className={`my-4 max-w-[56ch] ${muted}`}>
            <b className="text-foreground">{picked === q.a ? 'Correct.' : 'Not quite.'}</b> {q.why}
          </p>
          <button
          type="button"
          className={button}
          onClick={() => {
            setIndex((i) => i + 1);
            setPicked(null);
          }}>
          
            {index === QUIZ.length - 1 ? 'See score' : 'Next question'}
          </button>
        </>
      }
    </div>);

}
