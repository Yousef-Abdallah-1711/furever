import type { ReactElement } from 'react';
import { Text, View } from 'react-native';
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
      <View className="flex-row items-start justify-between gap-sp-4">
        <View className="flex-1 gap-sp-1">
          <Text className="text-fs-h3 text-text-primary">{name}</Text>
          <Text className="text-fs-body text-text-secondary">{breed} · {age}</Text>
        </View>
        <StatusBadge status={status}>{statusLabel}</StatusBadge>
      </View>
    </Card>
  );
}