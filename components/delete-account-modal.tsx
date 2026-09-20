import { Alert, Modal, Text, View } from 'react-native';
import { useState } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { Button, ButtonRow } from '@/components/ui/button';
import { Theme } from '@/constants/theme';
import { useAuth } from '@/contexts/auth-context';
import { excluirUsuario } from '@/services/user-service';

type Props = {
  visible: boolean;
  onClose: () => void;
};

export function DeleteAccountModal({ visible, onClose }: Props) {
  const [loading, setLoading] = useState(false);
  const { user, logout } = useAuth();

  async function handleDelete() {
    if (!user?.id) return;
    setLoading(true);
    try {
      await excluirUsuario(user.id);
      await logout();
    } catch (error: any) {
      const message = error.response?.data?.message ?? 'Não foi possível excluir sua conta agora. Tente novamente em instantes.';
      Alert.alert('Erro ao excluir conta', message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View
        style={{
          flex: 1,
          backgroundColor: 'rgba(15,6,5,0.7)',
          justifyContent: 'center',
          alignItems: 'center',
          paddingHorizontal: 28,
        }}
      >
        <View
          style={{
            backgroundColor: Theme.colors.primaryDark,
            borderRadius: Theme.radius.lg,
            padding: 28,
            width: '100%',
            borderWidth: 1,
            borderColor: Theme.glass.border,
            ...Theme.shadow.card,
          }}
        >
          <View
            style={{
              width: 56,
              height: 56,
              borderRadius: 28,
              backgroundColor: 'rgba(239,68,68,0.15)',
              borderWidth: 1,
              borderColor: 'rgba(239,68,68,0.3)',
              justifyContent: 'center',
              alignItems: 'center',
              alignSelf: 'center',
              marginBottom: 16,
            }}
          >
            <Ionicons name="warning-outline" size={28} color={Theme.colors.danger} />
          </View>

          <Text
            style={{
              fontSize: 20,
              fontWeight: '800',
              color: '#fff',
              marginBottom: 12,
              textAlign: 'center',
            }}
          >
            Excluir Conta?
          </Text>
          <Text
            style={{
              fontSize: 14,
              color: 'rgba(255,255,255,0.65)',
              textAlign: 'center',
              lineHeight: 22,
              marginBottom: 28,
            }}
          >
            Esta ação é irreversível. Todos os seus dados serão perdidos.
          </Text>

          <ButtonRow>
            <Button label="Cancelar" onPress={onClose} variant="outlineOnDark" disabled={loading} style={{ flex: 1 }} />
            <Button label="Excluir" onPress={handleDelete} variant="danger" loading={loading} style={{ flex: 1 }} />
          </ButtonRow>
        </View>
      </View>
    </Modal>
  );
}