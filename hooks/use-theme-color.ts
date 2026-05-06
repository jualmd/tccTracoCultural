import { useColorScheme } from '@/hooks/use-color-scheme';

const Colors = {
  light: { text: '#11181C', background: '#fff', tint: '#8E5E56', icon: '#687076', tabIconDefault: '#687076', tabIconSelected: '#8E5E56' },
  dark:  { text: '#ECEDEE', background: '#151718', tint: '#fff',    icon: '#9BA1A6', tabIconDefault: '#9BA1A6', tabIconSelected: '#fff' },
};

export function useThemeColor(
  props: { light?: string; dark?: string },
  colorName: keyof typeof Colors.light & keyof typeof Colors.dark
) {
  const theme = useColorScheme() ?? 'light';
  return props[theme] ?? Colors[theme][colorName];
}
