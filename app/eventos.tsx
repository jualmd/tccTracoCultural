import { View, Text, StyleSheet, FlatList } from 'react-native';

const eventos = [
  {
    id: '1',
    titulo: 'Festival de Música Popular',
    local: 'Praça Central',
    data: '12/06/2026',
  },
  {
    id: '2',
    titulo: 'Exposição de Arte Moderna',
    local: 'Museu Municipal',
    data: '20/06/2026',
  },
  {
    id: '3',
    titulo: 'Peça de Teatro Infantil',
    local: 'Teatro da Cidade',
    data: '25/06/2026',
  },
];

export default function EventosScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Eventos Culturais</Text>

      <FlatList
        data={eventos}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <Text style={styles.nome}>{item.titulo}</Text>
            <Text style={styles.info}>📍 {item.local}</Text>
            <Text style={styles.info}>📅 {item.data}</Text>
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 20,
  },
  title: {
    fontSize: 30,
    fontWeight: 'bold',
    marginTop: 40,
    marginBottom: 20,
  },
  card: {
    backgroundColor: '#f2f2f2',
    padding: 20,
    borderRadius: 10,
    marginBottom: 15,
  },
  nome: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  info: {
    fontSize: 16,
    color: '#555',
  },
});
