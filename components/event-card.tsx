import { Image, Pressable, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Theme } from '@/constants/theme';
import type { Evento } from '@/types/domain';

type Props = {
  event: Evento;
  onPress: () => void;
  onFavorite: () => void;
  isFavorited: boolean;
  isOwner?: boolean;
  onEdit?: () => void;
  /** 'light' (padrão) = card claro usado em Favoritos.
   *  'dark' = card "glass" sobre o hero escuro, usado na Home
   *  (espelha .event-card do HomePage.css). */
  variant?: 'light' | 'dark';
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

export function EventCard({ event, onPress, onFavorite, isFavorited, isOwner = false, onEdit, variant = 'light' }: Props) {
  const category = event.categoria?.nome ?? 'Cultura';
  const dark = variant === 'dark';

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => ({
        backgroundColor: dark ? 'rgba(255,255,255,0.10)' : Theme.light.surface,
        borderRadius: dark ? Theme.radius.lg : Theme.radius.md,
        borderWidth: 1,
        borderColor: dark ? 'rgba(255,255,255,0.18)' : Theme.light.border,
        marginBottom: 14,
        overflow: 'hidden',
        opacity: pressed ? 0.92 : 1,
        transform: [{ scale: pressed ? 0.98 : 1 }],
        ...(dark ? Theme.shadow.card : Theme.shadowLight.sm),
      })}
    >
      {/* Imagem responsiva */}
      <View style={{ aspectRatio: 16 / 9 }}>
        <Image
          source={getImageSource(event)}
          style={{ width: '100%', height: '100%' }}
          resizeMode="cover"
        />

        {/* Badge categoria */}
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

        {/* Ações no canto superior direito */}
        <View style={{ position: 'absolute', top: 8, right: 8, flexDirection: 'row', gap: 6 }}>
          {isOwner && onEdit && (
            <Pressable
              onPress={(e) => {
                e.stopPropagation?.();
                onEdit();
              }}
              hitSlop={10}
              style={({ pressed }) => ({
                backgroundColor: pressed ? 'rgba(30,20,18,0.75)' : 'rgba(30,20,18,0.55)',
                borderRadius: 18,
                padding: 6,
                transform: [{ scale: pressed ? 0.88 : 1 }],
              })}
            >
              <Ionicons name="pencil" size={15} color="#fff" />
            </Pressable>
          )}
          <Pressable
            onPress={(e) => {
              e.stopPropagation?.();
              onFavorite();
            }}
            hitSlop={10}
            style={({ pressed }) => ({
              backgroundColor: pressed
                ? 'rgba(30,20,18,0.75)'
                : isFavorited
                ? 'rgba(30,20,18,0.6)'
                : 'rgba(30,20,18,0.4)',
              borderRadius: 18,
              padding: 6,
              transform: [{ scale: pressed ? 0.88 : 1 }],
            })}
          >
            <Ionicons
              name={isFavorited ? 'heart' : 'heart-outline'}
              size={17}
              color={isFavorited ? '#ff6b6b' : '#fff'}
            />
          </Pressable>
        </View>
      </View>

      {/* Conteúdo */}
      <View style={{ paddingHorizontal: 14, paddingTop: 11, paddingBottom: 13 }}>
        <Text
          style={{
            color: dark ? '#fff' : Theme.light.text,
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

        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 5 }}>
          <Ionicons name="time-outline" size={11} color={dark ? Theme.colors.accent : Theme.colors.primary} />
          <Text
            style={{
              color: dark ? 'rgba(255,255,255,0.65)' : Theme.light.textMuted,
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