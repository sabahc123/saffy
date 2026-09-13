import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect, useRouter } from 'expo-router';
import { useCallback, useState } from 'react';
import {
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { getDueMemories } from '../../utils/memory-scheduling';

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
  const [dueCount, setDueCount] = useState(0);

  useFocusEffect(
    useCallback(() => {
     async function loadTopics() {
  const savedTopics = await AsyncStorage.getItem('saved-topics');

  if (!savedTopics) {
    setTopics([]);
    setDueCount(0);
    return;
  }

  const parsedTopics: SavedTopic[] = JSON.parse(savedTopics);

  setTopics(parsedTopics);

  const topicMemories = await Promise.all(
    parsedTopics.map(async (topic) => {
      const topicName =
        typeof topic === 'string'
          ? topic
          : topic.name;

      const savedItems = await AsyncStorage.getItem(
        `topic-items-${topicName}`
      );

      return savedItems ? JSON.parse(savedItems) : [];
    })
  );

  const allMemories = topicMemories.flat();

  const dueMemories = getDueMemories(allMemories);

  setDueCount(dueMemories.length);

  console.log('HOME DUE COUNT', dueMemories.length);
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
              <Pressable
                key={`${topicName}-${index}`}
                style={styles.topicCard}
                onPress={async () => {
                  const savedItems = await AsyncStorage.getItem(
                    `topic-items-${topicName}`
                  );

                  const items = savedItems
                    ? JSON.parse(savedItems)
                    : [];

                  router.push({
                    pathname: '/topic-summary',
                    params: {
                      topicName,
                      items: JSON.stringify(items),
                    },
                  });
                }}
              >
                <Text style={styles.topicName}>
                  {topicName}
                </Text>

                <Text style={styles.topicHint}>
                  Tap to preview lesson
                </Text>
              </Pressable>
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

  topicHint: {
    fontSize: 14,
    color: '#666666',
    marginTop: 4,
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