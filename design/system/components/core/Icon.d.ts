import * as React from 'react';
export interface IconProps {
  /** Lucide icon name, e.g. "calendar" */
  name: string;
  size?: number;
  /** Mirror in RTL (back, chevrons, progress arrows only) */
  flip?: boolean;
  label?: string;
  style?: React.CSSProperties;
}
export declare function Icon(props: IconProps): JSX.Element;
