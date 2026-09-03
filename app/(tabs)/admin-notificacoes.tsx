import { useCallback, useState } from 'react';
import { Alert, Pressable, ScrollView, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Theme } from '@/constants/theme';
import { enviarNotificacaoGeral } from '@/services/notification-service';

export default function AdminNotificacoes() {
  const router = useRouter();
  const [mensagem, setMensagem] = useState('');
  const [enviando, setEnviando] = useState(false);

  const handleEnviar = useCallback(async () => {
    if (!mensagem.trim()) {
      Alert.alert('Ops', 'Escreva uma mensagem antes de enviar.');
      return;
    }

    setEnviando(true);
    try {
      const resultado = await enviarNotificacaoGeral(mensagem.trim());
      Alert.alert(
        'Enviado!',
        `Notificação enviada para ${resultado.totalEnviado} ${resultado.totalEnviado === 1 ? 'pessoa' : 'pessoas'}.`
      );
      setMensagem('');
    } catch (error: any) {
      Alert.alert('Erro', error.response?.data?.message ?? 'Não foi possível enviar a notificação. Tente novamente.');
    } finally {
      setEnviando(false);
    }
  }, [mensagem]);

  return (
    <View style={{ flex: 1, backgroundColor: Theme.colors.primaryDark }}>
      <LinearGradient
        colors={Theme.gradient.primary}
        start={{ x: 0.15, y: 0.05 }}
        end={{ x: 0.85, y: 1 }}
        style={{ position: 'absolute', inset: 0 } as any}
      />

      <SafeAreaView style={{ flex: 1 }}>
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            paddingHorizontal: 20,
            paddingTop: 14,
            paddingBottom: 4,
          }}
        >
          <Pressable onPress={() => router.back()} hitSlop={10} style={{ marginRight: 12 }}>
            <Ionicons name="arrow-back" size={22} color="#fff" />
          </Pressable>
          <View>
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
              Painel Admin
            </Text>
            <Text style={{ color: '#fff', fontSize: 23, fontWeight: '800', letterSpacing: 0.3 }}>
              Notificação Geral
            </Text>
          </View>
        </View>

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 20, paddingBottom: 40 }}
        >
          <Text style={{ color: 'rgba(255,255,255,0.6)', fontSize: 13.5, lineHeight: 20, marginBottom: 20 }}>
            Enviada pra <Text style={{ fontWeight: '700', color: '#fff' }}>todos os usuários</Text> da plataforma —
            use pra avisos sobre o sistema, manutenções ou novidades. Pra avisar só quem favoritou um evento
            específico, isso agora é feito direto na tela de edição desse evento (Meus Eventos → editar).
          </Text>

          <Text style={{ color: 'rgba(255,255,255,0.55)', fontSize: 11.5, fontWeight: '700', letterSpacing: 1, marginBottom: 10, textTransform: 'uppercase' }}>
            Mensagem
          </Text>
          <TextInput
            value={mensagem}
            onChangeText={setMensagem}
            placeholder="Ex: A plataforma passará por manutenção às 22h."
            placeholderTextColor="rgba(255,255,255,0.4)"
            multiline
            numberOfLines={4}
            style={{
              backgroundColor: Theme.glass.bg,
              borderRadius: Theme.radius.md,
              borderWidth: 1,
              borderColor: Theme.glass.border,
              color: '#fff',
              fontSize: 14.5,
              padding: 14,
              minHeight: 110,
              textAlignVertical: 'top',
              marginBottom: 24,
            }}
          />

          <Pressable
            onPress={handleEnviar}
            disabled={enviando}
            style={({ pressed }) => ({
              backgroundColor: Theme.colors.accent,
              borderRadius: Theme.radius.pill,
              paddingVertical: 15,
              alignItems: 'center',
              flexDirection: 'row',
              justifyContent: 'center',
              gap: 8,
              opacity: pressed || enviando ? 0.7 : 1,
            })}
          >
            <Ionicons name="megaphone" size={18} color={Theme.colors.primaryDark} />
            <Text style={{ color: Theme.colors.primaryDark, fontWeight: '700', fontSize: 16 }}>
              {enviando ? 'Enviando...' : 'Enviar pra todos'}
            </Text>
          </Pressable>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}