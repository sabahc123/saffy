import AsyncStorage from '@react-native-async-storage/async-storage';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import {
  Modal,
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

type LessonResult = {
  question: string;
  correctAnswer: string;
  acceptedAnswers?: string[];
  userAnswer: string;
  skipped: boolean;
  isCorrect: boolean;
};

type PileType = 'review' | 'recall';

export default function TopicSummaryScreen() {
  const { topicName, items } = useLocalSearchParams();
  const router = useRouter();

  const parsedPrompts: Prompt[] = items
    ? JSON.parse(items as string)
    : [];

  const initialPrompts: Prompt[] = parsedPrompts.map((prompt) => ({
    ...prompt,
    acceptedAnswers: prompt.acceptedAnswers ?? [],
  }));

  const [prompts, setPrompts] = useState<Prompt[]>(initialPrompts);
  const [isEditing, setIsEditing] = useState(false);
  const [promptsOpen, setPromptsOpen] = useState(false);

  const [reviewPile, setReviewPile] = useState<LessonResult[]>([]);
  const [recallPile, setRecallPile] = useState<LessonResult[]>([]);
  const [lastCompletedAt, setLastCompletedAt] = useState<string | null>(null);
  const [hasCompletedLesson, setHasCompletedLesson] = useState(false);

  const [selectedPile, setSelectedPile] = useState<PileType | null>(null);

  const [acceptedAnswersText, setAcceptedAnswersText] = useState<string[]>(
    initialPrompts.map((prompt) =>
      (prompt.acceptedAnswers ?? []).join(', ')
    )
  );

  // Load the learner's latest saved lesson state.
  useEffect(() => {
    async function loadLearningState() {
      if (!topicName) {
        return;
      }

      const topicKey = String(topicName);

      const savedResults = await AsyncStorage.getItem(
        `topic-last-results-${topicKey}`
      );

      if (!savedResults) {
        setHasCompletedLesson(false);
        return;
      }

      const savedReview = await AsyncStorage.getItem(
        `topic-review-${topicKey}`
      );

      const savedRecall = await AsyncStorage.getItem(
        `topic-recall-${topicKey}`
      );

      const savedCompletedAt = await AsyncStorage.getItem(
        `topic-last-completed-${topicKey}`
      );

      setReviewPile(
        savedReview ? JSON.parse(savedReview) : []
      );

      setRecallPile(
        savedRecall ? JSON.parse(savedRecall) : []
      );

      setLastCompletedAt(savedCompletedAt);
      setHasCompletedLesson(true);
    }

    loadLearningState();
  }, [topicName]);

  function formatLessonTime(timestamp: string | null) {
    if (!timestamp) {
      return '';
    }

    const date = new Date(timestamp);
    const now = new Date();

    const sameDay =
      date.getDate() === now.getDate() &&
      date.getMonth() === now.getMonth() &&
      date.getFullYear() === now.getFullYear();

    const time = date.toLocaleTimeString('en-GB', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });

    if (sameDay) {
      return `Today, ${time}`;
    }

    const dateText = date.toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });

    return `${dateText}, ${time}`;
  }

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

  function startEditing() {
    setPromptsOpen(true);
    setIsEditing(true);
  }

  async function saveChanges() {
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

  function convertPileToPrompts(pile: LessonResult[]): Prompt[] {
    return pile.map((result) => ({
      question: result.question,
      answer: result.correctAnswer,
      acceptedAnswers: result.acceptedAnswers ?? [],
    }));
  }

  function startPileLesson(pileType: PileType) {
    const selectedResults =
      pileType === 'review'
        ? reviewPile
        : recallPile;

    const lessonPrompts =
      convertPileToPrompts(selectedResults);

    if (lessonPrompts.length === 0) {
      return;
    }

    setSelectedPile(null);

    router.push({
      pathname: '/lesson',
      params: {
        topicName,
        items: JSON.stringify(lessonPrompts),
      },
    });
  }

  const modalPile =
    selectedPile === 'review'
      ? reviewPile
      : recallPile;

  const modalTitle =
    selectedPile === 'review'
      ? 'Review pile'
      : 'Recall pile';

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.mainScroll}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <Text style={styles.title}>Lesson Preview</Text>

        <Text style={styles.topicName}>{topicName}</Text>

        <Text style={styles.count}>
          {prompts.length} prompts
        </Text>

        {hasCompletedLesson && (
          <>
            <Text style={styles.lastLesson}>
              Last lesson: {formatLessonTime(lastCompletedAt)}
            </Text>

            <View style={styles.learningSummary}>
              <Pressable
                style={styles.pileCard}
                onPress={() => setSelectedPile('review')}
              >
                <Text style={styles.pileNumber}>
                  {reviewPile.length}
                </Text>

                <Text style={styles.pileLabel}>
                  Review
                </Text>

                <Text style={styles.pileHint}>
                  Tap to preview
                </Text>
              </Pressable>

              <Pressable
                style={styles.pileCard}
                onPress={() => setSelectedPile('recall')}
              >
                <Text style={styles.pileNumber}>
                  {recallPile.length}
                </Text>

                <Text style={styles.pileLabel}>
                  Recall
                </Text>

                <Text style={styles.pileHint}>
                  Tap to preview
                </Text>
              </Pressable>
            </View>
          </>
        )}

        <View style={styles.promptsSection}>
          <Pressable
            style={styles.promptsHeader}
            onPress={() => {
              if (!isEditing) {
                setPromptsOpen(!promptsOpen);
              }
            }}
          >
            <View>
              <Text style={styles.promptsTitle}>
                Prompts
              </Text>

              <Text style={styles.promptsCount}>
                {prompts.length} prompts
              </Text>
            </View>

            <Text style={styles.chevron}>
              {promptsOpen ? '⌃' : '⌄'}
            </Text>
          </Pressable>

          {promptsOpen && (
            <View style={styles.promptListContainer}>
              <View style={styles.tableHeader}>
                <Text
                  style={[
                    styles.headerCell,
                    styles.questionColumn,
                  ]}
                >
                  Question
                </Text>

                <Text
                  style={[
                    styles.headerCell,
                    styles.answerColumn,
                  ]}
                >
                  Answer
                </Text>
              </View>

              {prompts.map((prompt, index) => (
                <View
                  key={index}
                  style={styles.tableRow}
                >
                  {isEditing ? (
                    <>
                      <View style={styles.questionColumn}>
                        <TextInput
                          style={styles.inputCell}
                          value={prompt.question}
                          onChangeText={(value) =>
                            updatePrompt(
                              index,
                              'question',
                              value
                            )
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
                            updatePrompt(
                              index,
                              'answer',
                              value
                            )
                          }
                          autoCorrect={false}
                          autoCapitalize="none"
                        />

                        <TextInput
                          style={[
                            styles.inputCell,
                            styles.acceptedAnswersInput,
                          ]}
                          value={
                            acceptedAnswersText[index] ?? ''
                          }
                          onChangeText={(value) =>
                            updateAcceptedAnswersText(
                              index,
                              value
                            )
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
            </View>
          )}

          <Pressable
            style={styles.editButton}
            onPress={
              isEditing
                ? saveChanges
                : startEditing
            }
          >
            <Text style={styles.editButtonText}>
              {isEditing ? 'Save Changes' : 'Edit'}
            </Text>
          </Pressable>
        </View>

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
            Start Full Lesson
          </Text>
        </Pressable>

        <View style={styles.bottomSpacing} />
      </ScrollView>

      <Modal
        visible={selectedPile !== null}
        transparent
        animationType="fade"
        onRequestClose={() => setSelectedPile(null)}
      >
        <View style={styles.modalBackdrop}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>
              {modalTitle}
            </Text>

            {lastCompletedAt && (
              <Text style={styles.modalTimestamp}>
                From your lesson {formatLessonTime(lastCompletedAt)}
              </Text>
            )}

            <ScrollView style={styles.modalList}>
              {modalPile.length === 0 ? (
                <Text style={styles.emptyPile}>
                  No prompts in this pile.
                </Text>
              ) : (
                modalPile.map((result, index) => (
                  <View
                    key={`${result.question}-${index}`}
                    style={styles.modalPromptRow}
                  >
                    <Text style={styles.modalPrompt}>
                      {index + 1}. {result.question}
                    </Text>
                  </View>
                ))
              )}
            </ScrollView>

            <Pressable
              style={[
                styles.modalStartButton,
                modalPile.length === 0 &&
                  styles.modalStartButtonDisabled,
              ]}
              disabled={modalPile.length === 0}
              onPress={() => {
                if (selectedPile) {
                  startPileLesson(selectedPile);
                }
              }}
            >
              <Text style={styles.modalStartButtonText}>
                Start {selectedPile === 'review' ? 'Review' : 'Recall'} Lesson
              </Text>
            </Pressable>

            <Pressable
              style={styles.modalCloseButton}
              onPress={() => setSelectedPile(null)}
            >
              <Text style={styles.modalCloseText}>
                Close
              </Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },

  mainScroll: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 70,
  },

  title: {
    fontSize: 28,
    fontWeight: '600',
    marginBottom: 8,
  },

  topicName: {
    fontSize: 20,
    fontWeight: '500',
    marginBottom: 6,
  },

  count: {
    fontSize: 14,
    color: '#666666',
    marginBottom: 8,
  },

  lastLesson: {
    fontSize: 13,
    color: '#777777',
    marginBottom: 18,
  },

  learningSummary: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 22,
  },

  pileCard: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 14,
    borderWidth: 1,
    borderColor: '#E5E5E5',
    borderRadius: 10,
  },

  pileNumber: {
    fontSize: 24,
    fontWeight: '600',
  },

  pileLabel: {
    fontSize: 14,
    fontWeight: '600',
    marginTop: 3,
  },

  pileHint: {
    fontSize: 11,
    color: '#888888',
    marginTop: 4,
  },

  promptsSection: {
    borderTopWidth: 1,
    borderTopColor: '#E5E5E5',
  },

  promptsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
  },

  promptsTitle: {
    fontSize: 18,
    fontWeight: '700',
  },

  promptsCount: {
    fontSize: 13,
    color: '#777777',
    marginTop: 3,
  },

  chevron: {
    fontSize: 22,
    color: '#666666',
  },

  promptListContainer: {
    paddingBottom: 8,
  },

  tableHeader: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#D8D8D8',
    paddingBottom: 8,
  },

  headerCell: {
    fontSize: 14,
    fontWeight: '700',
  },

  tableRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    borderBottomWidth: 1,
    borderBottomColor: '#EEEEEE',
    paddingVertical: 10,
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
    marginTop: 8,
    marginBottom: 20,
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
  },

  startButtonDisabled: {
    backgroundColor: '#CCCCCC',
  },

  startButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },

  bottomSpacing: {
    height: 100,
  },

  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.35)',
    justifyContent: 'center',
    padding: 24,
  },

  modalCard: {
    maxHeight: '70%',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 22,
  },

  modalTitle: {
    fontSize: 24,
    fontWeight: '700',
  },

  modalTimestamp: {
    fontSize: 13,
    color: '#777777',
    marginTop: 5,
    marginBottom: 16,
  },

  modalList: {
    marginBottom: 18,
  },

  modalPromptRow: {
    paddingVertical: 9,
    borderBottomWidth: 1,
    borderBottomColor: '#EEEEEE',
  },

  modalPrompt: {
    fontSize: 15,
  },

  emptyPile: {
    fontSize: 14,
    color: '#999999',
    paddingVertical: 12,
  },

  modalStartButton: {
    width: '100%',
    padding: 15,
    borderRadius: 10,
    backgroundColor: '#000000',
    alignItems: 'center',
  },

  modalStartButtonDisabled: {
    backgroundColor: '#CCCCCC',
  },

  modalStartButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },

  modalCloseButton: {
    alignItems: 'center',
    paddingTop: 14,
  },

  modalCloseText: {
    fontSize: 15,
    color: '#666666',
  },
});