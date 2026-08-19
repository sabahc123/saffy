import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect, useRouter } from 'expo-router';
import { useCallback, useState } from 'react';
import {
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';

type SavedTopic =
  | string
  | {
      name: string;
      items?: {
        question: string;
        answer: string;
      }[];
    };

export default function HomeScreen() {
  const router = useRouter();
  const [topics, setTopics] = useState<SavedTopic[]>([]);

  useFocusEffect(
    useCallback(() => {
      async function loadTopics() {
        const savedTopics = await AsyncStorage.getItem('saved-topics');

        if (savedTopics) {
          setTopics(JSON.parse(savedTopics));
        } else {
          setTopics([]);
        }
      }

      loadTopics();
    }, [])
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Time to learn!</Text>

      {topics.length === 0 ? (
        <Text style={styles.subtitle}>
          Your topics will live here.
        </Text>
      ) : (
        <View style={styles.topicList}>
          {topics.map((topic, index) => {
            const topicName =
              typeof topic === 'string'
                ? topic
                : topic.name;

            return (
              <View
                key={`${topicName}-${index}`}
                style={styles.topicCard}
              >
                <Text style={styles.topicName}>
                  {topicName}
                </Text>
              </View>
            );
          })}
        </View>
      )}

      <Pressable
        style={styles.addButton}
        onPress={() => router.push('/create-topic')}
      >
        <Text style={styles.addButtonText}>+</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    paddingTop: 80,
    backgroundColor: '#FFFFFF',
  },

  title: {
    fontSize: 28,
    fontWeight: '600',
    marginBottom: 8,
  },

  subtitle: {
    fontSize: 16,
    marginBottom: 32,
  },

  topicList: {
    width: '100%',
    marginTop: 20,
  },

  topicCard: {
    width: '100%',
    padding: 16,
    borderWidth: 1,
    borderColor: '#E5E5E5',
    borderRadius: 10,
    marginBottom: 12,
  },

  topicName: {
    fontSize: 18,
    fontWeight: '600',
  },

  addButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 24,
  },

  addButtonText: {
    fontSize: 30,
  },
});