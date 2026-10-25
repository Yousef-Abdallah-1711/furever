import { useTheme } from '@/hooks/useTheme';
import tokenPreset from '../../../packages/design-tokens/dist/tailwind-preset.js';

const themeColors = (
  tokenPreset as unknown as {
    furever: { themes: Record<'light' | 'dark', { colors: Record<string, string> }> };
  }
).furever.themes;

/**
 * Resolves a design-token color name (e.g. "on-primary") to its actual hex value for the
 * active theme. React Native has no CSS `var()`/`currentColor` resolution, so components that
 * need to pass a token color into a child's `style` prop (rather than a `className`) must use
 * this instead of a literal CSS color string.
 */
export function useTokenColor(name: string): string {
  const { theme } = useTheme();
  return themeColors[theme].colors[name] ?? themeColors.light.colors[name] ?? themeColors.light.colors['text-primary'];
}
