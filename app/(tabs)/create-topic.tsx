import { useRouter } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';

export default function CreateTopicScreen() {
  const router = useRouter();

  return (

    <View style={styles.container}>
        <Pressable onPress={() => router.back()}>
        <Text style={styles.backButton}>← Back</Text>
        </Pressable>
      <Text style={styles.title}>Create a topic</Text>

      <Text style={styles.subtitle}>
        What would you like to learn?
      </Text>
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
});