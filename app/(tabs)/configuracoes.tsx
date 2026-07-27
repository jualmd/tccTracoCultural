import { useState } from 'react';
import { Linking, Pressable, ScrollView, Switch, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Theme } from '@/constants/theme';

function SettingsCard({ children }: { children: React.ReactNode }) {
  return (
    <View
      style={{
        backgroundColor: Theme.light.surface,
        borderRadius: Theme.radius.md,
        borderWidth: 1,
        borderColor: Theme.light.border,
        overflow: 'hidden',
        marginBottom: 16,
      }}
    >
      {children}
    </View>
  );
}

function ToggleRow({
  title,
  subtitle,
  value,
  onValueChange,
}: {
  title: string;
  subtitle?: string;
  value: boolean;
  onValueChange: (v: boolean) => void;
}) {
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 16 }}>
      <View style={{ flex: 1, paddingRight: 12 }}>
        <Text style={{ color: Theme.light.text, fontWeight: '600', fontSize: 15 }}>{title}</Text>
        {!!subtitle && (
          <Text style={{ color: Theme.light.textMuted, fontSize: 12.5, marginTop: 3 }}>{subtitle}</Text>
        )}
      </View>
      <Switch
        value={value}
        onValueChange={onValueChange}
        thumbColor="#fff"
        trackColor={{ true: Theme.colors.primary, false: Theme.light.borderStrong }}
      />
    </View>
  );
}

function LinkRow({ title, subtitle, icon, onPress }: { title: string; subtitle?: string; icon: keyof typeof Ionicons.glyphMap; onPress: () => void }) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => ({
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        gap: 12,
        opacity: pressed ? 0.7 : 1,
      })}
    >
      <View
        style={{
          width: 34,
          height: 34,
          borderRadius: 10,
          backgroundColor: Theme.light.surfaceAlt,
          justifyContent: 'center',
          alignItems: 'center',
        }}
      >
        <Ionicons name={icon} size={17} color={Theme.colors.primary} />
      </View>
      <View style={{ flex: 1 }}>
        <Text style={{ color: Theme.light.text, fontWeight: '600', fontSize: 15 }}>{title}</Text>
        {!!subtitle && (
          <Text style={{ color: Theme.light.textMuted, fontSize: 12.5, marginTop: 2 }}>{subtitle}</Text>
        )}
      </View>
      <Ionicons name="chevron-forward" size={18} color={Theme.light.textMuted} />
    </Pressable>
  );
}

function Divider() {
  return <View style={{ height: 1, marginHorizontal: 16, backgroundColor: Theme.light.border }} />;
}

function SectionLabel({ children }: { children: string }) {
  return (
    <Text
      style={{
        color: Theme.light.textMuted,
        fontSize: 11.5,
        fontWeight: '700',
        letterSpacing: 1,
        textTransform: 'uppercase',
        marginBottom: 8,
        marginLeft: 4,
      }}
    >
      {children}
    </Text>
  );
}

export default function Configuracoes() {
  const [emailMarketing, setEmailMarketing] = useState(false);
  const [pushNotifications, setPushNotifications] = useState(true);
  const [compartilharLocalizacao, setCompartilharLocalizacao] = useState(true);
  const router = useRouter();

  return (
    <View style={{ flex: 1, backgroundColor: Theme.light.bg }}>
      <SafeAreaView style={{ flex: 1 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, paddingVertical: 16, gap: 12 }}>
          <Pressable
            onPress={() => router.back()}
            hitSlop={8}
            style={({ pressed }) => ({
              opacity: pressed ? 0.6 : 1,
              backgroundColor: Theme.light.surface,
              borderRadius: 16,
              padding: 7,
              borderWidth: 1,
              borderColor: Theme.light.border,
            })}
          >
            <Ionicons name="arrow-back" size={20} color={Theme.light.text} />
          </Pressable>
          <Text style={{ color: Theme.light.text, fontSize: 20, fontWeight: '700' }}>Configurações</Text>
        </View>

        <ScrollView contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 32 }} showsVerticalScrollIndicator={false}>
          <SectionLabel>Conta</SectionLabel>
          <SettingsCard>
            <LinkRow
              title="Informações pessoais"
              subtitle="Nome, email e senha"
              icon="person-outline"
              onPress={() => router.push('/(tabs)/edit-profile')}
            />
          </SettingsCard>

          <SectionLabel>Preferências</SectionLabel>
          <SettingsCard>
            <ToggleRow
              title="Compartilhar localização"
              subtitle="Permitir sugestões de eventos baseadas na sua localização"
              value={compartilharLocalizacao}
              onValueChange={setCompartilharLocalizacao}
            />
          </SettingsCard>

          <SectionLabel>Notificações</SectionLabel>
          <SettingsCard>
            <ToggleRow title="Notificações push" value={pushNotifications} onValueChange={setPushNotifications} />
            <Divider />
            <ToggleRow title="Email marketing" value={emailMarketing} onValueChange={setEmailMarketing} />
          </SettingsCard>

          <SectionLabel>Legal</SectionLabel>
          <SettingsCard>
            <LinkRow
              title="Termos de uso"
              icon="document-text-outline"
              onPress={() => Linking.openURL('https://tracultural.com/termos')}
            />
            <Divider />
            <LinkRow
              title="Política de privacidade"
              icon="shield-checkmark-outline"
              onPress={() => Linking.openURL('https://tracultural.com/privacidade')}
            />
          </SettingsCard>

          <Text style={{ color: Theme.light.textMuted, fontSize: 12, textAlign: 'center', marginTop: 8 }}>
            Traço Cultural v1.0.0
          </Text>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}
