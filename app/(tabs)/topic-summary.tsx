import AsyncStorage from '@react-native-async-storage/async-storage';
import { useLocalSearchParams, useRouter } from 'expo-router';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';

export default function TopicSummaryScreen() {
  const { topicName, items } = useLocalSearchParams();
  const router = useRouter();

  const parsedItems = items
    ? JSON.parse(items as string)
    : [];

  function editItem(index: number) {
    router.push({
      pathname: '/add-content',
      params: {
        topicName,
        editIndex: index.toString(),
      },
    });
  }

  async function saveTopic() {
    const savedTopics = await AsyncStorage.getItem('saved-topics');

    const topicNames: string[] = savedTopics
      ? JSON.parse(savedTopics)
      : [];

    const currentTopicName = String(topicName);

    if (!topicNames.includes(currentTopicName)) {
      topicNames.push(currentTopicName);
    }

    await AsyncStorage.setItem(
      'saved-topics',
      JSON.stringify(topicNames)
    );

    router.replace('/');
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Topic Summary</Text>

      <Text style={styles.topicName}>{topicName}</Text>

      <Text style={styles.count}>
        {parsedItems.length} prompts
      </Text>

      <View style={styles.tableHeader}>
        <Text style={[styles.headerCell, styles.questionColumn]}>
          Question
        </Text>

        <Text style={[styles.headerCell, styles.answerColumn]}>
          Answer
        </Text>

        <Text style={styles.editColumn}></Text>
      </View>

      <ScrollView style={styles.list}>
        {parsedItems.map(
          (
            item: { question: string; answer: string },
            index: number
          ) => (
            <View key={index} style={styles.tableRow}>
              <Text style={[styles.cell, styles.questionColumn]}>
                {index + 1}. {item.question}
              </Text>

              <Text style={[styles.cell, styles.answerColumn]}>
                {item.answer}
              </Text>

              <Pressable
                style={styles.editColumn}
                onPress={() => editItem(index)}
              >
                <Text style={styles.editButton}>Edit</Text>
              </Pressable>
            </View>
          )
        )}
      </ScrollView>

      <Pressable
        style={styles.saveButton}
        onPress={saveTopic}
      >
        <Text style={styles.saveButtonText}>Save Topic</Text>
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

  title: {
    fontSize: 28,
    fontWeight: '600',
    marginTop: 60,
    marginBottom: 8,
  },

  topicName: {
    fontSize: 20,
    fontWeight: '500',
    marginBottom: 8,
  },

  count: {
    fontSize: 14,
    color: '#666666',
    marginBottom: 12,
  },

  tableHeader: {
    flexDirection: 'row',
    borderBottomWidth: 2,
    borderBottomColor: '#000000',
    paddingBottom: 8,
  },

  list: {
    flex: 1,
  },

  tableRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5E5',
    paddingVertical: 10,
  },

  headerCell: {
    fontSize: 15,
    fontWeight: '600',
  },

  cell: {
    fontSize: 15,
  },

  questionColumn: {
    flex: 1,
    paddingRight: 12,
  },

  answerColumn: {
    flex: 1,
    paddingRight: 8,
  },

  editColumn: {
    width: 42,
    alignItems: 'flex-end',
  },

  editButton: {
    fontSize: 14,
    fontWeight: '600',
  },

  saveButton: {
    width: '100%',
    padding: 16,
    borderRadius: 10,
    backgroundColor: '#000000',
    alignItems: 'center',
    marginTop: 16,
  },

  saveButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});