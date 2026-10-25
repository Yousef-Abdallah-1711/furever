import * as React from 'react';
import { useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { format, parseISO } from 'date-fns';
import { Icon } from './Icon';
import { useTokenColor } from '@/lib/resolveTokenColor';

export interface DateFieldProps {
  value?: string;
  onChange: (value: string) => void;
  label?: string;
  hint?: string;
  error?: string;
  placeholder?: string;
  disabled?: boolean;
  minimumDate?: string;
  maximumDate?: string;
}

export function DateField({ value, onChange, label, hint, error, placeholder, disabled = false, minimumDate, maximumDate }: DateFieldProps) {
  const [show, setShow] = useState(false);
  const [today] = useState(() => new Date());
  const iconColor = useTokenColor('text-secondary');
  const message = error ?? hint;
  const displayedValue = value ? format(parseISO(value), 'PP') : placeholder;

  return (
    <View className="w-full gap-sp-2">
      {label ? <Text className="text-fs-caption text-text-primary">{label}</Text> : null}
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={label}
        accessibilityState={{ disabled }}
        disabled={disabled}
        onPress={() => setShow(true)}
        className={`min-h-sp-12 flex-row items-center justify-between gap-sp-3 rounded-r-control border px-sp-4 py-sp-3 ${error ? 'border-danger' : 'border-default'} ${disabled ? 'bg-surface-secondary' : 'bg-surface'}`}
      >
        <Text className={`flex-1 text-start text-fs-body ${value ? 'text-text-primary' : 'text-text-secondary'}`}>
          {displayedValue}
        </Text>
        <Icon name="calendar" style={{ color: iconColor } as never} />
      </Pressable>
      {message ? <Text className={`text-fs-caption ${error ? 'text-danger' : 'text-text-secondary'}`}>{message}</Text> : null}
      {show ? (
        <DateTimePicker
          mode="date"
          value={new Date(value ? parseISO(value).getTime() : today.getTime())}
          minimumDate={minimumDate ? parseISO(minimumDate) : undefined}
          maximumDate={maximumDate ? parseISO(maximumDate) : undefined}
          onValueChange={(_event, selectedDate) => {
            if (selectedDate) onChange(format(selectedDate, 'yyyy-MM-dd'));
          }}
          onDismiss={() => setShow(false)}
        />
      ) : null}
    </View>
  );
}
