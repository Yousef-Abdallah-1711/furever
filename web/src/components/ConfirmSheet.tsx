'use client';

import type { ReactNode } from 'react';
import { Button } from './Button';

export interface ConfirmSheetProps { title: string; body?: string; confirm: string; cancel: string; destructive?: boolean; onConfirm?: () => void; onCancel?: () => void; children?: ReactNode; }
export function ConfirmSheet({ title, body, confirm, cancel, destructive, onConfirm, onCancel, children }: ConfirmSheetProps) {
 return <div className="fixed inset-0 bg-overlay" onClick={onCancel}><section role="dialog" aria-modal="true" aria-labelledby="confirm-sheet-title" onClick={(event) => event.stopPropagation()} className="fixed inset-x-0 bottom-0 flex flex-col gap-sp-4 rounded-r-sheet bg-surface p-sp-6 shadow-sheet"><h2 id="confirm-sheet-title" className="text-text-primary text-fs-h3">{title}</h2>{body != null && <p className="text-text-secondary text-fs-body">{body}</p>}{children}<div className="flex gap-sp-3"><Button variant="ghost" style={{ flex: 1 }} onClick={onCancel}>{cancel}</Button><Button variant={destructive ? "destructive" : "primary"} style={{ flex: 1 }} onClick={onConfirm}>{confirm}</Button></div></section></div>;
}
