import type { ReactNode } from 'react';
import { Image, KeyboardAvoidingView, Platform, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { Theme } from '@/constants/theme';

type Props = {
  /** Ionicons name shown inside the little badge above the title (asp-painel-icone) */
  icon?: keyof typeof Ionicons.glyphMap;
  /** asp-painel h1 */
  title: string;
  /** asp-painel p */
  subtitle: string;
  children: ReactNode;
};

/**
 * Layout compartilhado das telas de autenticação (Login, Cadastrar,
 * VerificarCodigo, EsqueciSenha, RedefinirSenha) -- espelha o
 * ".asp-page" do front web: painel gradiente com a mensagem de marca
 * em cima (empilhado, já que no mobile não cabe lado a lado) e o
 * cartão de formulário (fundo branco, cantos arredondados) abaixo,
 * sobrepondo levemente o painel.
 */
export function AuthLayout({ icon, title, subtitle, children }: Props) {
  return (
    <View style={{ flex: 1, backgroundColor: Theme.colors.primaryDark }}>
      <LinearGradient
        colors={Theme.gradient.primary}
        start={{ x: 0.1, y: 0 }}
        end={{ x: 0.9, y: 1 }}
        style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 320 }}
      />
      {/* manchas decorativas, ecoando o ::before/::after do .asp-painel */}
      <View
        pointerEvents="none"
        style={{
          position: 'absolute',
          width: 260,
          height: 260,
          borderRadius: 130,
          top: -90,
          right: -80,
          backgroundColor: 'rgba(212,163,115,0.28)',
        }}
      />
      <View
        pointerEvents="none"
        style={{
          position: 'absolute',
          width: 180,
          height: 180,
          borderRadius: 90,
          top: 60,
          left: -80,
          backgroundColor: 'rgba(255,255,255,0.08)',
        }}
      />

      <SafeAreaView style={{ flex: 1 }} edges={['top']}>
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
          <ScrollView
            contentContainerStyle={{ flexGrow: 1 }}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            {/* ── asp-painel ── */}
            <View style={{ paddingHorizontal: 28, paddingTop: 18, paddingBottom: 30 }}>
              <Image
                source={require('@/assets/images/tracocult.logo.png')}
                tintColor="#ffffff"
                style={{ height: 30, width: 150, marginBottom: 22 }}
                resizeMode="contain"
              />
              {icon && (
                <View
                  style={{
                    width: 52,
                    height: 52,
                    borderRadius: 16,
                    backgroundColor: 'rgba(255,255,255,0.14)',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginBottom: 16,
                  }}
                >
                  <Ionicons name={icon} size={24} color="#fff" />
                </View>
              )}
              <Text
                style={{
                  color: '#fff',
                  fontSize: 26,
                  fontWeight: '800',
                  letterSpacing: -0.5,
                  lineHeight: 32,
                  marginBottom: 10,
                }}
              >
                {title}
              </Text>
              <Text style={{ color: 'rgba(255,255,255,0.8)', fontSize: 14, fontWeight: '300', lineHeight: 21 }}>
                {subtitle}
              </Text>
            </View>

            {/* ── asp-form-lado / asp-card ── */}
            <View
              style={{
                flex: 1,
                backgroundColor: Theme.light.bg,
                borderTopLeftRadius: 28,
                borderTopRightRadius: 28,
                paddingHorizontal: 24,
                paddingTop: 28,
                paddingBottom: 40,
              }}
            >
              {children}
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </View>
  );
}

/** Campo com label maiúsculo + underline, espelhando .asp-group / .asp-group input */
export function AuthField({
  label,
  icon,
  error,
  children,
}: {
  label: string;
  icon?: keyof typeof Ionicons.glyphMap;
  error?: string;
  children: ReactNode;
}) {
  return (
    <View style={{ marginBottom: 18 }}>
      <Text
        style={{
          color: Theme.light.text,
          fontWeight: '600',
          fontSize: 11,
          letterSpacing: 0.5,
          textTransform: 'uppercase',
          marginBottom: 8,
        }}
      >
        {label}
      </Text>
      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
        {icon && (
          <Ionicons
            name={icon}
            size={16}
            color={Theme.colors.accentDark}
            style={{ marginRight: 8, opacity: 0.8 }}
          />
        )}
        <View style={{ flex: 1 }}>{children}</View>
      </View>
      {!!error && (
        <Text style={{ color: '#c0392b', fontSize: 12, fontWeight: '500', marginTop: 5 }}>{error}</Text>
      )}
    </View>
  );
}

export const authInputStyle = {
  borderBottomWidth: 2,
  borderBottomColor: '#ece3dc',
  paddingVertical: 10,
  fontSize: 15,
  color: Theme.light.text,
} as const;

/** Estilo do botão sólido cor "accent-dark", espelhando .asp-btn-submit.
 *  Usar em conjunto com <Pressable style={authSubmitStyle(...)}>. */
export function authSubmitStyle(opts: { pressed?: boolean; disabled?: boolean } = {}) {
  return {
    backgroundColor: opts.disabled
      ? '#d8ceC7'
      : opts.pressed
        ? Theme.colors.primaryDark
        : Theme.colors.accentDark,
    borderRadius: Theme.radius.sm,
    paddingVertical: 15,
    alignItems: 'center' as const,
    marginTop: 8,
  };
}