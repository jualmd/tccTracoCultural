import { useCallback, useState } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect, useRouter } from 'expo-router';
import { DeleteAccountModal } from '@/components/delete-account-modal';
import { Theme } from '@/constants/theme';
import { useAuth } from '@/contexts/auth-context';
import { useFavorites } from '@/contexts/favorites-context';
import { buscarUsuario } from '@/services/user-service';

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
          backgroundColor: danger ? 'rgba(239,68,68,0.18)' : Theme.glass.bgMd,
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
          color: danger ? Theme.colors.danger : '#fff',
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

export default function Profile() {
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const { count: favCount } = useFavorites();
  const { user, setUser, logout } = useAuth();
  const router = useRouter();

  useFocusEffect(
    useCallback(() => {
      if (!user?.id) return;
      buscarUsuario(user.id).then(setUser).catch(() => {});
    }, [setUser, user?.id])
  );

  const initial = user?.nome?.charAt(0).toUpperCase() ?? '?';

  return (
    <LinearGradient
      colors={Theme.gradient.primary}
      style={{ flex: 1 }}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
    >
      <SafeAreaView style={{ flex: 1 }}>
        {/* Header */}
        <View style={{ paddingHorizontal: 20, paddingVertical: 16 }}>
          <Text style={{ color: '#fff', fontSize: 23, fontWeight: '800', letterSpacing: 0.3 }}>
            Meu Perfil
          </Text>
        </View>

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 32 }}
        >
          {/* Avatar + info */}
          <GlassCard>
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
                <Text style={{ fontSize: 12, color: 'rgba(255,255,255,0.42)', marginTop: 6 }}>
                  Membro desde {new Date(user.createdAt).toLocaleDateString('pt-BR')}
                </Text>
              )}
              <View
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: 6,
                  marginTop: 16,
                  backgroundColor: Theme.glass.bgMd,
                  borderWidth: 1,
                  borderColor: Theme.glass.border,
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
          </GlassCard>

          {/* Editar Perfil */}
          <SectionLabel>Editar Perfil</SectionLabel>
          <GlassCard>
            <SectionButton
              icon="person-outline"
              label="Editar Informações"
              onPress={() => router.push('/(tabs)/edit-profile')}
            />
          </GlassCard>

          {/* Configurações */}
          <SectionLabel>Configurações</SectionLabel>
          <GlassCard>
            <SectionButton
              icon="notifications-outline"
              label="Configurações"
              onPress={() => router.push('/(tabs)/configuracoes' as never)}
            />
          </GlassCard>

          {/* Perigo */}
          <SectionLabel>Zona de Perigo</SectionLabel>
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
    </LinearGradient>
  );
}
