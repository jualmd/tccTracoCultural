import { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Alert,
  ScrollView,
} from 'react-native';

export default function NovoEventoScreen() {
  const [titulo, setTitulo] = useState('');
  const [local, setLocal] = useState('');
  const [data, setData] = useState('');
  const [descricao, setDescricao] = useState('');

  function cadastrarEvento() {
    if (!titulo || !local || !data) {
      Alert.alert('Erro', 'Preencha os campos obrigatórios');
      return;
    }

    Alert.alert('Sucesso', 'Evento cadastrado com sucesso!');

    setTitulo('');
    setLocal('');
    setData('');
    setDescricao('');
  }

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Novo Evento</Text>

      <TextInput
        placeholder="Título do evento"
        style={styles.input}
        value={titulo}
        onChangeText={setTitulo}
      />

      <TextInput
        placeholder="Local"
        style={styles.input}
        value={local}
        onChangeText={setLocal}
      />

      <TextInput
        placeholder="Data"
        style={styles.input}
        value={data}
        onChangeText={setData}
      />

      <TextInput
        placeholder="Descrição"
        style={[styles.input, styles.textarea]}
        multiline
        numberOfLines={5}
        value={descricao}
        onChangeText={setDescricao}
      />

      <TouchableOpacity
        style={styles.button}
        onPress={cadastrarEvento}
      >
        <Text style={styles.buttonText}>Cadastrar Evento</Text>
      </TouchableOpacity>
    </ScrollView>
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
  input: {
    backgroundColor: '#f2f2f2',
    padding: 15,
    borderRadius: 10,
    marginBottom: 15,
    fontSize: 16,
  },
  textarea: {
    height: 120,
    textAlignVertical: 'top',
  },
  button: {
    backgroundColor: '#222',
    padding: 18,
    borderRadius: 10,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
});
