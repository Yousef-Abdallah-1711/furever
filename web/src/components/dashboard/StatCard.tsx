'use client';

export interface StatCardProps {
  label: string;
  value: string;
  sublabel?: string;
  tone?: 'primary' | 'success' | 'warning' | 'danger' | 'info';
}
const toneClasses: Record<NonNullable<StatCardProps['tone']>, string> = {
  primary: 'text-primary', success: 'text-success', warning: 'text-warning', danger: 'text-danger', info: 'text-info',
};
export function StatCard({ label, value, sublabel, tone }: StatCardProps) {
  return <article className="rounded-r-card bg-surface-card p-sp-4 shadow-card">
    <p className="text-fs-caption text-text-secondary">{label}</p>
    <p dir="ltr" className={`text-fs-h1 font-bold ${tone ? toneClasses[tone] : 'text-text-primary'}`}>{value}</p>
    {sublabel ? <p className="text-fs-caption text-text-secondary">{sublabel}</p> : null}
  </article>;
}
