import * as React from 'react';
export interface PhaseTagProps {
  phase?: 2|3|4;
  /** Override text, e.g. translated "Later phase" */
  children?: React.ReactNode;
}
export declare function PhaseTag(props: PhaseTagProps): JSX.Element;
