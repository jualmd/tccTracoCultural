import { Image, Pressable, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Theme } from '@/constants/theme';

// Espelha ".welcome-page" do front web (paginas/WelcomePage + WelcomePage.css):
// fundo em gradiente escuro com manchas decorativas, badge, título grande,
// subtítulo, dois botões (Entrar / Criar conta) e uma barra de estatísticas
// no rodapé.
export default function Welcome() {
  const router = useRouter();

  return (
    <View style={{ flex: 1, backgroundColor: Theme.colors.primaryDark }}>
      <LinearGradient
        colors={Theme.gradient.primary}
        start={{ x: 0.15, y: 0.1 }}
        end={{ x: 0.9, y: 0.95 }}
        style={{ position: 'absolute', inset: 0 } as any}
      />
      <View
        pointerEvents="none"
        style={{
          position: 'absolute',
          width: 360,
          height: 360,
          borderRadius: 180,
          top: -140,
          right: -110,
          backgroundColor: 'rgba(212,163,115,0.20)',
        }}
      />
      <View
        pointerEvents="none"
        style={{
          position: 'absolute',
          width: 280,
          height: 280,
          borderRadius: 140,
          bottom: 120,
          left: -110,
          backgroundColor: 'rgba(142,94,86,0.28)',
        }}
      />

      <SafeAreaView style={{ flex: 1 }}>
        {/* ── welcome-nav ── */}
        <View style={{ paddingHorizontal: 28, paddingTop: 18 }}>
          <Image
            source={require('@/assets/images/tracocult.logo.png')}
            tintColor="#ffffff"
            style={{ height: 30, width: 150 }}
            resizeMode="contain"
          />
        </View>

        {/* ── welcome-hero ── */}
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 28 }}>
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              gap: 6,
              backgroundColor: 'rgba(212,163,115,0.15)',
              borderWidth: 1,
              borderColor: 'rgba(212,163,115,0.45)',
              borderRadius: Theme.radius.pill,
              paddingHorizontal: 16,
              paddingVertical: 8,
              marginBottom: 24,
            }}
          >
            <Ionicons name="compass-outline" size={13} color={Theme.colors.accent} />
            <Text
              style={{
                color: Theme.colors.accent,
                fontSize: 11,
                fontWeight: '700',
                letterSpacing: 2,
                textTransform: 'uppercase',
              }}
            >
              Descubra o que há por perto
            </Text>
          </View>

          <Text
            style={{
              color: '#fff',
              fontSize: 42,
              fontWeight: '800',
              letterSpacing: -1,
              lineHeight: 46,
              textAlign: 'center',
              marginBottom: 18,
            }}
          >
            Para onde nós vamos{' '}
            <Text style={{ color: Theme.colors.accent }}>hoje?</Text>
          </Text>

          <Text
            style={{
              color: 'rgba(255,255,255,0.72)',
              fontSize: 15,
              fontWeight: '300',
              lineHeight: 24,
              textAlign: 'center',
              maxWidth: 340,
              marginBottom: 36,
            }}
          >
            Encontre eventos culturais, shows, feiras e experiências únicas perto de você.
          </Text>

          <View style={{ width: '100%', gap: 12 }}>
            <Pressable
              onPress={() => router.push('/(tabs)/login' as never)}
              style={({ pressed }) => ({
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 8,
                backgroundColor: Theme.colors.accent,
                borderRadius: Theme.radius.pill,
                paddingVertical: 15,
                opacity: pressed ? 0.85 : 1,
                ...Theme.shadow.accent,
              })}
            >
              <Ionicons name="arrow-forward-circle-outline" size={19} color={Theme.colors.primaryDark} />
              <Text style={{ color: Theme.colors.primaryDark, fontWeight: '700', fontSize: 15 }}>Entrar</Text>
            </Pressable>

            <Pressable
              onPress={() => router.push('/(tabs)/cadastrar' as never)}
              style={({ pressed }) => ({
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: pressed ? 'rgba(255,255,255,0.2)' : 'rgba(255,255,255,0.10)',
                borderWidth: 1,
                borderColor: 'rgba(255,255,255,0.22)',
                borderRadius: Theme.radius.pill,
                paddingVertical: 15,
              })}
            >
              <Text style={{ color: '#fff', fontWeight: '600', fontSize: 15 }}>Criar conta grátis</Text>
            </Pressable>
          </View>
        </View>

        {/* ── welcome-stats ── */}
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
            paddingVertical: 18,
            backgroundColor: 'rgba(0,0,0,0.28)',
            borderTopWidth: 1,
            borderTopColor: 'rgba(255,255,255,0.18)',
          }}
        >
          {[
            { n: '500+', l: 'Eventos' },
            { n: '27', l: 'Estados' },
            { n: '10k+', l: 'Usuários' },
          ].map((stat, i) => (
            <View key={stat.l} style={{ flexDirection: 'row', alignItems: 'center' }}>
              <View style={{ alignItems: 'center', paddingHorizontal: 22 }}>
                <Text style={{ color: Theme.colors.accent, fontSize: 20, fontWeight: '800', letterSpacing: -0.5 }}>
                  {stat.n}
                </Text>
                <Text
                  style={{
                    color: 'rgba(255,255,255,0.55)',
                    fontSize: 10,
                    fontWeight: '500',
                    letterSpacing: 1,
                    textTransform: 'uppercase',
                    marginTop: 3,
                  }}
                >
                  {stat.l}
                </Text>
              </View>
              {i < 2 && <View style={{ width: 1, height: 32, backgroundColor: 'rgba(255,255,255,0.18)' }} />}
            </View>
          ))}
        </View>
      </SafeAreaView>
    </View>
  );
}