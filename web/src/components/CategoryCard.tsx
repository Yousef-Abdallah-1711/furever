'use client';
import { Card } from './Card';
import { Icon } from './Icon';
export interface CategoryCardProps { icon: string; label: string; onClick?: () => void; tone?: 'primary' | 'danger'; }
export function CategoryCard({ icon, label, onClick, tone = 'primary' }: CategoryCardProps) {
  const toneClass = tone === 'danger' ? 'text-danger' : 'text-primary';
  return <Card tint onClick={onClick} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}><span className={toneClass}><Icon name={icon} size={28} /></span><span className="mt-sp-2 text-fs-body font-medium text-text-primary">{label}</span></Card>;
}
