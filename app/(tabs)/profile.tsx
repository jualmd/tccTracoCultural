import { useCallback, useState } from 'react';
import { Image, Pressable, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect, useRouter } from 'expo-router';
import { DeleteAccountModal } from '@/components/delete-account-modal';
import { EditEventModal } from '@/components/edit-event-modal';
import { EventDetailModal } from '@/components/event-detail-modal';
import { Theme } from '@/constants/theme';
import { useAuth } from '@/contexts/auth-context';
import { useFavorites } from '@/contexts/favorites-context';
import { buscarUsuario } from '@/services/user-service';
import { listarMeusEventos } from '@/services/event-service';
import type { Evento } from '@/types/domain';

type SectionButtonProps = {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  onPress: () => void;
  danger?: boolean;
};

function SectionButton({ icon, label, onPress, danger = false }: SectionButtonProps) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => ({
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 14,
        paddingHorizontal: 16,
        opacity: pressed ? 0.7 : 1,
      })}
    >
      <View
        style={{
          width: 36,
          height: 36,
          borderRadius: 10,
          backgroundColor: danger ? 'rgba(239,68,68,0.16)' : Theme.glass.bgMd,
          justifyContent: 'center',
          alignItems: 'center',
          marginRight: 14,
        }}
      >
        <Ionicons name={icon} size={18} color={danger ? Theme.colors.danger : Theme.colors.accent} />
      </View>
      <Text
        style={{
          flex: 1,
          fontSize: 15,
          fontWeight: '500',
          color: danger ? '#e5847a' : '#fff',
        }}
      >
        {label}
      </Text>
      {!danger && (
        <Ionicons name="chevron-forward" size={16} color="rgba(255,255,255,0.45)" />
      )}
    </Pressable>
  );
}

function Card({ children }: { children: React.ReactNode }) {
  return (
    <View
      style={{
        backgroundColor: Theme.glass.bg,
        borderRadius: Theme.radius.md,
        borderWidth: 1,
        borderColor: Theme.glass.border,
        overflow: 'hidden',
        marginBottom: 16,
      }}
    >
      {children}
    </View>
  );
}

function SectionLabel({ children }: { children: string }) {
  return (
    <Text
      style={{
        color: 'rgba(255,255,255,0.55)',
        fontSize: 11.5,
        fontWeight: '700',
        letterSpacing: 1,
        marginBottom: 8,
        marginLeft: 4,
        textTransform: 'uppercase',
      }}
    >
      {children}
    </Text>
  );
}

function EventMiniCard({ evento, onPress, onEdit }: { evento: Evento; onPress: () => void; onEdit: () => void }) {
  const imagem = evento.cardImage ? `data:image/jpeg;base64,${evento.cardImage}` : null;
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => ({
        flexDirection: 'row',
        alignItems: 'center',
        padding: 12,
        gap: 12,
        opacity: pressed ? 0.8 : 1,
      })}
    >
      {imagem ? (
        <Image source={{ uri: imagem }} style={{ width: 52, height: 52, borderRadius: Theme.radius.sm }} />
      ) : (
        <View
          style={{
            width: 52,
            height: 52,
            borderRadius: Theme.radius.sm,
            backgroundColor: Theme.glass.bgMd,
            justifyContent: 'center',
            alignItems: 'center',
          }}
        >
          <Ionicons name="image-outline" size={20} color="rgba(255,255,255,0.5)" />
        </View>
      )}
      <View style={{ flex: 1 }}>
        <Text style={{ color: '#fff', fontWeight: '700', fontSize: 14.5 }} numberOfLines={1}>
          {evento.nome}
        </Text>
        <Text style={{ color: 'rgba(255,255,255,0.6)', fontSize: 12.5, marginTop: 2 }} numberOfLines={1}>
          {new Date(evento.dataInicio).toLocaleDateString('pt-BR')} · {evento.cidade}
        </Text>
      </View>
      <Pressable
        onPress={(e) => {
          e.stopPropagation?.();
          onEdit();
        }}
        hitSlop={10}
        style={({ pressed }) => ({
          width: 34,
          height: 34,
          borderRadius: 17,
          backgroundColor: Theme.glass.bgMd,
          justifyContent: 'center',
          alignItems: 'center',
          opacity: pressed ? 0.7 : 1,
        })}
      >
        <Ionicons name="pencil" size={15} color={Theme.colors.accent} />
      </Pressable>
    </Pressable>
  );
}

export default function Profile() {
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const [myEvents, setMyEvents] = useState<Evento[]>([]);
  const [editingEvent, setEditingEvent] = useState<Evento | null>(null);
  const [selectedEvent, setSelectedEvent] = useState<Evento | null>(null);
  const { isFavorite, toggleFavorite, count: favCount } = useFavorites();
  const { user, setUser, logout } = useAuth();
  const router = useRouter();

  const loadMyEvents = useCallback(() => {
    listarMeusEventos().then(setMyEvents).catch(() => setMyEvents([]));
  }, []);

  useFocusEffect(
    useCallback(() => {
      if (!user?.id) return;
      buscarUsuario(user.id).then(setUser).catch(() => {});
      loadMyEvents();
    }, [setUser, user?.id, loadMyEvents])
  );

  const initial = user?.nome?.charAt(0).toUpperCase() ?? '?';

  return (
    <View style={{ flex: 1, backgroundColor: Theme.colors.primaryDark }}>
      <LinearGradient
        colors={Theme.gradient.primary}
        start={{ x: 0.15, y: 0.05 }}
        end={{ x: 0.85, y: 1 }}
        style={{ position: 'absolute', inset: 0 } as any}
      />

      <SafeAreaView style={{ flex: 1 }}>
        {/* Header — espelha .title-section */}
        <View style={{ paddingHorizontal: 20, paddingTop: 14, paddingBottom: 4 }}>
          <Text
            style={{
              color: Theme.colors.accent,
              fontSize: 10.5,
              fontWeight: '700',
              letterSpacing: 1,
              textTransform: 'uppercase',
              marginBottom: 4,
            }}
          >
            Sua conta
          </Text>
          <Text style={{ color: '#fff', fontSize: 23, fontWeight: '800', letterSpacing: 0.3 }}>
            Meu Perfil
          </Text>
        </View>

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 16, paddingBottom: 32 }}
        >
          {/* Avatar + info — espelha .profile-card / .profile-header / .profile-stats */}
          <Card>
            <View style={{ alignItems: 'center', paddingVertical: 30, paddingHorizontal: 16 }}>
              <View
                style={{
                  width: 84,
                  height: 84,
                  borderRadius: 42,
                  backgroundColor: Theme.colors.accent,
                  justifyContent: 'center',
                  alignItems: 'center',
                  marginBottom: 16,
                  ...Theme.shadow.accent,
                }}
              >
                <Text style={{ fontSize: 32, fontWeight: '800', color: Theme.colors.primaryDark }}>
                  {initial}
                </Text>
              </View>
              <Text style={{ fontSize: 20, fontWeight: '700', color: '#fff', marginBottom: 4 }}>
                {user?.nome ?? '—'}
              </Text>
              <Text style={{ fontSize: 14, color: 'rgba(255,255,255,0.65)' }}>
                {user?.email ?? '—'}
              </Text>
              {user?.createdAt && (
                <Text style={{ fontSize: 12, color: 'rgba(255,255,255,0.5)', marginTop: 6 }}>
                  Membro desde {new Date(user.createdAt).toLocaleDateString('pt-BR')}
                </Text>
              )}

              <View style={{ flexDirection: 'row', gap: 10, marginTop: 18 }}>
                <View
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    gap: 6,
                    backgroundColor: 'rgba(212,163,115,0.15)',
                    borderWidth: 1,
                    borderColor: 'rgba(212,163,115,0.25)',
                    borderRadius: Theme.radius.pill,
                    paddingHorizontal: 14,
                    paddingVertical: 6,
                  }}
                >
                  <Ionicons name="calendar-outline" size={14} color={Theme.colors.accent} />
                  <Text style={{ color: '#fff', fontSize: 13, fontWeight: '600' }}>
                    {myEvents.length} {myEvents.length === 1 ? 'evento' : 'eventos'}
                  </Text>
                </View>
                <View
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    gap: 6,
                    backgroundColor: 'rgba(212,163,115,0.15)',
                    borderWidth: 1,
                    borderColor: 'rgba(212,163,115,0.25)',
                    borderRadius: Theme.radius.pill,
                    paddingHorizontal: 14,
                    paddingVertical: 6,
                  }}
                >
                  <Ionicons name="heart" size={14} color="#ff6b6b" />
                  <Text style={{ color: '#fff', fontSize: 13, fontWeight: '600' }}>
                    {favCount} {favCount === 1 ? 'favorito' : 'favoritos'}
                  </Text>
                </View>
              </View>
            </View>
          </Card>

          <SectionLabel>Meus Eventos</SectionLabel>
          {myEvents.length > 0 ? (
            <Card>
              {myEvents.map((evento, index) => (
                <View key={evento.id}>
                  <EventMiniCard
                    evento={evento}
                    onPress={() => setSelectedEvent(evento)}
                    onEdit={() => setEditingEvent(evento)}
                  />
                  {index < myEvents.length - 1 && (
                    <View style={{ height: 1, marginHorizontal: 12, backgroundColor: Theme.glass.border }} />
                  )}
                </View>
              ))}
            </Card>
          ) : (
            <Card>
              <View style={{ alignItems: 'center', paddingVertical: 28, paddingHorizontal: 20 }}>
                <Ionicons name="calendar-outline" size={28} color="rgba(255,255,255,0.4)" />
                <Text style={{ color: 'rgba(255,255,255,0.55)', fontSize: 13.5, marginTop: 10, textAlign: 'center' }}>
                  Você ainda não criou nenhum evento.
                </Text>
              </View>
            </Card>
          )}

          <SectionLabel>Editar Perfil</SectionLabel>
          <Card>
            <SectionButton
              icon="person-outline"
              label="Editar Informações"
              onPress={() => router.push('/(tabs)/edit-profile')}
            />
          </Card>

          <SectionLabel>Configurações</SectionLabel>
          <Card>
            <SectionButton
              icon="options-outline"
              label="Configurações"
              onPress={() => router.push('/(tabs)/configuracoes' as never)}
            />
          </Card>

          <SectionLabel>Zona de Perigo</SectionLabel>
          <Card>
            <SectionButton
              icon="trash-outline"
              label="Excluir Conta"
              onPress={() => setDeleteModalVisible(true)}
              danger
            />
          </Card>

          <Pressable
            onPress={logout}
            style={({ pressed }) => ({
              backgroundColor: pressed ? Theme.colors.dangerDark : Theme.colors.danger,
              borderRadius: Theme.radius.pill,
              paddingVertical: 15,
              alignItems: 'center',
              flexDirection: 'row',
              justifyContent: 'center',
              gap: 8,
              marginTop: 4,
            })}
          >
            <Ionicons name="log-out-outline" size={20} color="#fff" />
            <Text style={{ color: '#fff', fontWeight: '700', fontSize: 16 }}>Sair da Conta</Text>
          </Pressable>
        </ScrollView>
      </SafeAreaView>

      <DeleteAccountModal
        visible={deleteModalVisible}
        onClose={() => setDeleteModalVisible(false)}
      />

      <EventDetailModal
        event={selectedEvent}
        visible={!!selectedEvent}
        onClose={() => setSelectedEvent(null)}
        onFavorite={() => selectedEvent && toggleFavorite(selectedEvent.id)}
        isFavorited={!!selectedEvent && isFavorite(selectedEvent.id)}
      />

      <EditEventModal
        event={editingEvent}
        visible={!!editingEvent}
        onClose={() => setEditingEvent(null)}
        onSaved={() => loadMyEvents()}
        onDeleted={() => loadMyEvents()}
      />
    </View>
  );
}