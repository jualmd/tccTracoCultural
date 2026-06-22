import { useMemo, useState } from 'react';
import { ActivityIndicator, FlatList, Pressable, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { EventCard } from '@/components/event-card';
import { EventDetailModal } from '@/components/event-detail-modal';
import { Theme } from '@/constants/theme';
import { useFavorites } from '@/contexts/favorites-context';
import type { Evento } from '@/types/domain';

export default function Favorites() {
  const [search, setSearch] = useState('');
  const [selectedEvent, setSelectedEvent] = useState<Evento | null>(null);
  const { favorites, favoriteEvents, loadingFavorites, isFavorite, toggleFavorite, refreshFavorites } = useFavorites();

  const filteredFavoriteEvents = useMemo(() => {
    return favoriteEvents.filter((e) => {
      if (!search) return true;
      const normalized = search.toLowerCase();
      return (
        e.nome.toLowerCase().includes(normalized) ||
        e.cidade.toLowerCase().includes(normalized) ||
        e.categoria?.nome.toLowerCase().includes(normalized)
      );
    });
  }, [favoriteEvents, search]);

  return (
    <LinearGradient
      colors={Theme.gradient.primary}
      style={{ flex: 1 }}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
    >
      <SafeAreaView style={{ flex: 1 }}>
        {/* Header */}
        <View style={{ paddingHorizontal: 20, paddingTop: 14, paddingBottom: 6 }}>
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              alignSelf: 'flex-start',
              backgroundColor: Theme.glass.bg,
              borderWidth: 1,
              borderColor: Theme.glass.border,
              borderRadius: Theme.radius.pill,
              paddingHorizontal: 10,
              paddingVertical: 3,
              marginBottom: 6,
            }}
          >
            <Ionicons name="heart" size={10} color="#ff6b6b" />
            <Text
              style={{
                color: 'rgba(255,255,255,0.85)',
                fontSize: 10,
                fontWeight: '700',
                marginLeft: 4,
                textTransform: 'uppercase',
                letterSpacing: 0.5,
              }}
            >
              Salvos
            </Text>
          </View>
          <Text style={{ color: '#fff', fontSize: 23, fontWeight: '800', letterSpacing: 0.3 }}>
            Meus Favoritos
          </Text>
          {favorites.size > 0 && (
            <Text style={{ color: 'rgba(255,255,255,0.65)', fontSize: 13, marginTop: 3 }}>
              {favorites.size} {favorites.size === 1 ? 'evento salvo' : 'eventos salvos'}
            </Text>
          )}
        </View>

        {/* Search */}
        {favorites.size > 0 && (
          <View style={{ paddingHorizontal: 20, marginTop: 14, marginBottom: 14 }}>
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                backgroundColor: 'rgba(255,255,255,0.96)',
                borderRadius: Theme.radius.pill,
                paddingHorizontal: 16,
                ...Theme.shadow.card,
              }}
            >
              <Ionicons name="search-outline" size={18} color={Theme.colors.primary} />
              <TextInput
                value={search}
                onChangeText={setSearch}
                placeholder="Buscar favoritos..."
                placeholderTextColor="#b0a09e"
                style={{
                  flex: 1,
                  color: Theme.colors.text,
                  paddingVertical: 13,
                  paddingLeft: 10,
                  fontSize: 14.5,
                }}
              />
              {!!search && (
                <Pressable onPress={() => setSearch('')} hitSlop={8}>
                  <Ionicons name="close-circle" size={18} color={Theme.colors.textMuted} />
                </Pressable>
              )}
            </View>
          </View>
        )}

        {/* List */}
        <FlatList
          data={filteredFavoriteEvents}
          keyExtractor={(item) => String(item.id)}
          contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 24, flexGrow: 1 }}
          showsVerticalScrollIndicator={false}
          refreshing={loadingFavorites}
          onRefresh={refreshFavorites}
          ListEmptyComponent={
            <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', marginTop: 80 }}>
              <View
                style={{
                  width: 96,
                  height: 96,
                  borderRadius: 48,
                  backgroundColor: Theme.glass.bg,
                  borderWidth: 1,
                  borderColor: Theme.glass.border,
                  justifyContent: 'center',
                  alignItems: 'center',
                  marginBottom: 18,
                }}
              >
                {loadingFavorites ? (
                  <ActivityIndicator color={Theme.colors.accent} />
                ) : (
                  <Ionicons name="heart-outline" size={42} color="rgba(255,255,255,0.45)" />
                )}
              </View>
              <Text
                style={{
                  color: 'rgba(255,255,255,0.75)',
                  fontSize: 17,
                  fontWeight: '700',
                }}
              >
                {search ? 'Nenhum resultado encontrado' : 'Você não tem eventos favoritos ainda'}
              </Text>
              <Text
                style={{
                  color: 'rgba(255,255,255,0.45)',
                  fontSize: 13,
                  marginTop: 8,
                  textAlign: 'center',
                  paddingHorizontal: 32,
                  lineHeight: 19,
                }}
              >
                {!search && 'Toque no ❤️ de qualquer evento na aba Início para salvar aqui.'}
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
