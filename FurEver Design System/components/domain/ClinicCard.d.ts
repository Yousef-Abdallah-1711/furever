import * as React from 'react';
export interface ClinicCardProps {
  name: string;
  distance: string;
  rating: string;
  next: string;
  /** Translated "Next available" */
  nextLabel: string;
  badge?: React.ReactNode;
  onClick?: () => void;
}
export declare function ClinicCard(props: ClinicCardProps): JSX.Element;
