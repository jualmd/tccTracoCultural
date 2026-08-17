import { useCallback, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { EventCard } from '@/components/event-card';
import { EventDetailModal } from '@/components/event-detail-modal';
import { EditEventModal } from '@/components/edit-event-modal';
import { Theme } from '@/constants/theme';
import { useAuth } from '@/contexts/auth-context';
import { useFavorites } from '@/contexts/favorites-context';
import { useEvents } from '@/hooks/use-events';
import type { Evento } from '@/types/domain';

// Remove acentos e normaliza caixa, pra bater "Educação", "educação" ou
// "EDUCAÇÃO" com a mesma entrada do mapa de ícones.
function normalizeCategoryName(value: string): string {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim();
}

// Mapeamento de categoria → ícone Ionicons (chaves já normalizadas)
const CATEGORY_ICONS: Record<string, keyof typeof Ionicons.glyphMap> = {
  'social': 'people-outline',
  'musica': 'musical-notes-outline',
  'cultura & arte': 'color-palette-outline',
  'profissional': 'briefcase-outline',
  'educacao': 'school-outline',
  'tecnologia': 'hardware-chip-outline',
  'bem-estar': 'leaf-outline',
  'esporte': 'football-outline',
  'gastronomia': 'restaurant-outline',
  'comercio': 'storefront-outline',
  'kids': 'happy-outline',
  'religioso': 'star-outline',
  'comunidade': 'heart-circle-outline',
  'geek': 'game-controller-outline',
  'viagem': 'airplane-outline',
};

function getCategoryIcon(name: string): keyof typeof Ionicons.glyphMap {
  return CATEGORY_ICONS[normalizeCategoryName(name)] ?? 'grid-outline';
}

export default function Home() {
  const [selectedEvent, setSelectedEvent] = useState<Evento | null>(null);
  const [editingEvent, setEditingEvent] = useState<Evento | null>(null);
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

  // Recarrega a lista sempre que a Home ganha foco de novo -- garante que
  // qualquer alteração feita em outra tela (ex: editar evento) reflita aqui.
  useFocusEffect(
    useCallback(() => {
      refresh();
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])
  );

  return (
    <View style={{ flex: 1, backgroundColor: Theme.colors.primaryDark }}>
      <LinearGradient
        colors={Theme.gradient.primary}
        start={{ x: 0.15, y: 0.05 }}
        end={{ x: 0.85, y: 1 }}
        style={{ position: 'absolute', inset: 0 } as any}
      />
      {/* manchas decorativas — espelha .home-hero::before/::after */}
      <View
        pointerEvents="none"
        style={{
          position: 'absolute',
          width: 340,
          height: 340,
          borderRadius: 170,
          top: -130,
          right: -90,
          backgroundColor: 'rgba(212,163,115,0.16)',
        }}
      />

      <SafeAreaView style={{ flex: 1 }}>
        {/* ── Hero ── */}
        <View style={{ paddingHorizontal: 20, paddingTop: 12, paddingBottom: 18 }}>
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              gap: 6,
              alignSelf: 'flex-start',
              backgroundColor: 'rgba(212,163,115,0.15)',
              borderWidth: 1,
              borderColor: 'rgba(212,163,115,0.3)',
              borderRadius: Theme.radius.pill,
              paddingHorizontal: 12,
              paddingVertical: 5,
              marginBottom: 10,
            }}
          >
            <Ionicons name="sparkles-outline" size={12} color={Theme.colors.accent} />
            <Text
              style={{
                color: Theme.colors.accent,
                fontSize: 10.5,
                fontWeight: '700',
                textTransform: 'uppercase',
                letterSpacing: 0.6,
              }}
            >
              Sua agenda cultural
            </Text>
          </View>

          <Text style={{ color: '#fff', fontSize: 26, fontWeight: '800', letterSpacing: -0.5, lineHeight: 31 }}>
            Descubra o que{'\n'}
            <Text style={{ color: Theme.colors.accent }}>acontece perto de você</Text>
          </Text>

          {/* Avatar no canto */}
          <View
            style={{
              position: 'absolute',
              top: 14,
              right: 20,
              width: 36,
              height: 36,
              borderRadius: 18,
              backgroundColor: Theme.colors.accent,
              justifyContent: 'center',
              alignItems: 'center',
            }}
          >
            <Text style={{ fontSize: 14, fontWeight: '800', color: Theme.colors.primaryDark }}>
              {user?.nome?.charAt(0).toUpperCase() ?? '?'}
            </Text>
          </View>
        </View>

        {/* ── Busca (glass, espelha .search-container) ── */}
        <View style={{ paddingHorizontal: 20, marginBottom: 14 }}>
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              backgroundColor: '#fff',
              borderRadius: Theme.radius.pill,
              paddingHorizontal: 14,
              ...Theme.shadow.card,
            }}
          >
            <Ionicons name="search-outline" size={17} color={Theme.colors.primary} />
            <TextInput
              value={search}
              onChangeText={setSearch}
              placeholder="Pesquisar eventos, artistas ou lugares..."
              placeholderTextColor="#b0a09e"
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

        {/* ── Categorias (chips uniformes: mesma altura, largura mínima, 1 linha) ── */}
        {categories.length > 0 && (
          <FlatList
            horizontal
            data={['Todos', ...categories]}
            keyExtractor={(item) => item}
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{
              paddingHorizontal: 20,
              gap: 8,
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
                    justifyContent: 'center',
                    gap: 6,
                    height: 38,
                    minWidth: 72,
                    backgroundColor: active ? Theme.colors.accent : 'rgba(255,255,255,0.08)',
                    borderWidth: 1,
                    borderColor: active ? Theme.colors.accent : 'rgba(255,255,255,0.18)',
                    borderRadius: 19,
                    paddingHorizontal: 14,
                    opacity: pressed ? 0.75 : 1,
                    ...(active
                      ? {
                          shadowColor: Theme.colors.accent,
                          shadowOpacity: 0.4,
                          shadowRadius: 8,
                          shadowOffset: { width: 0, height: 3 },
                          elevation: 4,
                          boxShadow: '0px 3px 8px rgba(212,163,115,0.4)',
                        }
                      : {}),
                  })}
                >
                  <Ionicons
                    name={icon}
                    size={15}
                    color={active ? Theme.colors.primaryDark : 'rgba(255,255,255,0.72)'}
                    style={{ flexShrink: 0 }}
                  />
                  <Text
                    numberOfLines={1}
                    style={{
                      color: active ? Theme.colors.primaryDark : 'rgba(255,255,255,0.72)',
                      fontSize: 12.5,
                      fontWeight: active ? '700' : '600',
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

        {/* ── Cabeçalho de resultados ── */}
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            paddingHorizontal: 20,
            marginBottom: 10,
          }}
        >
          <Text style={{ color: '#fff', fontSize: 16, fontWeight: '700' }}>
            {category ?? 'Todos os eventos'}
          </Text>
          {!loading && (
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                gap: 5,
                backgroundColor: 'rgba(212,163,115,0.15)',
                borderWidth: 1,
                borderColor: 'rgba(212,163,115,0.25)',
                borderRadius: Theme.radius.pill,
                paddingHorizontal: 10,
                paddingVertical: 4,
              }}
            >
              <Ionicons name="calendar-outline" size={11} color={Theme.colors.accent} />
              <Text style={{ color: Theme.colors.accent, fontSize: 11, fontWeight: '700' }}>
                {filteredEvents.length} {filteredEvents.length === 1 ? 'evento' : 'eventos'}
              </Text>
            </View>
          )}
        </View>

        {/* ── Lista de eventos (cards glass) ── */}
        <FlatList
          data={filteredEvents}
          keyExtractor={(item) => String(item.id)}
          style={{ flex: 1 }}
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
                  backgroundColor: 'rgba(255,255,255,0.08)',
                  borderWidth: 1,
                  borderColor: 'rgba(255,255,255,0.18)',
                  justifyContent: 'center',
                  alignItems: 'center',
                  marginBottom: 16,
                }}
              >
                {loading ? (
                  <ActivityIndicator color={Theme.colors.accent} />
                ) : (
                  <Ionicons name="calendar-outline" size={32} color="rgba(255,255,255,0.5)" />
                )}
              </View>
              <Text style={{ color: 'rgba(255,255,255,0.6)', fontSize: 14, fontWeight: '500' }}>
                {error || 'Nenhum evento encontrado'}
              </Text>
            </View>
          }
          renderItem={({ item }) => (
            <EventCard
              event={item}
              variant="dark"
              onPress={() => setSelectedEvent(item)}
              onFavorite={() => toggleFavorite(item.id)}
              isFavorited={isFavorite(item.id)}
              isOwner={!!user?.id && item.usuario?.id === user.id}
              onEdit={() => setEditingEvent(item)}
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

      <EditEventModal
        event={editingEvent}
        visible={!!editingEvent}
        onClose={() => setEditingEvent(null)}
        onSaved={() => refresh()}
      />
    </View>
  );
}