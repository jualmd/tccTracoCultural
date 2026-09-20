import { Redirect } from 'expo-router';

// Sempre entra pela tela de boas-vindas; o AuthProvider (contexts/auth-context)
// redireciona pra "/(tabs)" automaticamente se já houver sessão salva.
export default function Index() {
  return <Redirect href="/welcome" />;
}