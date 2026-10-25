'use client';

import * as LucideIcons from 'lucide-react';
import type { CSSProperties, ComponentType } from 'react';

export interface IconProps {
  name: string;
  size?: number;
  flip?: boolean;
  label?: string;
  style?: CSSProperties;
}

const kebabToPascal = (name: string) =>
  name.replace(/(^|-)([a-z0-9])/g, (_, _separator, character: string) => character.toUpperCase());

export function Icon({ name, size = 24, flip = false, label, style }: IconProps) {
  const IconComponent = (LucideIcons as unknown as Record<string, ComponentType<Record<string, unknown>>>)[
    kebabToPascal(name)
  ];
  if (!IconComponent) return null;

  const iconStyle: CSSProperties = {
    ...style,
    ...(flip ? { transform: `scaleX(-1) ${style?.transform ?? ''}`.trim() } : {}),
  };

  return (
    <IconComponent
      size={size}
      strokeWidth={1.75}
      className="text-text-primary"
      aria-label={label}
      aria-hidden={label ? undefined : true}
      style={iconStyle}
    />
  );
}

