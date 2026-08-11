import { useCallback, useMemo, useRef, useState } from 'react';
import { ActivityIndicator, FlatList, Pressable, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { WebView, type WebViewMessageEvent } from 'react-native-webview';
import * as Location from 'expo-location';
import { useFocusEffect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { EventDetailModal } from '@/components/event-detail-modal';
import { Theme } from '@/constants/theme';
import { useFavorites } from '@/contexts/favorites-context';
import { listarEventos } from '@/services/event-service';
import type { Evento } from '@/types/domain';

const MAP_HTML = `
<!DOCTYPE html>
<html>
<head>
  <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no" />
  <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
  <style>
    html, body, #map { height: 100%; margin: 0; padding: 0; background: #faf6f0; }
    .marcador-evento svg { filter: drop-shadow(0 3px 4px rgba(0,0,0,.35)); }
    .popup-evento { font-family: -apple-system, sans-serif; min-width: 180px; }
    .popup-evento img { width: 100%; height: 90px; object-fit: cover; border-radius: 8px; margin-bottom: 6px; }
    .popup-evento strong { display:block; font-size: 13.5px; color:#1E1412; margin-bottom:2px; }
    .popup-evento span { display:block; font-size: 11.5px; color:#7a6360; }
    .popup-evento button { margin-top:6px; width:100%; padding:6px 0; background:#8E5E56; color:#fff; border:none; border-radius:20px; font-size:12px; font-weight:600; }
  </style>
</head>
<body>
  <div id="map"></div>
  <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
  <script>
    const map = L.map('map', { zoomControl: false }).setView([-14.235, -51.9253], 4);
    L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
      maxZoom: 19,
      attribution: '&copy; OpenStreetMap &copy; CARTO'
    }).addTo(map);

    const iconeEvento = L.divIcon({
      className: 'marcador-evento',
      html: '<svg width="30" height="40" viewBox="0 0 34 46" xmlns="http://www.w3.org/2000/svg"><path d="M17 45C17 45 32 27.5 32 17C32 7.6 25.3 1 17 1C8.7 1 2 7.6 2 17C2 27.5 17 45 17 45Z" fill="#D4A373" stroke="#ffffff" stroke-width="1.5"/><circle cx="17" cy="17" r="6" fill="#ffffff"/></svg>',
      iconSize: [30, 40],
      iconAnchor: [15, 39],
      popupAnchor: [0, -36],
    });

    const iconeVoce = L.divIcon({
      className: 'marcador-voce',
      html: '<div style="width:20px;height:20px;border-radius:50%;background:#8E5E56;border:3px solid #fff;box-shadow:0 2px 6px rgba(0,0,0,.4)"></div>',
      iconSize: [20, 20],
      iconAnchor: [10, 10],
    });

    const cacheCidades = {};
    const marcadores = {};
    let userMarker = null;

    function post(msg) {
      if (window.ReactNativeWebView) window.ReactNativeWebView.postMessage(JSON.stringify(msg));
    }

    async function geocodificar(cidade) {
      if (!cidade) return null;
      if (cacheCidades[cidade]) return cacheCidades[cidade];
      try {
        const resp = await fetch('https://nominatim.openstreetmap.org/search?format=json&limit=1&q=' + encodeURIComponent(cidade + ', Brasil'));
        const dados = await resp.json();
        if (dados && dados.length > 0) {
          const coords = [parseFloat(dados[0].lat), parseFloat(dados[0].lon)];
          cacheCidades[cidade] = coords;
          return coords;
        }
      } catch (e) { post({ type: 'error', message: String(e) }); }
      return null;
    }

    function limparMarcadores() {
      Object.values(marcadores).forEach((m) => map.removeLayer(m));
      for (const k in marcadores) delete marcadores[k];
    }

    async function setEventos(eventos) {
      limparMarcadores();
      post({ type: 'loading', value: true });
      let count = 0;
      for (const ev of eventos) {
        const coords = await geocodificar(ev.cidade);
        if (coords) {
          const marker = L.marker(coords, { icon: iconeEvento }).addTo(map);
          const img = ev.cardImage ? '<img src="data:image/jpeg;base64,' + ev.cardImage + '" />' : '';
          const data = ev.dataInicio ? new Date(ev.dataInicio).toLocaleDateString('pt-BR') : '';
          marker.bindPopup(
            '<div class="popup-evento">' + img +
            '<strong>' + ev.nome + '</strong>' +
            '<span>' + data + '</span>' +
            '<span>' + ev.cidade + '</span>' +
            '<button onclick="window.__selecionar(' + ev.id + ')">Ver detalhes</button>' +
            '</div>'
          );
          marcadores[ev.id] = marker;
          count += 1;
        }
        await new Promise((r) => setTimeout(r, 250));
      }
      post({ type: 'loading', value: false });
      post({ type: 'count', value: count });
    }

    window.__selecionar = function (id) {
      post({ type: 'select', id: id });
    };

    function setUserLocation(lat, lng) {
      if (userMarker) map.removeLayer(userMarker);
      userMarker = L.marker([lat, lng], { icon: iconeVoce }).addTo(map).bindPopup('Você está aqui');
      map.setView([lat, lng], 11);
    }

    function handleMessage(raw) {
      try {
        const msg = JSON.parse(raw);
        if (msg.type === 'events') setEventos(msg.data);
        if (msg.type === 'location') setUserLocation(msg.lat, msg.lng);
      } catch (e) {}
    }

    document.addEventListener('message', (e) => handleMessage(e.data));
    window.addEventListener('message', (e) => handleMessage(e.data));

    post({ type: 'ready' });
  </script>
</body>
</html>
`;

const CATEGORIAS_PRINCIPAIS: { nome: string; icone: keyof typeof Ionicons.glyphMap; cor: string }[] = [
  { nome: 'Todos', icone: 'location', cor: Theme.colors.primaryDark },
  { nome: 'Música', icone: 'musical-notes', cor: '#e85d75' },
  { nome: 'Cultura & Arte', icone: 'color-palette', cor: '#8a5cf5' },
  { nome: 'Teatro', icone: 'happy', cor: '#e8a13d' },
  { nome: 'Gastronomia', icone: 'restaurant', cor: '#4a9d6b' },
];

const CATEGORIAS_EXTRA: { nome: string; icone: keyof typeof Ionicons.glyphMap; cor: string }[] = [
  { nome: 'Esporte', icone: 'trophy', cor: '#2f8f7a' },
  { nome: 'Tecnologia', icone: 'hardware-chip', cor: '#3d7ae8' },
  { nome: 'Kids', icone: 'balloon', cor: '#e86ba0' },
  { nome: 'Comunidade', icone: 'people', cor: '#b8864e' },
];

export default function Mapa() {
  const webviewRef = useRef<WebView>(null);
  const [ready, setReady] = useState(false);
  const [events, setEvents] = useState<Evento[]>([]);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('Todos');
  const [mostrarExtras, setMostrarExtras] = useState(false);
  const [mapLoading, setMapLoading] = useState(true);
  const [markerCount, setMarkerCount] = useState(0);
  const [locationError, setLocationError] = useState('');
  const [selectedEvent, setSelectedEvent] = useState<Evento | null>(null);
  const { isFavorite, toggleFavorite } = useFavorites();

  const categoriasVisiveis = mostrarExtras
    ? [...CATEGORIAS_PRINCIPAIS, ...CATEGORIAS_EXTRA]
    : CATEGORIAS_PRINCIPAIS;

  const filteredEvents = useMemo(() => {
    const termo = search.trim().toLowerCase();
    return events.filter((e) => {
      const matchBusca = !termo || e.nome.toLowerCase().includes(termo) || e.cidade.toLowerCase().includes(termo);
      const matchCategoria = category === 'Todos' || e.categoria?.nome === category;
      return matchBusca && matchCategoria;
    });
  }, [events, search, category]);

  const sendEvents = useCallback((list: Evento[]) => {
    webviewRef.current?.postMessage(JSON.stringify({ type: 'events', data: list }));
  }, []);

  useFocusEffect(
    useCallback(() => {
      listarEventos().then(setEvents).catch(() => setEvents([]));
    }, [])
  );

  useFocusEffect(
    useCallback(() => {
      if (!ready) return;
      sendEvents(filteredEvents);
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [ready, filteredEvents])
  );

  const handleLoad = useCallback(async () => {
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') {
      setLocationError('Não conseguimos acessar sua localização. Mostrando o mapa do Brasil.');
      return;
    }
    try {
      const pos = await Location.getCurrentPositionAsync({});
      webviewRef.current?.postMessage(
        JSON.stringify({ type: 'location', lat: pos.coords.latitude, lng: pos.coords.longitude })
      );
    } catch {
      setLocationError('Não conseguimos acessar sua localização. Mostrando o mapa do Brasil.');
    }
  }, []);

  const onMessage = useCallback(
    (e: WebViewMessageEvent) => {
      try {
        const msg = JSON.parse(e.nativeEvent.data);
        if (msg.type === 'ready') {
          setReady(true);
          sendEvents(filteredEvents);
          handleLoad();
        }
        if (msg.type === 'loading') setMapLoading(msg.value);
        if (msg.type === 'count') setMarkerCount(msg.value);
        if (msg.type === 'select') {
          const evento = events.find((ev) => ev.id === msg.id);
          if (evento) setSelectedEvent(evento);
        }
      } catch {}
    },
    [events, filteredEvents, handleLoad, sendEvents]
  );

  return (
    <View style={{ flex: 1, backgroundColor: '#faf6f0' }}>
      <WebView
        ref={webviewRef}
        source={{ html: MAP_HTML }}
        onMessage={onMessage}
        javaScriptEnabled
        geolocationEnabled
        originWhitelist={['*']}
        startInLoadingState
        style={{ flex: 1 }}
        renderLoading={() => (
          <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#faf6f0' }}>
            <ActivityIndicator color={Theme.colors.primary} />
          </View>
        )}
      />

      <SafeAreaView style={{ position: 'absolute', top: 0, left: 0, right: 0 }} pointerEvents="box-none">
        <View style={{ paddingHorizontal: 20, paddingTop: 12, gap: 10 }} pointerEvents="box-none">
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              backgroundColor: '#fff',
              borderRadius: Theme.radius.pill,
              paddingHorizontal: 14,
              ...Theme.shadowLight.md,
            }}
          >
            <Ionicons name="search-outline" size={17} color={Theme.colors.textMuted} />
            <TextInput
              value={search}
              onChangeText={setSearch}
              placeholder="Buscar evento ou localidade..."
              placeholderTextColor="#b5a49c"
              style={{ flex: 1, color: Theme.colors.text, paddingVertical: 11, paddingLeft: 9, fontSize: 14 }}
            />
            {!!search && (
              <Pressable onPress={() => setSearch('')} hitSlop={8}>
                <Ionicons name="close-circle" size={17} color={Theme.colors.textMuted} />
              </Pressable>
            )}
          </View>

          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              alignSelf: 'flex-start',
              gap: 6,
              backgroundColor: '#fff',
              borderRadius: Theme.radius.pill,
              paddingHorizontal: 12,
              paddingVertical: 7,
              ...Theme.shadowLight.sm,
            }}
          >
            <Ionicons
              name={mapLoading ? 'hourglass-outline' : 'location'}
              size={13}
              color={Theme.colors.accentDark}
            />
            <Text style={{ color: Theme.colors.textMuted, fontSize: 12, fontWeight: '600' }}>
              {mapLoading ? 'Carregando eventos...' : `${markerCount} evento(s) localizado(s)`}
            </Text>
          </View>

          {!!locationError && (
            <View
              style={{
                alignSelf: 'flex-start',
                backgroundColor: 'rgba(255,255,255,0.92)',
                borderRadius: Theme.radius.pill,
                paddingHorizontal: 12,
                paddingVertical: 6,
              }}
            >
              <Text style={{ color: Theme.colors.textMuted, fontSize: 11 }}>{locationError}</Text>
            </View>
          )}
        </View>
      </SafeAreaView>

      <SafeAreaView style={{ position: 'absolute', left: 0, right: 0, bottom: 0 }} pointerEvents="box-none" edges={['bottom']}>
        <View style={{ alignItems: 'center', paddingBottom: 14 }} pointerEvents="box-none">
          <FlatList
            horizontal
            data={categoriasVisiveis}
            keyExtractor={(item) => item.nome}
            showsHorizontalScrollIndicator={false}
            style={{
              backgroundColor: 'rgba(255,255,255,0.96)',
              borderRadius: Theme.radius.pill,
              maxWidth: '92%',
              ...Theme.shadowLight.md,
            }}
            contentContainerStyle={{ padding: 6, gap: 4, alignItems: 'center' }}
            ListFooterComponent={
              <Pressable
                onPress={() => setMostrarExtras((v) => !v)}
                style={({ pressed }) => ({
                  width: 34,
                  height: 34,
                  borderRadius: 17,
                  alignItems: 'center',
                  justifyContent: 'center',
                  backgroundColor: pressed ? Theme.light.surfaceAlt : 'transparent',
                })}
              >
                <Ionicons name={mostrarExtras ? 'close' : 'ellipsis-horizontal'} size={17} color={Theme.colors.textMuted} />
              </Pressable>
            }
            renderItem={({ item }) => {
              const active = category === item.nome;
              return (
                <Pressable
                  onPress={() => setCategory(item.nome)}
                  style={({ pressed }) => ({
                    flexDirection: 'row',
                    alignItems: 'center',
                    gap: 6,
                    paddingHorizontal: 13,
                    paddingVertical: 9,
                    borderRadius: Theme.radius.pill,
                    backgroundColor: active ? item.cor : 'transparent',
                    opacity: pressed ? 0.75 : 1,
                  })}
                >
                  <Ionicons name={item.icone} size={13} color={active ? '#fff' : item.cor} />
                  <Text
                    style={{
                      fontSize: 12.5,
                      fontWeight: '600',
                      color: active ? '#fff' : Theme.colors.textMuted,
                    }}
                  >
                    {item.nome}
                  </Text>
                </Pressable>
              );
            }}
          />
        </View>
      </SafeAreaView>

      <EventDetailModal
        event={selectedEvent}
        visible={!!selectedEvent}
        onClose={() => setSelectedEvent(null)}
        onFavorite={() => selectedEvent && toggleFavorite(selectedEvent.id)}
        isFavorited={!!selectedEvent && isFavorite(selectedEvent.id)}
      />
    </View>
  );
}