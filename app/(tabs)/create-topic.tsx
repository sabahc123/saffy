import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

export default function CreateTopicScreen() {
  const router = useRouter();
  const [topicName, setTopicName] = useState('');

  return (

    <View style={styles.container}>
        <Pressable onPress={() => router.back()}>
        <Text style={styles.backButton}>← Back</Text>
        </Pressable>
      <Text style={styles.title}>Create a topic</Text>

      <Text style={styles.subtitle}>
        What would you like to learn?
      </Text>

      <TextInput
        style={styles.input}
        placeholder="e.g. French Vocabulary"
        value={topicName}
        onChangeText={setTopicName}
      />

      <Pressable
        style={styles.createButton}
      onPress={() =>
        router.push({
          pathname: '/add-content',
          params: { topicName },
        })
      }      >
        <Text style={styles.createButtonText}>Create Topic</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    backgroundColor: '#FFFFFF',
  },

  backButton: {
    fontSize: 16,
    marginTop: 40,
    marginBottom: 30,
},

  title: {
    fontSize: 28,
    fontWeight: '600',
    marginTop: 0,
    marginBottom: 8,
  },

  subtitle: {
    fontSize: 16,
  },

  input: {
    width: '100%',
    borderWidth: 1,
    borderColor: '#CCCCCC',
    borderRadius: 10,
    padding: 14,
    fontSize: 16,
    marginTop: 24,
  },

  createButton: {
    width: '100%',
    padding: 16,
    borderRadius: 10,
    backgroundColor: '#000000',
    alignItems: 'center',
    marginTop: 16,
},

  createButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
},
});