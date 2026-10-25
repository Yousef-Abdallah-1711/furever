import { Text, View, type StyleProp, type ViewStyle } from 'react-native';
import { useTokenColor } from '@/lib/resolveTokenColor';
import { Card } from './Card';
import { Icon } from './Icon';

export interface CategoryCardProps {
  icon: string;
  label: string;
  onClick?: () => void;
  tone?: 'primary' | 'danger';
}

export function CategoryCard({ icon, label, onClick, tone = 'primary' }: CategoryCardProps) {
  const color = useTokenColor(tone);
  const iconStyle = { color } as unknown as StyleProp<ViewStyle>;
  return (
    <Card tint onClick={onClick}>
      <View className="items-center">
        <Icon name={icon} size={28} style={iconStyle} />
        <Text className="mt-sp-2 text-center text-fs-body font-medium text-text-primary">{label}</Text>
      </View>
    </Card>
  );
}
