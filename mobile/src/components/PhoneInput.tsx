import { Input } from './Input';

export interface PhoneInputProps {
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  label?: string;
  hint?: string;
  error?: string;
  disabled?: boolean;
  placeholder?: string;
}

export function PhoneInput({ value, onChange, label, hint, error, disabled, placeholder }: PhoneInputProps) {
  return <Input value={value} onChange={onChange} label={label} hint={hint} error={error} disabled={disabled} placeholder={placeholder ?? '100 123 4567'} ltr inputMode="tel" prefix="+20" />;
}
