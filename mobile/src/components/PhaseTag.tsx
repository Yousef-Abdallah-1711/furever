import type { ReactNode } from 'react';
import { Text, View } from 'react-native';
export interface PhaseTagProps { phase?: 2 | 3 | 4; children?: ReactNode; }
export function PhaseTag({ phase = 2, children }: PhaseTagProps) {
  return <View className="self-start rounded-r-chip bg-surface-secondary px-sp-3 py-sp-1"><Text className="text-fs-caption text-text-secondary">{children ?? 'Phase ' + phase}</Text></View>;
}
