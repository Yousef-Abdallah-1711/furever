import * as React from 'react';
export interface RatingProps {
  value?: number;
  size?: number;
  /** Provide to make it an input (Rate visit) */
  onChange?: (n: number) => void;
}
export declare function Rating(props: RatingProps): JSX.Element;
