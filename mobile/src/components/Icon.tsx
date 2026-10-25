import * as LucideIcons from 'lucide-react-native';
import { cssInterop } from 'nativewind';
import type { ComponentType } from 'react';
import type { StyleProp, ViewStyle } from 'react-native';

export interface IconProps {
  name: string;
  size?: number;
  flip?: boolean;
  label?: string;
  style?: StyleProp<ViewStyle>;
}

const kebabToPascal = (name: string) =>
  name.replace(/(^|-)([a-z0-9])/g, (_, _separator, character: string) => character.toUpperCase());

type LucideIconType = ComponentType<{
  size?: number;
  color?: string;
  strokeWidth?: number;
  style?: StyleProp<ViewStyle>;
  className?: string;
  accessibilityLabel?: string;
  accessibilityRole?: 'image';
}>;

function isIconComponent(value: unknown): value is LucideIconType {
  if (typeof value === 'function') return true;
  if (typeof value !== 'object' || value === null) return false;
  // lucide-react-native wraps every icon in React.forwardRef, so the
  // export is an object with this $$typeof, not a plain function.
  const typeofTag = (value as { $$typeof?: symbol }).$$typeof;
  return typeofTag === Symbol.for('react.forward_ref') || typeofTag === Symbol.for('react.memo');
}

// Built once at module scope, not inside Icon's render, so every icon's
// component identity is stable across renders (react-hooks/static-components).
const nativeIcons: Record<string, LucideIconType> = Object.fromEntries(
  Object.entries(LucideIcons as unknown as Record<string, unknown>)
    .filter(([, value]) => isIconComponent(value))
    .map(([pascalName, value]) => [
      pascalName,
      cssInterop(value as LucideIconType, {
        className: { target: 'style', nativeStyleToProp: { color: 'color' } },
      }),
    ]),
);

export function Icon({ name, size = 24, flip = false, label, style }: IconProps) {
  const IconComponent = nativeIcons[kebabToPascal(name)];
  if (!IconComponent) return null;

  return (
    <IconComponent
      size={size}
      strokeWidth={1.75}
      className="text-text-primary"
      accessibilityLabel={label}
      accessibilityRole={label ? 'image' : undefined}
      style={flip ? [{ transform: [{ scaleX: -1 }] }, style] : style}
    />
  );
}
