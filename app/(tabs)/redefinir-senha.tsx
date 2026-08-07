import { useEffect, useState } from 'react';
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
import { esqueciSenha, redefinirSenha, validarCodigo } from '@/services/auth-service';

const TAMANHO_CODIGO = 6;
const TEMPO_REENVIO = 60;
const SENHA_FORTE_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&]).{8,}$/;

export default function RedefinirSenha() {
  const params = useLocalSearchParams<{ email?: string }>();
  const router = useRouter();

  const [email] = useState(params.email ?? '');
  const [codigo, setCodigo] = useState('');
  const [novaSenha, setNovaSenha] = useState('');
  const [confirmarSenha, setConfirmarSenha] = useState('');
  const [erro, setErro] = useState('');
  const [loading, setLoading] = useState(false);
  const [sucesso, setSucesso] = useState(false);
  const [verificando, setVerificando] = useState(false);
  const [codigoConfirmado, setCodigoConfirmado] = useState<boolean | null>(null);
  const [reenviando, setReenviando] = useState(false);
  const [contador, setContador] = useState(TEMPO_REENVIO);

  useEffect(() => {
    if (contador <= 0) return;
    const timer = setTimeout(() => setContador((c) => c - 1), 1000);
    return () => clearTimeout(timer);
  }, [contador]);

  function onChangeCodigo(v: string) {
    setCodigo(v.replace(/\D/g, '').slice(0, TAMANHO_CODIGO));
    if (codigoConfirmado !== null) setCodigoConfirmado(null);
  }

  async function handleVerificarCodigo() {
    if (codigo.length < TAMANHO_CODIGO) {
      setErro('Digite o código completo de 6 dígitos.');
      return;
    }
    setErro('');
    setVerificando(true);
    try {
      // validarCodigo (não consome) -- NUNCA usar verificarCodigoCadastro
      // aqui, ele confirma a conta e apaga o código.
      const data = await validarCodigo(email, codigo);
      if (data?.valido) {
        setCodigoConfirmado(true);
      } else {
        setCodigoConfirmado(false);
        setErro('Código incorreto ou expirado.');
      }
    } catch (err: any) {
      setCodigoConfirmado(false);
      setErro(err.response?.data?.message ?? 'Não foi possível verificar o código agora.');
    } finally {
      setVerificando(false);
    }
  }

  async function handleReenviar() {
    if (!email) return;
    setErro('');
    setReenviando(true);
    try {
      await esqueciSenha(email);
      setContador(TEMPO_REENVIO);
      setCodigo('');
      setCodigoConfirmado(null);
    } catch (err: any) {
      setErro(err.response?.data?.message ?? 'Não foi possível reenviar o código.');
    } finally {
      setReenviando(false);
    }
  }

  async function handleSubmit() {
    if (codigoConfirmado !== true) {
      setErro('Verifique o código antes de continuar.');
      return;
    }
    if (!SENHA_FORTE_REGEX.test(novaSenha)) {
      setErro('A senha deve ter no mínimo 8 caracteres, com maiúscula, minúscula, número e um caractere especial.');
      return;
    }
    if (novaSenha !== confirmarSenha) {
      setErro('As senhas não coincidem.');
      return;
    }
    setErro('');
    setLoading(true);
    try {
      await redefinirSenha(email, codigo, novaSenha);
      setSucesso(true);
      setTimeout(() => router.replace('/(tabs)/login' as never), 1200);
    } catch (err: any) {
      const status = err.response?.status;
      const msg = err.response?.data?.message;
      setErro(status === 400 || status === 401 ? (msg ?? 'Código inválido ou expirado.') : (msg ?? 'Erro ao redefinir a senha.'));
      setCodigo('');
      setCodigoConfirmado(null);
    } finally {
      setLoading(false);
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
                <Ionicons name="shield-checkmark-outline" size={26} color={Theme.colors.primary} />
              </View>
              <Text style={{ color: Theme.light.text, fontSize: 20, fontWeight: '700', textAlign: 'center' }}>
                Redefinir senha
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
                  Senha redefinida com sucesso! Redirecionando...
                </Text>
              )}

              <Text style={{ color: Theme.light.textMuted, fontSize: 13, marginBottom: 6 }}>
                Código de confirmação
              </Text>
              <TextInput
                value={codigo}
                onChangeText={onChangeCodigo}
                placeholder="000000"
                placeholderTextColor="#b0a09e"
                keyboardType="number-pad"
                maxLength={TAMANHO_CODIGO}
                editable={!loading && !sucesso}
                style={{
                  backgroundColor: Theme.light.surfaceAlt,
                  borderRadius: Theme.radius.pill,
                  paddingHorizontal: 18,
                  paddingVertical: 13,
                  color: Theme.light.text,
                  fontSize: 18,
                  letterSpacing: 6,
                  textAlign: 'center',
                  borderWidth: 1,
                  borderColor: codigoConfirmado === false ? Theme.colors.danger : Theme.light.border,
                  marginBottom: 10,
                }}
              />

              <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
                <Pressable
                  onPress={handleVerificarCodigo}
                  disabled={verificando || loading || sucesso || codigo.length < TAMANHO_CODIGO}
                >
                  <Text style={{ color: Theme.colors.primary, fontWeight: '700', fontSize: 13 }}>
                    {verificando ? 'Verificando...' : 'Verificar código'}
                  </Text>
                </Pressable>
                {codigoConfirmado === true && (
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                    <Ionicons name="checkmark-circle" size={16} color={Theme.colors.success} />
                    <Text style={{ color: Theme.colors.success, fontSize: 12, fontWeight: '600' }}>
                      Código confirmado
                    </Text>
                  </View>
                )}
              </View>

              {codigoConfirmado === true && (
                <>
                  <Text style={{ color: Theme.light.textMuted, fontSize: 13, marginBottom: 6 }}>Nova senha</Text>
                  <TextInput
                    value={novaSenha}
                    onChangeText={setNovaSenha}
                    placeholder="Ex: Traco123@"
                    placeholderTextColor="#b0a09e"
                    secureTextEntry
                    editable={!loading && !sucesso}
                    style={{
                      backgroundColor: Theme.light.surfaceAlt,
                      borderRadius: Theme.radius.pill,
                      paddingHorizontal: 18,
                      paddingVertical: 13,
                      color: Theme.light.text,
                      fontSize: 15,
                      borderWidth: 1,
                      borderColor: Theme.light.border,
                      marginBottom: 4,
                    }}
                  />
                  <Text style={{ color: Theme.light.textMuted, fontSize: 11, marginBottom: 12, lineHeight: 16 }}>
                    Mín. 8 caracteres, maiúscula, minúscula, número e caractere especial (@, $, !, %, *, ?, &).
                  </Text>

                  <Text style={{ color: Theme.light.textMuted, fontSize: 13, marginBottom: 6 }}>Confirmar nova senha</Text>
                  <TextInput
                    value={confirmarSenha}
                    onChangeText={setConfirmarSenha}
                    placeholder="Repita a nova senha"
                    placeholderTextColor="#b0a09e"
                    secureTextEntry
                    editable={!loading && !sucesso}
                    style={{
                      backgroundColor: Theme.light.surfaceAlt,
                      borderRadius: Theme.radius.pill,
                      paddingHorizontal: 18,
                      paddingVertical: 13,
                      color: Theme.light.text,
                      fontSize: 15,
                      borderWidth: 1,
                      borderColor: Theme.light.border,
                      marginBottom: 16,
                    }}
                  />
                </>
              )}

              <Pressable
                onPress={handleSubmit}
                disabled={loading || sucesso || codigoConfirmado !== true}
                style={({ pressed }) => ({
                  backgroundColor: codigoConfirmado !== true ? Theme.light.border : (pressed ? Theme.colors.accentDark : Theme.colors.accent),
                  borderRadius: Theme.radius.pill,
                  paddingVertical: 14,
                  alignItems: 'center',
                  ...(codigoConfirmado === true ? Theme.shadow.accent : {}),
                })}
              >
                {loading ? (
                  <ActivityIndicator color={Theme.colors.primaryDark} />
                ) : (
                  <Text style={{ color: Theme.colors.primaryDark, fontWeight: '700', fontSize: 16 }}>
                    Redefinir senha
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
