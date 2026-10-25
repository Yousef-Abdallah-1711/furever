'use client';
import { Avatar } from './Avatar';
import { Card } from './Card';
export interface DoctorCardProps { name: string; specialty?: string; experience?: string; photo?: string; onClick?: () => void; selected?: boolean; }
export function DoctorCard({ name, specialty, experience, photo, onClick, selected = false }: DoctorCardProps) {
 const details = [specialty, experience].filter(Boolean).join(' · ');
 return <Card tint={selected} onClick={onClick}><div className="flex items-center"><div className="me-sp-3"><Avatar src={photo} name={name} size={48} /></div><div className="min-w-0 flex-1"><div className="text-fs-h3 font-semibold text-text-primary">{name}</div>{details ? <div className="text-fs-body text-text-secondary">{details}</div> : null}</div></div></Card>;
}
