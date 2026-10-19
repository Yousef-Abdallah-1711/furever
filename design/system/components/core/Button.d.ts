import * as React from 'react';
/**
 * @startingPoint section="Core" subtitle="Primary, secondary, ghost, destructive, loading" viewport="700x260"
 */
export interface ButtonProps {
  variant?: 'primary'|'secondary'|'ghost'|'destructive'|'outline';
  /** l=48, m=40, s=32 high */
  size?: 'l'|'m'|'s';
  block?: boolean;
  loading?: boolean;
  disabled?: boolean;
  /** Lucide icon name shown before the label */
  icon?: string;
  children?: React.ReactNode;
  onClick?: () => void;
  style?: React.CSSProperties;
  type?: 'button'|'submit';
}
export declare function Button(props: ButtonProps): JSX.Element;
