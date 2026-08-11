import { useState } from 'react';
import { ActivityIndicator, Pressable, Text, TextInput, View } from 'react-native';
import { useRouter } from 'expo-router';
import { AuthField, AuthLayout, authInputStyle, authSubmitStyle } from '@/components/auth-layout';
import { Theme } from '@/constants/theme';
import { esqueciSenha } from '@/services/auth-service';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function EsqueciSenha() {
  const [email, setEmail] = useState('');
  const [erro, setErro] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleEnviar() {
    if (!email.trim() || !EMAIL_REGEX.test(email)) {
      setErro('Informe um email válido.');
      return;
    }
    setErro('');
    setLoading(true);
    try {
      await esqueciSenha(email.trim());
    } catch {
      // por segurança seguimos pra tela de código mesmo se o backend
      // não confirmar se o email existe.
    } finally {
      setLoading(false);
      router.push({ pathname: '/(tabs)/redefinir-senha', params: { email: email.trim() } } as never);
    }
  }

  return (
    <AuthLayout
      icon="lock-closed-outline"
      title="Vamos recuperar o acesso à sua conta"
      subtitle="Informe o email cadastrado e enviaremos um código para redefinir sua senha."
    >
      <Text style={{ color: Theme.colors.primaryDark, fontSize: 22, fontWeight: '800', letterSpacing: -0.5, marginBottom: 4 }}>
        Esqueceu sua senha?
      </Text>
      <Text style={{ color: Theme.light.textMuted, fontSize: 13, fontWeight: '300', marginBottom: 26 }}>
        Digite seu email e enviaremos um código para redefinir sua senha
      </Text>

      {!!erro && (
        <View style={{ backgroundColor: '#fff0f0', borderLeftWidth: 4, borderLeftColor: '#e74c3c', borderRadius: 10, padding: 12, marginBottom: 16 }}>
          <Text style={{ color: '#c0392b', fontSize: 13, fontWeight: '500' }}>{erro}</Text>
        </View>
      )}

      <AuthField label="Email" icon="mail-outline" error={undefined}>
        <TextInput
          value={email}
          onChangeText={(v) => { setEmail(v); setErro(''); }}
          placeholder="seu@email.com"
          placeholderTextColor="#cabdb5"
          keyboardType="email-address"
          autoCapitalize="none"
          autoCorrect={false}
          autoFocus
          style={[authInputStyle, erro ? { borderBottomColor: '#e74c3c' } : null]}
        />
      </AuthField>

      <Pressable onPress={handleEnviar} disabled={loading} style={({ pressed }) => authSubmitStyle({ pressed, disabled: loading })}>
        {loading ? <ActivityIndicator color="#fff" /> : (
          <Text style={{ color: '#fff', fontWeight: '700', fontSize: 15, letterSpacing: 0.4 }}>Enviar código</Text>
        )}
      </Pressable>

      <View style={{ marginTop: 30, gap: 10 }}>
        <Text style={{ color: Theme.light.textMuted, fontSize: 13.5 }}>
          Lembrou a senha?{' '}
          <Text onPress={() => router.back()} style={{ color: Theme.colors.accentDark, fontWeight: '700' }}>
            Entrar
          </Text>
        </Text>
      </View>
    </AuthLayout>
  );
}