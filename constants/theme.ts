export const Theme = {
  colors: {
    primary: '#8E5E56',
    primaryDark: '#3C2321',
    primaryLight: '#A67B72',
    accent: '#D4A373',
    accentDark: '#B8864E',
    white: '#FFFFFF',
    text: '#2d1f1d',
    textMuted: '#7a6360',
    danger: '#EF4444',
    dangerDark: '#dc2626',
    success: '#22C55E',

    // mantidos por compatibilidade com código existente
    secondary: '#3C2321',
    background: '#FFFFFF',
    muted: '#f0f0f0',
    surface: 'rgba(255,255,255,0.12)',
    border: 'rgba(255,255,255,0.22)',
    foreground: '#11181C',
    placeholder: 'rgba(255,255,255,0.45)',
  },

  // Escala de espaçamento única — antes cada tela usava paddingHorizontal
  // 16/18/20/24 meio ao acaso; usar essa escala em telas novas/redesenhadas
  // deixa o ritmo vertical/horizontal consistente entre elas.
  space: {
    xs: 6,
    sm: 10,
    md: 16,
    lg: 20,
    xl: 28,
    xxl: 40,
  },

  // Escala tipográfica — tamanho/peso/altura de linha combinados, pra não
  // ter cada tela escolhendo um fontSize levemente diferente pra "título".
  type: {
    display: { fontSize: 34, fontWeight: '800' as const, lineHeight: 38, letterSpacing: -0.6 },
    title: { fontSize: 22, fontWeight: '800' as const, lineHeight: 27, letterSpacing: -0.4 },
    subtitle: { fontSize: 15, fontWeight: '700' as const, lineHeight: 20 },
    body: { fontSize: 14.5, fontWeight: '400' as const, lineHeight: 21 },
    caption: { fontSize: 12.5, fontWeight: '500' as const, lineHeight: 17 },
    label: { fontSize: 11, fontWeight: '700' as const, lineHeight: 14, letterSpacing: 0.6 },
  },

  // ── Tema claro (espelha estilos/temaClaro.css do front web) ──
  // Usado nas telas com navegação por abas (Home, Mapa, Favoritos,
  // Perfil, Configurações), que abandonaram o gradiente escuro/glass
  // em favor de um visual minimalista claro.
  light: {
    bg: '#faf6f0',
    surface: '#FFFFFF',
    surfaceAlt: '#F3EAE0',
    border: 'rgba(60, 35, 33, 0.10)',
    borderStrong: 'rgba(60, 35, 33, 0.16)',
    text: '#1E1412',
    textMuted: '#7a6360',
    star: '#D9A441',
  },

  shadowLight: {
    sm: {
      shadowColor: '#3C2321',
      shadowOpacity: 0.06,
      shadowRadius: 10,
      shadowOffset: { width: 0, height: 2 },
      elevation: 2,
      boxShadow: '0px 2px 10px rgba(60,35,33,0.06)',
    },
    md: {
      shadowColor: '#3C2321',
      shadowOpacity: 0.1,
      shadowRadius: 20,
      shadowOffset: { width: 0, height: 10 },
      elevation: 4,
      boxShadow: '0px 10px 32px rgba(60,35,33,0.10)',
    },
  },

  gradient: {
    primary: ['#3C2321', '#8E5E56', '#A67B72'] as const,
  },

  glass: {
    bg: 'rgba(255,255,255,0.10)',
    bgMd: 'rgba(255,255,255,0.16)',
    border: 'rgba(255,255,255,0.22)',
  },

  shadow: {
    accent: {
      shadowColor: '#B8864E',
      shadowOpacity: 0.35,
      shadowRadius: 12,
      shadowOffset: { width: 0, height: 6 },
      elevation: 6,
      // web
      boxShadow: '0px 6px 12px rgba(184,134,78,0.35)',
    },
    card: {
      shadowColor: '#000',
      shadowOpacity: 0.22,
      shadowRadius: 14,
      shadowOffset: { width: 0, height: 6 },
      elevation: 5,
      // web
      boxShadow: '0px 6px 14px rgba(0,0,0,0.22)',
    },
  },

  radius: {
    sm: 10,
    md: 18,
    lg: 28,
    pill: 50,
  },
};