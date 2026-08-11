import { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Pressable, Text, TextInput, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { AuthLayout, authSubmitStyle } from '@/components/auth-layout';
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
    <AuthLayout
      icon="mail-open-outline"
      title="Falta pouco para confirmar sua conta"
      subtitle="Digite o código que enviamos por email para ativar seu acesso ao Traço Cultural."
    >
      <Text style={{ color: Theme.colors.primaryDark, fontSize: 22, fontWeight: '800', letterSpacing: -0.5, marginBottom: 4 }}>
        Confirme seu email
      </Text>
      <Text style={{ color: Theme.light.textMuted, fontSize: 13, fontWeight: '300', marginBottom: 24 }}>
        {email ? (
          <>Enviamos um código de 6 dígitos para <Text style={{ fontWeight: '700', color: Theme.light.text }}>{email}</Text></>
        ) : (
          'Digite o código de 6 dígitos que enviamos'
        )}
      </Text>

      {!!erro && (
        <View style={{ backgroundColor: '#fff0f0', borderLeftWidth: 4, borderLeftColor: '#e74c3c', borderRadius: 10, padding: 12, marginBottom: 16 }}>
          <Text style={{ color: '#c0392b', fontSize: 13, fontWeight: '500' }}>{erro}</Text>
        </View>
      )}
      {sucesso && (
        <View style={{ backgroundColor: '#f0faf4', borderLeftWidth: 4, borderLeftColor: '#2ecc71', borderRadius: 10, padding: 12, marginBottom: 16 }}>
          <Text style={{ color: '#1e7e47', fontSize: 13, fontWeight: '600' }}>Email confirmado com sucesso!</Text>
        </View>
      )}
      {reenviado && !sucesso && (
        <View style={{ backgroundColor: '#f0faf4', borderLeftWidth: 4, borderLeftColor: '#2ecc71', borderRadius: 10, padding: 12, marginBottom: 16 }}>
          <Text style={{ color: '#1e7e47', fontSize: 13, fontWeight: '600' }}>Código reenviado! Confira sua caixa de entrada.</Text>
        </View>
      )}

      <Text style={{ color: Theme.light.text, fontWeight: '600', fontSize: 11, letterSpacing: 0.5, textTransform: 'uppercase', marginBottom: 10 }}>
        Código de confirmação
      </Text>
      <View style={{ position: 'relative', marginBottom: 22 }}>
        <TextInput
          ref={inputRef}
          value={codigo}
          onChangeText={(v) => { setCodigo(v.replace(/\D/g, '').slice(0, TAMANHO_CODIGO)); setErro(''); }}
          keyboardType="number-pad"
          maxLength={TAMANHO_CODIGO}
          autoFocus
          editable={!loading && !sucesso}
          style={{ position: 'absolute', opacity: 0, width: '100%', height: 54 }}
        />
        <Pressable onPress={() => inputRef.current?.focus()} style={{ flexDirection: 'row', justifyContent: 'space-between', gap: 6 }}>
          {digitos.map((d, i) => (
            <View
              key={i}
              style={{
                flex: 1,
                aspectRatio: 1,
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: '#fbf7f2',
                borderBottomWidth: 3,
                borderBottomColor: erro ? '#e74c3c' : (i === codigo.length ? Theme.colors.accentDark : '#ece3dc'),
                borderTopLeftRadius: 6,
                borderTopRightRadius: 6,
              }}
            >
              <Text style={{ fontSize: 19, fontWeight: '700', color: Theme.colors.accentDark }}>{d.trim()}</Text>
            </View>
          ))}
        </Pressable>
      </View>

      <Pressable onPress={handleConfirmar} disabled={loading || sucesso} style={({ pressed }) => authSubmitStyle({ pressed, disabled: loading || sucesso })}>
        {loading ? <ActivityIndicator color="#fff" /> : (
          <Text style={{ color: '#fff', fontWeight: '700', fontSize: 15, letterSpacing: 0.4 }}>Confirmar código</Text>
        )}
      </Pressable>

      <View style={{ marginTop: 26, gap: 10 }}>
        <Text style={{ color: Theme.light.textMuted, fontSize: 13.5 }}>
          Não recebeu o código?{' '}
          {contador > 0 ? (
            <Text style={{ color: Theme.light.textMuted, fontWeight: '600' }}>Reenviar em {contador}s</Text>
          ) : (
            <Text onPress={reenviando ? undefined : handleReenviar} style={{ color: Theme.colors.accentDark, fontWeight: '700' }}>
              {reenviando ? 'Reenviando...' : 'Reenviar código'}
            </Text>
          )}
        </Text>
        <Text onPress={() => router.replace('/(tabs)/login' as never)} style={{ color: '#b3a9a3', fontSize: 12.5 }}>
          Voltar para o login
        </Text>
      </View>
    </AuthLayout>
  );
}