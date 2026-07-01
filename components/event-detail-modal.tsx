import {
  ActivityIndicator,
  Image,
  Linking,
  Modal,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from 'react-native';
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

function formatDate(iso: string) {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleString('pt-BR', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function getImageSource(event: Evento) {
  if (!event.cardImage) return { uri: `https://picsum.photos/seed/evento-${event.id}/900/600` };
  if (event.cardImage.startsWith('http') || event.cardImage.startsWith('data:')) return { uri: event.cardImage };
  return { uri: `data:image/jpeg;base64,${event.cardImage}` };
}

function CommentAvatar({ name }: { name: string }) {
  return (
    <View
      style={{
        width: 30,
        height: 30,
        borderRadius: 15,
        backgroundColor: Theme.glass.bgMd,
        borderWidth: 1,
        borderColor: Theme.glass.border,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 8,
        flexShrink: 0,
      }}
    >
      <Text style={{ color: Theme.colors.accent, fontSize: 12, fontWeight: '700' }}>
        {name.charAt(0).toUpperCase()}
      </Text>
    </View>
  );
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
      .catch(() => { if (active) setDetail(event); })
      .finally(() => { if (active) setLoading(false); });

    return () => { active = false; };
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

  async function handleDeleteComment(id: number) {
    await excluirComentario(id);
    setComments((prev) => prev.filter((c) => c.id !== id));
  }

  if (!event || !selectedEvent) return null;

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

            {/* ── Imagem hero com aspectRatio ── */}
            <View style={{ aspectRatio: 16 / 9, position: 'relative' }}>
              <Image
                source={getImageSource(selectedEvent)}
                style={{ width: '100%', height: '100%' }}
                resizeMode="cover"
              />

              {/* Gradiente base */}
              <LinearGradient
                colors={['transparent', 'rgba(20,8,7,0.7)']}
                style={{ position: 'absolute', left: 0, right: 0, bottom: 0, height: '60%' }}
              />

              {/* Controles */}
              <View
                style={{
                  position: 'absolute',
                  top: 14,
                  left: 16,
                  right: 16,
                  flexDirection: 'row',
                  justifyContent: 'space-between',
                }}
              >
                <Pressable
                  onPress={onClose}
                  style={({ pressed }) => ({
                    backgroundColor: pressed ? 'rgba(15,5,4,0.65)' : 'rgba(15,5,4,0.42)',
                    borderRadius: 18,
                    padding: 8,
                    borderWidth: 1,
                    borderColor: Theme.glass.border,
                  })}
                >
                  <Ionicons name="arrow-back" size={18} color="#fff" />
                </Pressable>

                <Pressable
                  onPress={onFavorite}
                  style={({ pressed }) => ({
                    backgroundColor: pressed ? 'rgba(15,5,4,0.65)' : 'rgba(15,5,4,0.42)',
                    borderRadius: 18,
                    padding: 8,
                    borderWidth: 1,
                    borderColor: Theme.glass.border,
                    transform: [{ scale: pressed ? 0.88 : 1 }],
                  })}
                >
                  <Ionicons
                    name={isFavorited ? 'heart' : 'heart-outline'}
                    size={18}
                    color={isFavorited ? '#ff6b6b' : '#fff'}
                  />
                </Pressable>
              </View>

              {/* Badge categoria sobre a imagem */}
              <View
                style={{
                  position: 'absolute',
                  bottom: 14,
                  left: 16,
                  backgroundColor: Theme.colors.accent,
                  borderRadius: Theme.radius.pill,
                  paddingHorizontal: 10,
                  paddingVertical: 4,
                }}
              >
                <Text
                  style={{
                    color: Theme.colors.primaryDark,
                    fontSize: 10,
                    fontWeight: '700',
                    textTransform: 'uppercase',
                    letterSpacing: 0.5,
                  }}
                >
                  {category}
                </Text>
              </View>
            </View>

            {/* ── Conteúdo ── */}
            <View style={{ padding: 20 }}>

              {/* Título */}
              <Text
                style={{
                  color: '#fff',
                  fontSize: 22,
                  fontWeight: '800',
                  lineHeight: 28,
                  marginBottom: 16,
                  letterSpacing: 0.1,
                }}
              >
                {selectedEvent.nome}
              </Text>

              {loading && (
                <View style={{ marginBottom: 12 }}>
                  <ActivityIndicator color={Theme.colors.accent} size="small" />
                </View>
              )}

              {/* Info compacta: data + cidade */}
              <View
                style={{
                  backgroundColor: Theme.glass.bg,
                  borderRadius: Theme.radius.sm,
                  borderWidth: 1,
                  borderColor: Theme.glass.border,
                  paddingHorizontal: 14,
                  paddingVertical: 12,
                  gap: 10,
                  marginBottom: 20,
                }}
              >
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                  <Ionicons name="calendar-outline" size={14} color={Theme.colors.accent} />
                  <Text style={{ color: 'rgba(255,255,255,0.85)', fontSize: 13, flex: 1 }}>
                    {formatDate(selectedEvent.dataInicio)}
                    {selectedEvent.dataFim ? `  →  ${formatDate(selectedEvent.dataFim)}` : ''}
                  </Text>
                </View>
                <View style={{ height: 1, backgroundColor: 'rgba(255,255,255,0.07)' }} />
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                  <Ionicons name="location-outline" size={14} color={Theme.colors.accent} />
                  <Text style={{ color: 'rgba(255,255,255,0.85)', fontSize: 13, flex: 1 }}>
                    {selectedEvent.cidade}
                  </Text>
                </View>
              </View>

              {/* Descrição */}
              <Text
                style={{
                  color: 'rgba(255,255,255,0.75)',
                  fontSize: 14,
                  lineHeight: 22,
                  marginBottom: 20,
                }}
              >
                {selectedEvent.descricao || 'Este evento ainda não possui descrição.'}
              </Text>

              {/* Link externo */}
              {!!selectedEvent.linkExterno && (
                <Pressable
                  onPress={() => Linking.openURL(selectedEvent.linkExterno!)}
                  style={({ pressed }) => ({
                    flexDirection: 'row',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 8,
                    backgroundColor: pressed ? Theme.glass.bgMd : Theme.glass.bg,
                    borderWidth: 1,
                    borderColor: Theme.glass.border,
                    borderRadius: Theme.radius.pill,
                    paddingVertical: 11,
                    marginBottom: 20,
                  })}
                >
                  <Ionicons name="open-outline" size={15} color={Theme.colors.accent} />
                  <Text style={{ color: '#fff', fontWeight: '600', fontSize: 13 }}>
                    Abrir link do evento
                  </Text>
                </Pressable>
              )}

              {/* ── Comentários ── */}
              <View
                style={{
                  backgroundColor: Theme.glass.bg,
                  borderRadius: Theme.radius.md,
                  borderWidth: 1,
                  borderColor: Theme.glass.border,
                  padding: 16,
                  marginBottom: 20,
                }}
              >
                <Text
                  style={{
                    color: '#fff',
                    fontSize: 15,
                    fontWeight: '700',
                    marginBottom: 14,
                    letterSpacing: 0.1,
                  }}
                >
                  Comentários
                  {sortedComments.length > 0 && (
                    <Text style={{ color: Theme.colors.accent, fontWeight: '500' }}>
                      {' '}({sortedComments.length})
                    </Text>
                  )}
                </Text>

                {/* Input */}
                <View style={{ flexDirection: 'row', gap: 8, marginBottom: 16 }}>
                  <TextInput
                    value={commentText}
                    onChangeText={setCommentText}
                    placeholder="Escreva um comentário..."
                    placeholderTextColor="rgba(255,255,255,0.35)"
                    style={{
                      flex: 1,
                      minHeight: 40,
                      color: '#fff',
                      borderWidth: 1,
                      borderColor: Theme.glass.border,
                      borderRadius: Theme.radius.sm,
                      paddingHorizontal: 12,
                      paddingVertical: 8,
                      backgroundColor: Theme.glass.bgMd,
                      fontSize: 13,
                    }}
                  />
                  <Pressable
                    onPress={handleCreateComment}
                    disabled={!canSubmitComment}
                    style={({ pressed }) => ({
                      width: 40,
                      height: 40,
                      borderRadius: 20,
                      alignItems: 'center',
                      justifyContent: 'center',
                      backgroundColor: Theme.colors.accent,
                      opacity: canSubmitComment ? (pressed ? 0.7 : 1) : 0.35,
                      transform: [{ scale: pressed ? 0.9 : 1 }],
                    })}
                  >
                    {commentLoading ? (
                      <ActivityIndicator color={Theme.colors.primaryDark} size="small" />
                    ) : (
                      <Ionicons name="send" size={15} color={Theme.colors.primaryDark} />
                    )}
                  </Pressable>
                </View>

                {/* Lista de comentários */}
                {sortedComments.length === 0 ? (
                  <Text style={{ color: 'rgba(255,255,255,0.4)', fontSize: 13 }}>
                    Nenhum comentário ainda. Seja o primeiro!
                  </Text>
                ) : (
                  sortedComments.map((comment) => {
                    const canDelete = user?.id && comment.usuario?.id === user.id;
                    const authorName = comment.usuario?.nome ?? 'Usuário';
                    return (
                      <View
                        key={comment.id}
                        style={{
                          paddingTop: 12,
                          borderTopWidth: 1,
                          borderTopColor: 'rgba(255,255,255,0.07)',
                        }}
                      >
                        <View style={{ flexDirection: 'row', alignItems: 'flex-start' }}>
                          <CommentAvatar name={authorName} />
                          <View style={{ flex: 1 }}>
                            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 3 }}>
                              <Text style={{ color: '#fff', fontWeight: '700', fontSize: 12.5, flex: 1 }}>
                                {authorName}
                              </Text>
                              {canDelete && (
                                <Pressable
                                  onPress={() => handleDeleteComment(comment.id)}
                                  hitSlop={10}
                                  style={({ pressed }) => ({ opacity: pressed ? 0.6 : 1 })}
                                >
                                  <Ionicons name="trash-outline" size={13} color={Theme.colors.danger} />
                                </Pressable>
                              )}
                            </View>
                            <Text style={{ color: 'rgba(255,255,255,0.7)', fontSize: 13, lineHeight: 19 }}>
                              {comment.texto}
                            </Text>
                          </View>
                        </View>
                      </View>
                    );
                  })
                )}
              </View>

              {/* Fechar */}
              <Pressable
                onPress={onClose}
                style={({ pressed }) => ({
                  backgroundColor: pressed ? Theme.colors.accentDark : Theme.colors.accent,
                  borderRadius: Theme.radius.pill,
                  paddingVertical: 14,
                  alignItems: 'center',
                  shadowColor: Theme.colors.accent,
                  shadowOpacity: 0.35,
                  shadowRadius: 10,
                  shadowOffset: { width: 0, height: 4 },
                  elevation: 6,
                  boxShadow: '0px 4px 10px rgba(212,163,115,0.35)',
                })}
              >
                <Text style={{ color: Theme.colors.primaryDark, fontWeight: '700', fontSize: 14 }}>
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
