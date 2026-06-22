import { ActivityIndicator, Image, Linking, Modal, Pressable, ScrollView, Text, TextInput, View } from 'react-native';
import { useEffect, useMemo, useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { Theme } from '@/constants/theme';
import { criarComentario, excluirComentario, listarComentarios } from '@/services/comment-service';
import { getEventoPorId } from '@/services/event-service';
import type { Comentario, Evento } from '@/types/domain';
import { useAuth } from '@/contexts/auth-context';

type Props = {
  event: Evento | null;
  visible: boolean;
  onClose: () => void;
  onFavorite: () => void;
  isFavorited: boolean;
};

function formatEventDate(event: Evento) {
  const start = new Date(event.dataInicio);
  if (Number.isNaN(start.getTime())) return event.dataInicio;
  const startText = start.toLocaleString('pt-BR', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  if (!event.dataFim) return startText;
  const end = new Date(event.dataFim);
  if (Number.isNaN(end.getTime())) return startText;
  return `${startText} a ${end.toLocaleString('pt-BR', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })}`;
}

function getImageSource(event: Evento) {
  if (!event.cardImage) return { uri: `https://picsum.photos/seed/evento-${event.id}/900/600` };
  if (event.cardImage.startsWith('http') || event.cardImage.startsWith('data:')) return { uri: event.cardImage };
  return { uri: `data:image/jpeg;base64,${event.cardImage}` };
}

export function EventDetailModal({ event, visible, onClose, onFavorite, isFavorited }: Props) {
  const [detail, setDetail] = useState<Evento | null>(event);
  const [comments, setComments] = useState<Comentario[]>([]);
  const [commentText, setCommentText] = useState('');
  const [loading, setLoading] = useState(false);
  const [commentLoading, setCommentLoading] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    setDetail(event);
    if (!visible || !event) return;

    let active = true;
    setLoading(true);
    Promise.all([getEventoPorId(event.id), listarComentarios(event.id)])
      .then(([evento, comentarios]) => {
        if (!active) return;
        setDetail(evento);
        setComments(comentarios);
      })
      .catch(() => {
        if (active) setDetail(event);
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [event, visible]);

  const selectedEvent = detail ?? event;
  const category = selectedEvent?.categoria?.nome ?? 'Cultura';
  const canSubmitComment = commentText.trim().length > 0 && !commentLoading;

  const sortedComments = useMemo(
    () => [...comments].sort((a, b) => Number(new Date(b.dataCriacao ?? 0)) - Number(new Date(a.dataCriacao ?? 0))),
    [comments]
  );

  async function handleCreateComment() {
    if (!selectedEvent || !canSubmitComment) return;
    setCommentLoading(true);
    try {
      const created = await criarComentario(selectedEvent.id, commentText.trim());
      setComments((prev) => [created, ...prev]);
      setCommentText('');
    } finally {
      setCommentLoading(false);
    }
  }

  async function handleDeleteComment(commentId: number) {
    await excluirComentario(commentId);
    setComments((prev) => prev.filter((comment) => comment.id !== commentId));
  }

  if (!event) return null;
  if (!selectedEvent) return null;

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <LinearGradient
        colors={Theme.gradient.primary}
        style={{ flex: 1 }}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <SafeAreaView style={{ flex: 1 }}>
          <ScrollView showsVerticalScrollIndicator={false} bounces>
            {/* Imagem full-width */}
            <View style={{ position: 'relative' }}>
              <Image
                source={getImageSource(selectedEvent)}
                style={{ width: '100%', height: 280 }}
                resizeMode="cover"
              />

              {/* Overlay de gradiente na base da imagem, igual ao hero do web */}
              <LinearGradient
                colors={['transparent', 'rgba(20,8,7,0.65)']}
                style={{
                  position: 'absolute',
                  left: 0,
                  right: 0,
                  bottom: 0,
                  height: 110,
                }}
              />

              {/* Botões sobre a imagem */}
              <View
                style={{
                  position: 'absolute',
                  top: 16,
                  left: 16,
                  right: 16,
                  flexDirection: 'row',
                  justifyContent: 'space-between',
                }}
              >
                <Pressable
                  onPress={onClose}
                  style={({ pressed }) => ({
                    backgroundColor: pressed ? 'rgba(20,8,7,0.6)' : 'rgba(20,8,7,0.42)',
                    borderRadius: 20,
                    padding: 9,
                    borderWidth: 1,
                    borderColor: Theme.glass.border,
                  })}
                >
                  <Ionicons name="arrow-back" size={20} color="#fff" />
                </Pressable>

                <Pressable
                  onPress={onFavorite}
                  style={({ pressed }) => ({
                    backgroundColor: pressed ? 'rgba(20,8,7,0.6)' : 'rgba(20,8,7,0.42)',
                    borderRadius: 20,
                    padding: 9,
                    borderWidth: 1,
                    borderColor: Theme.glass.border,
                  })}
                >
                  <Ionicons
                    name={isFavorited ? 'heart' : 'heart-outline'}
                    size={20}
                    color={isFavorited ? '#ff6b6b' : '#fff'}
                  />
                </Pressable>
              </View>
            </View>

            {/* Conteúdo */}
            <View style={{ padding: 22, marginTop: -28 }}>
              {/* Badge categoria */}
              <View
                style={{
                  alignSelf: 'flex-start',
                  backgroundColor: Theme.colors.accent,
                  borderRadius: Theme.radius.pill,
                  paddingHorizontal: 13,
                  paddingVertical: 5,
                  marginBottom: 14,
                  ...Theme.shadow.accent,
                }}
              >
                <Text
                  style={{
                    color: Theme.colors.primaryDark,
                    fontSize: 11.5,
                    fontWeight: '700',
                    textTransform: 'uppercase',
                    letterSpacing: 0.5,
                  }}
                >
                  {category}
                </Text>
              </View>

              {/* Título */}
              <Text
                style={{ color: '#fff', fontSize: 25, fontWeight: '800', marginBottom: 18, lineHeight: 31 }}
              >
                {selectedEvent.nome}
              </Text>

              {loading && (
                <View style={{ alignItems: 'flex-start', marginBottom: 14 }}>
                  <ActivityIndicator color={Theme.colors.accent} />
                </View>
              )}

              {/* Data e local */}
              <View
                style={{
                  backgroundColor: Theme.glass.bg,
                  borderRadius: Theme.radius.md,
                  borderWidth: 1,
                  borderColor: Theme.glass.border,
                  padding: 16,
                  gap: 12,
                  marginBottom: 22,
                }}
              >
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                  <View
                    style={{
                      width: 30,
                      height: 30,
                      borderRadius: 9,
                      backgroundColor: Theme.glass.bgMd,
                      justifyContent: 'center',
                      alignItems: 'center',
                    }}
                  >
                    <Ionicons name="calendar-outline" size={15} color={Theme.colors.accent} />
                  </View>
                  <Text style={{ color: '#fff', fontSize: 14, fontWeight: '500', flex: 1 }}>
                    {formatEventDate(selectedEvent)}
                  </Text>
                </View>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                  <View
                    style={{
                      width: 30,
                      height: 30,
                      borderRadius: 9,
                      backgroundColor: Theme.glass.bgMd,
                      justifyContent: 'center',
                      alignItems: 'center',
                    }}
                  >
                    <Ionicons name="location-outline" size={15} color={Theme.colors.accent} />
                  </View>
                  <Text style={{ color: '#fff', fontSize: 14, fontWeight: '500', flex: 1 }}>
                    {selectedEvent.cidade}
                  </Text>
                </View>
              </View>

              {/* Descrição */}
              <Text
                style={{
                  color: 'rgba(255,255,255,0.85)',
                  fontSize: 15,
                  lineHeight: 24,
                  marginBottom: 32,
                }}
              >
                {selectedEvent.descricao || 'Este evento ainda não possui descrição.'}
              </Text>

              {!!selectedEvent.linkExterno && (
                <Pressable
                  onPress={() => Linking.openURL(selectedEvent.linkExterno!)}
                  style={({ pressed }) => ({
                    backgroundColor: pressed ? Theme.glass.bgMd : Theme.glass.bg,
                    borderWidth: 1,
                    borderColor: Theme.glass.border,
                    borderRadius: Theme.radius.pill,
                    paddingVertical: 12,
                    paddingHorizontal: 16,
                    flexDirection: 'row',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 8,
                    marginBottom: 24,
                  })}
                >
                  <Ionicons name="open-outline" size={18} color={Theme.colors.accent} />
                  <Text style={{ color: '#fff', fontWeight: '700' }}>Abrir link do evento</Text>
                </Pressable>
              )}

              <View
                style={{
                  backgroundColor: Theme.glass.bg,
                  borderRadius: Theme.radius.md,
                  borderWidth: 1,
                  borderColor: Theme.glass.border,
                  padding: 16,
                  marginBottom: 24,
                }}
              >
                <Text style={{ color: '#fff', fontSize: 17, fontWeight: '800', marginBottom: 12 }}>
                  Comentários
                </Text>

                <View style={{ flexDirection: 'row', gap: 8, marginBottom: 16 }}>
                  <TextInput
                    value={commentText}
                    onChangeText={setCommentText}
                    placeholder="Escreva um comentário..."
                    placeholderTextColor="rgba(255,255,255,0.45)"
                    style={{
                      flex: 1,
                      minHeight: 42,
                      color: '#fff',
                      borderWidth: 1,
                      borderColor: Theme.glass.border,
                      borderRadius: Theme.radius.md,
                      paddingHorizontal: 12,
                      backgroundColor: Theme.glass.bgMd,
                    }}
                  />
                  <Pressable
                    onPress={handleCreateComment}
                    disabled={!canSubmitComment}
                    style={({ pressed }) => ({
                      width: 44,
                      height: 44,
                      borderRadius: 22,
                      alignItems: 'center',
                      justifyContent: 'center',
                      opacity: canSubmitComment ? (pressed ? 0.7 : 1) : 0.45,
                      backgroundColor: Theme.colors.accent,
                    })}
                  >
                    {commentLoading ? (
                      <ActivityIndicator color={Theme.colors.primaryDark} />
                    ) : (
                      <Ionicons name="send" size={18} color={Theme.colors.primaryDark} />
                    )}
                  </Pressable>
                </View>

                {sortedComments.length === 0 ? (
                  <Text style={{ color: 'rgba(255,255,255,0.58)', lineHeight: 20 }}>
                    Nenhum comentário ainda.
                  </Text>
                ) : (
                  sortedComments.map((comment) => {
                    const canDelete = user?.id && comment.usuario?.id === user.id;
                    return (
                      <View
                        key={comment.id}
                        style={{
                          paddingVertical: 12,
                          borderTopWidth: 1,
                          borderTopColor: 'rgba(255,255,255,0.1)',
                        }}
                      >
                        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 4 }}>
                          <Text style={{ color: '#fff', fontWeight: '800', flex: 1 }}>
                            {comment.usuario?.nome ?? 'Usuário'}
                          </Text>
                          {canDelete && (
                            <Pressable onPress={() => handleDeleteComment(comment.id)} hitSlop={8}>
                              <Ionicons name="trash-outline" size={16} color={Theme.colors.danger} />
                            </Pressable>
                          )}
                        </View>
                        <Text style={{ color: 'rgba(255,255,255,0.76)', lineHeight: 20 }}>
                          {comment.texto}
                        </Text>
                      </View>
                    );
                  })
                )}
              </View>

              {/* Botão fechar */}
              <Pressable
                onPress={onClose}
                style={({ pressed }) => ({
                  backgroundColor: pressed ? Theme.colors.accentDark : Theme.colors.accent,
                  borderRadius: Theme.radius.pill,
                  paddingVertical: 15,
                  alignItems: 'center',
                  ...Theme.shadow.accent,
                })}
              >
                <Text style={{ color: Theme.colors.primaryDark, fontWeight: '700', fontSize: 15 }}>
                  Fechar
                </Text>
              </Pressable>
            </View>
          </ScrollView>
        </SafeAreaView>
      </LinearGradient>
    </Modal>
  );
}
