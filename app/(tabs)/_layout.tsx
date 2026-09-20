import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Theme } from '@/constants/theme';

export default function TabsLayout() {
  // Ao definir uma altura fixa para a tabBar, o React Navigation deixa de
  // somar automaticamente o inset seguro inferior (home indicator no iOS,
  // gesture bar no Android). Por isso somamos manualmente aqui — sem isso
  // os ícones/labels ficam espremidos ou parcialmente cobertos pela barra
  // de gestos em aparelhos físicos, mesmo funcionando bem no emulador.
  const insets = useSafeAreaInsets();
  const bottomInset = insets.bottom;

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: Theme.colors.accent,
        tabBarInactiveTintColor: 'rgba(255,255,255,0.5)',
        tabBarStyle: {
          backgroundColor: Theme.colors.secondary,
          borderTopWidth: 0,
          elevation: 0,
          shadowOpacity: 0,
          height: 60 + bottomInset,
          paddingTop: 10,
          paddingBottom: Math.max(bottomInset, 12),
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '600',
          marginTop: 2,
        },
        tabBarIconStyle: {
          marginBottom: 0,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Início',
          tabBarIcon: ({ color }) => (
            <Ionicons name="home" size={26} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="mapa"
        options={{
          title: 'Mapa',
          tabBarIcon: ({ color }) => (
            <Ionicons name="map" size={24} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="favorites"
        options={{
          title: 'Favoritos',
          tabBarIcon: ({ color }) => (
            <Ionicons name="heart" size={26} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Perfil',
          tabBarIcon: ({ color }) => (
            <Ionicons name="person" size={26} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}