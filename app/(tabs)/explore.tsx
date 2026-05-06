import { FlatList, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const eventos = [
  {
    id: '1',
    titulo: 'Festival de Música Popular',
    local: 'Parque Ibirapuera, São Paulo',
    data: '15 de Agosto de 2025',
  },
  {
    id: '2',
    titulo: 'Exposição de Arte Moderna',
    local: 'MASP, São Paulo',
    data: '20 de Agosto de 2025',
  },
  {
    id: '3',
    titulo: 'Peça de Teatro Infantil',
    local: 'Teatro Municipal, Rio de Janeiro',
    data: '28 de Agosto de 2025',
  },
];

export default function Explore() {
  return (
    <SafeAreaView className="flex-1 bg-background px-6 pt-8">
      <Text className="text-2xl font-bold text-text mb-1">Eventos</Text>
      <Text className="text-secondary mb-6">Confira os próximos eventos culturais</Text>

      <FlatList
        data={eventos}
        keyExtractor={(item) => item.id}
        showsVerticalScrollIndicator={false}
        renderItem={({ item }) => (
          <View className="bg-gray-100 rounded-2xl p-5 mb-4">
            <Text className="text-base font-semibold text-text mb-3">{item.titulo}</Text>
            <Text className="text-secondary text-sm mb-1">📍 {item.local}</Text>
            <Text className="text-secondary text-sm">📅 {item.data}</Text>
          </View>
        )}
      />
    </SafeAreaView>
  );
}
