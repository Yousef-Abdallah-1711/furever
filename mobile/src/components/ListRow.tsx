import type React from 'react';
import { Pressable, Text, View } from 'react-native';
import { Icon } from './Icon';
export interface ListRowProps { icon?: string; label: string; value?: string; trailing?: React.ReactNode; onClick?: () => void; showDivider?: boolean; }
export function ListRow({ icon, label, value, trailing, onClick, showDivider = true }: ListRowProps) {
 const content = <View className="flex-row items-center py-sp-3">{icon ? <View className="me-sp-3"><Icon name={icon} size={24} /></View> : null}<View className="flex-1"><Text className="text-fs-body text-text-primary">{label}</Text>{value ? <Text className="text-fs-caption text-text-secondary">{value}</Text> : null}</View>{trailing != null ? <View className="ms-sp-3">{trailing}</View> : null}</View>;
 const classes = showDivider ? 'border-t border-border' : '';
 return onClick ? <Pressable accessibilityRole="button" onPress={onClick} className={classes}>{content}</Pressable> : <View className={classes}>{content}</View>;
}
