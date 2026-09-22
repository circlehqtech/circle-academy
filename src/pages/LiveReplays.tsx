import { View } from '../components/View';
import { Icon } from '../components/Icon';
import { Player } from '../components/Player';
import { ReplayList } from '../components/ReplayList';
import { usePlayer } from '../contexts/PlayerContext';
import { useToast } from '../contexts/ToastContext';
import { fmt } from '../utils/format';
import { agenda, buttonGhostSmall, buttonSmall, chip, heading, liveGrid } from '../styles';

interface LiveReplaysProps {
  onSelectReplay: (id: string) => void;
}

export function LiveReplays({ onSelectReplay }: LiveReplaysProps) {
  const { time, marks, addMark, seek } = usePlayer();
  const { toast } = useToast();

  return (
    <View>
      <div className={liveGrid}>
        <div>
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
        </div>

        <div>
          <h3 className={heading}>Coming up</h3>
          <ul className={agenda}>
            <li>
              <div>
                <b>Compound components</b>
                <span>Today, 4:00 pm</span>
              </div>
              <button
                type="button"
                className={buttonSmall}
                onClick={() => toast('Opening Zoom. This is a preview.')}>
                
                Join
              </button>
            </li>
            <li>
              <div>
                <b>TypeScript: Generics in practice</b>
                <span>Thursday, 5:00 pm</span>
              </div>
              <button
                type="button"
                className={buttonGhostSmall}
                onClick={() => toast('Added to your calendar.')}>
                
                Remind me
              </button>
            </li>
          </ul>
        </div>
      </div>

      <div className="mt-10">
        <h3 className={heading}>Replay library</h3>
        <ReplayList onSelect={onSelectReplay} />
      </div>
    </View>);

}
