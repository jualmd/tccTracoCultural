import { useEffect } from 'react';
import { Modal, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

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
          backgroundColor: 'rgba(0,0,0,0.55)',
          justifyContent: 'center',
          alignItems: 'center',
          paddingHorizontal: 40,
        }}
      >
        <View
          style={{
            backgroundColor: '#3C2321',
            borderRadius: 20,
            padding: 32,
            alignItems: 'center',
            width: '100%',
            borderWidth: 1,
            borderColor: 'rgba(255,255,255,0.15)',
          }}
        >
          <View
            style={{
              width: 64,
              height: 64,
              borderRadius: 32,
              backgroundColor: 'rgba(34,197,94,0.15)',
              justifyContent: 'center',
              alignItems: 'center',
              marginBottom: 16,
            }}
          >
            <Ionicons name="checkmark-circle" size={40} color="#22C55E" />
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
