'use client';
import type React from 'react';
import { Icon } from './Icon';
export interface ListRowProps { icon?: string; label: string; value?: string; trailing?: React.ReactNode; onClick?: () => void; showDivider?: boolean; }
export function ListRow({ icon, label, value, trailing, onClick, showDivider = true }: ListRowProps) {
 const classes = `flex w-full items-center py-sp-3 text-start ${showDivider ? 'border-t border-border' : ''}`;
 const content = <>{icon ? <span className="me-sp-3"><Icon name={icon} size={24} /></span> : null}<span className="min-w-0 flex-1"><span className="block text-fs-body text-text-primary">{label}</span>{value ? <span className="block text-fs-caption text-text-secondary">{value}</span> : null}</span>{trailing != null ? <span className="ms-sp-3">{trailing}</span> : null}</>;
 return onClick ? <button type="button" role="button" onClick={onClick} className={classes}>{content}</button> : <div className={classes}>{content}</div>;
}
