'use client';
import * as React from 'react';
import { IconButton } from './IconButton';
export interface ToastProps { message: string; tone?: 'default' | 'success' | 'danger'; onDismiss?: () => void; duration?: number; }
export function Toast({ message, tone = 'default', onDismiss, duration }: ToastProps) {
 // Capture the latest onDismiss via a ref (updated in its own effect, never during render)
 // so the timer isn't torn down and restarted every time a caller passes a fresh inline
 // closure (e.g. onDismiss={() => setToast(null)}) - otherwise a parent that re-renders at
 // all during `duration` would reset the timer forever.
 const onDismissRef = React.useRef(onDismiss);
 React.useEffect(() => {
  onDismissRef.current = onDismiss;
 }, [onDismiss]);
 React.useEffect(() => {
  if (duration === undefined) return;
  const timer = setTimeout(() => onDismissRef.current?.(), duration);
  return () => clearTimeout(timer);
 }, [duration]);
 const toneClass = tone === 'success' ? 'bg-success-bg text-success' : tone === 'danger' ? 'bg-danger-bg text-danger' : 'bg-surface text-text-primary';
 return <div className={`flex w-fit max-w-full items-center justify-center gap-sp-3 self-center rounded-r-control px-sp-4 py-sp-3 shadow-card ${toneClass}`}>
  <p className="flex-1 text-fs-body">{message}</p>
  {onDismiss ? <IconButton icon="x" label="Dismiss" plain onClick={onDismiss} /> : null}
 </div>;
}
