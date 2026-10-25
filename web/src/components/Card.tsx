'use client';

import type { CSSProperties, ReactNode } from 'react';
export interface CardProps { children?: ReactNode; onClick?: () => void; pad?: number; tint?: boolean; style?: CSSProperties; }
const spacingClass: Record<number, string> = { 4: 'p-sp-1', 8: 'p-sp-2', 12: 'p-sp-3', 16: 'p-sp-4', 20: 'p-sp-5', 24: 'p-sp-6', 32: 'p-sp-8', 40: 'p-sp-10', 48: 'p-sp-12' };
export function Card({ children, onClick, pad = 16, tint = false, style }: CardProps) {
  const classes = ['rounded-r-card shadow-card', tint ? 'bg-surface-secondary border border-primary' : 'bg-surface-card', spacingClass[pad]].filter(Boolean).join(' ');
  const combinedStyle = { ...(spacingClass[pad] ? {} : { padding: pad }), ...style };
  return onClick
    ? <button type="button" onClick={onClick} className={classes + ' border-0 text-start'} style={combinedStyle}>{children}</button>
    : <div className={classes} style={combinedStyle}>{children}</div>;
}
