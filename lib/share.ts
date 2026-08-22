import { Share } from 'react-native';
import type { Evento } from '@/types/domain';
import { registrarCompartilhamento } from '@/services/share-service';

// Aponte pro domínio real do front web (ex: Vercel) via variável de
// ambiente. Sem isso, cai num placeholder só pra não quebrar o app —
// configure EXPO_PUBLIC_WEB_URL no seu .env.
const WEB_URL = process.env.EXPO_PUBLIC_WEB_URL || 'https://traco-cultural.vercel.app';

export async function shareEvento(evento: Evento, isLoggedIn: boolean) {
  const url = `${WEB_URL}/eventos/${evento.id}`;
  try {
    const resultado = await Share.share({
      message: `Dá uma olhada nesse evento: ${evento.nome}\n${url}`,
      url, // usado no iOS quando disponível; Android ignora e usa só "message"
      title: evento.nome,
    });
    if (resultado.action === Share.sharedAction && isLoggedIn) {
      registrarCompartilhamento(evento.id).catch(() => {});
    }
  } catch {
    // usuário cancelou ou o share sheet falhou — não é um erro pra mostrar
  }
}
