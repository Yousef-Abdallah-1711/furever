import type { ReactNode } from 'react';
import { Pressable, View, type StyleProp, type ViewStyle } from 'react-native';
export interface CardProps { children?: ReactNode; onClick?: () => void; pad?: number; tint?: boolean; style?: StyleProp<ViewStyle>; }
const spacingClass: Record<number, string> = { 4: 'p-sp-1', 8: 'p-sp-2', 12: 'p-sp-3', 16: 'p-sp-4', 20: 'p-sp-5', 24: 'p-sp-6', 32: 'p-sp-8', 40: 'p-sp-10', 48: 'p-sp-12' };
export function Card({ children, onClick, pad = 16, tint = false, style }: CardProps) {
  const classes = ['rounded-r-card shadow-card', tint ? 'bg-surface-secondary border border-primary' : 'bg-surface-card', spacingClass[pad]].filter(Boolean).join(' ');
  const combinedStyle = [spacingClass[pad] ? undefined : { padding: pad }, style];
  return onClick
    ? <Pressable accessibilityRole="button" onPress={onClick} className={classes} style={combinedStyle}>{children}</Pressable>
    : <View className={classes} style={combinedStyle}>{children}</View>;
}
