import { normalizeText } from '@/lib/text';
import type { Evento } from '@/types/domain';
import { useGeoLocation } from '@/hooks/use-geo-location';

/**
 * Retorna os eventos cuja `cidade` bate com a cidade real do usuário
 * (descoberta via useGeoLocation, o mesmo esquema usado no Perfil e no
 * web). Os eventos só têm `cidade` (sem lat/long), então "perto de você"
 * aqui significa "na sua cidade".
 */
export function useNearbyEvents(events: Evento[]) {
  const { city, loading, denied } = useGeoLocation();

  const normalizedCity = city ? normalizeText(city) : null;
  const nearbyEvents = normalizedCity
    ? events.filter((e) => normalizeText(e.cidade ?? '') === normalizedCity)
    : [];

  return {
    city,
    loading,
    denied,
    nearbyEvents,
  };
}
