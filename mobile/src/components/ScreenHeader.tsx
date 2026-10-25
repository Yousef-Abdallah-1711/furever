import type React from 'react';
import { Text, View } from 'react-native';
import { IconButton } from './IconButton';
import { PhaseTag } from './PhaseTag';
export interface ScreenHeaderProps { title: string; back?: () => void; sub?: string; phase?: boolean; right?: React.ReactNode; }
export function ScreenHeader({ title, back, sub, phase = false, right }: ScreenHeaderProps) {
 return <View className="min-h-sp-12 flex-row items-center">{back ? <View className="me-sp-2"><IconButton icon="arrow-left" label="Go back" plain flip onClick={back} /></View> : <View className="me-sp-2 min-h-11 min-w-11" />}<View className="min-w-0 flex-1"><Text className="text-fs-h2 font-semibold text-text-primary" numberOfLines={1}>{title}</Text>{sub ? <Text className="text-fs-caption text-text-secondary" numberOfLines={1}>{sub}</Text> : null}</View>{phase ? <View className="ms-sp-2"><PhaseTag /></View> : null}{right != null ? <View className="ms-sp-2">{right}</View> : null}</View>;
}
