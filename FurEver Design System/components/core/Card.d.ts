import * as React from 'react';
export interface CardProps {
  children?: React.ReactNode;
  onClick?: () => void;
  pad?: number;
  /** Category-card look: #EEDAD7 fill, primary border */
  tint?: boolean;
  style?: React.CSSProperties;
}
export declare function Card(props: CardProps): JSX.Element;
