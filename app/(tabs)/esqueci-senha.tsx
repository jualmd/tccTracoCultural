import { useState } from 'react';
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
import { useRouter } from 'expo-router';
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
      router.push({
        pathname: '/(tabs)/redefinir-senha',
        params: { email: email.trim() },
      } as never);
    } catch (err: any) {
      // Por segurança o backend pode não confirmar se o email existe;
      // mesmo assim seguimos pra tela de código.
      router.push({
        pathname: '/(tabs)/redefinir-senha',
        params: { email: email.trim() },
      } as never);
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
                <Ionicons name="lock-closed-outline" size={26} color={Theme.colors.primary} />
              </View>
              <Text style={{ color: Theme.light.text, fontSize: 20, fontWeight: '700', textAlign: 'center' }}>
                Vamos recuperar o acesso à sua conta
              </Text>
              <Text style={{ color: Theme.light.textMuted, fontSize: 14, textAlign: 'center', marginTop: 6 }}>
                Informe o email cadastrado e enviaremos um código de confirmação.
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
              <Text style={{ color: Theme.light.textMuted, fontSize: 13, marginBottom: 6 }}>Email</Text>
              <TextInput
                value={email}
                onChangeText={(v) => { setEmail(v); setErro(''); }}
                placeholder="seu@email.com"
                placeholderTextColor="#b0a09e"
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
                autoFocus
                style={{
                  backgroundColor: Theme.light.surfaceAlt,
                  borderRadius: Theme.radius.pill,
                  paddingHorizontal: 18,
                  paddingVertical: 13,
                  color: Theme.light.text,
                  fontSize: 15,
                  borderWidth: 1,
                  borderColor: erro ? Theme.colors.danger : Theme.light.border,
                  marginBottom: 4,
                }}
              />
              {!!erro && (
                <Text style={{ color: Theme.colors.danger, fontSize: 12, marginBottom: 8, marginLeft: 4 }}>
                  {erro}
                </Text>
              )}

              <Pressable
                onPress={handleEnviar}
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
                    Enviar código
                  </Text>
                )}
              </Pressable>

              <Pressable onPress={() => router.back()} style={{ alignItems: 'center', marginTop: 18 }}>
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
