import { useState } from 'react';
import {
  ActivityIndicator,
  Image,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { Theme } from '@/constants/theme';
import { cadastrarUsuario } from '@/services/auth-service';
import { useAuth } from '@/contexts/auth-context';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function Cadastrar() {
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({ nome: '', email: '', senha: '' });
  const router = useRouter();
  const { login } = useAuth();

  function validate() {
    const next = { nome: '', email: '', senha: '' };
    if (!nome.trim()) next.nome = 'Nome obrigatório';
    if (!email.trim()) next.email = 'Email obrigatório';
    else if (!EMAIL_REGEX.test(email)) next.email = 'Email inválido';
    if (!senha) next.senha = 'Senha obrigatória';
    else if (senha.length < 6) next.senha = 'Mínimo 6 caracteres';
    setErrors(next);
    return !Object.values(next).some(Boolean);
  }

  async function handleCadastrar() {
    if (!validate()) return;
    setLoading(true);
    try {
      const data = await cadastrarUsuario({
        nome: nome.trim(),
        email: email.trim(),
        senha,
      });
      await login(data);
      router.replace('/(tabs)' as never);
    } catch (err: any) {
      const msg =
        err.response?.status === 409
          ? 'Email já cadastrado'
          : err.response?.data?.message ?? 'Erro ao criar conta.';
      setErrors((p) => ({ ...p, email: msg }));
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
          <View style={{ alignItems: 'center', marginBottom: 36 }}>
            <Image
              source={require('@/assets/images/tracocult.logo.png')}
              style={{ height: 48, width: 220, marginBottom: 12 }}
              resizeMode="contain"
            />
            <Text style={{ color: 'rgba(255,255,255,0.7)', fontSize: 14 }}>
              Crie sua conta
            </Text>
          </View>

          <View
            style={{
              backgroundColor: 'rgba(255,255,255,0.12)',
              borderRadius: 20,
              borderWidth: 1,
              borderColor: 'rgba(255,255,255,0.2)',
              padding: 24,
            }}
          >
            {[
              { key: 'nome', label: 'Nome', value: nome, setValue: setNome, error: errors.nome },
              { key: 'email', label: 'Email', value: email, setValue: setEmail, error: errors.email },
              { key: 'senha', label: 'Senha', value: senha, setValue: setSenha, error: errors.senha },
            ].map((field) => (
              <View key={field.key} style={{ marginBottom: 12 }}>
                <Text style={{ color: 'rgba(255,255,255,0.8)', fontSize: 13, marginBottom: 6 }}>
                  {field.label}
                </Text>
                <TextInput
                  value={field.value}
                  onChangeText={(value) => {
                    field.setValue(value);
                    setErrors((p) => ({ ...p, [field.key]: '' }));
                  }}
                  placeholder={field.label}
                  placeholderTextColor="rgba(255,255,255,0.4)"
                  keyboardType={field.key === 'email' ? 'email-address' : 'default'}
                  autoCapitalize={field.key === 'nome' ? 'words' : 'none'}
                  secureTextEntry={field.key === 'senha'}
                  style={{
                    backgroundColor: 'rgba(255,255,255,0.15)',
                    borderRadius: 25,
                    paddingHorizontal: 18,
                    paddingVertical: 13,
                    color: '#fff',
                    fontSize: 15,
                    borderWidth: 1,
                    borderColor: field.error ? '#ff6b6b' : 'rgba(255,255,255,0.2)',
                  }}
                />
                {!!field.error && (
                  <Text style={{ color: '#ff9999', fontSize: 12, marginTop: 4 }}>
                    {field.error}
                  </Text>
                )}
              </View>
            ))}

            <Pressable
              onPress={handleCadastrar}
              disabled={loading}
              style={({ pressed }) => ({
                backgroundColor: pressed ? 'rgba(255,255,255,0.85)' : '#fff',
                borderRadius: 25,
                paddingVertical: 14,
                alignItems: 'center',
                marginTop: 8,
              })}
            >
              {loading ? (
                <ActivityIndicator color={Theme.colors.secondary} />
              ) : (
                <Text style={{ color: Theme.colors.secondary, fontWeight: '700', fontSize: 16 }}>
                  Criar conta
                </Text>
              )}
            </Pressable>

            <Pressable
              onPress={() => router.replace('/(tabs)/login' as never)}
              style={({ pressed }) => ({ alignItems: 'center', marginTop: 16, opacity: pressed ? 0.65 : 1 })}
            >
              <Text style={{ color: '#fff', fontWeight: '700', fontSize: 14 }}>
                Já tenho conta
              </Text>
            </Pressable>
          </View>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </LinearGradient>
  );
}
