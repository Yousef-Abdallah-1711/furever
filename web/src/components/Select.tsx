'use client';
import * as React from 'react';
import { Icon } from './Icon';
export interface SelectOption { value: string; label: string; disabled?: boolean; }
export interface SelectProps { value?: string; onChange: (value: string) => void; options: SelectOption[]; label?: string; placeholder?: string; hint?: string; error?: string; disabled?: boolean; }
export function Select({ value, onChange, options, label, placeholder, hint, error, disabled = false }: SelectProps) {
 const [isOpen, setIsOpen] = React.useState(false);
 const containerRef = React.useRef<HTMLDivElement>(null);
 const selected = options.find((option) => option.value === value), message = error ?? hint;
 React.useEffect(() => {
  if (!isOpen) return;
  const outside = (event: MouseEvent) => { if (event.target instanceof Node && !containerRef.current?.contains(event.target)) setIsOpen(false); };
  const escape = (event: KeyboardEvent) => { if (event.key === 'Escape') setIsOpen(false); };
  document.addEventListener('click', outside); document.addEventListener('keydown', escape);
  return () => { document.removeEventListener('click', outside); document.removeEventListener('keydown', escape); };
 }, [isOpen]);
 const choose = (option: SelectOption) => { if (!option.disabled) { onChange(option.value); setIsOpen(false); } };
 return <div ref={containerRef} className="relative flex w-full flex-col gap-sp-2">
  {label ? <label className="text-fs-caption text-text-primary">{label}</label> : null}
  <button type="button" aria-label={label} aria-expanded={isOpen} aria-haspopup="listbox" disabled={disabled} onClick={() => setIsOpen(true)} onFocus={() => setIsOpen(true)} className={`flex min-h-sp-12 w-full items-center justify-between rounded-r-control border px-sp-4 py-sp-3 text-start ${error ? 'border-danger' : 'border-default'} ${disabled ? 'cursor-not-allowed bg-surface-secondary opacity-50' : 'bg-surface'}`}>
   <span className={`flex-1 text-fs-body ${selected ? 'text-text-primary' : 'text-text-secondary'}`}>{selected?.label ?? placeholder ?? ''}</span><Icon name="chevron-down" />
  </button>
  {message ? <p className={`text-fs-caption ${error ? 'text-danger' : 'text-text-secondary'}`}>{message}</p> : null}
  {isOpen ? <div role="listbox" className="absolute start-0 top-full z-10 mt-sp-1 max-h-3/4 w-full overflow-y-auto rounded-r-control border border-default bg-surface p-sp-1 shadow-card">
   {options.map((option) => { const active = option.value === value; return <button key={option.value} type="button" role="option" aria-selected={active} disabled={option.disabled} onClick={() => choose(option)} className={`flex min-h-sp-12 w-full items-center justify-between rounded-r-control px-sp-4 py-sp-3 text-start text-fs-body text-text-primary ${option.disabled ? 'cursor-not-allowed opacity-50' : 'hover:bg-surface-secondary'}`}>
    <span>{option.label}</span>{active ? <Icon name="check" /> : null}
   </button>; })}
  </div> : null}
 </div>;
}
