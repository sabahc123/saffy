import AsyncStorage from '@react-native-async-storage/async-storage';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useState } from 'react';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

type Prompt = {
  question: string;
  answer: string;
  acceptedAnswers?: string[];
};

export default function TopicSummaryScreen() {
  const { topicName, items } = useLocalSearchParams();
  const router = useRouter();

  const parsedPrompts: Prompt[] = items
    ? JSON.parse(items as string)
    : [];

  // Keep older saved prompts compatible with accepted answers.
  const initialPrompts: Prompt[] = parsedPrompts.map((prompt) => ({
    ...prompt,
    acceptedAnswers: prompt.acceptedAnswers ?? [],
  }));

  const [prompts, setPrompts] = useState<Prompt[]>(initialPrompts);
  const [isEditing, setIsEditing] = useState(false);

  // Keep accepted answers as plain text while the user is editing.
  const [acceptedAnswersText, setAcceptedAnswersText] = useState<string[]>(
    initialPrompts.map((prompt) =>
      (prompt.acceptedAnswers ?? []).join(', ')
    )
  );

  function updatePrompt(
    index: number,
    field: 'question' | 'answer',
    value: string
  ) {
    const updatedPrompts = [...prompts];

    updatedPrompts[index] = {
      ...updatedPrompts[index],
      [field]: value,
    };

    setPrompts(updatedPrompts);
  }

  function updateAcceptedAnswersText(
    index: number,
    value: string
  ) {
    const updatedText = [...acceptedAnswersText];

    updatedText[index] = value;

    setAcceptedAnswersText(updatedText);
  }

  async function saveChanges() {
    // Convert comma-separated text into accepted answer arrays only on save.
    const updatedPrompts = prompts.map((prompt, index) => ({
      ...prompt,
      question: prompt.question.trim(),
      answer: prompt.answer.trim(),
      acceptedAnswers: (acceptedAnswersText[index] ?? '')
        .split(',')
        .map((answer) => answer.trim())
        .filter(Boolean),
    }));

    setPrompts(updatedPrompts);

    await AsyncStorage.setItem(
      `topic-items-${topicName}`,
      JSON.stringify(updatedPrompts)
    );

    setIsEditing(false);
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Lesson Preview</Text>

      <Text style={styles.topicName}>{topicName}</Text>

      <Text style={styles.count}>
        {prompts.length} prompts
      </Text>

      <View style={styles.tableHeader}>
        <Text style={[styles.headerCell, styles.questionColumn]}>
          Question
        </Text>

        <Text style={[styles.headerCell, styles.answerColumn]}>
          Answer
        </Text>
      </View>

      <ScrollView
        style={styles.list}
        keyboardShouldPersistTaps="handled"
      >
        {prompts.map((prompt, index) => (
          <View key={index} style={styles.tableRow}>
            {isEditing ? (
              <>
                <View style={styles.questionColumn}>
                  <TextInput
                    style={styles.inputCell}
                    value={prompt.question}
                    onChangeText={(value) =>
                      updatePrompt(index, 'question', value)
                    }
                    autoCorrect={false}
                    autoCapitalize="none"
                  />
                </View>

                <View style={styles.answerColumn}>
                  <TextInput
                    style={styles.inputCell}
                    value={prompt.answer}
                    onChangeText={(value) =>
                      updatePrompt(index, 'answer', value)
                    }
                    autoCorrect={false}
                    autoCapitalize="none"
                  />

                  <TextInput
                    style={[
                      styles.inputCell,
                      styles.acceptedAnswersInput,
                    ]}
                    value={acceptedAnswersText[index] ?? ''}
                    onChangeText={(value) =>
                      updateAcceptedAnswersText(index, value)
                    }
                    placeholder="Also accept..."
                    autoCorrect={false}
                    autoCapitalize="none"
                  />
                </View>
              </>
            ) : (
              <>
                <Text
                  style={[
                    styles.cell,
                    styles.questionColumn,
                  ]}
                >
                  {index + 1}. {prompt.question}
                </Text>

                <View style={styles.answerColumn}>
                  <Text style={styles.cell}>
                    {prompt.answer}
                  </Text>

                  {prompt.acceptedAnswers &&
                    prompt.acceptedAnswers.length > 0 && (
                      <Text style={styles.acceptedAnswers}>
                        Also accept:{' '}
                        {prompt.acceptedAnswers.join(', ')}
                      </Text>
                    )}
                </View>
              </>
            )}
          </View>
        ))}
      </ScrollView>

      <Pressable
        style={styles.editButton}
        onPress={
          isEditing
            ? saveChanges
            : () => setIsEditing(true)
        }
      >
        <Text style={styles.editButtonText}>
          {isEditing ? 'Save Changes' : 'Edit'}
        </Text>
      </Pressable>

      <Pressable
        style={[
          styles.startButton,
          isEditing && styles.startButtonDisabled,
        ]}
        disabled={isEditing}
        onPress={() =>
          router.push({
            pathname: '/lesson',
            params: {
              topicName,
              items: JSON.stringify(prompts),
            },
          })
        }
      >
        <Text style={styles.startButtonText}>
          Start Lesson
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
    alignItems: 'flex-start',
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

  inputCell: {
    width: '100%',
    fontSize: 15,
    borderWidth: 1,
    borderColor: '#CCCCCC',
    borderRadius: 6,
    padding: 8,
  },

  acceptedAnswersInput: {
    marginTop: 6,
  },

  acceptedAnswers: {
    fontSize: 12,
    color: '#777777',
    marginTop: 4,
  },

  questionColumn: {
    flex: 1,
    paddingRight: 12,
  },

  answerColumn: {
    flex: 1,
  },

  editButton: {
    alignSelf: 'flex-start',
    paddingVertical: 10,
    paddingHorizontal: 18,
    borderRadius: 8,
    backgroundColor: '#E5E5E5',
    marginTop: 16,
  },

  editButtonText: {
    fontSize: 16,
    fontWeight: '500',
  },

  startButton: {
    width: '100%',
    padding: 16,
    borderRadius: 10,
    backgroundColor: '#000000',
    alignItems: 'center',
    marginTop: 16,
  },

  startButtonDisabled: {
    backgroundColor: '#CCCCCC',
  },

  startButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});