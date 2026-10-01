import React from 'react';
import { View } from '../components/View';
import type { Course } from '../types/lms';
import { art, artTone, progressBar, tag, tile, tileBody, tiles } from '../styles';
import { EmptyState } from '../components/ui/EmptyState';

interface CoursesProps {
  courses: Course[];
  onOpenCourse: (id: string) => void;
}

export function Courses({ courses, onOpenCourse }: CoursesProps) {
  return (
    <View>
      {courses.length ? <div className={tiles}>
        {courses.map((c) =>
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
      </div> : <EmptyState icon="book" title="No courses yet" description="Courses you are enrolled in will appear here with lessons and progress." />}
    </View>);

}
