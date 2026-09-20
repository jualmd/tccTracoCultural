import { useEffect, useCallback, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Theme } from '@/constants/theme';
import { SuccessModal } from '@/components/success-modal';
import { Button, ButtonRow } from '@/components/ui/button';
import { useAuth } from '@/contexts/auth-context';
import { atualizarUsuario } from '@/services/user-service';
import { esqueciSenha } from '@/services/auth-service';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

type Errors = {
  name: string;
  email: string;
};

function Field({
  label,
  value,
  onChangeText,
  error,
  secure,
  placeholder,
  keyboardType,
  autoCapitalize,
}: {
  label: string;
  value: string;
  onChangeText: (v: string) => void;
  error?: string;
  secure?: boolean;
  placeholder?: string;
  keyboardType?: 'default' | 'email-address';
  autoCapitalize?: 'none' | 'words';
}) {
  const [show, setShow] = useState(false);

  return (
    <View style={{ marginBottom: 4 }}>
      <Text style={{ color: 'rgba(255,255,255,0.8)', fontSize: 13, marginBottom: 6 }}>
        {label}
      </Text>
      <View style={{ position: 'relative' }}>
        <TextInput
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor="rgba(255,255,255,0.4)"
          secureTextEntry={secure && !show}
          keyboardType={keyboardType ?? 'default'}
          autoCapitalize={autoCapitalize ?? 'none'}
          autoCorrect={false}
          style={{
            backgroundColor: Theme.glass.bg,
            borderRadius: 12,
            paddingHorizontal: 16,
            paddingVertical: 13,
            paddingRight: secure ? 46 : 16,
            color: '#fff',
            fontSize: 15,
            borderWidth: 1,
            borderColor: error ? '#ff6b6b' : Theme.glass.border,
          }}
        />
        {secure && (
          <Pressable
            onPress={() => setShow((p) => !p)}
            hitSlop={8}
            style={{ position: 'absolute', right: 14, top: 0, bottom: 0, justifyContent: 'center' }}
          >
            <Ionicons name={show ? 'eye-off-outline' : 'eye-outline'} size={18} color="rgba(255,255,255,0.5)" />
          </Pressable>
        )}
      </View>
      {!!error && (
        <Text style={{ color: '#ff9999', fontSize: 12, marginTop: 4, marginLeft: 2 }}>
          {error}
        </Text>
      )}
    </View>
  );
}

export default function EditProfile() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [errors, setErrors] = useState<Errors>({ name: '', email: '' });
  const [loading, setLoading] = useState(false);
  const [sendingCode, setSendingCode] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [showSuccess, setShowSuccess] = useState(false);
  const router = useRouter();
  const { user, setUser } = useAuth();

  const handleSuccessClose = useCallback(() => {
    setShowSuccess(false);
    router.back();
  }, [router]);

  useEffect(() => {
    if (!user) return;
    setName(user.nome);
    setEmail(user.email);
  }, [user]);

  function clearError(field: keyof Errors) {
    setErrors((p) => ({ ...p, [field]: '' }));
  }

  function validate() {
    const e: Errors = { name: '', email: '' };

    if (!name.trim()) e.name = 'Nome obrigatório';
    if (!email) e.email = 'Email obrigatório';
    else if (!EMAIL_REGEX.test(email)) e.email = 'Email inválido';

    setErrors(e);
    return !Object.values(e).some(Boolean);
  }

  async function handleSave() {
    if (!validate()) return;

    setLoading(true);
    try {
      if (!user?.id) throw new Error('Usuário não encontrado');
      const updated = await atualizarUsuario(user.id, { nome: name.trim(), email });
      setUser(updated);
      setSuccessMessage('Informações atualizadas com sucesso!');
      setShowSuccess(true);
    } catch {
      router.back();
    } finally {
      setLoading(false);
    }
  }

  async function handleAlterarSenha() {
    if (!user?.email || sendingCode) return;
    setSendingCode(true);
    try {
      // Mesmo fluxo de "esqueci minha senha": envia um código de 6 dígitos
      // por email e só a partir dele a pessoa consegue definir a nova
      // senha — em vez de pedir a senha atual direto nesta tela.
      await esqueciSenha(user.email);
      router.push({
        pathname: '/redefinir-senha',
        params: { email: user.email },
      } as never);
    } catch {
      Alert.alert('Erro', 'Não foi possível enviar o código agora. Tente novamente.');
    } finally {
      setSendingCode(false);
    }
  }

  return (
    <>
      <LinearGradient
        colors={Theme.gradient.primary}
        style={{ flex: 1 }}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <SafeAreaView style={{ flex: 1 }}>
          {/* Header */}
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              paddingHorizontal: 20,
              paddingVertical: 16,
              gap: 12,
            }}
          >
            <Pressable
              onPress={() => router.back()}
              hitSlop={8}
              style={({ pressed }) => ({
                opacity: pressed ? 0.6 : 1,
                backgroundColor: Theme.glass.bg,
                borderRadius: 16,
                padding: 7,
                borderWidth: 1,
                borderColor: Theme.glass.border,
              })}
            >
              <Ionicons name="arrow-back" size={20} color="#fff" />
            </Pressable>
            <Text style={{ color: '#fff', fontSize: 20, fontWeight: '700' }}>Editar Perfil</Text>
          </View>

          <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={{ flex: 1 }}
          >
            <ScrollView
              contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 32 }}
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="handled"
            >
              {/* Informações */}
              <View
                style={{
                  backgroundColor: Theme.glass.bg,
                  borderRadius: Theme.radius.md,
                  borderWidth: 1,
                  borderColor: Theme.glass.border,
                  padding: 20,
                  marginBottom: 16,
                }}
              >
                <Text style={{ color: '#fff', fontSize: 15, fontWeight: '700', marginBottom: 16 }}>
                  Informações Pessoais
                </Text>
                <Field
                  label="Nome completo"
                  value={name}
                  onChangeText={(v) => { setName(v); clearError('name'); }}
                  error={errors.name}
                  placeholder="Seu nome"
                  autoCapitalize="words"
                  keyboardType="default"
                />
                <View style={{ marginTop: 12 }}>
                  <Field
                    label="Email"
                    value={email}
                    onChangeText={(v) => { setEmail(v); clearError('email'); }}
                    error={errors.email}
                    placeholder="seu@email.com"
                    keyboardType="email-address"
                  />
                </View>
              </View>

              {/* Alterar senha — dispara o envio do código por email (mesmo
                  fluxo de "esqueci senha") e leva direto pra tela que
                  recebe esse código, em vez de pedir a senha atual aqui. */}
              <Pressable
                onPress={handleAlterarSenha}
                disabled={sendingCode}
                style={({ pressed }) => ({
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  backgroundColor: pressed ? Theme.glass.bgMd : Theme.glass.bg,
                  borderRadius: Theme.radius.md,
                  borderWidth: 1,
                  borderColor: Theme.glass.border,
                  padding: 18,
                  marginBottom: 24,
                  opacity: sendingCode ? 0.7 : 1,
                })}
              >
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                  <View
                    style={{
                      width: 38,
                      height: 38,
                      borderRadius: 12,
                      backgroundColor: 'rgba(255,255,255,0.10)',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <Ionicons name="lock-closed-outline" size={18} color="#fff" />
                  </View>
                  <View>
                    <Text style={{ color: '#fff', fontSize: 15, fontWeight: '700' }}>
                      Alterar Senha
                    </Text>
                    <Text style={{ color: 'rgba(255,255,255,0.5)', fontSize: 12, marginTop: 2 }}>
                      {sendingCode ? 'Enviando código...' : 'Enviaremos um código por email'}
                    </Text>
                  </View>
                </View>
                {sendingCode ? (
                  <ActivityIndicator size="small" color="rgba(255,255,255,0.7)" />
                ) : (
                  <Ionicons name="chevron-forward" size={18} color="rgba(255,255,255,0.5)" />
                )}
              </Pressable>

              {/* Botões */}
              <ButtonRow>
                <Button
                  label="Cancelar"
                  variant="outlineOnDark"
                  onPress={() => router.back()}
                  style={{ flex: 1 }}
                />
                <Button
                  label="Salvar Alterações"
                  loading={loading}
                  onPress={handleSave}
                  style={{ flex: 1 }}
                />
              </ButtonRow>
            </ScrollView>
          </KeyboardAvoidingView>
        </SafeAreaView>
      </LinearGradient>

      <SuccessModal
        visible={showSuccess}
        message={successMessage}
        onClose={handleSuccessClose}
      />
    </>
  );
}