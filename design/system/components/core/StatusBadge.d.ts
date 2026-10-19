import * as React from 'react';
/**
 * @startingPoint section="Core" subtitle="Appointment and vaccination statuses" viewport="700x160"
 */
export interface StatusBadgeProps {
  /** Maps to PRD status tokens */
  status: 'pending'|'confirmed'|'checked_in'|'in_progress'|'completed'|'cancelled'|'no_show'|'up_to_date'|'due_soon'|'overdue'|'verified'|'self_reported';
  /** Translated label */
  children?: React.ReactNode;
}
export declare function StatusBadge(props: StatusBadgeProps): JSX.Element;
