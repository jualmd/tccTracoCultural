import { useCallback, useEffect, useRef, useState } from 'react';
import { AppState } from 'react-native';
import { useAuth } from '@/contexts/auth-context';
import {
  contarNaoLidas,
  listarNotificacoes,
  marcarComoLida,
  marcarTodasComoLidas,
  type Notificacao,
} from '@/services/notification-service';

const POLL_MS = 60000;

/**
 * Sininho in-app: sem push de verdade (isso pediria expo-notifications +
 * servidor de push configurado), então faz polling leve da contagem de
 * não lidas — igual ao que foi feito no front web.
 */
export function useNotifications() {
  const { user } = useAuth();
  const [naoLidas, setNaoLidas] = useState(0);
  const [notificacoes, setNotificacoes] = useState<Notificacao[]>([]);
  const [carregando, setCarregando] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const atualizarContagem = useCallback(() => {
    if (!user) return;
    contarNaoLidas().then(setNaoLidas).catch(() => {});
  }, [user]);

  useEffect(() => {
    if (!user) {
      setNaoLidas(0);
      setNotificacoes([]);
      return;
    }

    atualizarContagem();
    intervalRef.current = setInterval(atualizarContagem, POLL_MS);

    // repõe o polling quando o app volta pro primeiro plano
    const sub = AppState.addEventListener('change', (state) => {
      if (state === 'active') atualizarContagem();
    });

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
      sub.remove();
    };
  }, [user, atualizarContagem]);

  const carregarLista = useCallback(async () => {
    setCarregando(true);
    try {
      const data = await listarNotificacoes();
      setNotificacoes(data);
    } catch {
      setNotificacoes([]);
    } finally {
      setCarregando(false);
    }
  }, []);

  const lerNotificacao = useCallback(async (id: number) => {
    setNotificacoes((prev) => prev.map((n) => (n.id === id ? { ...n, lida: true } : n)));
    setNaoLidas((prev) => Math.max(0, prev - 1));
    marcarComoLida(id).catch(() => {});
  }, []);

  const lerTodas = useCallback(async () => {
    setNotificacoes((prev) => prev.map((n) => ({ ...n, lida: true })));
    setNaoLidas(0);
    marcarTodasComoLidas().catch(() => {});
  }, []);

  return { naoLidas, notificacoes, carregando, carregarLista, lerNotificacao, lerTodas };
}
