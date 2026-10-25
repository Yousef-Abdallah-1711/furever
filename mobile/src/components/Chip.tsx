import type { ReactElement } from 'react';
import { Icon } from './Icon';
import { useTokenColor } from '@/lib/resolveTokenColor';
import { Pressable, Text } from 'react-native';

export interface ChipProps {
  on?: boolean;
  icon?: string;
  children?: React.ReactNode;
  onClick?: () => void;
}

export function Chip({ on = false, icon, children, onClick }: ChipProps): ReactElement {
  const contentColor = on ? 'text-on-primary' : 'text-text-primary';
  // RN's style prop isn't run through NativeWind's className compiler, so Icon's color
  // override must be a real hex (via useTokenColor), never the CSS keyword 'currentColor'.
  const iconColor = useTokenColor(on ? 'on-primary' : 'text-primary');
  return (
    <Pressable accessibilityRole="button" accessibilityState={{ selected: on }} onPress={onClick}
      className={`flex-row items-center gap-sp-2 rounded-r-chip border px-sp-4 py-sp-2 ${on ? 'border-primary bg-primary' : 'border-border bg-surface'}`}>
      {icon ? <Icon name={icon} size={16} style={{ color: iconColor } as never} /> : null}
      <Text className={`${contentColor} text-fs-button`}>{children}</Text>
    </Pressable>
  );
}
