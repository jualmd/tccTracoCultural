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
      shadowColor: '#D4A373',
      shadowOpacity: 0.45,
      shadowRadius: 14,
      shadowOffset: { width: 0, height: 8 },
      elevation: 8,
      // web
      boxShadow: '0px 8px 14px rgba(212,163,115,0.45)',
    },
    card: {
      shadowColor: '#000',
      shadowOpacity: 0.25,
      shadowRadius: 16,
      shadowOffset: { width: 0, height: 8 },
      elevation: 6,
      // web
      boxShadow: '0px 8px 16px rgba(0,0,0,0.25)',
    },
  },

  radius: {
    sm: 10,
    md: 18,
    lg: 28,
    pill: 50,
  },
};