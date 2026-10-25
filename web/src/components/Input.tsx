'use client';

import * as React from 'react';
import { Icon } from './Icon';

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

export function Input({ label, hint, error, icon, value, defaultValue, placeholder, disabled = false, type = 'text', inputMode = 'text', ltr = false, prefix, onChange }: InputProps) {
  const message = error ?? hint;

  return (
    <div className="flex w-full flex-col gap-sp-2">
      {label ? <label className="text-fs-caption text-text-primary">{label}</label> : null}
      <div className={`flex min-h-sp-12 items-center gap-sp-3 rounded-r-control border px-sp-4 py-sp-3 ${error ? 'border-danger' : 'border-default'} ${disabled ? 'bg-surface-secondary' : 'bg-surface'}`}>
        {icon ? <span className="shrink-0 text-text-secondary"><Icon name={icon} style={{ color: 'currentColor' }} /></span> : null}
        {prefix ? <span className="shrink-0">{prefix}</span> : null}
        <input className="min-w-0 flex-1 border-0 bg-transparent p-0 text-start text-fs-body text-text-primary outline-none placeholder:text-text-secondary disabled:cursor-not-allowed" type={type} inputMode={inputMode} value={value} defaultValue={defaultValue} placeholder={placeholder} disabled={disabled} onChange={onChange} dir={ltr ? 'ltr' : undefined} aria-label={label} aria-invalid={error ? true : undefined} />
      </div>
      {message ? <p className={`text-fs-caption ${error ? 'text-danger' : 'text-text-secondary'}`}>{message}</p> : null}
    </div>
  );
}
