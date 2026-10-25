'use client';
import { Avatar } from '../Avatar';
import { IconButton } from '../IconButton';
import { SearchBar } from '../SearchBar';
import { Select } from '../Select';
export interface TopBarClinicOption { id: string; name: string; }
export interface TopBarProps {
 search?: { value: string; onChange: (e: React.ChangeEvent<HTMLInputElement>) => void; placeholder?: string };
 clinics?: TopBarClinicOption[]; selectedClinicId?: string; onClinicChange?: (id: string) => void;
 locale: 'en' | 'ar'; onLocaleChange: () => void; theme: 'light' | 'dark'; onThemeChange: () => void;
 notificationCount?: number; onNotificationsClick?: () => void; userName: string; userAvatarSrc?: string; onSignOut: () => void;
}
export function TopBar(p: TopBarProps) {
 return <header className="flex h-15 shrink-0 items-center gap-sp-3 border-b border-border bg-surface px-sp-6">
  {p.search ? <div className="w-full max-w-sm"><SearchBar value={p.search.value} onChange={p.search.onChange} placeholder={p.search.placeholder} /></div> : null}
  <div className="flex-1" />
  {p.clinics ? <div className="w-full max-w-60"><Select value={p.selectedClinicId} onChange={p.onClinicChange ?? (() => undefined)} options={p.clinics.map(x => ({ value: x.id, label: x.name }))} label="Clinic" placeholder="Select clinic" /></div> : null}
  <IconButton icon="languages" label={`Language (${p.locale})`} onClick={p.onLocaleChange} />
  <IconButton icon={p.theme === 'dark' ? 'sun' : 'moon'} label="Theme" onClick={p.onThemeChange} />
  <IconButton icon="bell" label="Notifications" badge={p.notificationCount && p.notificationCount > 0 ? p.notificationCount : undefined} onClick={p.onNotificationsClick} />
  <Avatar name={p.userName} src={p.userAvatarSrc} /><IconButton icon="log-out" label="Sign out" onClick={p.onSignOut} />
 </header>;
}
