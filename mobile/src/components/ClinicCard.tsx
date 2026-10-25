import { Text, View, type ViewStyle } from 'react-native';
import { useTokenColor } from '@/lib/resolveTokenColor';
import { Card } from './Card';
import { Icon } from './Icon';
export interface ClinicCardProps { name: string; distance: string; rating: string; next: string; nextLabel: string; badge?: React.ReactNode; onClick?: () => void; }
export function ClinicCard({ name, distance, rating, next, nextLabel, badge, onClick }: ClinicCardProps) {
 const color = useTokenColor('text-secondary');
 const iconStyle = { color } as ViewStyle;
 return <Card onClick={onClick}><View className="gap-sp-4">
  <View className="flex-row items-center justify-between gap-sp-3"><Text className="flex-1 text-fs-h3 text-text-primary">{name}</Text>{badge != null ? <View>{badge}</View> : null}</View>
  <View className="flex-row flex-wrap items-center gap-sp-4">
   <View className="flex-row items-center gap-sp-2"><Icon name="map-pin" size={16} style={iconStyle} /><Text className="text-fs-body text-text-secondary">{distance}</Text></View>
   <View className="flex-row items-center gap-sp-2"><Icon name="star" size={16} style={iconStyle} /><Text className="text-fs-body text-text-secondary">{rating}</Text></View>
  </View>
  <View className="flex-row items-center gap-sp-2"><Text className="text-fs-body text-text-secondary">{nextLabel}</Text><Text className="text-fs-body text-text-primary">{next}</Text></View>
 </View></Card>;
}
