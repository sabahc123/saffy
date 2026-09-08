import AsyncStorage from '@react-native-async-storage/async-storage';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

type MemoryState = 'seeded' | 'depositing' | 'banked';

type Prompt = {
  id: string;
  question: string;
  answer: string;
  acceptedAnswers: string[];
  memoryState: MemoryState;
};

export default function AddContentScreen() {
  const { topicName, editIndex } = useLocalSearchParams();
  const router = useRouter();

  const [question, setQuestion] = useState('');
  const [answer, setAnswer] = useState('');
  const [acceptedAnswersText, setAcceptedAnswersText] = useState('');
  const [items, setItems] = useState<Prompt[]>([]);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [hasLoaded, setHasLoaded] = useState(false);

  const questionInputRef = useRef<TextInput>(null);

  function createPromptId() {
    return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
  }

  function addItem() {
    if (!question.trim() || !answer.trim()) {
      return;
    }

    const acceptedAnswers = acceptedAnswersText
      .split(',')
      .map((item) => item.trim())
      .filter(Boolean);

    if (editingIndex !== null) {
      const existingPrompt = items[editingIndex];

      const updatedPrompt: Prompt = {
        ...existingPrompt,
        question: question.trim(),
        answer: answer.trim(),
        acceptedAnswers,
      };

      const updatedItems = [...items];
      updatedItems[editingIndex] = updatedPrompt;

      setItems(updatedItems);
      setEditingIndex(null);
    } else {
      const newPrompt: Prompt = {
        id: createPromptId(),
        question: question.trim(),
        answer: answer.trim(),
        acceptedAnswers,
        memoryState: 'seeded',
      };

      setItems([...items, newPrompt]);
    }

    setQuestion('');
    setAnswer('');
    setAcceptedAnswersText('');

    questionInputRef.current?.focus();
  }

  function editItem(index: number) {
    const item = items[index];

    setQuestion(item.question);
    setAnswer(item.answer);
    setAcceptedAnswersText(
      item.acceptedAnswers?.join(', ') ?? ''
    );
    setEditingIndex(index);

    questionInputRef.current?.focus();
  }

  useEffect(() => {
    async function loadItems() {
      setHasLoaded(false);

      const savedItems = await AsyncStorage.getItem(
        `topic-items-${topicName}`
      );

      if (savedItems) {
        const parsedItems = JSON.parse(savedItems);

        /*
         * Older prompts may not contain:
         * - id
         * - acceptedAnswers
         * - memoryState
         *
         * This upgrades them when they are loaded.
         */
        const normalisedItems: Prompt[] = parsedItems.map(
          (
            item: {
              id?: string;
              question: string;
              answer: string;
              acceptedAnswers?: string[];
              memoryState?: MemoryState;
            },
            index: number
          ) => ({
            id:
              item.id ??
              `${Date.now()}-${index}-${Math.random()
                .toString(36)
                .slice(2, 9)}`,
            question: item.question,
            answer: item.answer,
            acceptedAnswers: item.acceptedAnswers ?? [],
            memoryState: item.memoryState ?? 'seeded',
          })
        );

        setItems(normalisedItems);

        if (editIndex !== undefined) {
          const index = Number(editIndex);
          const item = normalisedItems[index];

          if (item) {
            setQuestion(item.question);
            setAnswer(item.answer);
            setAcceptedAnswersText(
              item.acceptedAnswers.join(', ')
            );
            setEditingIndex(index);
          }
        }
      } else {
        setItems([]);
      }

      setHasLoaded(true);
    }

    loadItems();
  }, [topicName, editIndex]);

  useEffect(() => {
    async function saveItems() {
      if (!hasLoaded) {
        return;
      }

      await AsyncStorage.setItem(
        `topic-items-${topicName}`,
        JSON.stringify(items)
      );
    }

    saveItems();
  }, [items, topicName, hasLoaded]);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Add content</Text>

      <Text style={styles.topicName}>{topicName}</Text>

      <Text style={styles.helperText}>
        Enter at least 10 prompts to create your topic.
      </Text>

      <Text style={styles.label}>Question</Text>

      <TextInput
        ref={questionInputRef}
        style={styles.input}
        placeholder="e.g. Le livre"
        value={question}
        onChangeText={setQuestion}
        autoCorrect={false}
        autoCapitalize="none"
      />

      <Text style={styles.label}>Answer</Text>

      <TextInput
        style={styles.input}
        placeholder="e.g. Book"
        value={answer}
        onChangeText={setAnswer}
        autoCorrect={false}
        autoCapitalize="none"
      />

      <Text style={styles.label}>
        Also accept (optional)
      </Text>

      <TextInput
        style={styles.input}
        placeholder="e.g. novel, a book"
        value={acceptedAnswersText}
        onChangeText={setAcceptedAnswersText}
        autoCorrect={false}
        autoCapitalize="none"
      />

      <Text style={styles.acceptedAnswersHint}>
        Separate alternative answers with commas.
      </Text>

      <Pressable style={styles.addButton} onPress={addItem}>
        <Text style={styles.addButtonText}>
          {editingIndex !== null ? 'Update' : 'Add'}
        </Text>
      </Pressable>

      <Text style={styles.listTitle}>Prompts added</Text>

      <ScrollView style={styles.list}>
        {items.map((item, index) => (
          <View key={item.id} style={styles.item}>
            <View style={styles.itemText}>
              <Text style={styles.itemQuestion}>
                {index + 1}. {item.question}
              </Text>

              <Text style={styles.itemAnswer}>
                {item.answer}
              </Text>

              {item.acceptedAnswers.length > 0 && (
                <Text style={styles.itemAcceptedAnswers}>
                  Also accept: {item.acceptedAnswers.join(', ')}
                </Text>
              )}
            </View>

            <Pressable onPress={() => editItem(index)}>
              <Text style={styles.editButton}>Edit</Text>
            </Pressable>
          </View>
        ))}
      </ScrollView>

      <Pressable
        style={[
          styles.doneButton,
          items.length < 10 && styles.doneButtonDisabled,
        ]}
        disabled={items.length < 10}
        onPress={() =>
          router.push({
            pathname: '/topic-summary',
            params: {
              topicName,
              items: JSON.stringify(items),
            },
          })
        }
      >
        <Text
          style={[
            styles.doneButtonText,
            items.length < 10 &&
              styles.doneButtonTextDisabled,
          ]}
        >
          Done
        </Text>
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
    marginBottom: 24,
  },

  helperText: {
    fontSize: 14,
    color: '#666666',
    marginBottom: 20,
  },

  label: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 6,
  },

  input: {
    width: '100%',
    borderWidth: 1,
    borderColor: '#CCCCCC',
    borderRadius: 10,
    padding: 14,
    fontSize: 16,
    marginBottom: 16,
  },

  acceptedAnswersHint: {
    fontSize: 13,
    color: '#777777',
    marginTop: -8,
    marginBottom: 16,
  },

  addButton: {
    width: '100%',
    padding: 16,
    borderRadius: 10,
    backgroundColor: '#000000',
    alignItems: 'center',
    marginBottom: 24,
  },

  addButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },

  listTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginTop: 8,
  },

  list: {
    flex: 1,
    marginTop: 12,
    marginBottom: 12,
  },

  item: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5E5',
    paddingVertical: 12,
  },

  itemText: {
    flex: 1,
    paddingRight: 16,
  },

  itemQuestion: {
    fontSize: 16,
    fontWeight: '600',
  },

  itemAnswer: {
    fontSize: 16,
    marginTop: 4,
  },

  itemAcceptedAnswers: {
    fontSize: 13,
    color: '#666666',
    marginTop: 4,
  },

  editButton: {
    fontSize: 15,
    fontWeight: '600',
  },

  doneButton: {
    width: '100%',
    padding: 16,
    borderRadius: 10,
    backgroundColor: '#000000',
    alignItems: 'center',
    marginTop: 12,
  },

  doneButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },

  doneButtonDisabled: {
    backgroundColor: '#D3D3D3',
  },

  doneButtonTextDisabled: {
    color: '#888888',
  },
});