import * as React from 'react';
/**
 * @startingPoint section="Core" subtitle="Text field states" viewport="700x240"
 */
export interface InputProps {
  label?: string;
  hint?: string;
  /** Inline error message; turns the border red */
  error?: string;
  icon?: string;
  value?: string;
  defaultValue?: string;
  placeholder?: string;
  disabled?: boolean;
  type?: string;
  inputMode?: 'text'|'tel'|'numeric'|'email';
  /** Keep LTR order inside Arabic (phones, codes) */
  ltr?: boolean;
  /** e.g. "+20" country prefix */
  prefix?: React.ReactNode;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
}
export declare function Input(props: InputProps): JSX.Element;
