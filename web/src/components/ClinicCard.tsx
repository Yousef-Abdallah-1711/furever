'use client';
import { Card } from './Card';
import { Icon } from './Icon';
export interface ClinicCardProps { name: string; distance: string; rating: string; next: string; nextLabel: string; badge?: React.ReactNode; onClick?: () => void; }
export function ClinicCard({ name, distance, rating, next, nextLabel, badge, onClick }: ClinicCardProps) {
 return <Card onClick={onClick}><div className="flex flex-col gap-sp-4">
  <div className="flex items-center justify-between gap-sp-3"><h3 className="flex-1 text-fs-h3 text-text-primary">{name}</h3>{badge != null ? <div>{badge}</div> : null}</div>
  <div className="flex flex-wrap items-center gap-sp-4 text-text-secondary">
   <div className="flex items-center gap-sp-2"><span className="text-text-secondary"><Icon name="map-pin" size={16} /></span><span className="text-fs-body">{distance}</span></div>
   <div className="flex items-center gap-sp-2"><span className="text-text-secondary"><Icon name="star" size={16} /></span><span className="text-fs-body">{rating}</span></div>
  </div>
  <div className="flex items-center gap-sp-2"><span className="text-fs-body text-text-secondary">{nextLabel}</span><span className="text-fs-body font-semibold text-text-primary">{next}</span></div>
 </div></Card>;
}
