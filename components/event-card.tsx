import { Image, Pressable, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Theme } from '@/constants/theme';
import type { Evento } from '@/types/domain';

type Props = {
  event: Evento;
  onPress: () => void;
  onFavorite: () => void;
  isFavorited: boolean;
};

function formatEventDate(event: Evento) {
  const start = new Date(event.dataInicio);
  if (Number.isNaN(start.getTime())) return event.dataInicio;

  const startText = start.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' });
  if (!event.dataFim) return startText;

  const end = new Date(event.dataFim);
  if (Number.isNaN(end.getTime())) return startText;
  return `${startText} a ${end.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' })}`;
}

function getImageSource(event: Evento) {
  if (!event.cardImage) return { uri: `https://picsum.photos/seed/evento-${event.id}/600/400` };
  if (event.cardImage.startsWith('http') || event.cardImage.startsWith('data:')) return { uri: event.cardImage };
  return { uri: `data:image/jpeg;base64,${event.cardImage}` };
}

export function EventCard({ event, onPress, onFavorite, isFavorited }: Props) {
  const category = event.categoria?.nome ?? 'Cultura';

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => ({
        backgroundColor: Theme.glass.bg,
        borderRadius: Theme.radius.md,
        borderWidth: 1,
        borderColor: Theme.glass.border,
        marginBottom: 16,
        overflow: 'hidden',
        opacity: pressed ? 0.92 : 1,
        transform: [{ scale: pressed ? 0.98 : 1 }],
        ...Theme.shadow.card,
      })}
    >
      <View>
        <Image
          source={getImageSource(event)}
          style={{ width: '100%', height: 170 }}
          resizeMode="cover"
        />

        {/* Favorite button */}
        <Pressable
          onPress={onFavorite}
          style={({ pressed }) => ({
            position: 'absolute',
            top: 10,
            right: 10,
            backgroundColor: pressed ? 'rgba(20,8,7,0.55)' : 'rgba(20,8,7,0.38)',
            borderRadius: 20,
            padding: 7,
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
            backgroundColor: Theme.colors.accent,
            borderRadius: Theme.radius.pill,
            paddingHorizontal: 11,
            paddingVertical: 4,
            ...Theme.shadow.accent,
          }}
        >
          <Text
            style={{
              color: Theme.colors.primaryDark,
              fontSize: 10.5,
              fontWeight: '700',
              letterSpacing: 0.4,
              textTransform: 'uppercase',
            }}
          >
            {category}
          </Text>
        </View>
      </View>

      {/* Content */}
      <View style={{ padding: 15 }}>
        <Text
          style={{ color: '#fff', fontSize: 16, fontWeight: '700', marginBottom: 8, lineHeight: 21 }}
          numberOfLines={2}
        >
          {event.nome}
        </Text>

        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 4 }}>
          <Ionicons name="calendar-outline" size={13} color={Theme.colors.accent} />
          <Text style={{ color: 'rgba(255,255,255,0.78)', fontSize: 12.5, marginLeft: 6 }}>
            {formatEventDate(event)}
          </Text>
        </View>

        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <Ionicons name="location-outline" size={13} color={Theme.colors.accent} />
          <Text style={{ color: 'rgba(255,255,255,0.78)', fontSize: 12.5, marginLeft: 6 }}>
            {event.cidade}
          </Text>
        </View>
      </View>
    </Pressable>
  );
}
