import { useEffect, useState } from 'react';
import { View } from '../components/View';
import { Icon } from '../components/Icon';
import type { Session } from '../types/lms';
import { buttonSmall, heading, status, statusMiss } from '../styles';

interface AdminRecordingsProps {
  sessions: Session[];
  onAttach: (index: number) => void;
  onDrop: () => void;
}

function UploadBar() {
  const [full, setFull] = useState(false);
  useEffect(() => {
    const id = requestAnimationFrame(() => setFull(true));
    return () => cancelAnimationFrame(id);
  }, []);
  return (
    <div className="mt-1.5 h-[5px] w-[130px] overflow-hidden rounded-[9px] bg-surface-2" aria-hidden="true">
      <u className="block h-full bg-accent transition-[width] duration-[1600ms] ease-linear" style={{ width: full ? '100%' : 0 }} />
    </div>);

}

export function AdminRecordings({ sessions, onAttach, onDrop }: AdminRecordingsProps) {
  return (
    <View>
      <button type="button" className="mb-[34px] grid w-full place-items-center gap-1.5 rounded-[22px_22px_22px_6px] border-2 border-dashed border-line px-5 py-[34px] text-center transition-[border-color,background] duration-200 hover:border-accent hover:bg-surface" onClick={onDrop}>
        <Icon name="upload" className="size-7 text-accent" />
        <b className="text-[17px]">Drop a Zoom recording here</b>
        <span className="text-muted">Or choose a file. We match it to the session for you.</span>
      </button>

      <h3 className={heading}>Sessions</h3>
      <div>
        {sessions.map((s, i) =>
        <div key={s.t} className="grid grid-cols-[minmax(0,1fr)] items-center gap-4 border-t border-line px-2 py-[15px] first:border-t-0 min-[821px]:grid-cols-[minmax(0,1fr)_110px_170px]">
            <div>
              <b className="block font-[620]">{s.t}</b>
              <span className="text-sm text-muted">{s.d}</span>
            </div>
            <span className={s.ok ? status : statusMiss}>
              <i aria-hidden="true" />
              {s.uploading ? 'Uploading' : s.ok ? 'Attached' : 'Missing'}
            </span>
            <div>
              {s.uploading ?
            <UploadBar /> :
            s.ok ? null :
            <button type="button" className={buttonSmall} onClick={() => onAttach(i)}>
                  Attach recording
                </button>
            }
            </div>
          </div>
        )}
      </div>
    </View>);

}
