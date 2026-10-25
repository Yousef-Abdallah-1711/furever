'use client';
import type React from 'react';
import { IconButton } from './IconButton';
import { PhaseTag } from './PhaseTag';
export interface ScreenHeaderProps { title: string; back?: () => void; sub?: string; phase?: boolean; right?: React.ReactNode; }
export function ScreenHeader({ title, back, sub, phase = false, right }: ScreenHeaderProps) {
 return <div className="flex min-h-sp-12 items-center">{back ? <span className="me-sp-2"><IconButton icon="arrow-left" label="Go back" plain flip onClick={back} /></span> : <span className="me-sp-2 min-h-11 min-w-11" aria-hidden="true" />}<div className="min-w-0 flex-1"><h1 className="truncate text-fs-h2 font-semibold text-text-primary">{title}</h1>{sub ? <p className="truncate text-fs-caption text-text-secondary">{sub}</p> : null}</div>{phase ? <span className="ms-sp-2"><PhaseTag /></span> : null}{right != null ? <span className="ms-sp-2">{right}</span> : null}</div>;
}
