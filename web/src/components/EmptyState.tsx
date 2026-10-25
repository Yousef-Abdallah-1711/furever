'use client';
import { Button } from './Button';
import { Icon } from './Icon';
export interface EmptyStateProps { icon?: string; title: string; body?: string; action?: string; onAction?: () => void; tone?: 'default' | 'danger'; }
export function EmptyState({ icon, title, body, action, onAction, tone = 'default' }: EmptyStateProps) {
 return <div className="flex flex-col items-center justify-center gap-sp-4 p-sp-6">
  {icon ? <span className={tone === 'danger' ? 'text-danger' : 'text-text-primary'}><Icon name={icon} size={48} /></span> : null}
  <div className="flex flex-col items-center gap-sp-2"><h3 className={`text-center text-fs-h3 ${tone === 'danger' ? 'text-danger' : 'text-text-primary'}`}>{title}</h3>{body ? <p className="text-center text-fs-body text-text-secondary">{body}</p> : null}</div>
  {action && onAction ? <Button onClick={onAction}>{action}</Button> : null}
 </div>;
}
