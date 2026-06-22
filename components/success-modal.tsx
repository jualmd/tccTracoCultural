import { useEffect } from 'react';
import { Modal, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Theme } from '@/constants/theme';

type Props = {
  visible: boolean;
  message: string;
  onClose: () => void;
  duration?: number;
};

export function SuccessModal({ visible, message, onClose, duration = 2500 }: Props) {
  useEffect(() => {
    if (!visible) return;
    const timer = setTimeout(onClose, duration);
    return () => clearTimeout(timer);
  }, [visible, duration, onClose]);

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View
        style={{
          flex: 1,
          backgroundColor: 'rgba(15,6,5,0.65)',
          justifyContent: 'center',
          alignItems: 'center',
          paddingHorizontal: 40,
        }}
      >
        <View
          style={{
            backgroundColor: Theme.colors.primaryDark,
            borderRadius: Theme.radius.lg,
            padding: 32,
            alignItems: 'center',
            width: '100%',
            borderWidth: 1,
            borderColor: Theme.glass.border,
            ...Theme.shadow.card,
          }}
        >
          <View
            style={{
              width: 68,
              height: 68,
              borderRadius: 34,
              backgroundColor: 'rgba(212,163,115,0.18)',
              borderWidth: 1,
              borderColor: 'rgba(212,163,115,0.35)',
              justifyContent: 'center',
              alignItems: 'center',
              marginBottom: 18,
            }}
          >
            <Ionicons name="checkmark-circle" size={42} color={Theme.colors.accent} />
          </View>

          <Text style={{ color: '#fff', fontSize: 18, fontWeight: '800', marginBottom: 8 }}>
            Sucesso!
          </Text>
          <Text
            style={{
              color: 'rgba(255,255,255,0.75)',
              fontSize: 14,
              textAlign: 'center',
              lineHeight: 20,
            }}
          >
            {message}
          </Text>
        </View>
      </View>
    </Modal>
  );
}