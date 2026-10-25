import type { ReactElement } from 'react';
import { Icon } from './Icon';
import { useTokenColor } from '@/lib/resolveTokenColor';
import { Pressable, View } from 'react-native';

export interface RatingProps {
  value?: number;
  size?: number;
  onChange?: (n: number) => void;
}

export function Rating({ value = 0, size = 24, onChange }: RatingProps): ReactElement {
  const filledCount = Math.max(0, Math.min(5, Math.round(Number.isFinite(value) ? value : 0)));
  // RN's style prop isn't run through NativeWind's className compiler, so each star's color
  // must be a real hex (via useTokenColor), never the CSS keyword 'currentColor'.
  const filledColor = useTokenColor('warning');
  const mutedColor = useTokenColor('text-secondary');
  return (
    <View className="flex-row items-center gap-sp-1">
      {Array.from({ length: 5 }, (_, index) => {
        const color = index < filledCount ? filledColor : mutedColor;
        const star = <Icon name="star" size={size} style={{ color } as never} />;
        return onChange ? (
          <Pressable key={index} accessibilityRole="button" accessibilityLabel={`Rate ${index + 1} out of 5`} onPress={() => onChange(index + 1)}>{star}</Pressable>
        ) : <View key={index}>{star}</View>;
      })}
    </View>
  );
}
