import React from 'react';
import { View } from '../components/View';
import { COURSES } from '../data/lms';
import { art, artTone, progressBar, tag, tile, tileBody, tiles } from '../styles';

interface CoursesProps {
  onOpenCourse: (id: string) => void;
}

export function Courses({ onOpenCourse }: CoursesProps) {
  return (
    <View>
      <div className={tiles}>
        {COURSES.map((c) =>
        <button key={c.id} type="button" className={tile} onClick={() => onOpenCourse(c.id)}>
            <span className={`${art} ${artTone[c.art]}`} aria-hidden="true">
              {c.g}
              {c.p === 100 && <span className={tag}>Completed</span>}
            </span>
            <span className={tileBody}>
              <b>{c.name}</b>
              <span>
                {c.lessons} lessons. {c.p === 100 ? 'Certificate ready.' : `Next: ${c.next}`}
              </span>
              <span
              className={`${progressBar} ${c.p === 100 ? '[&>i]:bg-reward' : ''}`}
              style={{ '--p': c.p, display: 'block' } as React.CSSProperties}>
              
                <i />
              </span>
            </span>
          </button>
        )}
      </div>
    </View>);

}
