import { useState } from 'react';
import {
  ActivityIndicator,
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
import { useRouter } from 'expo-router';
import { Theme } from '@/constants/theme';
import { cadastrarUsuario } from '@/services/auth-service';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
// mesma regra do backend/web: mín. 8, maiúscula, minúscula, número e especial
const SENHA_FORTE_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&]).{8,}$/;

export default function Cadastrar() {
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [confirmarSenha, setConfirmarSenha] = useState('');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({ nome: '', email: '', senha: '', confirmarSenha: '' });
  const router = useRouter();

  function validate() {
    const next = { nome: '', email: '', senha: '', confirmarSenha: '' };
    if (!nome.trim()) next.nome = 'Nome obrigatório';
    if (!email.trim()) next.email = 'Email obrigatório';
    else if (!EMAIL_REGEX.test(email)) next.email = 'Email inválido';
    if (!senha) next.senha = 'Senha obrigatória';
    else if (!SENHA_FORTE_REGEX.test(senha))
      next.senha = 'Mín. 8 caracteres, maiúscula, minúscula, número e caractere especial';
    if (confirmarSenha !== senha) next.confirmarSenha = 'As senhas não coincidem';
    setErrors(next);
    return !Object.values(next).some(Boolean);
  }

  async function handleCadastrar() {
    if (!validate()) return;
    setLoading(true);
    try {
      await cadastrarUsuario({ nome: nome.trim(), email: email.trim(), senha });
      // Conta criada mas ainda não confirmada -- vai pra tela de código.
      router.push({
        pathname: '/(tabs)/verificar-codigo',
        params: { email: email.trim() },
      } as never);
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

  const fields = [
    { key: 'nome', label: 'Nome', value: nome, setValue: setNome, error: errors.nome, secure: false, keyboard: 'default' as const, autoCap: 'words' as const },
    { key: 'email', label: 'Email', value: email, setValue: setEmail, error: errors.email, secure: false, keyboard: 'email-address' as const, autoCap: 'none' as const },
    { key: 'senha', label: 'Senha', value: senha, setValue: setSenha, error: errors.senha, secure: true, keyboard: 'default' as const, autoCap: 'none' as const },
    { key: 'confirmarSenha', label: 'Confirmar senha', value: confirmarSenha, setValue: setConfirmarSenha, error: errors.confirmarSenha, secure: true, keyboard: 'default' as const, autoCap: 'none' as const },
  ];

  return (
    <View style={{ flex: 1, backgroundColor: Theme.light.bg }}>
      <SafeAreaView style={{ flex: 1 }}>
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
          <ScrollView
            contentContainerStyle={{ flexGrow: 1, justifyContent: 'center', paddingHorizontal: 24, paddingVertical: 32 }}
            keyboardShouldPersistTaps="handled"
          >
            <View style={{ alignItems: 'center', marginBottom: 28 }}>
              <Image
                source={require('@/assets/images/tracocult.logo.png')}
                style={{ height: 44, width: 200, marginBottom: 10 }}
                resizeMode="contain"
              />
              <Text style={{ color: Theme.light.textMuted, fontSize: 14 }}>Crie sua conta</Text>
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
              {fields.map((field) => (
                <View key={field.key} style={{ marginBottom: 14 }}>
                  <Text style={{ color: Theme.light.textMuted, fontSize: 13, marginBottom: 6 }}>
                    {field.label}
                  </Text>
                  <TextInput
                    value={field.value}
                    onChangeText={(value) => {
                      field.setValue(value);
                      setErrors((p) => ({ ...p, [field.key]: '' }));
                    }}
                    placeholder={field.label}
                    placeholderTextColor="#b0a09e"
                    keyboardType={field.keyboard}
                    autoCapitalize={field.autoCap}
                    secureTextEntry={field.secure}
                    style={{
                      backgroundColor: Theme.light.surfaceAlt,
                      borderRadius: Theme.radius.pill,
                      paddingHorizontal: 18,
                      paddingVertical: 13,
                      color: Theme.light.text,
                      fontSize: 15,
                      borderWidth: 1,
                      borderColor: field.error ? Theme.colors.danger : Theme.light.border,
                    }}
                  />
                  {!!field.error && (
                    <Text style={{ color: Theme.colors.danger, fontSize: 12, marginTop: 4, marginLeft: 4 }}>
                      {field.error}
                    </Text>
                  )}
                </View>
              ))}

              <Text style={{ color: Theme.light.textMuted, fontSize: 12, marginBottom: 12, lineHeight: 17 }}>
                A senha deve ter no mínimo 8 caracteres, com maiúscula, minúscula, número e um
                caractere especial (@, $, !, %, *, ?, &).
              </Text>

              <Pressable
                onPress={handleCadastrar}
                disabled={loading}
                style={({ pressed }) => ({
                  backgroundColor: pressed ? Theme.colors.accentDark : Theme.colors.accent,
                  borderRadius: Theme.radius.pill,
                  paddingVertical: 14,
                  alignItems: 'center',
                  marginTop: 4,
                  ...Theme.shadow.accent,
                })}
              >
                {loading ? (
                  <ActivityIndicator color={Theme.colors.primaryDark} />
                ) : (
                  <Text style={{ color: Theme.colors.primaryDark, fontWeight: '700', fontSize: 16 }}>
                    Criar conta
                  </Text>
                )}
              </Pressable>

              <Pressable
                onPress={() => router.replace('/(tabs)/login' as never)}
                style={({ pressed }) => ({ alignItems: 'center', marginTop: 16, opacity: pressed ? 0.65 : 1 })}
              >
                <Text style={{ color: Theme.colors.primary, fontWeight: '700', fontSize: 14 }}>
                  Já tenho conta
                </Text>
              </Pressable>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </View>
  );
}
