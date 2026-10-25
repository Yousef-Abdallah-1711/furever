import { useEffect, useRef } from 'react';
import { Pressable, Text, TextInput, View } from 'react-native';

export interface OtpInputProps {
  length?: number;
  value: string;
  onChange: (code: string) => void;
  onComplete?: (code: string) => void;
  disabled?: boolean;
  error?: boolean;
  label?: string;
}

export function OtpInput({ length = 6, value, onChange, onComplete, disabled = false, error = false, label }: OtpInputProps) {
  const inputRef = useRef<TextInput>(null);
  const completedRef = useRef(false);

  useEffect(() => {
    if (value.length < length) completedRef.current = false;
  }, [length, value]);

  const handleChange = (input: string) => {
    const code = input.replace(/\D/g, '').slice(0, length);
    onChange(code);
    if (code.length === length) {
      if (!completedRef.current) {
        completedRef.current = true;
        onComplete?.(code);
      }
    } else {
      completedRef.current = false;
    }
  };

  return (
    <Pressable accessibilityRole="button" accessibilityLabel={label ?? 'Verification code'} disabled={disabled} onPress={() => inputRef.current?.focus()} className="gap-sp-2">
      {label ? <Text className="text-fs-caption text-text-primary">{label}</Text> : null}
      <View className="flex-row gap-sp-2">
        {Array.from({ length }, (_, index) => (
          <View key={index} className={`flex-1 items-center justify-center rounded-r-control border bg-surface ${error ? 'border-danger' : 'border-border'}`}>
            <Text className="text-fs-h2 text-text-primary">{value[index] ?? ''}</Text>
          </View>
        ))}
      </View>
      <TextInput ref={inputRef} value={value} onChangeText={handleChange} keyboardType="number-pad" maxLength={length} editable={!disabled} accessibilityLabel={label ?? 'Verification code'} pointerEvents="none" style={{ position: 'absolute', opacity: 0, top: 0, left: 0, right: 0, bottom: 0 }} />
    </Pressable>
  );
}
