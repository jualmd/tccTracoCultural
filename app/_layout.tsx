import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AuthProvider } from '@/contexts/auth-context';
import { FavoritesProvider } from '@/contexts/favorites-context';
import '../global.css';

export default function RootLayout() {
  return (
    // SafeAreaProvider precisa envolver toda a árvore para que os
    // <SafeAreaView> e useSafeAreaInsets() espalhados pelo app consigam
    // medir corretamente notch/status bar/gesture bar em dispositivos
    // físicos. Sem ele, a lib cai num fallback com insets zerados, o que
    // não costuma aparecer no Expo Go web/emulador mas corta conteúdo em
    // aparelhos reais (iOS e Android).
    <SafeAreaProvider>
      <AuthProvider>
        <FavoritesProvider>
          <Stack screenOptions={{ headerShown: false }}>
            <Stack.Screen name="index" />
            <Stack.Screen name="(tabs)" />
          </Stack>
          <StatusBar style="light" />
        </FavoritesProvider>
      </AuthProvider>
    </SafeAreaProvider>
  );
}