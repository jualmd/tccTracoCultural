import { useState } from 'react';
import { Linking, Pressable, ScrollView, Switch, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Theme } from '@/constants/theme';

function SettingsCard({ children }: { children: React.ReactNode }) {
  return (
    <View
      style={{
        backgroundColor: Theme.glass.bg,
        borderRadius: Theme.radius.md,
        borderWidth: 1,
        borderColor: Theme.glass.border,
        overflow: 'hidden',
        marginBottom: 16,
      }}
    >
      {children}
    </View>
  );
}

function ToggleRow({ title, value, onValueChange }: { title: string; value: boolean; onValueChange: (v: boolean) => void }) {
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 16 }}>
      <Text style={{ color: '#fff', fontWeight: '600', fontSize: 15 }}>{title}</Text>
      <Switch
        value={value}
        onValueChange={onValueChange}
        thumbColor="#fff"
        trackColor={{ true: Theme.colors.accent, false: 'rgba(255,255,255,0.2)' }}
      />
    </View>
  );
}

function LinkRow({ title, url }: { title: string; url?: string }) {
  return (
    <Pressable
      onPress={() => url && Linking.openURL(url)}
      style={({ pressed }) => ({
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: 16,
        opacity: pressed ? 0.7 : 1,
      })}
    >
      <Text style={{ color: '#fff', fontWeight: '600', fontSize: 15 }}>{title}</Text>
      <Ionicons name="chevron-forward" size={18} color="rgba(255,255,255,0.45)" />
    </Pressable>
  );
}

function Divider() {
  return <View style={{ height: 1, marginHorizontal: 16, backgroundColor: Theme.glass.border }} />;
}

export default function Configuracoes() {
  const [emailMarketing, setEmailMarketing] = useState(false);
  const [pushNotifications, setPushNotifications] = useState(true);
  const router = useRouter();

  return (
    <LinearGradient
      colors={Theme.gradient.primary}
      style={{ flex: 1 }}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
    >
      <SafeAreaView style={{ flex: 1 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, paddingVertical: 16, gap: 12 }}>
          <Pressable
            onPress={() => router.back()}
            hitSlop={8}
            style={({ pressed }) => ({
              opacity: pressed ? 0.6 : 1,
              backgroundColor: Theme.glass.bg,
              borderRadius: 16,
              padding: 7,
              borderWidth: 1,
              borderColor: Theme.glass.border,
            })}
          >
            <Ionicons name="arrow-back" size={20} color="#fff" />
          </Pressable>
          <Text style={{ color: '#fff', fontSize: 20, fontWeight: '700' }}>Configurações</Text>
        </View>

        <ScrollView contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 32 }} showsVerticalScrollIndicator={false}>
          <Text style={{ color: 'rgba(255,255,255,0.55)', fontSize: 11.5, fontWeight: '700', letterSpacing: 1, textTransform: 'uppercase', marginBottom: 8, marginLeft: 4 }}>
            Notificações
          </Text>
          <SettingsCard>
            <ToggleRow title="Notificações push" value={pushNotifications} onValueChange={setPushNotifications} />
            <Divider />
            <ToggleRow title="Email marketing" value={emailMarketing} onValueChange={setEmailMarketing} />
          </SettingsCard>

          <Text style={{ color: 'rgba(255,255,255,0.55)', fontSize: 11.5, fontWeight: '700', letterSpacing: 1, textTransform: 'uppercase', marginBottom: 8, marginLeft: 4 }}>
            Legal
          </Text>
          <SettingsCard>
            <LinkRow title="Termos de uso" url="https://tracultural.com/termos" />
            <Divider />
            <LinkRow title="Política de privacidade" url="https://tracultural.com/privacidade" />
          </SettingsCard>

          <Text style={{ color: 'rgba(255,255,255,0.4)', fontSize: 12, textAlign: 'center', marginTop: 8 }}>
            Traço Cultural v1.0.0
          </Text>
        </ScrollView>
      </SafeAreaView>
    </LinearGradient>
  );
}
