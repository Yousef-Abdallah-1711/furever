import { Pressable,Text,View } from 'react-native';
import { Icon } from './Icon';
export interface IconButtonProps { icon:string; label:string; badge?:number|string; plain?:boolean; flip?:boolean; onClick?:()=>void }
export function IconButton({icon,label,badge,plain=false,flip=false,onClick}:IconButtonProps){
 return <View className="relative min-h-11 min-w-11 items-center justify-center">
 <Pressable accessibilityRole="button" accessibilityLabel={label} className={['min-h-11 min-w-11 items-center justify-center',plain?'':'rounded-r-full border border-border bg-surface-secondary'].join(' ')} onPress={onClick}><Icon name={icon} size={20} flip={flip}/></Pressable>
 {badge!==undefined&&<View className="absolute end-0 top-0 min-w-sp-4 items-center justify-center rounded-r-full bg-danger px-sp-1"><Text className="text-fs-caption text-on-danger">{badge}</Text></View>}
 </View>;
}
