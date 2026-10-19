import * as React from 'react';
/**
 * @startingPoint section="Navigation" subtitle="Booking status stepper" viewport="700x140"
 */
export interface StepperProps {
  /** Translated step labels (booking status, add-pet steps) */
  steps: string[];
  /** Zero-based active step */
  current?: number;
}
export declare function Stepper(props: StepperProps): JSX.Element;
