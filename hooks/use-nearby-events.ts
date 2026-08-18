import { useEffect, useState } from 'react';
import * as Location from 'expo-location';
import { normalizeText } from '@/lib/text';
import type { Evento } from '@/types/domain';

type NearbyState = {
  city: string | null;
  loading: boolean;
  /** true quando a permissão de localização foi negada — usado pra
   *  esconder a seção em silêncio em vez de mostrar erro. */
  denied: boolean;
};

/**
 * Descobre a cidade do usuário via GPS (uma vez, ao montar) e retorna os
 * eventos cuja `cidade` bate com ela. Os eventos só têm `cidade` (sem
 * lat/long), então "perto de você" aqui significa "na sua cidade".
 */
export function useNearbyEvents(events: Evento[]) {
  const [state, setState] = useState<NearbyState>({ city: null, loading: true, denied: false });

  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') {
          if (!cancelled) setState({ city: null, loading: false, denied: true });
          return;
        }

        const position = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.Low,
        });

        const [place] = await Location.reverseGeocodeAsync({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        });

        const city = place?.city ?? place?.subregion ?? null;
        if (!cancelled) setState({ city, loading: false, denied: false });
      } catch {
        if (!cancelled) setState({ city: null, loading: false, denied: true });
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  const normalizedCity = state.city ? normalizeText(state.city) : null;
  const nearbyEvents = normalizedCity
    ? events.filter((e) => normalizeText(e.cidade ?? '') === normalizedCity)
    : [];

  return {
    city: state.city,
    loading: state.loading,
    denied: state.denied,
    nearbyEvents,
  };
}