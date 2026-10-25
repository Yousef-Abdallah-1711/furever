'use client';

import type { ReactNode } from 'react';
export interface StatusBadgeProps { status: 'pending' | 'confirmed' | 'checked_in' | 'in_progress' | 'completed' | 'cancelled' | 'no_show' | 'up_to_date' | 'due_soon' | 'overdue' | 'verified' | 'self_reported'; children?: ReactNode; }
const statusClasses: Record<StatusBadgeProps['status'], string> = {
  pending: 'bg-warning-bg text-warning', confirmed: 'bg-info-bg text-info', checked_in: 'bg-surface-secondary text-primary', in_progress: 'bg-info-bg text-info', completed: 'bg-success-bg text-success', cancelled: 'bg-surface-secondary text-text-secondary', no_show: 'bg-danger-bg text-danger', up_to_date: 'bg-success-bg text-success', due_soon: 'bg-warning-bg text-warning', overdue: 'bg-danger-bg text-danger', verified: 'bg-success-bg text-success', self_reported: 'bg-info-bg text-info',
};
export function StatusBadge({ status, children }: StatusBadgeProps) {
  return <span className={'inline-flex rounded-r-chip px-sp-3 py-sp-1 text-fs-caption ' + statusClasses[status]}>{children}</span>;
}
