import { Text, TextInput } from 'react-native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AuthProvider } from '@/contexts/auth-context';
import { FavoritesProvider } from '@/contexts/favorites-context';
import '../global.css';

// Trava a escala de fonte do aparelho em no máximo 1.2x o tamanho definido no
// design. Sem isso, celulares com "Tamanho da fonte" grande nas configurações
// de acessibilidade do Android/iOS estufam textos e quebram o layout dos
// cards — o que não acontece no preview do Expo Go quando o celular de teste
// está com a fonte do sistema no padrão.
// @ts-ignore - defaultProps ainda é suportado nestes dois componentes nativos
Text.defaultProps = Text.defaultProps || {};
// @ts-ignore
Text.defaultProps.maxFontSizeMultiplier = 1.2;
// @ts-ignore
TextInput.defaultProps = TextInput.defaultProps || {};
// @ts-ignore
TextInput.defaultProps.maxFontSizeMultiplier = 1.2;

export default function RootLayout() {
  return (
    // SafeAreaProvider precisa envolver TODO o app para que os SafeAreaView
    // espalhados pelas telas (index, profile, favorites, mapa, modais etc.)
    // recebam os insets corretos de notch/status bar/gesture bar em build
    // nativo. Sem ele, esse cálculo fica instável fora do preview web,
    // causando conteúdo cortado especificamente no aparelho físico.
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