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
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Theme } from '@/constants/theme';
import { SuccessModal } from '@/components/success-modal';
import { useAuth } from '@/contexts/auth-context';
import { atualizarUsuario } from '@/services/user-service';

type Errors = {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
};

function Field({
  label,
  value,
  onChangeText,
  error,
  placeholder,
}: {
  label: string;
  value: string;
  onChangeText: (v: string) => void;
  error?: string;
  placeholder?: string;
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
          secureTextEntry={!show}
          autoCapitalize="none"
          autoCorrect={false}
          style={{
            backgroundColor: Theme.glass.bg,
            borderRadius: 12,
            paddingHorizontal: 16,
            paddingVertical: 13,
            paddingRight: 46,
            color: '#fff',
            fontSize: 15,
            borderWidth: 1,
            borderColor: error ? '#ff6b6b' : Theme.glass.border,
          }}
        />
        <Pressable
          onPress={() => setShow((p) => !p)}
          hitSlop={8}
          style={{ position: 'absolute', right: 14, top: 0, bottom: 0, justifyContent: 'center' }}
        >
          <Ionicons name={show ? 'eye-off-outline' : 'eye-outline'} size={18} color="rgba(255,255,255,0.5)" />
        </Pressable>
      </View>
      {!!error && (
        <Text style={{ color: '#ff9999', fontSize: 12, marginTop: 4, marginLeft: 2 }}>
          {error}
        </Text>
      )}
    </View>
  );
}

export default function AlterarSenha() {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errors, setErrors] = useState<Errors>({
    currentPassword: '', newPassword: '', confirmPassword: '',
  });
  const [loading, setLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const router = useRouter();
  const { user, setUser } = useAuth();

  function clearError(field: keyof Errors) {
    setErrors((p) => ({ ...p, [field]: '' }));
  }

  function validate() {
    const e: Errors = { currentPassword: '', newPassword: '', confirmPassword: '' };

    if (!currentPassword) e.currentPassword = 'Informe a senha atual';
    if (!newPassword) e.newPassword = 'Informe a nova senha';
    else if (newPassword.length < 6) e.newPassword = 'Mínimo 6 caracteres';
    if (!confirmPassword) e.confirmPassword = 'Confirme a nova senha';
    else if (newPassword !== confirmPassword) e.confirmPassword = 'As senhas não coincidem';

    setErrors(e);
    return !Object.values(e).some(Boolean);
  }

  async function handleSave() {
    if (!validate()) return;

    setLoading(true);
    try {
      if (!user?.id) throw new Error('Usuário não encontrado');
      const updated = await atualizarUsuario(user.id, {
        senhaAtual: currentPassword,
        senha: newPassword,
      } as any);
      setUser(updated);
      setShowSuccess(true);
    } catch {
      setErrors((p) => ({ ...p, currentPassword: 'Não foi possível alterar a senha. Verifique a senha atual.' }));
    } finally {
      setLoading(false);
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
            <Text style={{ color: '#fff', fontSize: 20, fontWeight: '700' }}>Alterar Senha</Text>
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
              <View
                style={{
                  backgroundColor: Theme.glass.bg,
                  borderRadius: Theme.radius.md,
                  borderWidth: 1,
                  borderColor: Theme.glass.border,
                  padding: 20,
                  marginBottom: 24,
                }}
              >
                <Text style={{ color: '#fff', fontSize: 15, fontWeight: '700', marginBottom: 4 }}>
                  Alterar Senha
                </Text>
                <Text style={{ color: 'rgba(255,255,255,0.5)', fontSize: 12, marginBottom: 16 }}>
                  Informe sua senha atual e escolha uma nova
                </Text>
                <Field
                  label="Senha atual"
                  value={currentPassword}
                  onChangeText={(v) => { setCurrentPassword(v); clearError('currentPassword'); }}
                  error={errors.currentPassword}
                  placeholder="••••••••"
                />
                <View style={{ marginTop: 12 }}>
                  <Field
                    label="Nova senha"
                    value={newPassword}
                    onChangeText={(v) => { setNewPassword(v); clearError('newPassword'); }}
                    error={errors.newPassword}
                    placeholder="Mínimo 6 caracteres"
                  />
                </View>
                <View style={{ marginTop: 12 }}>
                  <Field
                    label="Confirmar nova senha"
                    value={confirmPassword}
                    onChangeText={(v) => { setConfirmPassword(v); clearError('confirmPassword'); }}
                    error={errors.confirmPassword}
                    placeholder="Repita a nova senha"
                  />
                </View>
              </View>

              {/* Botões */}
              <View style={{ flexDirection: 'row', gap: 12 }}>
                <Pressable
                  onPress={() => router.back()}
                  style={({ pressed }) => ({
                    flex: 1,
                    borderRadius: Theme.radius.pill,
                    paddingVertical: 14,
                    alignItems: 'center',
                    borderWidth: 1,
                    borderColor: 'rgba(255,255,255,0.35)',
                    backgroundColor: pressed ? Theme.glass.bg : 'transparent',
                  })}
                >
                  <Text style={{ color: '#fff', fontWeight: '600', fontSize: 15 }}>Cancelar</Text>
                </Pressable>

                <Pressable
                  onPress={handleSave}
                  disabled={loading}
                  style={({ pressed }) => ({
                    flex: 1,
                    borderRadius: Theme.radius.pill,
                    paddingVertical: 14,
                    alignItems: 'center',
                    backgroundColor: pressed ? Theme.colors.accentDark : Theme.colors.accent,
                    ...Theme.shadow.accent,
                  })}
                >
                  {loading ? (
                    <ActivityIndicator color={Theme.colors.primaryDark} />
                  ) : (
                    <Text style={{ color: Theme.colors.primaryDark, fontWeight: '700', fontSize: 15 }}>
                      Salvar Senha
                    </Text>
                  )}
                </Pressable>
              </View>
            </ScrollView>
          </KeyboardAvoidingView>
        </SafeAreaView>
      </LinearGradient>

      <SuccessModal
        visible={showSuccess}
        message="Senha alterada com sucesso!"
        onClose={() => {
          setShowSuccess(false);
          router.back();
        }}
      />
    </>
  );
}
