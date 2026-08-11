import { useState } from 'react';
import { ActivityIndicator, Alert, Pressable, Text, TextInput, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { AuthField, AuthLayout, authInputStyle, authSubmitStyle } from '@/components/auth-layout';
import { Theme } from '@/constants/theme';
import { useAuth } from '@/contexts/auth-context';
import { loginUsuario } from '@/services/auth-service';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function Login() {
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [showSenha, setShowSenha] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({ email: '', senha: '' });
  const router = useRouter();
  const { login } = useAuth();

  function validate() {
    const e = { email: '', senha: '' };
    if (!email) e.email = 'Email obrigatório';
    else if (!EMAIL_REGEX.test(email)) e.email = 'Email inválido';
    if (!senha) e.senha = 'Senha obrigatória';
    setErrors(e);
    return !e.email && !e.senha;
  }

  async function handleLogin() {
    if (!validate()) return;
    setLoading(true);
    try {
      const payload = await loginUsuario(email.trim(), senha);
      await login(payload);
      router.replace('/(tabs)');
    } catch (error: any) {
      const status = error.response?.status;
      if (status === 403 && error.response?.data?.emailNaoConfirmado) {
        router.push({
          pathname: '/(tabs)/verificar-codigo',
          params: { email: email.trim(), origem: 'login' },
        } as never);
        return;
      }
      if (status === 401 || status === 403) {
        setErrors((p) => ({ ...p, senha: 'Email ou senha inválidos' }));
      } else if (status === 429) {
        Alert.alert('Muitas tentativas', 'Aguarde alguns minutos antes de tentar novamente.');
      } else {
        Alert.alert('Erro', error.response?.data?.message ?? 'Não foi possível realizar o login. Tente novamente.');
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthLayout title="Que bom te ver de novo!" subtitle="Entre com sua conta para continuar descobrindo e organizando eventos culturais perto de você.">
      <Text style={{ color: Theme.colors.primaryDark, fontSize: 22, fontWeight: '800', letterSpacing: -0.5, marginBottom: 4 }}>
        Bem-vindo de volta
      </Text>
      <Text style={{ color: Theme.light.textMuted, fontSize: 13, fontWeight: '300', marginBottom: 26 }}>
        Acesse sua conta Traço Cultural
      </Text>

      <AuthField label="Email" icon="mail-outline" error={errors.email}>
        <TextInput
          value={email}
          onChangeText={(v) => { setEmail(v); setErrors((p) => ({ ...p, email: '' })); }}
          placeholder="seu@email.com"
          placeholderTextColor="#cabdb5"
          keyboardType="email-address"
          autoCapitalize="none"
          autoCorrect={false}
          style={[authInputStyle, errors.email ? { borderBottomColor: '#e74c3c' } : null]}
        />
      </AuthField>

      <View style={{ marginBottom: 6 }}>
        <AuthField label="Senha" error={errors.senha}>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <TextInput
              value={senha}
              onChangeText={(v) => { setSenha(v); setErrors((p) => ({ ...p, senha: '' })); }}
              placeholder="••••••••"
              placeholderTextColor="#cabdb5"
              secureTextEntry={!showSenha}
              style={[authInputStyle, { flex: 1 }, errors.senha ? { borderBottomColor: '#e74c3c' } : null]}
            />
            <Pressable onPress={() => setShowSenha((p) => !p)} hitSlop={8} style={{ paddingBottom: 10 }}>
              <Ionicons name={showSenha ? 'eye-off-outline' : 'eye-outline'} size={17} color={Theme.colors.accentDark} />
            </Pressable>
          </View>
        </AuthField>
        <Pressable onPress={() => router.push('/(tabs)/esqueci-senha' as never)} style={{ alignSelf: 'flex-end', marginTop: -12, marginBottom: 8 }}>
          <Text style={{ color: Theme.colors.accentDark, fontSize: 12.5, fontWeight: '600' }}>Esqueceu a senha?</Text>
        </Pressable>
      </View>

      <Pressable onPress={handleLogin} disabled={loading} style={({ pressed }) => authSubmitStyle({ pressed, disabled: loading })}>
        {loading ? <ActivityIndicator color="#fff" /> : (
          <Text style={{ color: '#fff', fontWeight: '700', fontSize: 15, letterSpacing: 0.4 }}>Entrar</Text>
        )}
      </Pressable>

      <View style={{ marginTop: 30, gap: 10 }}>
        <Text style={{ color: Theme.light.textMuted, fontSize: 13.5 }}>
          Não tem uma conta?{' '}
          <Text onPress={() => router.push('/(tabs)/cadastrar' as never)} style={{ color: Theme.colors.accentDark, fontWeight: '700' }}>
            Cadastre-se
          </Text>
        </Text>
        <Text onPress={() => router.push('/(tabs)/welcome' as never)} style={{ color: '#b3a9a3', fontSize: 12.5 }}>
          ← Voltar ao início
        </Text>
      </View>
    </AuthLayout>
  );
}