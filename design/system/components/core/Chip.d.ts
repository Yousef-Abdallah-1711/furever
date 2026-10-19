import * as React from 'react';
export interface ChipProps {
  on?: boolean;
  icon?: string;
  children?: React.ReactNode;
  onClick?: () => void;
}
export declare function Chip(props: ChipProps): JSX.Element;
