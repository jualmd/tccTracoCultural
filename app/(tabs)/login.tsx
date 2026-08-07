import { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
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
import { useRouter } from 'expo-router';
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
        // Conta existe mas o email ainda não foi confirmado -- manda pra
        // tela de código, igual o front web faz (origem: 'login').
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
    <View style={{ flex: 1, backgroundColor: Theme.light.bg }}>
      <SafeAreaView style={{ flex: 1 }}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={{ flex: 1 }}
        >
          <ScrollView
            contentContainerStyle={{ flexGrow: 1, justifyContent: 'center', paddingHorizontal: 24, paddingVertical: 32 }}
            keyboardShouldPersistTaps="handled"
          >
            {/* Logo */}
            <View style={{ alignItems: 'center', marginBottom: 32 }}>
              <Image
                source={require('@/assets/images/tracocult.logo.png')}
                style={{ height: 44, width: 200, marginBottom: 10 }}
                resizeMode="contain"
              />
              <Text style={{ color: Theme.light.textMuted, fontSize: 14 }}>
                Descubra eventos culturais da sua cidade
              </Text>
            </View>

            {/* Card */}
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
              <Text style={{ color: Theme.light.text, fontSize: 20, fontWeight: '700', marginBottom: 20 }}>
                Entrar
              </Text>

              <Text style={{ color: Theme.light.textMuted, fontSize: 13, marginBottom: 6 }}>Email</Text>
              <TextInput
                value={email}
                onChangeText={(v) => { setEmail(v); setErrors((p) => ({ ...p, email: '' })); }}
                placeholder="seu@email.com"
                placeholderTextColor="#b0a09e"
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
                style={{
                  backgroundColor: Theme.light.surfaceAlt,
                  borderRadius: Theme.radius.pill,
                  paddingHorizontal: 18,
                  paddingVertical: 13,
                  color: Theme.light.text,
                  fontSize: 15,
                  borderWidth: 1,
                  borderColor: errors.email ? Theme.colors.danger : Theme.light.border,
                  marginBottom: 4,
                }}
              />
              {!!errors.email && (
                <Text style={{ color: Theme.colors.danger, fontSize: 12, marginBottom: 8, marginLeft: 4 }}>
                  {errors.email}
                </Text>
              )}

              <Text style={{ color: Theme.light.textMuted, fontSize: 13, marginBottom: 6, marginTop: 8 }}>Senha</Text>
              <View style={{ position: 'relative' }}>
                <TextInput
                  value={senha}
                  onChangeText={(v) => { setSenha(v); setErrors((p) => ({ ...p, senha: '' })); }}
                  placeholder="••••••••"
                  placeholderTextColor="#b0a09e"
                  secureTextEntry={!showSenha}
                  style={{
                    backgroundColor: Theme.light.surfaceAlt,
                    borderRadius: Theme.radius.pill,
                    paddingHorizontal: 18,
                    paddingVertical: 13,
                    paddingRight: 46,
                    color: Theme.light.text,
                    fontSize: 15,
                    borderWidth: 1,
                    borderColor: errors.senha ? Theme.colors.danger : Theme.light.border,
                    marginBottom: 4,
                  }}
                />
                <Pressable
                  onPress={() => setShowSenha((p) => !p)}
                  hitSlop={8}
                  style={{ position: 'absolute', right: 16, top: 0, bottom: 0, justifyContent: 'center' }}
                >
                  <Ionicons
                    name={showSenha ? 'eye-off-outline' : 'eye-outline'}
                    size={18}
                    color={Theme.light.textMuted}
                  />
                </Pressable>
              </View>
              {!!errors.senha && (
                <Text style={{ color: Theme.colors.danger, fontSize: 12, marginBottom: 4, marginLeft: 4 }}>
                  {errors.senha}
                </Text>
              )}

              <Pressable
                onPress={() => router.push('/(tabs)/esqueci-senha' as never)}
                style={{ alignSelf: 'flex-end', marginTop: 4, marginBottom: 4 }}
              >
                <Text style={{ color: Theme.colors.primary, fontSize: 13, fontWeight: '600' }}>
                  Esqueci minha senha
                </Text>
              </Pressable>

              <Pressable
                onPress={handleLogin}
                disabled={loading}
                style={({ pressed }) => ({
                  backgroundColor: pressed ? Theme.colors.accentDark : Theme.colors.accent,
                  borderRadius: Theme.radius.pill,
                  paddingVertical: 14,
                  alignItems: 'center',
                  marginTop: 16,
                  ...Theme.shadow.accent,
                })}
              >
                {loading ? (
                  <ActivityIndicator color={Theme.colors.primaryDark} />
                ) : (
                  <Text style={{ color: Theme.colors.primaryDark, fontWeight: '700', fontSize: 16 }}>
                    Entrar
                  </Text>
                )}
              </Pressable>

              <Pressable
                onPress={() => router.push('/(tabs)/cadastrar' as never)}
                style={({ pressed }) => ({ alignItems: 'center', marginTop: 18, opacity: pressed ? 0.65 : 1 })}
              >
                <Text style={{ color: Theme.colors.primary, fontWeight: '700', fontSize: 14 }}>
                  Criar uma conta
                </Text>
              </Pressable>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </View>
  );
}
