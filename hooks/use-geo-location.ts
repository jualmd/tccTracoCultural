import { useEffect, useState } from 'react';
import * as Location from 'expo-location';
import { ufPorNomeEstado } from '@/constants/estados';

type GeoState = {
  city: string | null;
  uf: string | null;
  loading: boolean;
  /** true quando a permissão foi negada, o dispositivo não suporta, ou a
   *  busca falhou — quem consome o hook decide o que fazer (esconder a
   *  seção, não preencher o estado, etc.), igual ao web. */
  denied: boolean;
};

/**
 * Descobre a localização real do usuário: pede permissão de localização do
 * device e faz reverse geocoding pra extrair cidade e UF de onde ele está.
 * Mesmo esquema do useGeoLocation do web (lá via navegador + Nominatim; aqui
 * via GPS do device + expo-location) — nenhuma localização fixa/padrão,
 * tudo fica `null` se a permissão for negada ou a busca falhar.
 */
export function useGeoLocation() {
  const [state, setState] = useState<GeoState>({
    city: null,
    uf: null,
    loading: true,
    denied: false,
  });

  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') {
          if (!cancelled) setState({ city: null, uf: null, loading: false, denied: true });
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
        const uf = ufPorNomeEstado(place?.region);

        if (!cancelled) setState({ city, uf, loading: false, denied: false });
      } catch {
        if (!cancelled) setState({ city: null, uf: null, loading: false, denied: true });
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  return state;
}
