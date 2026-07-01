import { useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Image,
  Pressable,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { EventCard } from '@/components/event-card';
import { EventDetailModal } from '@/components/event-detail-modal';
import { Theme } from '@/constants/theme';
import { useAuth } from '@/contexts/auth-context';
import { useFavorites } from '@/contexts/favorites-context';
import { useEvents } from '@/hooks/use-events';
import type { Evento } from '@/types/domain';

// Mapeamento de categoria → ícone Ionicons
const CATEGORY_ICONS: Record<string, keyof typeof Ionicons.glyphMap> = {
  'Social': 'people-outline',
  'Música': 'musical-notes-outline',
  'Cultura & Arte': 'color-palette-outline',
  'Profissional': 'briefcase-outline',
  'Educação': 'school-outline',
  'Tecnologia': 'hardware-chip-outline',
  'Bem-Estar': 'leaf-outline',
  'Esporte': 'football-outline',
  'Gastronomia': 'restaurant-outline',
  'Comércio': 'storefront-outline',
  'Kids': 'happy-outline',
  'Religioso': 'star-outline',
  'Comunidade': 'heart-circle-outline',
  'Geek': 'game-controller-outline',
  'Viagem': 'airplane-outline',
};

function getCategoryIcon(name: string): keyof typeof Ionicons.glyphMap {
  return CATEGORY_ICONS[name] ?? 'grid-outline';
}

export default function Home() {
  const [selectedEvent, setSelectedEvent] = useState<Evento | null>(null);
  const { isFavorite, toggleFavorite } = useFavorites();
  const { user } = useAuth();
  const {
    filteredEvents,
    categories,
    search,
    setSearch,
    category,
    setCategory,
    loading,
    error,
    refresh,
  } = useEvents();

  return (
    <LinearGradient
      colors={Theme.gradient.primary}
      style={{ flex: 1 }}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
    >
      <SafeAreaView style={{ flex: 1 }}>

        {/* ── Header ── */}
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            paddingHorizontal: 20,
            paddingTop: 16,
            paddingBottom: 8,
          }}
        >
          <View>
            <Text
              style={{
                color: 'rgba(255,255,255,0.5)',
                fontSize: 11,
                fontWeight: '600',
                letterSpacing: 1.2,
                textTransform: 'uppercase',
                marginBottom: 6,
              }}
            >
              Descubra
            </Text>
            <Image
              source={require('@/assets/images/tracocult.logo.png')}
              style={{ height: 32, width: 160 }}
              resizeMode="contain"
            />
          </View>

          {/* Avatar */}
          <View
            style={{
              width: 38,
              height: 38,
              borderRadius: 19,
              backgroundColor: Theme.colors.accent,
              justifyContent: 'center',
              alignItems: 'center',
            }}
          >
            <Text style={{ fontSize: 15, fontWeight: '800', color: Theme.colors.primaryDark }}>
              {user?.nome?.charAt(0).toUpperCase() ?? '?'}
            </Text>
          </View>
        </View>

        {/* ── Busca ── */}
        <View style={{ paddingHorizontal: 20, marginTop: 8, marginBottom: 16 }}>
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              backgroundColor: 'rgba(255,255,255,0.97)',
              borderRadius: Theme.radius.pill,
              paddingHorizontal: 14,
              shadowColor: '#000',
              shadowOpacity: 0.1,
              shadowRadius: 8,
              shadowOffset: { width: 0, height: 3 },
              elevation: 3,
              boxShadow: '0px 3px 8px rgba(0,0,0,0.10)',
            }}
          >
            <Ionicons name="search-outline" size={17} color={Theme.colors.primary} />
            <TextInput
              value={search}
              onChangeText={setSearch}
              placeholder="Buscar eventos..."
              placeholderTextColor="#b8a8a5"
              style={{
                flex: 1,
                color: Theme.colors.text,
                paddingVertical: 12,
                paddingLeft: 9,
                fontSize: 14,
              }}
            />
            {!!search && (
              <Pressable onPress={() => setSearch('')} hitSlop={8}>
                <Ionicons name="close-circle" size={17} color={Theme.colors.textMuted} />
              </Pressable>
            )}
          </View>
        </View>

        {/* ── Categorias com ícone ── */}
        {categories.length > 0 && (
          <FlatList
            horizontal
            data={['Todos', ...categories]}
            keyExtractor={(item) => item}
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{
              paddingHorizontal: 20,
              gap: 6,
              paddingBottom: 16,
            }}
            renderItem={({ item }) => {
              const active = item === 'Todos' ? !category : category === item;
              const icon: keyof typeof Ionicons.glyphMap =
                item === 'Todos' ? 'apps-outline' : getCategoryIcon(item);

              return (
                <Pressable
                  onPress={() => setCategory(item === 'Todos' ? null : item)}
                  style={({ pressed }) => ({
                    flexDirection: 'row',
                    alignItems: 'center',
                    gap: 5,
                    backgroundColor: active
                      ? Theme.colors.accent
                      : 'rgba(255,255,255,0.08)',
                    borderWidth: 1,
                    borderColor: active
                      ? Theme.colors.accent
                      : 'rgba(255,255,255,0.14)',
                    borderRadius: Theme.radius.pill,
                    paddingHorizontal: 11,
                    paddingVertical: 6,
                    opacity: pressed ? 0.72 : 1,
                    // sombra só no ativo
                    ...(active
                      ? {
                          shadowColor: Theme.colors.accent,
                          shadowOpacity: 0.35,
                          shadowRadius: 8,
                          shadowOffset: { width: 0, height: 3 },
                          elevation: 4,
                          boxShadow: '0px 3px 8px rgba(212,163,115,0.35)',
                        }
                      : {}),
                  })}
                >
                  <Ionicons
                    name={icon}
                    size={12}
                    color={active ? Theme.colors.primaryDark : 'rgba(255,255,255,0.55)'}
                  />
                  <Text
                    style={{
                      color: active ? Theme.colors.primaryDark : 'rgba(255,255,255,0.55)',
                      fontSize: 11.5,
                      fontWeight: active ? '700' : '500',
                      letterSpacing: 0.1,
                    }}
                  >
                    {item}
                  </Text>
                </Pressable>
              );
            }}
          />
        )}

        {/* ── Lista de eventos ── */}
        <FlatList
          data={filteredEvents}
          keyExtractor={(item) => String(item.id)}
          contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 24 }}
          showsVerticalScrollIndicator={false}
          refreshing={loading}
          onRefresh={refresh}
          ListEmptyComponent={
            <View style={{ alignItems: 'center', marginTop: 64 }}>
              <View
                style={{
                  width: 80,
                  height: 80,
                  borderRadius: 40,
                  backgroundColor: 'rgba(255,255,255,0.07)',
                  borderWidth: 1,
                  borderColor: 'rgba(255,255,255,0.12)',
                  justifyContent: 'center',
                  alignItems: 'center',
                  marginBottom: 16,
                }}
              >
                {loading ? (
                  <ActivityIndicator color={Theme.colors.accent} />
                ) : (
                  <Ionicons name="calendar-outline" size={32} color="rgba(255,255,255,0.35)" />
                )}
              </View>
              <Text
                style={{
                  color: 'rgba(255,255,255,0.5)',
                  fontSize: 14,
                  fontWeight: '500',
                }}
              >
                {error || 'Nenhum evento encontrado'}
              </Text>
            </View>
          }
          renderItem={({ item }) => (
            <EventCard
              event={item}
              onPress={() => setSelectedEvent(item)}
              onFavorite={() => toggleFavorite(item.id)}
              isFavorited={isFavorite(item.id)}
            />
          )}
        />
      </SafeAreaView>

      <EventDetailModal
        event={selectedEvent}
        visible={!!selectedEvent}
        onClose={() => setSelectedEvent(null)}
        onFavorite={() => selectedEvent && toggleFavorite(selectedEvent.id)}
        isFavorited={!!selectedEvent && isFavorite(selectedEvent.id)}
      />
    </LinearGradient>
  );
}
