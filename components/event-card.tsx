import { Image, Pressable, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import type { Event } from '@/constants/events';

type Props = {
  event: Event;
  onPress: () => void;
  onFavorite: () => void;
  isFavorited: boolean;
};

export function EventCard({ event, onPress, onFavorite, isFavorited }: Props) {
  return (
    <View
      style={{
        backgroundColor: 'rgba(255,255,255,0.13)',
        borderRadius: 16,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.22)',
        marginBottom: 16,
        overflow: 'hidden',
      }}
    >
      <Image
        source={{ uri: event.image }}
        style={{ width: '100%', height: 160 }}
        resizeMode="cover"
      />

      {/* Favorite button */}
      <Pressable
        onPress={onFavorite}
        style={({ pressed }) => ({
          position: 'absolute',
          top: 10,
          right: 10,
          backgroundColor: pressed ? 'rgba(0,0,0,0.4)' : 'rgba(0,0,0,0.25)',
          borderRadius: 20,
          padding: 6,
        })}
        hitSlop={8}
      >
        <Ionicons
          name={isFavorited ? 'heart' : 'heart-outline'}
          size={20}
          color={isFavorited ? '#ff6b6b' : '#fff'}
        />
      </Pressable>

      {/* Category badge */}
      <View
        style={{
          position: 'absolute',
          top: 10,
          left: 10,
          backgroundColor: 'rgba(62,35,33,0.75)',
          borderRadius: 12,
          paddingHorizontal: 10,
          paddingVertical: 3,
        }}
      >
        <Text style={{ color: '#fff', fontSize: 11, fontWeight: '600' }}>{event.category}</Text>
      </View>

      {/* Content */}
      <View style={{ padding: 14 }}>
        <Text style={{ color: '#fff', fontSize: 16, fontWeight: '700', marginBottom: 6 }}>
          {event.emoji} {event.title}
        </Text>

        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 3 }}>
          <Ionicons name="calendar-outline" size={13} color="rgba(255,255,255,0.7)" />
          <Text style={{ color: 'rgba(255,255,255,0.75)', fontSize: 12, marginLeft: 5 }}>
            {event.date}
          </Text>
        </View>

        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 14 }}>
          <Ionicons name="location-outline" size={13} color="rgba(255,255,255,0.7)" />
          <Text style={{ color: 'rgba(255,255,255,0.75)', fontSize: 12, marginLeft: 5 }}>
            {event.location}
          </Text>
        </View>

        <Pressable
          onPress={onPress}
          style={({ pressed }) => ({
            backgroundColor: pressed ? 'rgba(255,255,255,0.85)' : '#fff',
            borderRadius: 25,
            paddingVertical: 9,
            alignItems: 'center',
          })}
        >
          <Text style={{ color: '#3C2321', fontWeight: '700', fontSize: 13 }}>Ver Mais</Text>
        </Pressable>
      </View>
    </View>
  );
}
