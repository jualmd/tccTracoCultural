import { useCallback, useState } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect, useRouter } from 'expo-router';
import { DeleteAccountModal } from '@/components/delete-account-modal';
import { Theme } from '@/constants/theme';
import { USER_STORAGE_KEY, type User } from '@/constants/user-types';
import { useFavorites } from '@/lib/favorites-context';

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
          backgroundColor: danger ? 'rgba(239,68,68,0.2)' : 'rgba(255,255,255,0.15)',
          justifyContent: 'center',
          alignItems: 'center',
          marginRight: 14,
        }}
      >
        <Ionicons name={icon} size={18} color={danger ? '#EF4444' : '#fff'} />
      </View>
      <Text
        style={{
          flex: 1,
          fontSize: 15,
          fontWeight: '500',
          color: danger ? '#EF4444' : '#fff',
        }}
      >
        {label}
      </Text>
      {!danger && (
        <Ionicons name="chevron-forward" size={16} color="rgba(255,255,255,0.4)" />
      )}
    </Pressable>
  );
}

function GlassCard({ children }: { children: React.ReactNode }) {
  return (
    <View
      style={{
        backgroundColor: 'rgba(255,255,255,0.12)',
        borderRadius: 16,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.2)',
        overflow: 'hidden',
        marginBottom: 16,
      }}
    >
      {children}
    </View>
  );
}

function Divider() {
  return (
    <View
      style={{
        height: 1,
        backgroundColor: 'rgba(255,255,255,0.1)',
        marginHorizontal: 16,
      }}
    />
  );
}

export default function Profile() {
  const [user, setUser] = useState<User | null>(null);
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const { count: favCount, clearFavorites } = useFavorites();
  const router = useRouter();

  useFocusEffect(
    useCallback(() => {
      AsyncStorage.getItem(USER_STORAGE_KEY).then((raw) => {
        if (raw) setUser(JSON.parse(raw));
      });
    }, [])
  );

  async function handleLogout() {
    await AsyncStorage.removeItem(USER_STORAGE_KEY);
    router.replace('/(tabs)/login');
  }

  const initial = user?.name?.charAt(0).toUpperCase() ?? '?';

  return (
    <LinearGradient
      colors={Theme.gradient.primary}
      style={{ flex: 1 }}
      start={{ x: 0, y: 0 }}
      end={{ x: 0.3, y: 1 }}
    >
      <SafeAreaView style={{ flex: 1 }}>
        {/* Header */}
        <View style={{ paddingHorizontal: 20, paddingVertical: 16 }}>
          <Text style={{ color: '#fff', fontSize: 22, fontWeight: '800', letterSpacing: 0.5 }}>
            Meu Perfil
          </Text>
        </View>

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 32 }}
        >
          {/* Avatar + info */}
          <GlassCard>
            <View style={{ alignItems: 'center', paddingVertical: 28, paddingHorizontal: 16 }}>
              <View
                style={{
                  width: 80,
                  height: 80,
                  borderRadius: 40,
                  backgroundColor: 'rgba(255,255,255,0.25)',
                  borderWidth: 2,
                  borderColor: 'rgba(255,255,255,0.4)',
                  justifyContent: 'center',
                  alignItems: 'center',
                  marginBottom: 14,
                }}
              >
                <Text style={{ fontSize: 32, fontWeight: '800', color: '#fff' }}>{initial}</Text>
              </View>
              <Text style={{ fontSize: 20, fontWeight: '700', color: '#fff', marginBottom: 4 }}>
                {user?.name ?? '—'}
              </Text>
              <Text style={{ fontSize: 14, color: 'rgba(255,255,255,0.65)' }}>
                {user?.email ?? '—'}
              </Text>
              {user?.createdAt && (
                <Text style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)', marginTop: 6 }}>
                  Membro desde {new Date(user.createdAt).toLocaleDateString('pt-BR')}
                </Text>
              )}
              <View
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: 6,
                  marginTop: 14,
                  backgroundColor: 'rgba(255,255,255,0.12)',
                  borderRadius: 20,
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
          </GlassCard>

          {/* Editar Perfil */}
          <Text style={{ color: 'rgba(255,255,255,0.55)', fontSize: 12, fontWeight: '600', letterSpacing: 1, marginBottom: 8, marginLeft: 4 }}>
            EDITAR PERFIL
          </Text>
          <GlassCard>
            <SectionButton
              icon="person-outline"
              label="Editar Informações"
              onPress={() => router.push('/(tabs)/edit-profile')}
            />
            <Divider />
            <SectionButton
              icon="lock-closed-outline"
              label="Alterar Senha"
              onPress={() => {}}
            />
          </GlassCard>

          {/* Configurações */}
          <Text style={{ color: 'rgba(255,255,255,0.55)', fontSize: 12, fontWeight: '600', letterSpacing: 1, marginBottom: 8, marginLeft: 4 }}>
            CONFIGURAÇÕES
          </Text>
          <GlassCard>
            <SectionButton
              icon="notifications-outline"
              label="Notificações"
              onPress={() => {}}
            />
            <Divider />
            <SectionButton
              icon="shield-outline"
              label="Privacidade"
              onPress={() => {}}
            />
            <Divider />
            <SectionButton
              icon="heart-dislike-outline"
              label="Limpar Favoritos"
              onPress={clearFavorites}
            />
          </GlassCard>

          {/* Perigo */}
          <Text style={{ color: 'rgba(255,255,255,0.55)', fontSize: 12, fontWeight: '600', letterSpacing: 1, marginBottom: 8, marginLeft: 4 }}>
            ZONA DE PERIGO
          </Text>
          <GlassCard>
            <SectionButton
              icon="trash-outline"
              label="Excluir Conta"
              onPress={() => setDeleteModalVisible(true)}
              danger
            />
          </GlassCard>

          {/* Logout */}
          <Pressable
            onPress={handleLogout}
            style={({ pressed }) => ({
              backgroundColor: pressed ? '#dc2626' : '#EF4444',
              borderRadius: 14,
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
    </LinearGradient>
  );
}
