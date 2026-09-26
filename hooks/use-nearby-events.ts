import { normalizeText } from '@/lib/text';
import type { Evento } from '@/types/domain';
import { useGeoLocation } from '@/hooks/use-geo-location';

/**
 * Retorna os eventos cujo campo "Cidade / Local" contém a cidade real do
 * usuário (descoberta via useGeoLocation, o mesmo esquema usado no Perfil e
 * no web). Esse campo é texto livre — o organizador pode digitar só a
 * cidade ("Barueri") ou algo como "Centro, Barueri" — por isso o match é
 * por `includes()` (mesma regra do Home.jsx no web), não igualdade exata:
 * com igualdade exata, qualquer coisa além do nome puro da cidade fazia o
 * evento nunca aparecer em "perto de você".
 */
export function useNearbyEvents(events: Evento[]) {
  const { city, loading, denied } = useGeoLocation();

  const normalizedCity = city ? normalizeText(city) : null;
  const nearbyEvents = normalizedCity
    ? events.filter((e) => normalizeText(e.cidade ?? '').includes(normalizedCity))
    : [];

  return {
    city,
    loading,
    denied,
    nearbyEvents,
  };
}