import * as React from 'react';
export interface IconButtonProps {
  icon: string;
  /** Required accessible label */
  label: string;
  badge?: number|string;
  plain?: boolean;
  flip?: boolean;
  onClick?: () => void;
}
export declare function IconButton(props: IconButtonProps): JSX.Element;
