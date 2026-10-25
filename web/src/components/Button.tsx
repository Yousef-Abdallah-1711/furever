'use client';
import type { CSSProperties, ReactNode } from 'react';
import { Icon } from './Icon';
export interface ButtonProps { variant?: 'primary'|'secondary'|'ghost'|'destructive'|'outline'; size?: 'l'|'m'|'s'; block?: boolean; loading?: boolean; disabled?: boolean; icon?: string; children?: ReactNode; onClick?: () => void; style?: CSSProperties; type?: 'button'|'submit' }
const vc={primary:['bg-primary','text-on-primary','var(--on-primary)'],secondary:['bg-surface-secondary','text-text-primary','var(--text-primary)'],ghost:['bg-transparent','text-primary','var(--primary)'],destructive:['bg-danger','text-on-danger','var(--on-danger)'],outline:['border border-border bg-transparent','text-text-primary','var(--text-primary)']} as const;
const sz={l:'h-[var(--h-btn-l)] px-sp-6',m:'h-[var(--h-btn-m)] px-sp-5',s:'h-[var(--h-btn-s)] px-sp-4'} as const;
export function Button({variant='primary',size='m',block=false,loading=false,disabled=false,icon,children,onClick,style,type='button'}:ButtonProps){
 const [box,fg,color]=vc[variant],off=disabled||loading;
 return <button type={type} aria-busy={loading||undefined} className={['inline-flex flex-row items-center justify-center gap-sp-2 rounded-r-control',box,sz[size],block?'w-full':'',off?'opacity-50':''].join(' ')} disabled={off} onClick={onClick} style={style}>
 {children!=null&&<span className={fg+' text-fs-button'}>{children}</span>}
 {icon&&<Icon name={icon} size={size==='s'?16:size==='m'?20:24} style={{color}}/>}
 {loading&&<span aria-hidden="true" className={['size-sp-4 animate-spin rounded-r-full border-2 border-current border-e-transparent',fg].join(' ')}/>}
 </button>;
}
