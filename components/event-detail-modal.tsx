import { Image, Modal, Pressable, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import type { Event } from '@/constants/events';
import { Theme } from '@/constants/theme';

type Props = {
  event: Event | null;
  visible: boolean;
  onClose: () => void;
  onFavorite: () => void;
  isFavorited: boolean;
};

export function EventDetailModal({ event, visible, onClose, onFavorite, isFavorited }: Props) {
  if (!event) return null;

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <LinearGradient
        colors={Theme.gradient.primary}
        style={{ flex: 1 }}
        start={{ x: 0, y: 0 }}
        end={{ x: 0.3, y: 1 }}
      >
        <SafeAreaView style={{ flex: 1 }}>
          <ScrollView showsVerticalScrollIndicator={false} bounces>
            {/* Imagem full-width */}
            <View style={{ position: 'relative' }}>
              <Image
                source={{ uri: event.image }}
                style={{ width: '100%', height: 260 }}
                resizeMode="cover"
              />

              {/* Botões sobre a imagem */}
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
                  onPress={onClose}
                  style={({ pressed }) => ({
                    backgroundColor: pressed ? 'rgba(0,0,0,0.55)' : 'rgba(0,0,0,0.35)',
                    borderRadius: 20,
                    padding: 8,
                  })}
                >
                  <Ionicons name="arrow-back" size={22} color="#fff" />
                </Pressable>

                <Pressable
                  onPress={onFavorite}
                  style={({ pressed }) => ({
                    backgroundColor: pressed ? 'rgba(0,0,0,0.55)' : 'rgba(0,0,0,0.35)',
                    borderRadius: 20,
                    padding: 8,
                  })}
                >
                  <Ionicons
                    name={isFavorited ? 'heart' : 'heart-outline'}
                    size={22}
                    color={isFavorited ? '#ff6b6b' : '#fff'}
                  />
                </Pressable>
              </View>
            </View>

            {/* Conteúdo */}
            <View style={{ padding: 22 }}>
              {/* Badge categoria */}
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

              {/* Título */}
              <Text
                style={{ color: '#fff', fontSize: 24, fontWeight: '800', marginBottom: 18 }}
              >
                {event.emoji} {event.title}
              </Text>

              {/* Data e local */}
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
                  <Text style={{ color: '#fff', fontSize: 14 }}>{event.location}</Text>
                </View>
              </View>

              {/* Descrição */}
              <Text
                style={{
                  color: 'rgba(255,255,255,0.85)',
                  fontSize: 15,
                  lineHeight: 24,
                  marginBottom: 32,
                }}
              >
                {event.description}
              </Text>

              {/* Botão fechar */}
              <Pressable
                onPress={onClose}
                style={({ pressed }) => ({
                  backgroundColor: pressed ? 'rgba(255,255,255,0.85)' : '#fff',
                  borderRadius: 14,
                  paddingVertical: 14,
                  alignItems: 'center',
                })}
              >
                <Text style={{ color: Theme.colors.secondary, fontWeight: '700', fontSize: 15 }}>
                  Fechar
                </Text>
              </Pressable>
            </View>
          </ScrollView>
        </SafeAreaView>
      </LinearGradient>
    </Modal>
  );
}
