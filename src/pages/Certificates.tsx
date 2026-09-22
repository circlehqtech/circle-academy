import { useEffect, useRef, useState } from 'react';
import { View } from '../components/View';
import { Icon } from '../components/Icon';
import { COURSES } from '../data/lms';
import { useToast } from '../contexts/ToastContext';
import { button, certificateGrid, courseListButton, muted, textInput } from '../styles';

const CERTS = [COURSES[2], COURSES[0], COURSES[1]];

export function Certificates() {
  const { toast } = useToast();
  const [ci, setCi] = useState(0);
  const [name, setName] = useState('');
  const [stamp, setStamp] = useState(false);
  const [btnLabel, setBtnLabel] = useState('Download PDF');
  const [preparing, setPreparing] = useState(false);
  const timers = useRef<number[]>([]);

  useEffect(() => () => timers.current.forEach((t) => window.clearTimeout(t)), []);

  const course = CERTS[ci];
  const complete = course.p === 100;
  const nameOk = name.trim().length >= 2;
  const canDownload = complete && nameOk && !preparing;

  const download = () => {
    if (!canDownload) return;
    setPreparing(true);
    setBtnLabel('Preparing PDF…');
    timers.current.push(
      window.setTimeout(() => {
        setStamp(false);
        window.requestAnimationFrame(() => setStamp(true));
        setBtnLabel('Downloaded');
        toast('Certificate ready. In the real app this saves a PDF.');
        timers.current.push(
          window.setTimeout(() => {
            setBtnLabel('Download PDF');
            setPreparing(false);
          }, 2200)
        );
      }, 1000)
    );
  };

  return (
    <View>
      <div className={certificateGrid}>
        <div>
          {CERTS.map((c, i) => {
            const done = c.p === 100;
            return (
              <button
                key={c.id}
                type="button"
                className={courseListButton}
                aria-pressed={i === ci}
                onClick={() => {
                  setCi(i);
                  setStamp(false);
                }}>
                
                <b>{c.name}</b>
                <span className={done ? '!text-foreground' : undefined}>
                  <Icon name={done ? 'check' : 'lock'} />
                  {done ? 'Ready to download' : `${c.p}% complete`}
                </span>
              </button>);

          })}
        </div>

        <div>
          <div className="mb-5 grid max-w-[440px] gap-1.5">
            <label className="font-semibold" htmlFor="certName">Name on certificate</label>
            <input
              className={textInput}
              id="certName"
              type="text"
              placeholder="Type your full name"
              autoComplete="name"
              disabled={!complete}
              value={name}
              onChange={(e) => setName(e.target.value)} />
            
            <span className={`text-[13.5px] ${muted}`}>
              Check the spelling before you download.
            </span>
          </div>

          <div className="relative max-w-[760px] [container-type:inline-size]">
            <div className={`relative aspect-[1.414/1] rounded-lg bg-[#f7f2e7] p-[4cqw] text-hq-ink shadow-[0_26px_60px_-28px_rgb(0_0_0/0.5)] transition-[filter] duration-400 before:absolute before:inset-[2.2cqw] before:border-[0.4cqw] before:border-hq-red after:absolute after:inset-[3.2cqw] after:border-[0.14cqw] after:border-hq-amber ${complete ? '' : 'blur-[7px] saturate-50'}`}>
              <div className="relative flex h-full flex-col items-center justify-center gap-[1.3cqw] text-center">
                <small className="text-[1.75cqw] text-[#5b5750]">HQ Learn certificate of completion</small>
                <h4 className="text-[3.3cqw] font-bold tracking-[-0.01em] [font-stretch:88%]">This certifies that</h4>
                <div className={`min-h-[7.2cqw] max-w-[88%] border-b-[0.22cqw] border-hq-amber px-[3cqw] pb-[0.8cqw] text-[6.2cqw] leading-[1.05] font-[760] tracking-[-0.025em] [overflow-wrap:anywhere] ${nameOk ? '' : 'font-medium text-[#b3ab9b]'}`}>{nameOk ? name.trim() : 'Your name'}</div>
                <small className="text-[1.75cqw] text-[#5b5750]">has completed</small>
                <div className="text-[2.9cqw] font-[650]">{course.name}</div>
                <div className="mt-[1.4cqw] text-[2.1cqw] italic">Dr. Amaka Obi</div>
                <span className="absolute bottom-[-1cqw] left-0 text-[1.4cqw] text-[#7c7668]">21 September 2026, ID HQ-7F3K-2291</span>
                <span className={`absolute right-[2.5cqw] bottom-[-0.5cqw] grid size-[11cqw] rotate-[-8deg] place-items-center rounded-full bg-[radial-gradient(circle_at_35%_30%,#ecd39c,#c9a25e_55%,#98773a)] text-center text-[1.55cqw] leading-[1.1] font-extrabold text-hq-red-ink shadow-[0_1cqw_2cqw_-1cqw_rgb(0_0_0/0.4)] ${stamp ? 'animate-stamp' : ''}`}>
                  HQ
                  <br />
                  Learn
                  <br />
                  Verified
                </span>
              </div>
            </div>
            {!complete && <div className="absolute inset-0 grid place-items-center p-6 text-center">
              <div className="rounded-[18px] bg-background px-[26px] py-5 text-foreground shadow-[0_20px_50px_-20px_rgb(0_0_0/0.5)]">
                <Icon name="lock" className="mb-1.5 size-[26px]" />
                <p>
                  <b>Finish the last {100 - course.p}% to unlock</b>
                </p>
              </div>
            </div>}
          </div>

          <div className="mt-[22px] flex flex-wrap items-center gap-3">
            <button type="button" className={button} disabled={!canDownload} onClick={download}>
              {btnLabel}
            </button>
            <span className={muted}>
              {!complete ?
              'Complete every lesson and pass the exam.' :
              nameOk ?
              'Your certificate is ready.' :
              'Type your name to continue.'}
            </span>
          </div>
        </div>
      </div>
    </View>);

}
