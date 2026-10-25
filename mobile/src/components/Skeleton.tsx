import { View } from 'react-native';
import type { ViewStyle } from 'react-native';

export interface SkeletonProps {
  w?: number | string;
  h?: number | string;
  r?: number | string;
}

export function Skeleton({ w = '100%', h = 16, r = 8 }: SkeletonProps) {
  const style: ViewStyle = {
    width: w as ViewStyle['width'],
    height: h as ViewStyle['height'],
    borderRadius: r as ViewStyle['borderRadius'],
  };

  return (
    <View
      className="animate-pulse bg-fe-skel-mix-1"
      style={style}
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
    />
  );
}
