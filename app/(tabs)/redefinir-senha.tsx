import { useEffect, useState } from 'react';
import { ActivityIndicator, Pressable, Text, TextInput, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { AuthField, AuthLayout, authInputStyle, authSubmitStyle } from '@/components/auth-layout';
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
  const [showSenha, setShowSenha] = useState(false);
  const [erro, setErro] = useState('');
  const [loading, setLoading] = useState(false);
  const [sucesso, setSucesso] = useState(false);
  const [verificando, setVerificando] = useState(false);
  const [codigoConfirmado, setCodigoConfirmado] = useState<boolean | null>(null);
  const [reenviando, setReenviando] = useState(false);
  const [reenviado, setReenviado] = useState(false);
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
      const data = await validarCodigo(email, codigo);
      if (data?.valido) setCodigoConfirmado(true);
      else { setCodigoConfirmado(false); setErro('Código incorreto ou expirado.'); }
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
      setReenviado(true);
      setContador(TEMPO_REENVIO);
      setCodigo('');
      setCodigoConfirmado(null);
      setTimeout(() => setReenviado(false), 4000);
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
      setErro('A senha deve conter no mínimo 8 caracteres, uma letra maiúscula, uma minúscula, um número e um caractere especial.');
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

  const digitos = codigo.padEnd(TAMANHO_CODIGO, ' ').split('');
  const revelado = codigoConfirmado === true;

  return (
    <AuthLayout
      icon="shield-checkmark-outline"
      title="Vamos recuperar o acesso à sua conta"
      subtitle="Confirme o código enviado por email e escolha uma nova senha para continuar explorando o Traço Cultural."
    >
      <Text style={{ color: Theme.colors.primaryDark, fontSize: 22, fontWeight: '800', letterSpacing: -0.5, marginBottom: 4 }}>
        Redefinir senha
      </Text>
      <Text style={{ color: Theme.light.textMuted, fontSize: 13, fontWeight: '300', marginBottom: 24 }}>
        {email ? (
          <>Enviamos um código de 6 dígitos para <Text style={{ fontWeight: '700', color: Theme.light.text }}>{email}</Text></>
        ) : (
          'Digite o código recebido e a nova senha'
        )}
      </Text>

      {!!erro && (
        <View style={{ backgroundColor: '#fff0f0', borderLeftWidth: 4, borderLeftColor: '#e74c3c', borderRadius: 10, padding: 12, marginBottom: 16 }}>
          <Text style={{ color: '#c0392b', fontSize: 13, fontWeight: '500' }}>{erro}</Text>
        </View>
      )}
      {sucesso && (
        <View style={{ backgroundColor: '#f0faf4', borderLeftWidth: 4, borderLeftColor: '#2ecc71', borderRadius: 10, padding: 12, marginBottom: 16 }}>
          <Text style={{ color: '#1e7e47', fontSize: 13, fontWeight: '600' }}>Senha redefinida com sucesso! Redirecionando...</Text>
        </View>
      )}
      {reenviado && (
        <View style={{ backgroundColor: '#f0faf4', borderLeftWidth: 4, borderLeftColor: '#2ecc71', borderRadius: 10, padding: 12, marginBottom: 16 }}>
          <Text style={{ color: '#1e7e47', fontSize: 13, fontWeight: '600' }}>Código reenviado! Confira sua caixa de entrada.</Text>
        </View>
      )}

      <Text style={{ color: Theme.light.text, fontWeight: '600', fontSize: 11, letterSpacing: 0.5, textTransform: 'uppercase', marginBottom: 10 }}>
        Código de confirmação
      </Text>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', gap: 6, marginBottom: 10 }}>
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
              borderBottomColor: codigoConfirmado === false ? '#e74c3c' : (i === codigo.length ? Theme.colors.accentDark : '#ece3dc'),
              borderTopLeftRadius: 6,
              borderTopRightRadius: 6,
            }}
          >
            <Text style={{ fontSize: 19, fontWeight: '700', color: Theme.colors.accentDark }}>{d.trim()}</Text>
          </View>
        ))}
      </View>
      {/* input real (invisível) para receber o teclado numérico */}
      <TextInput
        value={codigo}
        onChangeText={onChangeCodigo}
        keyboardType="number-pad"
        maxLength={TAMANHO_CODIGO}
        editable={!loading && !sucesso}
        autoFocus
        style={{ position: 'absolute', opacity: 0, height: 1, width: 1 }}
      />

      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 22 }}>
        <Text
          onPress={verificando || loading || sucesso || codigo.length < TAMANHO_CODIGO ? undefined : handleVerificarCodigo}
          style={{ color: Theme.colors.accentDark, fontWeight: '700', fontSize: 13, opacity: codigo.length < TAMANHO_CODIGO ? 0.5 : 1 }}
        >
          {verificando ? 'Verificando...' : 'Verificar código'}
        </Text>
        {revelado && (
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
            <Ionicons name="checkmark-circle" size={15} color="#2ecc71" />
            <Text style={{ color: '#2ecc71', fontSize: 12, fontWeight: '600' }}>Código confirmado</Text>
          </View>
        )}
      </View>

      <View style={{ opacity: revelado ? 1 : 0.3 }} pointerEvents={revelado ? 'auto' : 'none'}>
        <AuthField label="Nova senha" icon="lock-closed-outline">
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <TextInput
              value={novaSenha}
              onChangeText={setNovaSenha}
              placeholder="Ex: Traco123@"
              placeholderTextColor="#cabdb5"
              secureTextEntry={!showSenha}
              editable={revelado && !loading && !sucesso}
              style={[authInputStyle, { flex: 1 }]}
            />
            <Pressable onPress={() => setShowSenha((p) => !p)} hitSlop={8} style={{ paddingBottom: 10 }}>
              <Ionicons name={showSenha ? 'eye-off-outline' : 'eye-outline'} size={17} color={Theme.colors.accentDark} />
            </Pressable>
          </View>
        </AuthField>
        <Text style={{ color: Theme.light.textMuted, fontSize: 11, lineHeight: 17, marginTop: -10, marginBottom: 18 }}>
          Mín. 8 caracteres, maiúscula, minúscula, número e caractere especial (@, $, !, %, *, ?, &).
        </Text>

        <AuthField label="Confirmar nova senha" icon="lock-closed">
          <TextInput
            value={confirmarSenha}
            onChangeText={setConfirmarSenha}
            placeholder="Repita a nova senha"
            placeholderTextColor="#cabdb5"
            secureTextEntry={!showSenha}
            editable={revelado && !loading && !sucesso}
            style={authInputStyle}
          />
        </AuthField>
      </View>

      <Pressable
        onPress={handleSubmit}
        disabled={loading || sucesso || !revelado}
        style={({ pressed }) => authSubmitStyle({ pressed, disabled: loading || sucesso || !revelado })}
      >
        {loading ? <ActivityIndicator color="#fff" /> : (
          <Text style={{ color: '#fff', fontWeight: '700', fontSize: 15, letterSpacing: 0.4 }}>Redefinir senha</Text>
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