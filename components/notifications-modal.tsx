import { useEffect } from 'react';
import { ActivityIndicator, FlatList, Modal, Pressable, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Theme } from '@/constants/theme';
import type { Notificacao } from '@/services/notification-service';

type Props = {
  visible: boolean;
  onClose: () => void;
  notificacoes: Notificacao[];
  carregando: boolean;
  onAbrir: () => void; // busca a lista — chamado toda vez que o modal abre
  onPressNotificacao: (n: Notificacao) => void;
  onLerTodas: () => void;
};

const ICONES_TIPO: Record<string, keyof typeof Ionicons.glyphMap> = {
  COMENTARIO: 'chatbubble-ellipses',
  EVENTO_PROXIMO: 'alarm',
};

function formatarDataRelativa(dataStr: string) {
  const agora = new Date();
  const data = new Date(dataStr);
  const diffMin = Math.floor((agora.getTime() - data.getTime()) / 60000);
  if (diffMin < 1) return 'agora';
  if (diffMin < 60) return `há ${diffMin} min`;
  const diffH = Math.floor(diffMin / 60);
  if (diffH < 24) return `há ${diffH}h`;
  const diffD = Math.floor(diffH / 24);
  if (diffD < 7) return `há ${diffD}d`;
  return data.toLocaleDateString('pt-BR');
}

export function NotificationsModal({
  visible,
  onClose,
  notificacoes,
  carregando,
  onAbrir,
  onPressNotificacao,
  onLerTodas,
}: Props) {
  useEffect(() => {
    if (visible) onAbrir();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visible]);

  const temNaoLidas = notificacoes.some((n) => !n.lida);

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View style={{ flex: 1, backgroundColor: 'rgba(30,20,18,0.45)', justifyContent: 'flex-end' }}>
        <View
          style={{
            backgroundColor: Theme.light.bg,
            borderTopLeftRadius: Theme.radius.lg,
            borderTopRightRadius: Theme.radius.lg,
            maxHeight: '80%',
          }}
        >
          <SafeAreaView edges={['bottom']}>
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'space-between',
                paddingHorizontal: 20,
                paddingTop: 18,
                paddingBottom: 12,
                borderBottomWidth: 1,
                borderBottomColor: Theme.light.border,
              }}
            >
              <Text style={{ fontSize: 17, fontWeight: '800', color: Theme.light.text }}>
                Notificações
              </Text>
              <Pressable onPress={onClose} hitSlop={10}>
                <Ionicons name="close" size={22} color={Theme.light.textMuted} />
              </Pressable>
            </View>

            {temNaoLidas && (
              <Pressable
                onPress={onLerTodas}
                style={({ pressed }) => ({
                  paddingHorizontal: 20,
                  paddingVertical: 10,
                  opacity: pressed ? 0.7 : 1,
                })}
              >
                <Text style={{ color: Theme.colors.primary, fontSize: 12.5, fontWeight: '700', textAlign: 'right' }}>
                  Marcar todas como lidas
                </Text>
              </Pressable>
            )}

            {carregando ? (
              <View style={{ paddingVertical: 40, alignItems: 'center' }}>
                <ActivityIndicator color={Theme.colors.primary} />
              </View>
            ) : notificacoes.length === 0 ? (
              <View style={{ paddingVertical: 40, alignItems: 'center', gap: 8 }}>
                <Ionicons name="notifications-off-outline" size={26} color={Theme.light.textMuted} />
                <Text style={{ color: Theme.light.textMuted, fontSize: 13 }}>
                  Nenhuma notificação por aqui ainda.
                </Text>
              </View>
            ) : (
              <FlatList
                data={notificacoes}
                keyExtractor={(item) => String(item.id)}
                contentContainerStyle={{ paddingBottom: 16 }}
                renderItem={({ item }) => (
                  <Pressable
                    onPress={() => onPressNotificacao(item)}
                    style={({ pressed }) => ({
                      flexDirection: 'row',
                      alignItems: 'flex-start',
                      gap: 12,
                      paddingHorizontal: 20,
                      paddingVertical: 13,
                      backgroundColor: item.lida
                        ? pressed ? Theme.light.surfaceAlt : 'transparent'
                        : pressed ? 'rgba(212,163,115,0.18)' : 'rgba(212,163,115,0.08)',
                      borderBottomWidth: 1,
                      borderBottomColor: Theme.light.border,
                    })}
                  >
                    <View
                      style={{
                        width: 32,
                        height: 32,
                        borderRadius: 16,
                        backgroundColor: 'rgba(212,163,115,0.18)',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <Ionicons
                        name={ICONES_TIPO[item.tipo] ?? 'information-circle'}
                        size={15}
                        color={Theme.colors.accent}
                      />
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={{ color: Theme.light.text, fontSize: 13.5, lineHeight: 19 }}>
                        {item.mensagem}
                      </Text>
                      <Text style={{ color: Theme.light.textMuted, fontSize: 11.5, marginTop: 3 }}>
                        {formatarDataRelativa(item.dataCriacao)}
                      </Text>
                    </View>
                    {!item.lida && (
                      <View
                        style={{
                          width: 8,
                          height: 8,
                          borderRadius: 4,
                          backgroundColor: Theme.colors.accent,
                          marginTop: 5,
                        }}
                      />
                    )}
                  </Pressable>
                )}
              />
            )}
          </SafeAreaView>
        </View>
      </View>
    </Modal>
  );
}
