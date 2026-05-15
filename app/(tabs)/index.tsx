import { useCallback, useMemo, useState } from 'react';
import {
  FlatList,
  Pressable,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { EventCard } from '@/components/event-card';
import { EVENTS } from '@/constants/events';
import { Theme } from '@/constants/theme';

export default function Home() {
  const [search, setSearch] = useState('');
  const [favorites, setFavorites] = useState<Set<string>>(new Set());
  const router = useRouter();

  const filtered = useMemo(
    () =>
      EVENTS.filter(
        (e) =>
          e.title.toLowerCase().includes(search.toLowerCase()) ||
          e.category.toLowerCase().includes(search.toLowerCase())
      ),
    [search]
  );

  const toggleFavorite = useCallback((id: string) => {
    setFavorites((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }, []);

  async function handleLogout() {
    await AsyncStorage.removeItem('@traco:user');
    router.replace('/(tabs)/login');
  }

  return (
    <LinearGradient
      colors={Theme.gradient.primary}
      style={{ flex: 1 }}
      start={{ x: 0, y: 0 }}
      end={{ x: 0.3, y: 1 }}
    >
      <SafeAreaView style={{ flex: 1 }}>
        {/* Header */}
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            paddingHorizontal: 20,
            paddingVertical: 14,
          }}
        >
          <Text style={{ color: '#fff', fontSize: 22, fontWeight: '800', letterSpacing: 0.5 }}>
            Traço Cultural
          </Text>
          <Pressable
            onPress={handleLogout}
            hitSlop={8}
            style={({ pressed }) => ({ opacity: pressed ? 0.6 : 1 })}
          >
            <Ionicons name="log-out-outline" size={24} color="#fff" />
          </Pressable>
        </View>

        {/* Search */}
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
              placeholder="Buscar eventos..."
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

        {/* Events list */}
        <FlatList
          data={filtered}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 24 }}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={{ alignItems: 'center', marginTop: 60 }}>
              <Ionicons name="calendar-outline" size={48} color="rgba(255,255,255,0.4)" />
              <Text style={{ color: 'rgba(255,255,255,0.5)', marginTop: 12, fontSize: 15 }}>
                Nenhum evento encontrado
              </Text>
            </View>
          }
          renderItem={({ item }) => (
            <EventCard
              event={item}
              onFavorite={() => toggleFavorite(item.id)}
              isFavorited={favorites.has(item.id)}
            />
          )}
        />
      </SafeAreaView>
    </LinearGradient>
  );
}
