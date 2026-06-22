import { useState } from 'react';
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
import { EventCard } from '@/components/event-card';
import { EventDetailModal } from '@/components/event-detail-modal';
import { Theme } from '@/constants/theme';
import { useAuth } from '@/contexts/auth-context';
import { useFavorites } from '@/contexts/favorites-context';
import { useEvents } from '@/hooks/use-events';
import type { Evento } from '@/types/domain';

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
        {/* Header */}
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            paddingHorizontal: 20,
            paddingTop: 14,
            paddingBottom: 6,
          }}
        >
          <View>
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
              <Ionicons name="sparkles" size={10} color={Theme.colors.accent} />
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
                Descubra
              </Text>
            </View>
            <Text style={{ color: '#fff', fontSize: 23, fontWeight: '800', letterSpacing: 0.3 }}>
              Traço Cultural
            </Text>
          </View>

          <View
            style={{
              width: 40,
              height: 40,
              borderRadius: 20,
              backgroundColor: Theme.colors.accent,
              justifyContent: 'center',
              alignItems: 'center',
            }}
          >
            <Text style={{ fontSize: 16, fontWeight: '800', color: Theme.colors.primaryDark }}>
              {user?.nome?.charAt(0).toUpperCase() ?? '?'}
            </Text>
          </View>
        </View>

        {/* Search */}
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
              placeholder="Buscar eventos..."
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

        {categories.length > 0 && (
          <FlatList
            horizontal
            data={['Todos', ...categories]}
            keyExtractor={(item) => item}
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ paddingHorizontal: 20, gap: 8, paddingBottom: 12 }}
            renderItem={({ item }) => {
              const active = item === 'Todos' ? !category : category === item;
              return (
                <Pressable
                  onPress={() => setCategory(item === 'Todos' ? null : item)}
                  style={({ pressed }) => ({
                    backgroundColor: active ? Theme.colors.accent : Theme.glass.bg,
                    borderWidth: 1,
                    borderColor: active ? Theme.colors.accent : Theme.glass.border,
                    borderRadius: Theme.radius.pill,
                    paddingHorizontal: 14,
                    paddingVertical: 7,
                    opacity: pressed ? 0.75 : 1,
                  })}
                >
                  <Text
                    style={{
                      color: active ? Theme.colors.primaryDark : '#fff',
                      fontSize: 12,
                      fontWeight: '800',
                    }}
                  >
                    {item}
                  </Text>
                </Pressable>
              );
            }}
          />
        )}

        {/* Events list */}
        <FlatList
          data={filteredEvents}
          keyExtractor={(item) => String(item.id)}
          contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 24 }}
          showsVerticalScrollIndicator={false}
          refreshing={loading}
          onRefresh={refresh}
          ListEmptyComponent={
            <View style={{ alignItems: 'center', marginTop: 60 }}>
              <View
                style={{
                  width: 88,
                  height: 88,
                  borderRadius: 44,
                  backgroundColor: Theme.glass.bg,
                  borderWidth: 1,
                  borderColor: Theme.glass.border,
                  justifyContent: 'center',
                  alignItems: 'center',
                  marginBottom: 14,
                }}
              >
                {loading ? (
                  <ActivityIndicator color={Theme.colors.accent} />
                ) : (
                  <Ionicons name="calendar-outline" size={36} color="rgba(255,255,255,0.45)" />
                )}
              </View>
              <Text style={{ color: 'rgba(255,255,255,0.6)', fontSize: 15, fontWeight: '600' }}>
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
