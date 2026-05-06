import { ActivityIndicator, Modal, Pressable, Text, View } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { USER_STORAGE_KEY } from '@/constants/user-types';

type Props = {
  visible: boolean;
  onClose: () => void;
};

export function DeleteAccountModal({ visible, onClose }: Props) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleDelete() {
    setLoading(true);
    try {
      await AsyncStorage.removeItem(USER_STORAGE_KEY);
      router.replace('/(tabs)/login');
    } finally {
      setLoading(false);
    }
  }

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View
        style={{
          flex: 1,
          backgroundColor: 'rgba(0,0,0,0.6)',
          justifyContent: 'center',
          alignItems: 'center',
          paddingHorizontal: 28,
        }}
      >
        <View
          style={{
            backgroundColor: '#fff',
            borderRadius: 20,
            padding: 28,
            width: '100%',
          }}
        >
          <Text
            style={{
              fontSize: 20,
              fontWeight: '800',
              color: '#3C2321',
              marginBottom: 12,
              textAlign: 'center',
            }}
          >
            Excluir Conta?
          </Text>
          <Text
            style={{
              fontSize: 14,
              color: '#687076',
              textAlign: 'center',
              lineHeight: 22,
              marginBottom: 28,
            }}
          >
            Esta ação é irreversível. Todos os seus dados serão perdidos.
          </Text>

          <View style={{ flexDirection: 'row', gap: 12 }}>
            <Pressable
              onPress={onClose}
              style={({ pressed }) => ({
                flex: 1,
                backgroundColor: pressed ? '#f0f0f0' : '#fff',
                borderRadius: 12,
                paddingVertical: 13,
                alignItems: 'center',
                borderWidth: 1,
                borderColor: '#8E5E56',
              })}
            >
              <Text style={{ color: '#8E5E56', fontWeight: '700', fontSize: 15 }}>Cancelar</Text>
            </Pressable>

            <Pressable
              onPress={handleDelete}
              disabled={loading}
              style={({ pressed }) => ({
                flex: 1,
                backgroundColor: pressed ? '#dc2626' : '#EF4444',
                borderRadius: 12,
                paddingVertical: 13,
                alignItems: 'center',
              })}
            >
              {loading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={{ color: '#fff', fontWeight: '700', fontSize: 15 }}>Excluir</Text>
              )}
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
}
