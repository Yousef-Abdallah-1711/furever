import * as React from 'react';
import { Text, View } from 'react-native';
import { Icon } from './Icon';
import { useTokenColor } from '@/lib/resolveTokenColor';

export interface BannerProps {
  tone?: 'info' | 'warning' | 'danger' | 'success';
  action?: React.ReactNode;
  children?: React.ReactNode;
}

const tones = {
  info: { background: 'bg-info-bg', foreground: 'text-info', icon: 'info', token: 'info' },
  warning: { background: 'bg-warning-bg', foreground: 'text-warning', icon: 'triangle-alert', token: 'warning' },
  danger: { background: 'bg-danger-bg', foreground: 'text-danger', icon: 'circle-alert', token: 'danger' },
  success: { background: 'bg-success-bg', foreground: 'text-success', icon: 'circle-check', token: 'success' },
} as const;

function renderMessage(children: React.ReactNode): React.ReactNode {
  return React.Children.map(children, child =>
    typeof child === 'string' || typeof child === 'number' ? <Text className="text-fs-body">{child}</Text> : child,
  );
}

export function Banner({ tone = 'info', action, children }: BannerProps) {
  const colors = tones[tone];
  // RN's style prop isn't run through NativeWind's className compiler, so Icon's color
  // override must be a real hex (via useTokenColor), never the CSS keyword 'currentColor'.
  const iconColor = useTokenColor(colors.token);
  return (
    <View className={`w-full flex-row items-center gap-sp-3 rounded-r-control p-sp-4 ${colors.background} ${colors.foreground}`}>
      <View><Icon name={colors.icon} style={{ color: iconColor } as never} /></View>
      <View className="min-w-0 flex-1 gap-sp-1">{renderMessage(children)}</View>
      {action ? <View className="ms-auto shrink-0">{typeof action === 'string' || typeof action === 'number' ? <Text className="text-fs-body">{action}</Text> : action}</View> : null}
    </View>
  );
}
