'use client';
import { Icon } from './Icon';
export interface IconButtonProps { icon:string; label:string; badge?:number|string; plain?:boolean; flip?:boolean; onClick?:()=>void }
export function IconButton({icon,label,badge,plain=false,flip=false,onClick}:IconButtonProps){
 return <span className="relative inline-flex min-h-11 min-w-11 items-center justify-center">
 <button type="button" aria-label={label} className={['inline-flex min-h-11 min-w-11 items-center justify-center',plain?'':'rounded-r-full border border-border bg-surface-secondary'].join(' ')} onClick={onClick}><Icon name={icon} size={20} flip={flip}/></button>
 {badge!==undefined&&<span className="absolute end-0 top-0 min-w-sp-4 rounded-r-full bg-danger px-sp-1 text-center text-fs-caption text-on-danger">{badge}</span>}
 </span>;
}
