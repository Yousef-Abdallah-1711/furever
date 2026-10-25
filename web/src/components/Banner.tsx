'use client';

import * as React from 'react';
import { Icon } from './Icon';

export interface BannerProps {
  tone?: 'info' | 'warning' | 'danger' | 'success';
  action?: React.ReactNode;
  children?: React.ReactNode;
}

const tones = {
  info: { background: 'bg-info-bg', foreground: 'text-info', icon: 'info' },
  warning: { background: 'bg-warning-bg', foreground: 'text-warning', icon: 'triangle-alert' },
  danger: { background: 'bg-danger-bg', foreground: 'text-danger', icon: 'circle-alert' },
  success: { background: 'bg-success-bg', foreground: 'text-success', icon: 'circle-check' },
} as const;

export function Banner({ tone = 'info', action, children }: BannerProps) {
  const colors = tones[tone];
  return (
    <div className={`flex w-full items-center gap-sp-3 rounded-r-control p-sp-4 ${colors.background} ${colors.foreground}`}>
      <span className="shrink-0"><Icon name={colors.icon} style={{ color: 'currentColor' }} /></span>
      <div className="min-w-0 flex-1 text-fs-body">{children}</div>
      {action ? <div className="ms-auto shrink-0">{action}</div> : null}
    </div>
  );
}
