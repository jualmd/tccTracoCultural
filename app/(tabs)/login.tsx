import { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
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
    else if (senha.length < 6) e.senha = 'Mínimo 6 caracteres';
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
      if (error.response?.status === 401 || error.response?.status === 403) {
        setErrors((p) => ({ ...p, senha: 'Email ou senha inválidos' }));
      } else {
        Alert.alert('Erro', error.response?.data?.message ?? 'Não foi possível realizar o login. Tente novamente.');
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <LinearGradient
      colors={Theme.gradient.primary}
      style={{ flex: 1 }}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
    >
      <SafeAreaView style={{ flex: 1 }}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={{ flex: 1, justifyContent: 'center', paddingHorizontal: 28 }}
        >
          {/* Logo */}
          <View style={{ alignItems: 'center', marginBottom: 40 }}>
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                backgroundColor: Theme.glass.bg,
                borderWidth: 1,
                borderColor: Theme.glass.border,
                borderRadius: Theme.radius.pill,
                paddingHorizontal: 12,
                paddingVertical: 4,
                marginBottom: 14,
              }}
            >
              <Ionicons name="sparkles" size={11} color={Theme.colors.accent} />
              <Text
                style={{
                  color: 'rgba(255,255,255,0.85)',
                  fontSize: 10.5,
                  fontWeight: '700',
                  marginLeft: 5,
                  textTransform: 'uppercase',
                  letterSpacing: 0.5,
                }}
              >
                Bem-vindo de volta
              </Text>
            </View>
            <Text style={{ fontSize: 32, fontWeight: '800', color: '#fff', letterSpacing: 0.5 }}>
              Traço Cultural
            </Text>
            <Text style={{ color: 'rgba(255,255,255,0.7)', marginTop: 6, fontSize: 14 }}>
              Descubra eventos culturais da sua cidade
            </Text>
          </View>

          {/* Card */}
          <View
            style={{
              backgroundColor: Theme.glass.bg,
              borderRadius: Theme.radius.lg,
              borderWidth: 1,
              borderColor: Theme.glass.border,
              padding: 24,
              ...Theme.shadow.card,
            }}
          >
            <Text style={{ color: '#fff', fontSize: 20, fontWeight: '700', marginBottom: 20 }}>
              Entrar
            </Text>

            {/* Email */}
            <Text style={{ color: 'rgba(255,255,255,0.8)', fontSize: 13, marginBottom: 6 }}>
              Email
            </Text>
            <TextInput
              value={email}
              onChangeText={(v) => { setEmail(v); setErrors((p) => ({ ...p, email: '' })); }}
              placeholder="seu@email.com"
              placeholderTextColor="rgba(255,255,255,0.4)"
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
              style={{
                backgroundColor: Theme.glass.bgMd,
                borderRadius: Theme.radius.pill,
                paddingHorizontal: 18,
                paddingVertical: 13,
                color: '#fff',
                fontSize: 15,
                borderWidth: 1,
                borderColor: errors.email ? '#ff6b6b' : Theme.glass.border,
                marginBottom: 4,
              }}
            />
            {!!errors.email && (
              <Text style={{ color: '#ff9999', fontSize: 12, marginBottom: 8, marginLeft: 4 }}>
                {errors.email}
              </Text>
            )}

            {/* Senha */}
            <Text style={{ color: 'rgba(255,255,255,0.8)', fontSize: 13, marginBottom: 6, marginTop: 8 }}>
              Senha
            </Text>
            <View style={{ position: 'relative' }}>
              <TextInput
                value={senha}
                onChangeText={(v) => { setSenha(v); setErrors((p) => ({ ...p, senha: '' })); }}
                placeholder="••••••••"
                placeholderTextColor="rgba(255,255,255,0.4)"
                secureTextEntry={!showSenha}
                style={{
                  backgroundColor: Theme.glass.bgMd,
                  borderRadius: Theme.radius.pill,
                  paddingHorizontal: 18,
                  paddingVertical: 13,
                  paddingRight: 46,
                  color: '#fff',
                  fontSize: 15,
                  borderWidth: 1,
                  borderColor: errors.senha ? '#ff6b6b' : Theme.glass.border,
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
                  color="rgba(255,255,255,0.55)"
                />
              </Pressable>
            </View>
            {!!errors.senha && (
              <Text style={{ color: '#ff9999', fontSize: 12, marginBottom: 8, marginLeft: 4 }}>
                {errors.senha}
              </Text>
            )}

            {/* Botão */}
            <Pressable
              onPress={handleLogin}
              disabled={loading}
              style={({ pressed }) => ({
                backgroundColor: pressed ? Theme.colors.accentDark : Theme.colors.accent,
                borderRadius: Theme.radius.pill,
                paddingVertical: 14,
                alignItems: 'center',
                marginTop: 20,
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
              style={({ pressed }) => ({ alignItems: 'center', marginTop: 16, opacity: pressed ? 0.65 : 1 })}
            >
              <Text style={{ color: '#fff', fontWeight: '700', fontSize: 14 }}>
                Criar uma conta
              </Text>
            </Pressable>
          </View>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </LinearGradient>
  );
}
