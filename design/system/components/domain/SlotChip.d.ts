import * as React from 'react';
export interface SlotChipProps {
  /** e.g. "10:30" (Cairo time) */
  time: string;
  on?: boolean;
  disabled?: boolean;
  onClick?: () => void;
}
export declare function SlotChip(props: SlotChipProps): JSX.Element;
