import { useState } from 'react';
import { ActivityIndicator, Pressable, Text, TextInput, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { AuthField, AuthLayout, authInputStyle, authSubmitStyle } from '@/components/auth-layout';
import { Theme } from '@/constants/theme';
import { cadastrarUsuario } from '@/services/auth-service';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const SENHA_FORTE_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&]).{8,}$/;

export default function Cadastrar() {
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [confirmarSenha, setConfirmarSenha] = useState('');
  const [showSenha, setShowSenha] = useState(false);
  const [showConfirmar, setShowConfirmar] = useState(false);
  const [loading, setLoading] = useState(false);
  const [erroGeral, setErroGeral] = useState('');
  const [errors, setErrors] = useState({ nome: '', email: '', senha: '', confirmarSenha: '' });
  const router = useRouter();

  function validate() {
    const next = { nome: '', email: '', senha: '', confirmarSenha: '' };
    if (!nome.trim()) next.nome = 'Nome é obrigatório.';
    if (!EMAIL_REGEX.test(email)) next.email = 'Email inválido.';
    if (!SENHA_FORTE_REGEX.test(senha))
      next.senha = 'A senha deve conter no mínimo 8 caracteres, uma letra maiúscula, uma minúscula, um número e um caractere especial.';
    if (senha !== confirmarSenha) next.confirmarSenha = 'As senhas não coincidem.';
    setErrors(next);
    return !Object.values(next).some(Boolean);
  }

  async function handleCadastrar() {
    if (!validate()) return;
    setErroGeral('');
    setLoading(true);
    try {
      await cadastrarUsuario({ nome: nome.trim(), email: email.trim(), senha });
      router.push({ pathname: '/(tabs)/verificar-codigo', params: { email: email.trim() } } as never);
    } catch (err: any) {
      const status = err.response?.status;
      const msgBackend = err.response?.data?.message;
      if (status === 409) {
        setErrors((p) => ({ ...p, email: 'Este email já está cadastrado.' }));
      } else if (status === 400 && msgBackend?.toLowerCase().includes('domínio')) {
        setErrors((p) => ({ ...p, email: 'Esse domínio de email não existe. Confira se digitou corretamente.' }));
      } else {
        setErroGeral(msgBackend || 'Erro ao criar conta. Tente novamente.');
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthLayout title="Faça parte do Traço Cultural" subtitle="Crie sua conta para descobrir, salvar e participar de eventos culturais na sua cidade.">
      <Text style={{ color: Theme.colors.primaryDark, fontSize: 22, fontWeight: '800', letterSpacing: -0.5, marginBottom: 4 }}>
        Criar conta
      </Text>
      <Text style={{ color: Theme.light.textMuted, fontSize: 13, fontWeight: '300', marginBottom: 24 }}>
        Junte-se ao Traço Cultural
      </Text>

      {!!erroGeral && (
        <View style={{ backgroundColor: '#fff0f0', borderLeftWidth: 4, borderLeftColor: '#e74c3c', borderRadius: 10, padding: 12, marginBottom: 16 }}>
          <Text style={{ color: '#c0392b', fontSize: 13, fontWeight: '500' }}>{erroGeral}</Text>
        </View>
      )}

      <AuthField label="Nome" icon="person-outline" error={errors.nome}>
        <TextInput
          value={nome}
          onChangeText={(v) => { setNome(v); setErrors((p) => ({ ...p, nome: '' })); }}
          placeholder="Seu nome completo"
          placeholderTextColor="#cabdb5"
          autoCapitalize="words"
          style={[authInputStyle, errors.nome ? { borderBottomColor: '#e74c3c' } : null]}
        />
      </AuthField>

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

      <View>
        <AuthField label="Senha" icon="lock-closed-outline" error={errors.senha}>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <TextInput
              value={senha}
              onChangeText={(v) => { setSenha(v); setErrors((p) => ({ ...p, senha: '' })); }}
              placeholder="Ex: Traco123@"
              placeholderTextColor="#cabdb5"
              secureTextEntry={!showSenha}
              style={[authInputStyle, { flex: 1 }, errors.senha ? { borderBottomColor: '#e74c3c' } : null]}
            />
            <Pressable onPress={() => setShowSenha((p) => !p)} hitSlop={8} style={{ paddingBottom: 10 }}>
              <Ionicons name={showSenha ? 'eye-off-outline' : 'eye-outline'} size={17} color={Theme.colors.accentDark} />
            </Pressable>
          </View>
        </AuthField>
        <Text style={{ color: Theme.light.textMuted, fontSize: 11, lineHeight: 17, marginTop: -10, marginBottom: 18 }}>
          A senha deve conter: mínimo 8 caracteres, uma letra maiúscula, uma minúscula, um número e um caractere especial (@, $, !, %, *, ?, &).
        </Text>
      </View>

      <AuthField label="Confirmar senha" icon="lock-closed" error={errors.confirmarSenha}>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <TextInput
            value={confirmarSenha}
            onChangeText={(v) => { setConfirmarSenha(v); setErrors((p) => ({ ...p, confirmarSenha: '' })); }}
            placeholder="Repita a senha"
            placeholderTextColor="#cabdb5"
            secureTextEntry={!showConfirmar}
            style={[authInputStyle, { flex: 1 }, errors.confirmarSenha ? { borderBottomColor: '#e74c3c' } : null]}
          />
          <Pressable onPress={() => setShowConfirmar((p) => !p)} hitSlop={8} style={{ paddingBottom: 10 }}>
            <Ionicons name={showConfirmar ? 'eye-off-outline' : 'eye-outline'} size={17} color={Theme.colors.accentDark} />
          </Pressable>
        </View>
      </AuthField>

      <Pressable onPress={handleCadastrar} disabled={loading} style={({ pressed }) => authSubmitStyle({ pressed, disabled: loading })}>
        {loading ? <ActivityIndicator color="#fff" /> : (
          <Text style={{ color: '#fff', fontWeight: '700', fontSize: 15, letterSpacing: 0.4 }}>Criar conta</Text>
        )}
      </Pressable>

      <View style={{ marginTop: 30, gap: 10 }}>
        <Text style={{ color: Theme.light.textMuted, fontSize: 13.5 }}>
          Já tem uma conta?{' '}
          <Text onPress={() => router.replace('/(tabs)/login' as never)} style={{ color: Theme.colors.accentDark, fontWeight: '700' }}>
            Entrar
          </Text>
        </Text>
      </View>
    </AuthLayout>
  );
}