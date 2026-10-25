import { Text, View, type ViewStyle } from 'react-native';
import { useTokenColor } from '@/lib/resolveTokenColor';
import { Button } from './Button';
import { Icon } from './Icon';

export interface EmptyStateProps {
  icon?: string;
  title: string;
  body?: string;
  action?: string;
  onAction?: () => void;
  tone?: 'default' | 'danger';
}

export function EmptyState({ icon, title, body, action, onAction, tone = 'default' }: EmptyStateProps) {
  const dangerColor = useTokenColor('danger');
  return (
    <View className="items-center justify-center gap-sp-4 p-sp-6">
      {icon ? <Icon name={icon} size={48} style={tone === 'danger' ? ({ color: dangerColor } as ViewStyle) : undefined} /> : null}
      <View className="items-center gap-sp-2">
        <Text className={`text-center text-fs-h3 ${tone === 'danger' ? 'text-danger' : 'text-text-primary'}`}>{title}</Text>
        {body ? <Text className="text-center text-fs-body text-text-secondary">{body}</Text> : null}
      </View>
      {action && onAction ? <Button onClick={onAction}>{action}</Button> : null}
    </View>
  );
}
