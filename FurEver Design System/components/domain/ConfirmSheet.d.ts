import * as React from 'react';
export interface ConfirmSheetProps {
  title: string;
  body?: string;
  confirm: string;
  cancel: string;
  destructive?: boolean;
  onConfirm?: () => void;
  onCancel?: () => void;
  /** Extra content, e.g. reason field */
  children?: React.ReactNode;
}
export declare function ConfirmSheet(props: ConfirmSheetProps): JSX.Element;
