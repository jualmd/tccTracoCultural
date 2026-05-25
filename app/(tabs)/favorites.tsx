import { useMemo, useState } from 'react';
import { FlatList, Pressable, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { EventCard } from '@/components/event-card';
import { EventDetailModal } from '@/components/event-detail-modal';
import { EVENTS, type Event } from '@/constants/events';
import { Theme } from '@/constants/theme';
import { useFavorites } from '@/lib/favorites-context';

export default function Favorites() {
  const [search, setSearch] = useState('');
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const { favorites, isFavorite, toggleFavorite } = useFavorites();

  const favoriteEvents = useMemo(() => {
    return EVENTS.filter((e) => {
      if (!favorites.has(e.id)) return false;
      if (!search) return true;
      return (
        e.title.toLowerCase().includes(search.toLowerCase()) ||
        e.category.toLowerCase().includes(search.toLowerCase())
      );
    });
  }, [favorites, search]);

  return (
    <LinearGradient
      colors={Theme.gradient.primary}
      style={{ flex: 1 }}
      start={{ x: 0, y: 0 }}
      end={{ x: 0.3, y: 1 }}
    >
      <SafeAreaView style={{ flex: 1 }}>
        {/* Header */}
        <View style={{ paddingHorizontal: 20, paddingVertical: 14 }}>
          <Text style={{ color: '#fff', fontSize: 22, fontWeight: '800', letterSpacing: 0.5 }}>
            Meus Favoritos
          </Text>
          {favorites.size > 0 && (
            <Text style={{ color: 'rgba(255,255,255,0.6)', fontSize: 13, marginTop: 2 }}>
              {favorites.size} {favorites.size === 1 ? 'evento salvo' : 'eventos salvos'}
            </Text>
          )}
        </View>

        {/* Search */}
        {favorites.size > 0 && (
          <View style={{ paddingHorizontal: 20, marginBottom: 12 }}>
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                backgroundColor: 'rgba(255,255,255,0.15)',
                borderRadius: 25,
                borderWidth: 1,
                borderColor: 'rgba(255,255,255,0.2)',
                paddingHorizontal: 14,
              }}
            >
              <Ionicons name="search-outline" size={18} color="rgba(255,255,255,0.6)" />
              <TextInput
                value={search}
                onChangeText={setSearch}
                placeholder="Buscar favoritos..."
                placeholderTextColor="rgba(255,255,255,0.45)"
                style={{ flex: 1, color: '#fff', paddingVertical: 11, paddingLeft: 8, fontSize: 14 }}
              />
              {!!search && (
                <Pressable onPress={() => setSearch('')} hitSlop={8}>
                  <Ionicons name="close-circle" size={18} color="rgba(255,255,255,0.6)" />
                </Pressable>
              )}
            </View>
          </View>
        )}

        {/* List */}
        <FlatList
          data={favoriteEvents}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 24, flexGrow: 1 }}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', marginTop: 80 }}>
              <Ionicons name="heart-outline" size={56} color="rgba(255,255,255,0.3)" />
              <Text
                style={{
                  color: 'rgba(255,255,255,0.6)',
                  fontSize: 17,
                  fontWeight: '600',
                  marginTop: 16,
                }}
              >
                {search ? 'Nenhum resultado encontrado' : 'Você não tem eventos favoritos ainda'}
              </Text>
              <Text
                style={{
                  color: 'rgba(255,255,255,0.4)',
                  fontSize: 13,
                  marginTop: 8,
                  textAlign: 'center',
                  paddingHorizontal: 32,
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
