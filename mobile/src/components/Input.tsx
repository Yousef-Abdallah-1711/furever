import * as React from 'react';
import { Text, TextInput, View } from 'react-native';
import type { TextInputProps } from 'react-native';
import { Icon } from './Icon';
import { useTokenColor } from '@/lib/resolveTokenColor';

export interface InputProps {
  label?: string;
  hint?: string;
  error?: string;
  icon?: string;
  value?: string;
  defaultValue?: string;
  placeholder?: string;
  disabled?: boolean;
  type?: string;
  inputMode?: 'text' | 'tel' | 'numeric' | 'email';
  ltr?: boolean;
  prefix?: React.ReactNode;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

const keyboardTypes: Record<NonNullable<InputProps['inputMode']>, TextInputProps['keyboardType']> = {
  text: 'default',
  tel: 'phone-pad',
  numeric: 'numeric',
  email: 'email-address',
};

export function Input({ label, hint, error, icon, value, defaultValue, placeholder, disabled = false, type = 'text', inputMode = 'text', ltr = false, prefix, onChange }: InputProps) {
  const message = error ?? hint;
  // RN's style prop isn't run through NativeWind's className compiler, so Icon's color
  // override must be a real hex (via useTokenColor), never the CSS keyword 'currentColor'.
  const iconColor = useTokenColor('text-secondary');
  const handleChangeText = (text: string) => {
    onChange?.({ target: { value: text } } as unknown as React.ChangeEvent<HTMLInputElement>);
  };

  return (
    <View className="w-full gap-sp-2">
      {label ? <Text className="text-fs-caption text-text-primary">{label}</Text> : null}
      <View className={`min-h-sp-12 flex-row items-center gap-sp-3 rounded-r-control border px-sp-4 py-sp-3 ${error ? 'border-danger' : 'border-default'} ${disabled ? 'bg-surface-secondary' : 'bg-surface'}`}>
        {icon ? <Icon name={icon} style={{ color: iconColor } as never} /> : null}
        {prefix ? <View className="shrink-0">{typeof prefix === 'string' || typeof prefix === 'number' ? <Text className="text-fs-body text-text-secondary">{prefix}</Text> : prefix}</View> : null}
        <TextInput className="min-w-0 flex-1 p-0 text-start text-fs-body text-text-primary placeholder:text-text-secondary" value={value} defaultValue={defaultValue} placeholder={placeholder} editable={!disabled} secureTextEntry={type === 'password'} keyboardType={inputMode === 'text' && type === 'number' ? 'numeric' : keyboardTypes[inputMode]} onChangeText={handleChangeText} style={ltr ? { writingDirection: 'ltr' } : undefined} accessibilityLabel={label} accessibilityState={{ disabled }} />
      </View>
      {message ? <Text className={`text-fs-caption ${error ? 'text-danger' : 'text-text-secondary'}`}>{message}</Text> : null}
    </View>
  );
}
