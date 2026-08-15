import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { Platform } from 'react-native';
import { TOKEN_STORAGE_KEY, USER_STORAGE_KEY } from '@/constants/types';

// 10.0.2.2 = Android emulator -> host machine
// localhost = iOS simulator ou web
function resolveBaseUrl() {
  if (process.env.EXPO_PUBLIC_API_URL) return process.env.EXPO_PUBLIC_API_URL;
  return Platform.OS === 'android'
    ? 'http://10.0.2.2:8080/api/v1'
    : 'http://localhost:8080/api/v1'
    
}

let unauthorizedHandler: (() => void) | null = null;

export function setUnauthorizedHandler(handler: (() => void) | null) {
  unauthorizedHandler = handler;
}

export const apiClient = axios.create({
  baseURL: resolveBaseUrl(),
  timeout: 15000,
});

apiClient.interceptors.request.use(async (config) => {
  const token = await AsyncStorage.getItem(TOKEN_STORAGE_KEY);
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const status = error.response?.status;

    // O backend não tem um AuthenticationEntryPoint customizado, então
    // token ausente/inválido/expirado cai no 403 padrão do Spring Security
    // em vez de 401 -- por isso tratamos os dois como "sessão inválida".
    // Exceção: 403 com corpo próprio (ex: rota /admin bloqueando quem não
    // é admin) é uma negação de PERMISSÃO de um usuário já autenticado,
    // não deve derrubar a sessão dele.
    const isPermissionDenied = status === 403 && !!error.response?.data?.message;

    if (status === 401 || (status === 403 && !isPermissionDenied)) {
      await AsyncStorage.multiRemove([TOKEN_STORAGE_KEY, USER_STORAGE_KEY, '@traco:favorites']);
      unauthorizedHandler?.();
    }
    return Promise.reject(error);
  }
);

export default apiClient;