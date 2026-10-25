import { Image } from 'expo-image';
import { Text, View } from 'react-native';

export interface AvatarProps {
  name?: string;
  size?: number;
  src?: string;
}

function initialsFromName(name?: string) {
  return (name ?? '')
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join('')
    .toUpperCase();
}

export function Avatar({ name, size = 40, src }: AvatarProps) {
  return (
    <View
      className="items-center justify-center overflow-hidden rounded-r-full bg-primary-bg"
      style={{ width: size, height: size }}
      accessibilityLabel={name}
      accessibilityRole="image"
    >
      {src ? (
        <Image source={{ uri: src }} style={{ width: size, height: size }} contentFit="cover" />
      ) : (
        <Text className="text-text-primary text-fs-body" numberOfLines={1}>
          {initialsFromName(name)}
        </Text>
      )}
    </View>
  );
}
