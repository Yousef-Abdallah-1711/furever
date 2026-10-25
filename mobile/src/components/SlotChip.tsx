import type { ReactElement } from 'react';
import { Pressable, Text } from 'react-native';

export interface SlotChipProps {
  time: string;
  on?: boolean;
  disabled?: boolean;
  onClick?: () => void;
}

export function SlotChip({ time, on = false, disabled = false, onClick }: SlotChipProps): ReactElement {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ selected: on, disabled }}
      className={`rounded-r-chip border px-sp-4 py-sp-2 ${on ? 'border-primary bg-primary' : 'border-border bg-surface'} ${disabled ? 'opacity-50' : ''}`}
      disabled={disabled}
      onPress={onClick}
    >
      <Text className={on ? 'text-on-primary text-fs-button' : 'text-text-primary text-fs-button'}>{time}</Text>
    </Pressable>
  );
}
