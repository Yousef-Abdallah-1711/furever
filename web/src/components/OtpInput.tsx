'use client';

import { useEffect, useRef } from 'react';

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
  const inputRef = useRef<HTMLInputElement>(null);
  const completedRef = useRef(false);

  useEffect(() => {
    if (value.length < length) completedRef.current = false;
  }, [length, value]);

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const code = event.currentTarget.value.replace(/\D/g, '').slice(0, length);
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
    <div className="flex flex-col gap-sp-2" onClick={() => inputRef.current?.focus()}>
      {label ? <span className="text-fs-caption text-text-primary">{label}</span> : null}
      <div className="flex gap-sp-2">
        {Array.from({ length }, (_, index) => (
          <div key={index} className={`flex flex-1 items-center justify-center rounded-r-control border bg-surface ${error ? 'border-danger' : 'border-border'}`} aria-hidden="true">
            <span className="text-fs-h2 text-text-primary">{value[index] ?? ''}</span>
          </div>
        ))}
      </div>
      <input ref={inputRef} className="sr-only" type="text" inputMode="numeric" maxLength={length} value={value} onChange={handleChange} disabled={disabled} aria-label={label ?? 'Verification code'} />
    </div>
  );
}
