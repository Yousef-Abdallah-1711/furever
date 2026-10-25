'use client';

import type { ReactElement } from 'react';
import { Icon } from './Icon';

export interface RatingProps {
  value?: number;
  size?: number;
  onChange?: (n: number) => void;
}

export function Rating({ value = 0, size = 24, onChange }: RatingProps): ReactElement {
  const filledCount = Math.max(0, Math.min(5, Math.round(Number.isFinite(value) ? value : 0)));
  return (
    <div className="inline-flex items-center gap-sp-1">
      {Array.from({ length: 5 }, (_, index) => {
        const color = index < filledCount ? 'text-warning' : 'text-text-secondary';
        const star = <Icon name="star" size={size} style={{ color: 'currentColor' }} />;
        return onChange ? (
          <button key={index} type="button" aria-label={`Rate ${index + 1} out of 5`} onClick={() => onChange(index + 1)} className={color}>{star}</button>
        ) : <span key={index} className={color}>{star}</span>;
      })}
    </div>
  );
}
