import type { PropsWithChildren } from 'react';
import { Text, type TextProps } from 'react-native';

export function LtrText({ children, style, ...props }: PropsWithChildren<TextProps>) {
  return <Text {...props} style={[{ writingDirection: 'ltr' }, style]}>{children}</Text>;
}
