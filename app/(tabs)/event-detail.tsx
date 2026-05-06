import { useState } from 'react';
import { Image, Pressable, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { EVENTS } from '@/constants/events';
import { Theme } from '@/constants/theme';

export default function EventDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const [favorited, setFavorited] = useState(false);

  const event = EVENTS.find((e) => e.id === id);

  if (!event) {
    return (
      <LinearGradient colors={Theme.gradient.primary} style={{ flex: 1 }}>
        <SafeAreaView style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <Text style={{ color: '#fff', fontSize: 16 }}>Evento não encontrado.</Text>
          <Pressable onPress={() => router.back()} style={{ marginTop: 16 }}>
            <Text style={{ color: 'rgba(255,255,255,0.7)', fontSize: 14 }}>← Voltar</Text>
          </Pressable>
        </SafeAreaView>
      </LinearGradient>
    );
  }

  return (
    <LinearGradient colors={Theme.gradient.primary} style={{ flex: 1 }} end={{ x: 0.3, y: 1 }}>
      <SafeAreaView style={{ flex: 1 }}>
        <ScrollView showsVerticalScrollIndicator={false}>
          {/* Image */}
          <View style={{ position: 'relative' }}>
            <Image
              source={{ uri: event.image }}
              style={{ width: '100%', height: 260 }}
              resizeMode="cover"
            />
            {/* Overlay buttons */}
            <View
              style={{
                position: 'absolute',
                top: 14,
                left: 16,
                right: 16,
                flexDirection: 'row',
                justifyContent: 'space-between',
              }}
            >
              <Pressable
                onPress={() => router.back()}
                style={({ pressed }) => ({
                  backgroundColor: pressed ? 'rgba(0,0,0,0.5)' : 'rgba(0,0,0,0.35)',
                  borderRadius: 20,
                  padding: 8,
                })}
              >
                <Ionicons name="arrow-back" size={22} color="#fff" />
              </Pressable>

              <Pressable
                onPress={() => setFavorited((p) => !p)}
                style={({ pressed }) => ({
                  backgroundColor: pressed ? 'rgba(0,0,0,0.5)' : 'rgba(0,0,0,0.35)',
                  borderRadius: 20,
                  padding: 8,
                })}
              >
                <Ionicons
                  name={favorited ? 'heart' : 'heart-outline'}
                  size={22}
                  color={favorited ? '#ff6b6b' : '#fff'}
                />
              </Pressable>
            </View>
          </View>

          {/* Content */}
          <View style={{ padding: 22 }}>
            {/* Category badge */}
            <View
              style={{
                alignSelf: 'flex-start',
                backgroundColor: 'rgba(255,255,255,0.18)',
                borderRadius: 12,
                paddingHorizontal: 12,
                paddingVertical: 4,
                marginBottom: 12,
              }}
            >
              <Text style={{ color: '#fff', fontSize: 12, fontWeight: '600' }}>
                {event.category}
              </Text>
            </View>

            <Text style={{ color: '#fff', fontSize: 24, fontWeight: '800', marginBottom: 18 }}>
              {event.emoji} {event.title}
            </Text>

            {/* Info rows */}
            <View
              style={{
                backgroundColor: 'rgba(255,255,255,0.12)',
                borderRadius: 16,
                borderWidth: 1,
                borderColor: 'rgba(255,255,255,0.2)',
                padding: 16,
                gap: 12,
                marginBottom: 22,
              }}
            >
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                <Ionicons name="calendar-outline" size={18} color="rgba(255,255,255,0.7)" />
                <Text style={{ color: '#fff', fontSize: 14 }}>{event.date}</Text>
              </View>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                <Ionicons name="location-outline" size={18} color="rgba(255,255,255,0.7)" />
                <Text style={{ color: '#fff', fontSize: 14 }}>
                  {event.location}
                </Text>
              </View>
            </View>

            {/* Description */}
            <Text style={{ color: 'rgba(255,255,255,0.85)', fontSize: 15, lineHeight: 24 }}>
              {event.description}
            </Text>
          </View>
        </ScrollView>
      </SafeAreaView>
    </LinearGradient>
  );
}
