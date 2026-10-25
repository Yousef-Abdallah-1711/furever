'use client';
import { Icon } from '../Icon';
import { IconButton } from '../IconButton';
import { PhaseTag } from '../PhaseTag';
export interface SidebarNavItem { id: string; icon: string; label: string; phase?: 2 | 3 | 4; }
export interface SidebarProps { items: SidebarNavItem[]; activeId: string; onSelect: (id: string) => void; brandLabel: string; portalLabel: string; collapsed?: boolean; onToggleCollapse?: () => void; }
export function Sidebar({items,activeId,onSelect,brandLabel,portalLabel,collapsed=false,onToggleCollapse}:SidebarProps) {
 return <aside aria-label={portalLabel} className={`flex h-full shrink-0 flex-col border-e border-border bg-surface p-sp-4 ${collapsed?'w-16 items-center':'w-60'}`}>
  <div className={`mb-sp-6 flex min-h-sp-12 items-center ${collapsed?'justify-center':''}`}>
   {collapsed?<span className="flex h-sp-10 w-sp-10 items-center justify-center rounded-r-full bg-primary text-fs-h3 font-bold text-on-primary" aria-label={brandLabel} title={brandLabel}>{brandLabel.slice(0,1)}</span>:<div className="min-w-0"><p className="truncate text-fs-h3 font-bold text-primary">{brandLabel}</p><p className="truncate text-fs-caption text-text-secondary">{portalLabel}</p></div>}
  </div>
  <nav className="flex flex-col gap-sp-2" aria-label={portalLabel}>{items.map(item=>{const active=item.id===activeId;return <button key={item.id} type="button" title={collapsed?item.label:undefined} aria-label={collapsed?item.label:undefined} aria-current={active?'page':undefined} onClick={()=>onSelect(item.id)} className={`flex min-h-sp-12 w-full items-center rounded-r-control px-sp-3 text-start ${collapsed?'justify-center':'gap-sp-3'} ${active?'bg-surface-secondary font-semibold text-primary':'text-text-primary hover:bg-surface-secondary'}`}>
   <Icon name={item.icon} size={20}/>{!collapsed?<><span className="min-w-0 flex-1 truncate text-fs-body">{item.label}</span>{item.phase?<PhaseTag phase={item.phase}/>:null}</>:null}
  </button>})}</nav>
  {onToggleCollapse?<div className={`mt-auto border-t border-border pt-sp-4 ${collapsed?'':'self-end'}`}><IconButton icon={collapsed?'panel-left-open':'panel-left-close'} label={collapsed?'Expand sidebar':'Collapse sidebar'} plain onClick={onToggleCollapse}/></div>:null}
 </aside>;
}
