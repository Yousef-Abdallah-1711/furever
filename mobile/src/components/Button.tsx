import type { ReactNode } from 'react';
import { ActivityIndicator, Pressable, Text, type StyleProp, type ViewStyle } from 'react-native';
import { Icon } from './Icon';
import { useTokenColor } from '@/lib/resolveTokenColor';
export interface ButtonProps { variant?: 'primary'|'secondary'|'ghost'|'destructive'|'outline'; size?: 'l'|'m'|'s'; block?: boolean; loading?: boolean; disabled?: boolean; icon?: string; children?: ReactNode; onClick?: () => void; style?: StyleProp<ViewStyle>; type?: 'button'|'submit' }
// RN's style prop isn't run through NativeWind's className compiler, so a token's color here
// must be a real hex (via useTokenColor), never a CSS var()/currentColor string.
const vc={primary:['bg-primary','text-on-primary','on-primary'],secondary:['bg-surface-secondary','text-text-primary','text-primary'],ghost:['bg-transparent','text-primary','primary'],destructive:['bg-danger','text-on-danger','on-danger'],outline:['border border-border bg-transparent','text-text-primary','text-primary']} as const;
const sz={l:'h-[var(--h-btn-l)] px-sp-6',m:'h-[var(--h-btn-m)] px-sp-5',s:'h-[var(--h-btn-s)] px-sp-4'} as const;
export function Button({variant='primary',size='m',block=false,loading=false,disabled=false,icon,children,onClick,style}:ButtonProps){
 const [box,fg,colorToken]=vc[variant], off=disabled||loading;
 const color=useTokenColor(colorToken);
 return <Pressable accessibilityRole="button" accessibilityState={{disabled:off,busy:loading}} className={['flex-row items-center justify-center gap-sp-2 rounded-r-control',box,sz[size],block?'w-full':'',off?'opacity-50':''].join(' ')} disabled={off} onPress={onClick} style={style}>
 {children!=null&&<Text className={fg+' text-fs-button'}>{children}</Text>}
 {icon&&<Icon name={icon} size={size==='s'?16:size==='m'?20:24} style={{color} as ViewStyle}/>}
 {loading&&<ActivityIndicator size="small" color={color}/>}
 </Pressable>;
}
