import { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Theme } from '@/constants/theme';
import { useAuth } from '@/contexts/auth-context';
import { reenviarCodigo, verificarCodigoCadastro } from '@/services/auth-service';

const TAMANHO_CODIGO = 6;
const TEMPO_REENVIO = 60;

export default function VerificarCodigo() {
  const params = useLocalSearchParams<{ email?: string; origem?: string }>();
  const router = useRouter();
  const { login } = useAuth();

  const [email] = useState(params.email ?? '');
  const [codigo, setCodigo] = useState('');
  const [erro, setErro] = useState('');
  const [loading, setLoading] = useState(false);
  const [sucesso, setSucesso] = useState(false);
  const [reenviando, setReenviando] = useState(false);
  const [reenviado, setReenviado] = useState(false);
  const [contador, setContador] = useState(TEMPO_REENVIO);
  const inputRef = useRef<TextInput>(null);

  useEffect(() => {
    // Se veio de um login bloqueado (email não confirmado), o código do
    // cadastro pode ter expirado -- reenvia um novo automaticamente.
    if (params.origem === 'login' && email) {
      reenviarCodigo(email).catch(() => {});
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (contador <= 0) return;
    const timer = setTimeout(() => setContador((c) => c - 1), 1000);
    return () => clearTimeout(timer);
  }, [contador]);

  const digitos = codigo.padEnd(TAMANHO_CODIGO, ' ').split('');

  async function handleConfirmar() {
    if (codigo.length < TAMANHO_CODIGO) {
      setErro('Digite o código completo de 6 dígitos.');
      return;
    }
    setErro('');
    setLoading(true);
    try {
      const payload = await verificarCodigoCadastro(email, codigo);
      setSucesso(true);
      await login(payload);
      setTimeout(() => router.replace('/(tabs)'), 900);
    } catch (err: any) {
      const status = err.response?.status;
      const msg = err.response?.data?.message;
      setErro(status === 400 || status === 401 ? (msg ?? 'Código inválido ou expirado.') : (msg ?? 'Erro ao verificar o código.'));
      setCodigo('');
      inputRef.current?.focus();
    } finally {
      setLoading(false);
    }
  }

  async function handleReenviar() {
    if (!email) return;
    setErro('');
    setReenviando(true);
    try {
      await reenviarCodigo(email);
      setReenviado(true);
      setContador(TEMPO_REENVIO);
      setCodigo('');
      setTimeout(() => setReenviado(false), 4000);
    } catch (err: any) {
      setErro(err.response?.data?.message ?? 'Não foi possível reenviar o código.');
    } finally {
      setReenviando(false);
    }
  }

  return (
    <View style={{ flex: 1, backgroundColor: Theme.light.bg }}>
      <SafeAreaView style={{ flex: 1 }}>
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
          <ScrollView
            contentContainerStyle={{ flexGrow: 1, justifyContent: 'center', paddingHorizontal: 24, paddingVertical: 32 }}
            keyboardShouldPersistTaps="handled"
          >
            <View style={{ alignItems: 'center', marginBottom: 24 }}>
              <View
                style={{
                  width: 56, height: 56, borderRadius: 28,
                  backgroundColor: Theme.light.surfaceAlt,
                  alignItems: 'center', justifyContent: 'center', marginBottom: 14,
                }}
              >
                <Ionicons name="mail-open-outline" size={26} color={Theme.colors.primary} />
              </View>
              <Text style={{ color: Theme.light.text, fontSize: 20, fontWeight: '700', textAlign: 'center' }}>
                Confirme seu email
              </Text>
              <Text style={{ color: Theme.light.textMuted, fontSize: 14, textAlign: 'center', marginTop: 6 }}>
                Enviamos um código de 6 dígitos para{'\n'}
                <Text style={{ fontWeight: '700', color: Theme.light.text }}>{email}</Text>
              </Text>
            </View>

            <View
              style={{
                backgroundColor: Theme.light.surface,
                borderRadius: Theme.radius.lg,
                borderWidth: 1,
                borderColor: Theme.light.border,
                padding: 24,
                ...Theme.shadowLight.md,
              }}
            >
              {!!erro && (
                <Text style={{ color: Theme.colors.danger, fontSize: 13, marginBottom: 12, textAlign: 'center' }}>
                  {erro}
                </Text>
              )}
              {sucesso && (
                <Text style={{ color: Theme.colors.success, fontSize: 13, marginBottom: 12, textAlign: 'center' }}>
                  Email confirmado com sucesso!
                </Text>
              )}
              {reenviado && !sucesso && (
                <Text style={{ color: Theme.colors.success, fontSize: 13, marginBottom: 12, textAlign: 'center' }}>
                  Código reenviado! Confira sua caixa de entrada.
                </Text>
              )}

              {/* input real invisível por cima das caixinhas visuais */}
              <View style={{ position: 'relative', marginBottom: 20 }}>
                <TextInput
                  ref={inputRef}
                  value={codigo}
                  onChangeText={(v) => { setCodigo(v.replace(/\D/g, '').slice(0, TAMANHO_CODIGO)); setErro(''); }}
                  keyboardType="number-pad"
                  maxLength={TAMANHO_CODIGO}
                  autoFocus
                  editable={!loading && !sucesso}
                  style={{ position: 'absolute', opacity: 0, width: '100%', height: 52 }}
                />
                <Pressable
                  onPress={() => inputRef.current?.focus()}
                  style={{ flexDirection: 'row', justifyContent: 'center', gap: 8 }}
                >
                  {digitos.map((d, i) => (
                    <View
                      key={i}
                      style={{
                        width: 44, height: 52, borderRadius: 12,
                        borderWidth: 1.5,
                        borderColor: erro && !sucesso ? Theme.colors.danger : (i === codigo.length ? Theme.colors.accent : Theme.light.border),
                        backgroundColor: Theme.light.surfaceAlt,
                        alignItems: 'center', justifyContent: 'center',
                      }}
                    >
                      <Text style={{ fontSize: 20, fontWeight: '700', color: Theme.light.text }}>
                        {d.trim()}
                      </Text>
                    </View>
                  ))}
                </Pressable>
              </View>

              <Pressable
                onPress={handleConfirmar}
                disabled={loading || sucesso}
                style={({ pressed }) => ({
                  backgroundColor: pressed ? Theme.colors.accentDark : Theme.colors.accent,
                  borderRadius: Theme.radius.pill,
                  paddingVertical: 14,
                  alignItems: 'center',
                  ...Theme.shadow.accent,
                })}
              >
                {loading ? (
                  <ActivityIndicator color={Theme.colors.primaryDark} />
                ) : (
                  <Text style={{ color: Theme.colors.primaryDark, fontWeight: '700', fontSize: 16 }}>
                    Confirmar código
                  </Text>
                )}
              </Pressable>

              <View style={{ alignItems: 'center', marginTop: 18 }}>
                <Text style={{ color: Theme.light.textMuted, fontSize: 13 }}>
                  Não recebeu o código?{' '}
                  {contador > 0 ? (
                    <Text style={{ color: Theme.light.textMuted }}>Reenviar em {contador}s</Text>
                  ) : (
                    <Text
                      onPress={reenviando ? undefined : handleReenviar}
                      style={{ color: Theme.colors.primary, fontWeight: '700' }}
                    >
                      {reenviando ? 'Reenviando...' : 'Reenviar código'}
                    </Text>
                  )}
                </Text>
              </View>

              <Pressable onPress={() => router.replace('/(tabs)/login' as never)} style={{ alignItems: 'center', marginTop: 14 }}>
                <Text style={{ color: Theme.colors.primary, fontSize: 13, fontWeight: '600' }}>
                  Voltar para o login
                </Text>
              </Pressable>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </View>
  );
}
