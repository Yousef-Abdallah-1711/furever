'use client';

import * as React from 'react';
import { useEffect, useRef, useState } from 'react';
import { format, parseISO } from 'date-fns';
import { DayPicker } from 'react-day-picker';
import { Icon } from './Icon';

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
  const [open, setOpen] = useState(false);
  const fieldRef = useRef<HTMLDivElement>(null);
  const message = error ?? hint;
  const displayedValue = value ? format(parseISO(value), 'PP') : placeholder;
  const disabledDates = [
    ...(minimumDate ? [{ before: parseISO(minimumDate) }] : []),
    ...(maximumDate ? [{ after: parseISO(maximumDate) }] : []),
  ];

  useEffect(() => {
    if (!open) return;
    const closeOnOutsideClick = (event: MouseEvent) => {
      if (event.target instanceof Node && !fieldRef.current?.contains(event.target)) setOpen(false);
    };
    document.addEventListener('mousedown', closeOnOutsideClick);
    return () => document.removeEventListener('mousedown', closeOnOutsideClick);
  }, [open]);

  return (
    <div ref={fieldRef} className="relative flex w-full flex-col gap-sp-2">
      {label ? <label className="text-fs-caption text-text-primary">{label}</label> : null}
      <button
        type="button"
        disabled={disabled}
        aria-label={label}
        aria-expanded={open}
        onClick={() => setOpen((current) => !current)}
        className={`flex min-h-sp-12 w-full items-center justify-between gap-sp-3 rounded-r-control border px-sp-4 py-sp-3 text-start ${error ? 'border-danger' : 'border-default'} ${disabled ? 'bg-surface-secondary' : 'bg-surface'}`}
      >
        <span className={`flex-1 text-fs-body ${value ? 'text-text-primary' : 'text-text-secondary'}`}>
          {displayedValue}
        </span>
        <Icon name="calendar" />
      </button>
      {message ? <p className={`text-fs-caption ${error ? 'text-danger' : 'text-text-secondary'}`}>{message}</p> : null}
      {open ? (
        <div className="absolute start-0 top-full z-20 mt-sp-2 rounded-r-control border border-default bg-surface p-sp-3 shadow-card">
          <DayPicker
            mode="single"
            selected={value ? parseISO(value) : undefined}
            disabled={disabledDates.length ? disabledDates : undefined}
            onSelect={(selected) => {
              if (selected) {
                onChange(format(selected, 'yyyy-MM-dd'));
                setOpen(false);
              }
            }}
            className="text-text-primary"
            classNames={{
              root: 'w-full',
              months: 'flex flex-col',
              month: 'flex flex-col gap-sp-3',
              month_caption: 'flex items-center justify-center py-sp-1',
              caption_label: 'text-fs-body font-medium text-text-primary',
              nav: 'flex items-center gap-sp-2',
              button_previous: 'rounded-r-chip p-sp-2 text-text-secondary hover:bg-surface-secondary',
              button_next: 'rounded-r-chip p-sp-2 text-text-secondary hover:bg-surface-secondary',
              month_grid: 'w-full border-collapse',
              weekdays: 'text-text-secondary',
              weekday: 'p-sp-1 text-center text-fs-caption font-normal',
              week: 'text-center',
              day: 'p-sp-1 text-center',
              day_button: 'h-sp-8 min-w-sp-8 rounded-r-chip text-fs-caption text-text-primary hover:bg-surface-secondary',
              selected: 'rounded-r-chip bg-primary text-on-primary',
              today: 'font-semibold text-primary',
              outside: 'text-text-secondary',
              disabled: 'cursor-not-allowed text-text-secondary opacity-50',
            }}
          />
        </div>
      ) : null}
    </div>
  );
}
