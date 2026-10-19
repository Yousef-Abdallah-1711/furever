import * as React from 'react';
/**
 * @startingPoint section="Core" subtitle="Empty and error variants" viewport="700x320"
 */
export interface EmptyStateProps {
  icon?: string;
  title: string;
  body?: string;
  action?: string;
  onAction?: () => void;
  /** danger = error state with Retry */
  tone?: 'default'|'danger';
}
export declare function EmptyState(props: EmptyStateProps): JSX.Element;
