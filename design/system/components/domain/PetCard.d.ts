import * as React from 'react';
/**
 * @startingPoint section="Domain" subtitle="Pet and clinic cards" viewport="700x260"
 */
export interface PetCardProps {
  name: string;
  breed: string;
  age: string;
  status: 'up_to_date'|'due_soon'|'overdue';
  statusLabel: string;
  onClick?: () => void;
}
export declare function PetCard(props: PetCardProps): JSX.Element;
