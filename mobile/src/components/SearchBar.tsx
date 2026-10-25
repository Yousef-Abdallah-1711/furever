import { View } from 'react-native';
import { IconButton } from './IconButton';
import { Input } from './Input';

export interface SearchBarProps {
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder?: string;
  onClear?: () => void;
  disabled?: boolean;
}

export function SearchBar({ value, onChange, placeholder, onClear, disabled }: SearchBarProps) {
  return <View className="relative w-full"><Input value={value} onChange={onChange} placeholder={placeholder} disabled={disabled} icon="search" inputMode="text" />{onClear && value ? <View className="absolute end-sp-2 top-1/2 -translate-y-1/2"><IconButton icon="x" label="Clear search" plain onClick={onClear} /></View> : null}</View>;
}
