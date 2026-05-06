import { useState } from 'react';
import { Alert, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';

export default function Login() {
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const router = useRouter();

  function handleLogin() {
    if (!email || !senha) {
      Alert.alert('Atenção', 'Preencha email e senha.');
      return;
    }
    Alert.alert('Sucesso', 'Login realizado com sucesso!', [
      { text: 'OK', onPress: () => router.replace('/(tabs)') },
    ]);
  }

  return (
    <SafeAreaView className="flex-1 bg-background justify-center px-6">
      <Text className="text-3xl font-bold text-primary mb-2">Catálogo Cultural</Text>
      <Text className="text-secondary mb-8">Faça login para continuar</Text>

      <TextInput
        className="border border-gray-300 rounded-lg px-4 py-3 mb-4 text-text"
        placeholder="Email"
        placeholderTextColor="#687076"
        keyboardType="email-address"
        autoCapitalize="none"
        value={email}
        onChangeText={setEmail}
      />
      <TextInput
        className="border border-gray-300 rounded-lg px-4 py-3 mb-6 text-text"
        placeholder="Senha"
        placeholderTextColor="#687076"
        secureTextEntry
        value={senha}
        onChangeText={setSenha}
      />

      <TouchableOpacity
        className="bg-primary rounded-lg py-4 items-center"
        onPress={handleLogin}
      >
        <Text className="text-white font-semibold text-base">Entrar</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}
