'use client';

import type { ReactElement } from 'react';
import { Card } from './Card';
import { StatusBadge } from './StatusBadge';

export interface PetCardProps {
  name: string;
  breed: string;
  age: string;
  status: 'up_to_date' | 'due_soon' | 'overdue';
  statusLabel: string;
  onClick?: () => void;
}

export function PetCard({ name, breed, age, status, statusLabel, onClick }: PetCardProps): ReactElement {
  return (
    <Card onClick={onClick}>
      <div className="flex items-start justify-between gap-sp-4">
        <div className="flex-1">
          <h3 className="text-fs-h3 text-text-primary">{name}</h3>
          <p className="text-fs-body text-text-secondary">{breed} · {age}</p>
        </div>
        <StatusBadge status={status}>{statusLabel}</StatusBadge>
      </div>
    </Card>
  );
}