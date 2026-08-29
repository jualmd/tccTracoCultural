import { useCallback, useEffect, useState } from 'react';
import { Alert, Pressable, ScrollView, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Theme } from '@/constants/theme';
import { listarEventos } from '@/services/event-service';
import { enviarNotificacaoAdmin } from '@/services/notification-service';
import type { Evento } from '@/types/domain';

type Destino = 'TODOS' | 'FAVORITOS_EVENTO';

export default function AdminNotificacoes() {
  const router = useRouter();
  const [destino, setDestino] = useState<Destino>('TODOS');
  const [eventos, setEventos] = useState<Evento[]>([]);
  const [eventoSelecionado, setEventoSelecionado] = useState<Evento | null>(null);
  const [mensagem, setMensagem] = useState('');
  const [enviando, setEnviando] = useState(false);

  useEffect(() => {
    listarEventos().then(setEventos).catch(() => setEventos([]));
  }, []);

  const handleEnviar = useCallback(async () => {
    if (!mensagem.trim()) {
      Alert.alert('Ops', 'Escreva uma mensagem antes de enviar.');
      return;
    }
    if (destino === 'FAVORITOS_EVENTO' && !eventoSelecionado) {
      Alert.alert('Ops', 'Selecione um evento pra notificar quem favoritou.');
      return;
    }

    setEnviando(true);
    try {
      const resultado = await enviarNotificacaoAdmin({
        mensagem: mensagem.trim(),
        destino,
        eventoId: eventoSelecionado?.id,
      });
      Alert.alert(
        'Enviado!',
        `Notificação enviada para ${resultado.totalEnviado} ${resultado.totalEnviado === 1 ? 'pessoa' : 'pessoas'}.`
      );
      setMensagem('');
      setEventoSelecionado(null);
      setDestino('TODOS');
    } catch {
      Alert.alert('Erro', 'Não foi possível enviar a notificação. Tente novamente.');
    } finally {
      setEnviando(false);
    }
  }, [destino, eventoSelecionado, mensagem]);

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
              Enviar Notificação
            </Text>
          </View>
        </View>

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 20, paddingBottom: 40 }}
        >
          <Text style={{ color: 'rgba(255,255,255,0.55)', fontSize: 11.5, fontWeight: '700', letterSpacing: 1, marginBottom: 10, textTransform: 'uppercase' }}>
            Destinatários
          </Text>
          <View style={{ flexDirection: 'row', gap: 10, marginBottom: 20 }}>
            {(['TODOS', 'FAVORITOS_EVENTO'] as Destino[]).map((opcao) => {
              const ativo = destino === opcao;
              return (
                <Pressable
                  key={opcao}
                  onPress={() => setDestino(opcao)}
                  style={{
                    flex: 1,
                    paddingVertical: 12,
                    borderRadius: Theme.radius.md,
                    borderWidth: 1,
                    borderColor: ativo ? Theme.colors.accent : Theme.glass.border,
                    backgroundColor: ativo ? 'rgba(212,163,115,0.18)' : Theme.glass.bg,
                    alignItems: 'center',
                  }}
                >
                  <Text style={{ color: ativo ? Theme.colors.accent : '#fff', fontWeight: '700', fontSize: 13 }}>
                    {opcao === 'TODOS' ? 'Todos os usuários' : 'Quem favoritou um evento'}
                  </Text>
                </Pressable>
              );
            })}
          </View>

          {destino === 'FAVORITOS_EVENTO' && (
            <>
              <Text style={{ color: 'rgba(255,255,255,0.55)', fontSize: 11.5, fontWeight: '700', letterSpacing: 1, marginBottom: 10, textTransform: 'uppercase' }}>
                Evento
              </Text>
              <View
                style={{
                  backgroundColor: Theme.glass.bg,
                  borderRadius: Theme.radius.md,
                  borderWidth: 1,
                  borderColor: Theme.glass.border,
                  marginBottom: 20,
                  overflow: 'hidden',
                }}
              >
                {eventos.length === 0 && (
                  <Text style={{ color: 'rgba(255,255,255,0.55)', padding: 16, fontSize: 13.5 }}>
                    Nenhum evento encontrado.
                  </Text>
                )}
                {eventos.map((evento, index) => {
                  const selecionado = eventoSelecionado?.id === evento.id;
                  return (
                    <View key={evento.id}>
                      <Pressable
                        onPress={() => setEventoSelecionado(evento)}
                        style={{
                          flexDirection: 'row',
                          alignItems: 'center',
                          paddingVertical: 13,
                          paddingHorizontal: 16,
                          gap: 10,
                        }}
                      >
                        <Ionicons
                          name={selecionado ? 'radio-button-on' : 'radio-button-off'}
                          size={18}
                          color={selecionado ? Theme.colors.accent : 'rgba(255,255,255,0.5)'}
                        />
                        <Text style={{ color: '#fff', fontSize: 14, flex: 1 }} numberOfLines={1}>
                          {evento.nome}
                        </Text>
                      </Pressable>
                      {index < eventos.length - 1 && (
                        <View style={{ height: 1, marginHorizontal: 16, backgroundColor: Theme.glass.border }} />
                      )}
                    </View>
                  );
                })}
              </View>
            </>
          )}

          <Text style={{ color: 'rgba(255,255,255,0.55)', fontSize: 11.5, fontWeight: '700', letterSpacing: 1, marginBottom: 10, textTransform: 'uppercase' }}>
            Mensagem
          </Text>
          <TextInput
            value={mensagem}
            onChangeText={setMensagem}
            placeholder="Ex: Atualizamos o horário do evento, confira!"
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
            <Ionicons name="send" size={18} color={Theme.colors.primaryDark} />
            <Text style={{ color: Theme.colors.primaryDark, fontWeight: '700', fontSize: 16 }}>
              {enviando ? 'Enviando...' : 'Enviar Notificação'}
            </Text>
          </Pressable>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}