import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
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
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Theme } from '@/constants/theme';
import { USER_STORAGE_KEY, type User } from '@/constants/user-types';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function EditProfile() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [errors, setErrors] = useState({ name: '', email: '' });
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);
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

  function validate() {
    const e = { name: '', email: '' };
    if (!name.trim()) e.name = 'Nome obrigatório';
    if (!email) e.email = 'Email obrigatório';
    else if (!EMAIL_REGEX.test(email)) e.email = 'Email inválido';
    setErrors(e);
    return !e.name && !e.email;
  }

  async function handleSave() {
    if (!validate()) return;
    setLoading(true);
    try {
      const raw = await AsyncStorage.getItem(USER_STORAGE_KEY);
      const existing: User = raw ? JSON.parse(raw) : {};
      await AsyncStorage.setItem(
        USER_STORAGE_KEY,
        JSON.stringify({ ...existing, name: name.trim(), email })
      );
      setSaved(true);
      setTimeout(() => {
        router.back();
      }, 800);
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
          style={{ flex: 1, paddingHorizontal: 20 }}
        >
          {/* Card */}
          <View
            style={{
              backgroundColor: 'rgba(255,255,255,0.12)',
              borderRadius: 20,
              borderWidth: 1,
              borderColor: 'rgba(255,255,255,0.2)',
              padding: 24,
              marginTop: 8,
            }}
          >
            {/* Nome */}
            <Text style={{ color: 'rgba(255,255,255,0.8)', fontSize: 13, marginBottom: 6 }}>
              Nome completo
            </Text>
            <TextInput
              value={name}
              onChangeText={(v) => { setName(v); setErrors((p) => ({ ...p, name: '' })); }}
              placeholder="Seu nome"
              placeholderTextColor="rgba(255,255,255,0.4)"
              autoCapitalize="words"
              style={{
                backgroundColor: 'rgba(255,255,255,0.15)',
                borderRadius: 12,
                paddingHorizontal: 16,
                paddingVertical: 13,
                color: '#fff',
                fontSize: 15,
                borderWidth: 1,
                borderColor: errors.name ? '#ff6b6b' : 'rgba(255,255,255,0.2)',
                marginBottom: 4,
              }}
            />
            {!!errors.name && (
              <Text style={{ color: '#ff9999', fontSize: 12, marginBottom: 8, marginLeft: 2 }}>
                {errors.name}
              </Text>
            )}

            {/* Email */}
            <Text style={{ color: 'rgba(255,255,255,0.8)', fontSize: 13, marginBottom: 6, marginTop: 12 }}>
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
                borderRadius: 12,
                paddingHorizontal: 16,
                paddingVertical: 13,
                color: '#fff',
                fontSize: 15,
                borderWidth: 1,
                borderColor: errors.email ? '#ff6b6b' : 'rgba(255,255,255,0.2)',
                marginBottom: 4,
              }}
            />
            {!!errors.email && (
              <Text style={{ color: '#ff9999', fontSize: 12, marginBottom: 8, marginLeft: 2 }}>
                {errors.email}
              </Text>
            )}

            {/* Feedback de salvo */}
            {saved && (
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 8 }}>
                <Ionicons name="checkmark-circle" size={16} color="#4ade80" />
                <Text style={{ color: '#4ade80', fontSize: 13 }}>Salvo com sucesso!</Text>
              </View>
            )}

            {/* Botões */}
            <View style={{ flexDirection: 'row', gap: 12, marginTop: 24 }}>
              <Pressable
                onPress={() => router.back()}
                style={({ pressed }) => ({
                  flex: 1,
                  borderRadius: 12,
                  paddingVertical: 13,
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
                disabled={loading || saved}
                style={({ pressed }) => ({
                  flex: 1,
                  borderRadius: 12,
                  paddingVertical: 13,
                  alignItems: 'center',
                  backgroundColor: pressed ? 'rgba(255,255,255,0.85)' : '#fff',
                })}
              >
                {loading ? (
                  <ActivityIndicator color={Theme.colors.secondary} />
                ) : (
                  <Text style={{ color: Theme.colors.secondary, fontWeight: '700', fontSize: 15 }}>
                    Salvar
                  </Text>
                )}
              </Pressable>
            </View>
          </View>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </LinearGradient>
  );
}
