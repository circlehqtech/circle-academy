import { View } from '../components/View';
import { Icon } from '../components/Icon';
import { Player } from '../components/Player';
import { ReplayList } from '../components/ReplayList';
import { usePlayer } from '../contexts/PlayerContext';
import { useToast } from '../contexts/ToastContext';
import { fmt } from '../utils/format';
import { agenda, buttonGhostSmall, buttonSmall, chip, heading, liveGrid } from '../styles';
import { EmptyState } from '../components/ui/EmptyState';
import { useWorkspace } from '../features/workspace/useWorkspace';
import { formatClockTime, formatDate } from '../utils/dateTime';

interface LiveReplaysProps {
  onSelectReplay: (id: string) => void;
}

export function LiveReplays({ onSelectReplay }: LiveReplaysProps) {
  const { time, marks, addMark, seek, replays } = usePlayer();
  const { liveClasses, courses } = useWorkspace();
  const { toast } = useToast();
  const upcoming = liveClasses.filter((item) => !['Cancelled', 'Completed', 'Draft'].includes(item.status));

  return (
    <View>
      <div className={liveGrid}>
        <div>
          {replays.length ? <>
          <Player />
          <div className="mt-3.5 flex flex-wrap items-center gap-2">
            <button
              type="button"
              className={buttonGhostSmall}
              onClick={() => {
                const t = Math.floor(time);
                addMark(t);
                toast(`Bookmarked at ${fmt(t)}`);
              }}>
              
              <Icon name="bookmark" />
              Bookmark this moment
            </button>
            {marks.map((m) =>
            <button key={m} type="button" className={chip} onClick={() => seek(m)}>
                <Icon name="bookmark" />
                <b>{fmt(m)}</b>
              </button>
            )}
          </div>
          </> : <EmptyState icon="video" title="No recordings available" description="Recordings from completed live classes will appear here." />}
        </div>

        <div>
          <h3 className={heading}>Coming up</h3>
          {upcoming.length ? <ul className={agenda}>{upcoming.map((item) => <li key={item.id}><div><b>{item.title}</b><span>{courses.find((course) => course.id === item.courseId)?.title ?? 'Assigned course'} · {formatDate(item.date)}, {formatClockTime(item.time)}</span></div><button type="button" className={item.status === 'Live' ? buttonSmall : buttonGhostSmall} onClick={() => item.meetingUrl ? window.open(item.meetingUrl, '_blank', 'noopener,noreferrer') : toast('The meeting link has not been added yet.')}>{item.status === 'Live' ? 'Join' : 'View'}</button></li>)}</ul> : <EmptyState icon="video" title="No upcoming classes" description="Scheduled live classes will appear here." compact />}
        </div>
      </div>

      <div className="mt-10">
        <h3 className={heading}>Replay library</h3>
        {replays.length ? <ReplayList onSelect={onSelectReplay} /> : <EmptyState icon="play" title="Replay library is empty" description="Available class recordings will appear here after their external links are attached." compact />}
      </div>
    </View>);

}
