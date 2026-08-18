import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Modal,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Theme } from '@/constants/theme';
import { atualizarEvento, excluirEvento } from '@/services/event-service';
import type { Evento } from '@/types/domain';

type Props = {
  event: Evento | null;
  visible: boolean;
  onClose: () => void;
  onSaved: (evento: Evento) => void;
  /** Chamado após excluir com sucesso — o chamador deve recarregar a lista. */
  onDeleted?: (id: number) => void;
};

type FormState = {
  nome: string;
  descricao: string;
  dataInicio: string;
  dataFim: string;
  cidade: string;
  linkExterno: string;
};

// yyyy-MM-ddTHH:mm — formato aceito pelo backend e usado no front web
function toInputDate(iso?: string | null) {
  if (!iso) return '';
  return iso.length >= 16 ? iso.slice(0, 16) : iso;
}

function Field({
  label,
  value,
  onChangeText,
  placeholder,
  multiline = false,
}: {
  label: string;
  value: string;
  onChangeText: (v: string) => void;
  placeholder?: string;
  multiline?: boolean;
}) {
  return (
    <View style={{ marginBottom: 14 }}>
      <Text
        style={{
          fontSize: 12.5,
          fontWeight: '700',
          color: Theme.light.textMuted,
          marginBottom: 6,
        }}
      >
        {label}
      </Text>
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor="#b0a09e"
        multiline={multiline}
        style={{
          backgroundColor: Theme.light.surfaceAlt,
          borderWidth: 1,
          borderColor: Theme.light.border,
          borderRadius: Theme.radius.sm,
          paddingHorizontal: 14,
          paddingVertical: multiline ? 12 : 11,
          fontSize: 14.5,
          color: Theme.light.text,
          minHeight: multiline ? 90 : undefined,
          textAlignVertical: multiline ? 'top' : 'center',
        }}
      />
    </View>
  );
}

export function EditEventModal({ event, visible, onClose, onSaved, onDeleted }: Props) {
  const [form, setForm] = useState<FormState>({
    nome: '',
    descricao: '',
    dataInicio: '',
    dataFim: '',
    cidade: '',
    linkExterno: '',
  });
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!event) return;
    setForm({
      nome: event.nome ?? '',
      descricao: event.descricao ?? '',
      dataInicio: toInputDate(event.dataInicio),
      dataFim: toInputDate(event.dataFim),
      cidade: event.cidade ?? '',
      linkExterno: event.linkExterno ?? '',
    });
    setError('');
  }, [event]);

  const handleDelete = () => {
    if (!event) return;
    Alert.alert(
      'Excluir evento',
      `Tem certeza que deseja excluir "${event.nome}"? Essa ação não pode ser desfeita.`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Excluir',
          style: 'destructive',
          onPress: async () => {
            setDeleting(true);
            setError('');
            try {
              await excluirEvento(event.id);
              onDeleted?.(event.id);
              onClose();
            } catch {
              setError('Não foi possível excluir o evento. Tente novamente.');
            } finally {
              setDeleting(false);
            }
          },
        },
      ]
    );
  };

  const handleSave = async () => {
    if (!event) return;
    if (!form.nome.trim()) {
      setError('O nome do evento é obrigatório.');
      return;
    }
    if (!form.cidade.trim()) {
      setError('A cidade é obrigatória.');
      return;
    }
    setError('');
    setSaving(true);
    try {
      const updated = await atualizarEvento(event.id, {
        nome: form.nome.trim(),
        descricao: form.descricao.trim() || null,
        dataInicio: form.dataInicio,
        dataFim: form.dataFim || null,
        cidade: form.cidade.trim(),
        linkExterno: form.linkExterno.trim() || null,
      });
      onSaved(updated);
      onClose();
    } catch {
      setError('Não foi possível salvar as alterações. Tente novamente.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View style={{ flex: 1, backgroundColor: 'rgba(30,20,18,0.45)', justifyContent: 'flex-end' }}>
        <View
          style={{
            backgroundColor: Theme.light.bg,
            borderTopLeftRadius: Theme.radius.lg,
            borderTopRightRadius: Theme.radius.lg,
            maxHeight: '90%',
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
                Editar evento
              </Text>
              <Pressable onPress={onClose} hitSlop={10}>
                <Ionicons name="close" size={22} color={Theme.light.textMuted} />
              </Pressable>
            </View>

            <ScrollView
              contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 16, paddingBottom: 16 }}
              keyboardShouldPersistTaps="handled"
            >
              {!!error && (
                <Text
                  style={{
                    color: Theme.colors.danger,
                    fontSize: 13,
                    fontWeight: '600',
                    marginBottom: 12,
                  }}
                >
                  {error}
                </Text>
              )}

              <Field label="Nome do evento" value={form.nome} onChangeText={(v) => setForm((f) => ({ ...f, nome: v }))} />
              <Field
                label="Descrição"
                value={form.descricao}
                onChangeText={(v) => setForm((f) => ({ ...f, descricao: v }))}
                multiline
              />
              <Field
                label="Início (AAAA-MM-DDTHH:mm)"
                value={form.dataInicio}
                onChangeText={(v) => setForm((f) => ({ ...f, dataInicio: v }))}
                placeholder="2026-08-15T19:00"
              />
              <Field
                label="Fim (opcional)"
                value={form.dataFim}
                onChangeText={(v) => setForm((f) => ({ ...f, dataFim: v }))}
                placeholder="2026-08-15T23:00"
              />
              <Field label="Cidade" value={form.cidade} onChangeText={(v) => setForm((f) => ({ ...f, cidade: v }))} />
              <Field
                label="Link externo (opcional)"
                value={form.linkExterno}
                onChangeText={(v) => setForm((f) => ({ ...f, linkExterno: v }))}
                placeholder="https://..."
              />

              <View style={{ flexDirection: 'row', gap: 10, marginTop: 6 }}>
                <Pressable
                  onPress={onClose}
                  disabled={saving}
                  style={({ pressed }) => ({
                    flex: 1,
                    paddingVertical: 13,
                    borderRadius: Theme.radius.pill,
                    alignItems: 'center',
                    backgroundColor: Theme.light.surfaceAlt,
                    opacity: pressed ? 0.8 : 1,
                  })}
                >
                  <Text style={{ color: Theme.light.text, fontWeight: '700' }}>Cancelar</Text>
                </Pressable>
                <Pressable
                  onPress={handleSave}
                  disabled={saving}
                  style={({ pressed }) => ({
                    flex: 1,
                    paddingVertical: 13,
                    borderRadius: Theme.radius.pill,
                    alignItems: 'center',
                    flexDirection: 'row',
                    justifyContent: 'center',
                    gap: 8,
                    backgroundColor: Theme.colors.primary,
                    opacity: pressed ? 0.85 : 1,
                  })}
                >
                  {saving && <ActivityIndicator size="small" color="#fff" />}
                  <Text style={{ color: '#fff', fontWeight: '700' }}>
                    {saving ? 'Salvando...' : 'Salvar alterações'}
                  </Text>
                </Pressable>
              </View>

              <Pressable
                onPress={handleDelete}
                disabled={saving || deleting}
                style={({ pressed }) => ({
                  flexDirection: 'row',
                  justifyContent: 'center',
                  alignItems: 'center',
                  gap: 8,
                  paddingVertical: 13,
                  borderRadius: Theme.radius.pill,
                  marginTop: 10,
                  backgroundColor: 'rgba(239,68,68,0.1)',
                  opacity: pressed ? 0.75 : deleting ? 0.6 : 1,
                })}
              >
                {deleting ? (
                  <ActivityIndicator size="small" color={Theme.colors.danger} />
                ) : (
                  <Ionicons name="trash-outline" size={16} color={Theme.colors.danger} />
                )}
                <Text style={{ color: Theme.colors.danger, fontWeight: '700', fontSize: 14 }}>
                  {deleting ? 'Excluindo...' : 'Excluir evento'}
                </Text>
              </Pressable>
            </ScrollView>
          </SafeAreaView>
        </View>
      </View>
    </Modal>
  );
}