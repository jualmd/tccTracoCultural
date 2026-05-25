import { useEffect, useState } from 'react';
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
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Theme } from '@/constants/theme';
import { USER_STORAGE_KEY, type User } from '@/constants/user-types';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PASSWORD_KEY = '@traco:password';

type Errors = {
  name: string;
  email: string;
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
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
            backgroundColor: 'rgba(255,255,255,0.15)',
            borderRadius: 12,
            paddingHorizontal: 16,
            paddingVertical: 13,
            paddingRight: secure ? 46 : 16,
            color: '#fff',
            fontSize: 15,
            borderWidth: 1,
            borderColor: error ? '#ff6b6b' : 'rgba(255,255,255,0.2)',
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
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errors, setErrors] = useState<Errors>({
    name: '', email: '', currentPassword: '', newPassword: '', confirmPassword: '',
  });
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    AsyncStorage.getItem(USER_STORAGE_KEY).then((raw) => {
      if (raw) {
        const user: User = JSON.parse(raw);
        setName(user.name);
        setEmail(user.email);
      }
    });
  }, []);

  function clearError(field: keyof Errors) {
    setErrors((p) => ({ ...p, [field]: '' }));
  }

  async function validate() {
    const e: Errors = {
      name: '', email: '', currentPassword: '', newPassword: '', confirmPassword: '',
    };

    if (!name.trim()) e.name = 'Nome obrigatório';
    if (!email) e.email = 'Email obrigatório';
    else if (!EMAIL_REGEX.test(email)) e.email = 'Email inválido';

    const changingPassword = currentPassword || newPassword || confirmPassword;
    if (changingPassword) {
      const savedPassword = await AsyncStorage.getItem(PASSWORD_KEY);
      if (!currentPassword) {
        e.currentPassword = 'Informe a senha atual';
      } else if (savedPassword && currentPassword !== savedPassword) {
        // Só rejeita se houver senha salva E não bater
        e.currentPassword = 'Senha atual incorreta';
      }
      if (!newPassword) e.newPassword = 'Informe a nova senha';
      else if (newPassword.length < 6) e.newPassword = 'Mínimo 6 caracteres';
      if (!confirmPassword) e.confirmPassword = 'Confirme a nova senha';
      else if (newPassword !== confirmPassword) e.confirmPassword = 'As senhas não coincidem';
    }

    setErrors(e);
    return !Object.values(e).some(Boolean);
  }

  async function handleSave() {
    const valid = await validate();
    if (!valid) return;

    setLoading(true);
    try {
      // Busca o usuário atual e atualiza APENAS nome e email (preserva id, createdAt, etc.)
      const raw = await AsyncStorage.getItem(USER_STORAGE_KEY);
      const existing: User = raw ? JSON.parse(raw) : {};
      const updated: User = { ...existing, name: name.trim(), email };
      await AsyncStorage.setItem(USER_STORAGE_KEY, JSON.stringify(updated));

      // Salva nova senha se o usuário quis alterar
      const changingPassword = currentPassword || newPassword || confirmPassword;
      if (changingPassword && newPassword) {
        await AsyncStorage.setItem(PASSWORD_KEY, newPassword);
      }

      Alert.alert('Sucesso', 'Perfil atualizado com sucesso!', [
        { text: 'OK', onPress: () => router.back() },
      ]);
    } catch {
      Alert.alert('Erro', 'Não foi possível salvar. Tente novamente.');
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
            style={({ pressed }) => ({ opacity: pressed ? 0.6 : 1 })}
          >
            <Ionicons name="arrow-back" size={24} color="#fff" />
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
                backgroundColor: 'rgba(255,255,255,0.12)',
                borderRadius: 20,
                borderWidth: 1,
                borderColor: 'rgba(255,255,255,0.2)',
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

            {/* Alterar senha */}
            <View
              style={{
                backgroundColor: 'rgba(255,255,255,0.12)',
                borderRadius: 20,
                borderWidth: 1,
                borderColor: 'rgba(255,255,255,0.2)',
                padding: 20,
                marginBottom: 24,
              }}
            >
              <Text style={{ color: '#fff', fontSize: 15, fontWeight: '700', marginBottom: 4 }}>
                Alterar Senha
              </Text>
              <Text style={{ color: 'rgba(255,255,255,0.5)', fontSize: 12, marginBottom: 16 }}>
                Deixe em branco para manter a senha atual
              </Text>
              <Field
                label="Senha atual"
                value={currentPassword}
                onChangeText={(v) => { setCurrentPassword(v); clearError('currentPassword'); }}
                error={errors.currentPassword}
                placeholder="••••••••"
                secure
              />
              <View style={{ marginTop: 12 }}>
                <Field
                  label="Nova senha"
                  value={newPassword}
                  onChangeText={(v) => { setNewPassword(v); clearError('newPassword'); }}
                  error={errors.newPassword}
                  placeholder="Mínimo 6 caracteres"
                  secure
                />
              </View>
              <View style={{ marginTop: 12 }}>
                <Field
                  label="Confirmar nova senha"
                  value={confirmPassword}
                  onChangeText={(v) => { setConfirmPassword(v); clearError('confirmPassword'); }}
                  error={errors.confirmPassword}
                  placeholder="Repita a nova senha"
                  secure
                />
              </View>
            </View>

            {/* Botões */}
            <View style={{ flexDirection: 'row', gap: 12 }}>
              <Pressable
                onPress={() => router.back()}
                style={({ pressed }) => ({
                  flex: 1,
                  borderRadius: 12,
                  paddingVertical: 14,
                  alignItems: 'center',
                  borderWidth: 1,
                  borderColor: 'rgba(255,255,255,0.35)',
                  backgroundColor: pressed ? 'rgba(255,255,255,0.08)' : 'transparent',
                })}
              >
                <Text style={{ color: '#fff', fontWeight: '600', fontSize: 15 }}>Cancelar</Text>
              </Pressable>

              <Pressable
                onPress={handleSave}
                disabled={loading}
                style={({ pressed }) => ({
                  flex: 1,
                  borderRadius: 12,
                  paddingVertical: 14,
                  alignItems: 'center',
                  backgroundColor: pressed ? 'rgba(255,255,255,0.85)' : '#fff',
                })}
              >
                {loading ? (
                  <ActivityIndicator color={Theme.colors.secondary} />
                ) : (
                  <Text style={{ color: Theme.colors.secondary, fontWeight: '700', fontSize: 15 }}>
                    Salvar Alterações
                  </Text>
                )}
              </Pressable>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </LinearGradient>
  );
}
