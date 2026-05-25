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
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import { Theme } from '@/constants/theme';
import { USER_STORAGE_KEY } from '@/constants/user-types';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function Login() {
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({ email: '', senha: '' });
  const router = useRouter();

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
      // Verifica se já existe um usuário salvo com esse email
      const raw = await AsyncStorage.getItem(USER_STORAGE_KEY);
      const existing = raw ? JSON.parse(raw) : null;

      if (existing && existing.email === email) {
        // Usuário já existe: verifica senha salva
        const savedPassword = await AsyncStorage.getItem('@traco:password');
        if (savedPassword && savedPassword !== senha) {
          setErrors((p) => ({ ...p, senha: 'Senha incorreta' }));
          return;
        }
        // Login bem-sucedido — mantém dados existentes, só atualiza sessão
        router.replace('/(tabs)');
      } else {
        // Primeiro login: cria usuário novo
        const user = {
          id: 'user_' + Date.now(),
          name: email.split('@')[0],
          email,
          createdAt: new Date().toISOString(),
        };
        await AsyncStorage.setItem(USER_STORAGE_KEY, JSON.stringify(user));
        await AsyncStorage.setItem('@traco:password', senha);
        router.replace('/(tabs)');
      }
    } catch {
      Alert.alert('Erro', 'Não foi possível realizar o login. Tente novamente.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <LinearGradient
      colors={Theme.gradient.primary}
      style={{ flex: 1 }}
      start={{ x: 0, y: 0 }}
      end={{ x: 0.3, y: 1 }}
    >
      <SafeAreaView style={{ flex: 1 }}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={{ flex: 1, justifyContent: 'center', paddingHorizontal: 28 }}
        >
          {/* Logo */}
          <View style={{ alignItems: 'center', marginBottom: 48 }}>
            <Text style={{ fontSize: 36, fontWeight: '800', color: '#fff', letterSpacing: 1 }}>
              Traço Cultural
            </Text>
            <Text style={{ color: 'rgba(255,255,255,0.7)', marginTop: 6, fontSize: 14 }}>
              Descubra eventos culturais da sua cidade
            </Text>
          </View>

          {/* Card */}
          <View
            style={{
              backgroundColor: 'rgba(255,255,255,0.12)',
              borderRadius: 20,
              borderWidth: 1,
              borderColor: 'rgba(255,255,255,0.2)',
              padding: 24,
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
                backgroundColor: 'rgba(255,255,255,0.15)',
                borderRadius: 25,
                paddingHorizontal: 18,
                paddingVertical: 13,
                color: '#fff',
                fontSize: 15,
                borderWidth: 1,
                borderColor: errors.email ? '#ff6b6b' : 'rgba(255,255,255,0.2)',
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
            <TextInput
              value={senha}
              onChangeText={(v) => { setSenha(v); setErrors((p) => ({ ...p, senha: '' })); }}
              placeholder="••••••••"
              placeholderTextColor="rgba(255,255,255,0.4)"
              secureTextEntry
              style={{
                backgroundColor: 'rgba(255,255,255,0.15)',
                borderRadius: 25,
                paddingHorizontal: 18,
                paddingVertical: 13,
                color: '#fff',
                fontSize: 15,
                borderWidth: 1,
                borderColor: errors.senha ? '#ff6b6b' : 'rgba(255,255,255,0.2)',
                marginBottom: 4,
              }}
            />
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
                backgroundColor: pressed ? 'rgba(255,255,255,0.85)' : '#fff',
                borderRadius: 25,
                paddingVertical: 14,
                alignItems: 'center',
                marginTop: 20,
              })}
            >
              {loading ? (
                <ActivityIndicator color={Theme.colors.secondary} />
              ) : (
                <Text style={{ color: Theme.colors.secondary, fontWeight: '700', fontSize: 16 }}>
                  Entrar
                </Text>
              )}
            </Pressable>
          </View>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </LinearGradient>
  );
}
