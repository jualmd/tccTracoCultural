import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { router } from 'expo-router';

export default function HomeScreen() {
  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Catálogo Cultural</Text>

      <Text style={styles.subtitle}>
        Descubra eventos culturais da sua cidade
      </Text>

      <TouchableOpacity
        style={styles.card}
        onPress={() => router.push('/eventos')}
      >
        <Text style={styles.cardTitle}>Eventos Culturais</Text>
        <Text style={styles.cardText}>
          Veja shows, exposições, teatros e festivais.
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.card}
        onPress={() => router.push('/novo-evento')}
      >
        <Text style={styles.cardTitle}>Cadastrar Evento</Text>
        <Text style={styles.cardText}>
          Adicione um novo evento cultural.
        </Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#be4444ff',
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    marginTop: 40,
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 18,
    color: '#555',
    marginBottom: 30,
  },
  card: {
    backgroundColor: '#f3f3f3',
    padding: 20,
    borderRadius: 12,
    marginBottom: 20,
  },
  cardTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  cardText: {
    fontSize: 16,
    color: '#444',
  },
});
