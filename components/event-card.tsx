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

function formatMeta(event: Evento): string {
  const start = new Date(event.dataInicio);
  const dateStr = Number.isNaN(start.getTime())
    ? event.dataInicio
    : start.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' });
  return `${dateStr}  ·  ${event.cidade}`;
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
        marginBottom: 12,
        overflow: 'hidden',
        opacity: pressed ? 0.88 : 1,
        transform: [{ scale: pressed ? 0.975 : 1 }],
        // sombra suave — menos pesada que antes
        shadowColor: '#000',
        shadowOpacity: 0.14,
        shadowRadius: 10,
        shadowOffset: { width: 0, height: 4 },
        elevation: 3,
        boxShadow: '0px 4px 10px rgba(0,0,0,0.14)',
      })}
    >
      {/* Imagem responsiva */}
      <View style={{ aspectRatio: 16 / 9 }}>
        <Image
          source={getImageSource(event)}
          style={{ width: '100%', height: '100%' }}
          resizeMode="cover"
        />

        {/* Gradiente sutil na base — coberto pelo conteúdo */}
        <View
          style={{
            position: 'absolute',
            left: 0,
            right: 0,
            bottom: 0,
            height: '50%',
            backgroundColor: 'transparent',
          }}
        />

        {/* Badge categoria — menor e mais discreta */}
        <View
          style={{
            position: 'absolute',
            top: 10,
            left: 10,
            backgroundColor: Theme.colors.accent,
            borderRadius: Theme.radius.pill,
            paddingHorizontal: 9,
            paddingVertical: 3,
          }}
        >
          <Text
            style={{
              color: Theme.colors.primaryDark,
              fontSize: 9.5,
              fontWeight: '700',
              letterSpacing: 0.5,
              textTransform: 'uppercase',
            }}
          >
            {category}
          </Text>
        </View>

        {/* Botão favorito */}
        <Pressable
          onPress={onFavorite}
          hitSlop={10}
          style={({ pressed }) => ({
            position: 'absolute',
            top: 8,
            right: 8,
            backgroundColor: pressed
              ? 'rgba(15,5,4,0.65)'
              : isFavorited
              ? 'rgba(15,5,4,0.55)'
              : 'rgba(15,5,4,0.32)',
            borderRadius: 18,
            padding: 6,
            transform: [{ scale: pressed ? 0.88 : 1 }],
          })}
        >
          <Ionicons
            name={isFavorited ? 'heart' : 'heart-outline'}
            size={17}
            color={isFavorited ? '#ff6b6b' : 'rgba(255,255,255,0.9)'}
          />
        </Pressable>
      </View>

      {/* Conteúdo */}
      <View style={{ paddingHorizontal: 14, paddingTop: 11, paddingBottom: 13 }}>
        <Text
          style={{
            color: '#fff',
            fontSize: 15,
            fontWeight: '700',
            lineHeight: 20,
            marginBottom: 6,
            letterSpacing: 0.1,
          }}
          numberOfLines={2}
        >
          {event.nome}
        </Text>

        {/* Metadados numa linha só */}
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 5 }}>
          <Ionicons name="time-outline" size={11} color={Theme.colors.accent} />
          <Text
            style={{
              color: 'rgba(255,255,255,0.6)',
              fontSize: 11.5,
              fontWeight: '500',
              letterSpacing: 0.1,
            }}
            numberOfLines={1}
          >
            {formatMeta(event)}
          </Text>
        </View>
      </View>
    </Pressable>
  );
}
