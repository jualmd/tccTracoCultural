import { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Pressable, ScrollView, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Theme } from '@/constants/theme';
import {
  editarEnvioNotificacao,
  enviarNotificacaoGeral,
  excluirEnvioNotificacao,
  listarEnviosNotificacao,
  type EnvioNotificacao,
} from '@/services/notification-service';

const LIMITE_CARACTERES = 5000;

const SUGESTOES = [
  'A plataforma passará por manutenção programada às 22h.',
  'Novidade no ar! Confira os novos recursos do TraçoCultural.',
  'Lembrete: revise seus eventos favoritos para não perder nenhum.',
];

function formatarData(iso: string) {
  const d = new Date(iso);
  return `${d.toLocaleDateString('pt-BR')} às ${d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}`;
}

export default function AdminNotificacoes() {
  const router = useRouter();
  const [mensagem, setMensagem] = useState('');
  const [enviando, setEnviando] = useState(false);

  const [historico, setHistorico] = useState<EnvioNotificacao[]>([]);
  const [carregandoHistorico, setCarregandoHistorico] = useState(true);

  const [editandoId, setEditandoId] = useState<number | null>(null);
  const [textoEdicao, setTextoEdicao] = useState('');
  const [salvandoEdicao, setSalvandoEdicao] = useState(false);
  const [excluindoId, setExcluindoId] = useState<number | null>(null);

  const restantes = LIMITE_CARACTERES - mensagem.length;
  const podeEnviar = mensagem.trim().length > 0 && restantes >= 0 && !enviando;

  const carregarHistorico = useCallback(() => {
    setCarregandoHistorico(true);
    listarEnviosNotificacao()
      .then((data) => setHistorico(data.filter((e) => e.tipo === 'GERAL')))
      .catch(() => setHistorico([]))
      .finally(() => setCarregandoHistorico(false));
  }, []);

  useEffect(() => {
    carregarHistorico();
  }, [carregarHistorico]);

  const handleEnviar = useCallback(async () => {
    const texto = mensagem.trim();
    if (!texto) {
      Alert.alert('Ops', 'Escreva uma mensagem antes de enviar.');
      return;
    }
    if (texto.length > LIMITE_CARACTERES) {
      Alert.alert('Ops', `A mensagem excede o limite de ${LIMITE_CARACTERES} caracteres.`);
      return;
    }

    setEnviando(true);
    try {
      const resultado = await enviarNotificacaoGeral(texto);
      Alert.alert(
        'Enviado!',
        `Notificação enviada para ${resultado.totalEnviado} ${resultado.totalEnviado === 1 ? 'pessoa' : 'pessoas'}.`
      );
      setMensagem('');
      carregarHistorico();
    } catch (error: any) {
      Alert.alert('Erro', error.response?.data?.message ?? 'Não foi possível enviar a notificação. Tente novamente.');
    } finally {
      setEnviando(false);
    }
  }, [mensagem, carregarHistorico]);

  const iniciarEdicao = useCallback((envio: EnvioNotificacao) => {
    setEditandoId(envio.id);
    setTextoEdicao(envio.mensagem);
  }, []);

  const cancelarEdicao = useCallback(() => {
    setEditandoId(null);
    setTextoEdicao('');
  }, []);

  const salvarEdicao = useCallback(async (id: number) => {
    const texto = textoEdicao.trim();
    if (!texto) {
      Alert.alert('Ops', 'A mensagem não pode ficar vazia.');
      return;
    }
    setSalvandoEdicao(true);
    try {
      const atualizado = await editarEnvioNotificacao(id, texto);
      setHistorico((prev) => prev.map((e) => (e.id === id ? atualizado : e)));
      cancelarEdicao();
    } catch (error: any) {
      Alert.alert('Erro', error.response?.data?.message ?? 'Erro ao editar o envio.');
    } finally {
      setSalvandoEdicao(false);
    }
  }, [textoEdicao, cancelarEdicao]);

  const excluirEnvio = useCallback((id: number) => {
    Alert.alert(
      'Excluir envio',
      'Excluir esse envio? Ele também some da lista de notificações de quem recebeu.',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Excluir',
          style: 'destructive',
          onPress: async () => {
            setExcluindoId(id);
            try {
              await excluirEnvioNotificacao(id);
              setHistorico((prev) => prev.filter((e) => e.id !== id));
            } catch (error: any) {
              Alert.alert('Erro', error.response?.data?.message ?? 'Erro ao excluir o envio.');
            } finally {
              setExcluindoId(null);
            }
          },
        },
      ]
    );
  }, []);

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
              Notificações
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
            específico, isso é feito direto na tela de edição desse evento (Meus Eventos → editar).
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
            maxLength={LIMITE_CARACTERES + 500}
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
            }}
          />
          <Text
            style={{
              color: restantes < 0 ? '#f87171' : 'rgba(255,255,255,0.45)',
              fontSize: 11.5,
              textAlign: 'right',
              marginTop: 6,
              marginBottom: 18,
            }}
          >
            {mensagem.length}/{LIMITE_CARACTERES}
          </Text>

          <Text style={{ color: 'rgba(255,255,255,0.55)', fontSize: 11.5, fontWeight: '700', letterSpacing: 1, marginBottom: 10, textTransform: 'uppercase' }}>
            Sugestões rápidas
          </Text>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 24 }}>
            {SUGESTOES.map((s) => (
              <Pressable
                key={s}
                onPress={() => setMensagem(s)}
                disabled={enviando}
                style={({ pressed }) => ({
                  backgroundColor: Theme.glass.bg,
                  borderRadius: Theme.radius.pill,
                  borderWidth: 1,
                  borderColor: Theme.glass.border,
                  paddingVertical: 8,
                  paddingHorizontal: 14,
                  opacity: pressed ? 0.7 : 1,
                  maxWidth: '100%',
                })}
              >
                <Text style={{ color: 'rgba(255,255,255,0.8)', fontSize: 12 }} numberOfLines={1}>
                  {s}
                </Text>
              </Pressable>
            ))}
          </View>

          <Pressable
            onPress={handleEnviar}
            disabled={!podeEnviar}
            style={({ pressed }) => ({
              backgroundColor: Theme.colors.accent,
              borderRadius: Theme.radius.pill,
              paddingVertical: 15,
              alignItems: 'center',
              flexDirection: 'row',
              justifyContent: 'center',
              gap: 8,
              opacity: pressed || !podeEnviar ? 0.7 : 1,
              marginBottom: 32,
            })}
          >
            <Ionicons name="megaphone" size={18} color={Theme.colors.primaryDark} />
            <Text style={{ color: Theme.colors.primaryDark, fontWeight: '700', fontSize: 16 }}>
              {enviando ? 'Enviando...' : 'Enviar pra todos'}
            </Text>
          </Pressable>

          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 14 }}>
            <Ionicons name="time-outline" size={16} color="rgba(255,255,255,0.6)" />
            <Text style={{ color: 'rgba(255,255,255,0.6)', fontSize: 11.5, fontWeight: '700', letterSpacing: 1, textTransform: 'uppercase' }}>
              Notificações enviadas
            </Text>
          </View>

          {carregandoHistorico ? (
            <View style={{ paddingVertical: 24, alignItems: 'center' }}>
              <ActivityIndicator color={Theme.colors.accent} />
            </View>
          ) : historico.length === 0 ? (
            <Text style={{ color: 'rgba(255,255,255,0.45)', fontSize: 13 }}>
              Nenhuma notificação geral enviada ainda.
            </Text>
          ) : (
            <View style={{ gap: 12 }}>
              {historico.map((h) => (
                <View
                  key={h.id}
                  style={{
                    backgroundColor: Theme.glass.bg,
                    borderRadius: Theme.radius.md,
                    borderWidth: 1,
                    borderColor: Theme.glass.border,
                    padding: 14,
                  }}
                >
                  <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                    <View
                      style={{
                        flexDirection: 'row',
                        alignItems: 'center',
                        gap: 5,
                        backgroundColor: 'rgba(34,197,94,0.18)',
                        borderRadius: Theme.radius.pill,
                        paddingVertical: 4,
                        paddingHorizontal: 10,
                      }}
                    >
                      <Ionicons name="checkmark-circle" size={13} color={Theme.colors.success} />
                      <Text style={{ color: Theme.colors.success, fontSize: 11.5, fontWeight: '700' }}>
                        {h.totalDestinatarios} envio(s)
                      </Text>
                    </View>
                    <Text style={{ color: 'rgba(255,255,255,0.45)', fontSize: 11 }}>
                      {formatarData(h.dataCriacao)}
                      {h.dataAtualizacao ? ' · editado' : ''}
                    </Text>
                  </View>

                  {editandoId === h.id ? (
                    <>
                      <TextInput
                        value={textoEdicao}
                        onChangeText={setTextoEdicao}
                        multiline
                        numberOfLines={3}
                        maxLength={LIMITE_CARACTERES}
                        style={{
                          backgroundColor: 'rgba(0,0,0,0.18)',
                          borderRadius: Theme.radius.sm,
                          borderWidth: 1,
                          borderColor: Theme.glass.border,
                          color: '#fff',
                          fontSize: 13.5,
                          padding: 10,
                          minHeight: 70,
                          textAlignVertical: 'top',
                          marginBottom: 10,
                        }}
                      />
                      <View style={{ flexDirection: 'row', gap: 8 }}>
                        <Pressable
                          onPress={() => salvarEdicao(h.id)}
                          disabled={salvandoEdicao}
                          style={({ pressed }) => ({
                            backgroundColor: Theme.colors.accent,
                            borderRadius: Theme.radius.sm,
                            paddingVertical: 8,
                            paddingHorizontal: 14,
                            opacity: pressed || salvandoEdicao ? 0.7 : 1,
                          })}
                        >
                          <Text style={{ color: Theme.colors.primaryDark, fontWeight: '700', fontSize: 12.5 }}>
                            {salvandoEdicao ? 'Salvando...' : 'Salvar'}
                          </Text>
                        </Pressable>
                        <Pressable
                          onPress={cancelarEdicao}
                          disabled={salvandoEdicao}
                          style={({ pressed }) => ({
                            backgroundColor: 'transparent',
                            borderRadius: Theme.radius.sm,
                            borderWidth: 1,
                            borderColor: Theme.glass.border,
                            paddingVertical: 8,
                            paddingHorizontal: 14,
                            opacity: pressed ? 0.7 : 1,
                          })}
                        >
                          <Text style={{ color: 'rgba(255,255,255,0.8)', fontWeight: '700', fontSize: 12.5 }}>
                            Cancelar
                          </Text>
                        </Pressable>
                      </View>
                    </>
                  ) : (
                    <>
                      <Text style={{ color: 'rgba(255,255,255,0.85)', fontSize: 13.5, lineHeight: 19, marginBottom: 10 }}>
                        {h.mensagem}
                      </Text>
                      <View style={{ flexDirection: 'row', gap: 8 }}>
                        <Pressable
                          onPress={() => iniciarEdicao(h)}
                          style={({ pressed }) => ({
                            flexDirection: 'row',
                            alignItems: 'center',
                            gap: 5,
                            backgroundColor: 'transparent',
                            borderRadius: Theme.radius.sm,
                            borderWidth: 1,
                            borderColor: Theme.glass.border,
                            paddingVertical: 7,
                            paddingHorizontal: 12,
                            opacity: pressed ? 0.7 : 1,
                          })}
                        >
                          <Ionicons name="pencil" size={13} color="rgba(255,255,255,0.8)" />
                          <Text style={{ color: 'rgba(255,255,255,0.8)', fontWeight: '700', fontSize: 12 }}>
                            Editar
                          </Text>
                        </Pressable>
                        <Pressable
                          onPress={() => excluirEnvio(h.id)}
                          disabled={excluindoId === h.id}
                          style={({ pressed }) => ({
                            flexDirection: 'row',
                            alignItems: 'center',
                            gap: 5,
                            backgroundColor: 'rgba(239,68,68,0.14)',
                            borderRadius: Theme.radius.sm,
                            paddingVertical: 7,
                            paddingHorizontal: 12,
                            opacity: pressed || excluindoId === h.id ? 0.7 : 1,
                          })}
                        >
                          <Ionicons name="trash" size={13} color={Theme.colors.danger} />
                          <Text style={{ color: Theme.colors.danger, fontWeight: '700', fontSize: 12 }}>
                            {excluindoId === h.id ? 'Excluindo...' : 'Excluir'}
                          </Text>
                        </Pressable>
                      </View>
                    </>
                  )}
                </View>
              ))}
            </View>
          )}
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}