import { ActivityIndicator, Pressable, Text, View, type StyleProp, type ViewStyle } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Theme } from '@/constants/theme';

type Variant =
  /** Sólido, cor de destaque (dourado). Ação principal — usar 1 por tela. */
  | 'primary'
  /** Sólido, vermelho. Ações destrutivas (sair, excluir). */
  | 'danger'
  /** Contorno translúcido claro — para usar sobre fundo escuro/gradiente. */
  | 'outlineOnDark'
  /** Contorno sólido escuro — para usar sobre fundo claro. */
  | 'outlineOnLight'
  /** Texto puro, sem fundo nem borda — ação secundária discreta. */
  | 'ghost';

type Size = 'md' | 'sm';

type Props = {
  label: string;
  onPress: () => void;
  variant?: Variant;
  size?: Size;
  icon?: keyof typeof Ionicons.glyphMap;
  iconPosition?: 'left' | 'right';
  loading?: boolean;
  disabled?: boolean;
  fullWidth?: boolean;
  style?: StyleProp<ViewStyle>;
};

const HEIGHT: Record<Size, number> = { md: 54, sm: 42 };
const FONT_SIZE: Record<Size, number> = { md: 15.5, sm: 13.5 };

/**
 * Botão único e consistente pra substituir os vários <Pressable> com
 * estilo ad-hoc espalhados pelo app (cada tela reinventava padding,
 * radius, sombra e estado de "pressed" de um jeito ligeiramente
 * diferente, o que deixava a UI com uma sensação "feia"/inconsistente).
 * Todas as variantes compartilham: pill radius, altura fixa, peso de
 * fonte 700 e a mesma animação de toque (opacidade + leve scale).
 */
export function Button({
  label,
  onPress,
  variant = 'primary',
  size = 'md',
  icon,
  iconPosition = 'left',
  loading = false,
  disabled = false,
  fullWidth = true,
  style,
}: Props) {
  const isDisabled = disabled || loading;

  function getColors(pressed: boolean) {
    switch (variant) {
      case 'primary':
        return {
          bg: isDisabled ? 'rgba(212,163,115,0.4)' : pressed ? Theme.colors.accentDark : Theme.colors.accent,
          border: 'transparent',
          text: Theme.colors.primaryDark,
          shadow: !isDisabled,
        };
      case 'danger':
        return {
          bg: isDisabled ? 'rgba(239,68,68,0.4)' : pressed ? Theme.colors.dangerDark : Theme.colors.danger,
          border: 'transparent',
          text: '#fff',
          shadow: false,
        };
      case 'outlineOnDark':
        return {
          bg: pressed ? 'rgba(255,255,255,0.16)' : 'rgba(255,255,255,0.06)',
          border: 'rgba(255,255,255,0.32)',
          text: '#fff',
          shadow: false,
        };
      case 'outlineOnLight':
        return {
          bg: pressed ? Theme.light.surfaceAlt : 'transparent',
          border: Theme.light.borderStrong,
          text: Theme.light.text,
          shadow: false,
        };
      case 'ghost':
        return {
          bg: pressed ? 'rgba(255,255,255,0.08)' : 'transparent',
          border: 'transparent',
          text: Theme.colors.accent,
          shadow: false,
        };
    }
  }

  return (
    <Pressable
      onPress={isDisabled ? undefined : onPress}
      disabled={isDisabled}
      style={({ pressed }) => {
        const c = getColors(pressed);
        return [
          {
            height: HEIGHT[size],
            borderRadius: Theme.radius.pill,
            alignItems: 'center',
            justifyContent: 'center',
            flexDirection: 'row',
            gap: 8,
            paddingHorizontal: 22,
            backgroundColor: c.bg,
            borderWidth: variant.startsWith('outline') ? 1.5 : 0,
            borderColor: c.border,
            alignSelf: fullWidth ? 'stretch' : 'flex-start',
            opacity: isDisabled && variant === 'ghost' ? 0.5 : 1,
            transform: [{ scale: pressed && !isDisabled ? 0.98 : 1 }],
            ...(c.shadow ? Theme.shadow.accent : null),
          },
          style,
        ];
      }}
    >
      {({ pressed }) => {
        const c = getColors(pressed);
        return (
          <>
            {loading ? (
              <ActivityIndicator color={c.text} />
            ) : (
              <>
                {icon && iconPosition === 'left' && (
                  <Ionicons name={icon} size={size === 'sm' ? 15 : 18} color={c.text} />
                )}
                <Text
                  style={{
                    color: c.text,
                    fontSize: FONT_SIZE[size],
                    fontWeight: '700',
                    letterSpacing: 0.2,
                  }}
                  numberOfLines={1}
                >
                  {label}
                </Text>
                {icon && iconPosition === 'right' && (
                  <Ionicons name={icon} size={size === 'sm' ? 15 : 18} color={c.text} />
                )}
              </>
            )}
          </>
        );
      }}
    </Pressable>
  );
}

/** Par de botões lado a lado (ex: "Cancelar" / "Salvar"), com o mesmo
 *  espaçamento em todas as telas que usam esse padrão. */
export function ButtonRow({ children }: { children: React.ReactNode }) {
  return <View style={{ flexDirection: 'row', gap: 12 }}>{children}</View>;
}
