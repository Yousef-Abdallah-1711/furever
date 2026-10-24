import { useFonts as useExpoFonts } from 'expo-font';
import { Cairo_400Regular } from '@expo-google-fonts/cairo';
import { Inter_400Regular } from '@expo-google-fonts/inter';

/** Load the two approved typefaces before the splash screen is dismissed. */
export function useFonts() {
  return useExpoFonts({ Cairo_400Regular, Inter_400Regular });
}
