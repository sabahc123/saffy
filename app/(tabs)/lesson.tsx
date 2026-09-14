import AsyncStorage from '@react-native-async-storage/async-storage';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useMemo, useRef, useState } from 'react';
import {
  Alert,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { Card, createEmptyCard, fsrs, Rating } from 'ts-fsrs';

type MemoryState = 'seeded' | 'depositing' | 'banked';

type Prompt = {
  id: string;
  question: string;
  answer: string;
  acceptedAnswers?: string[];
  memoryState: MemoryState;
  fsrsCard: Card;
  sourceTopicName?: string;
};

type LessonAnswer = {
  id: string;
  question: string;
  correctAnswer: string;
  acceptedAnswers?: string[];
  userAnswer: string;
  skipped: boolean;
  isCorrect: boolean;
};

const scheduler = fsrs({
  enable_short_term: false,
});

export default function LessonScreen() {
  const { topicName, items } = useLocalSearchParams();
  const router = useRouter();

  const originalPrompts: Prompt[] = items
    ? JSON.parse(items as string).map(
        (prompt: Prompt) => ({
          ...prompt,
          fsrsCard: restoreFsrsCard(prompt.fsrsCard),
        })
      )
    : [];

  // Randomise the prompts once at the beginning of each lesson.
  const shuffledPrompts = useMemo(() => {
    return [...originalPrompts].sort(() => Math.random() - 0.5);
  }, [items]);

  const [countdown, setCountdown] = useState(3);
  const [lessonStarted, setLessonStarted] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [userAnswer, setUserAnswer] = useState('');
  const [lessonAnswers, setLessonAnswers] = useState<LessonAnswer[]>([]);
  const [feedback, setFeedback] = useState<LessonAnswer | null>(null);

  const answerInputRef = useRef<TextInput>(null);

  function restoreFsrsCard(card?: Partial<Card>): Card {
    if (!card) {
      return createEmptyCard();
    }

    return {
      ...createEmptyCard(),
      ...card,
      due: card.due ? new Date(card.due) : new Date(),
      last_review: card.last_review
        ? new Date(card.last_review)
        : undefined,
    };
  }

  // Run the 3-2-1 countdown, then automatically open the keyboard.
  useEffect(() => {
    if (countdown === 0) {
      setLessonStarted(true);

      setTimeout(() => {
        answerInputRef.current?.focus();
      }, 300);

      return;
    }

    const timer = setTimeout(() => {
      setCountdown((current) => current - 1);
    }, 1000);

    return () => clearTimeout(timer);
  }, [countdown]);

  const currentPrompt = shuffledPrompts[currentIndex];

  function normaliseAnswer(answer: string) {
    return answer
      .trim()
      .toLowerCase()
      .replace(/\s+/g, ' ')
      .replace(/^(a|an|the)\s+/i, '');
  }

  // Check the primary answer and any alternatives chosen by the learner.
  function checkAnswer(
    prompt: Prompt,
    submittedAnswer: string
  ) {
    const acceptableAnswers = [
      prompt.answer,
      ...(prompt.acceptedAnswers ?? []),
    ];

    const normalisedSubmittedAnswer =
      normaliseAnswer(submittedAnswer);

    return acceptableAnswers.some(
      (acceptableAnswer) =>
        normaliseAnswer(acceptableAnswer) ===
        normalisedSubmittedAnswer
    );
  }

  function getUpdatedMemoryState(
    currentState: MemoryState,
    isCorrect: boolean
  ): MemoryState {
    if (isCorrect) {
      if (currentState === 'seeded') {
        return 'depositing';
      }

      return currentState;
    }

    if (currentState === 'depositing') {
      return 'seeded';
    }

    if (currentState === 'banked') {
      return 'depositing';
    }

    return 'seeded';
  }

  async function updateMemoryAfterAnswer(
    prompt: Prompt,
    isCorrect: boolean
  ) {
    const rating = isCorrect
      ? Rating.Good
      : Rating.Again;

    const result = scheduler.next(
      restoreFsrsCard(prompt.fsrsCard),
      new Date(),
      rating
    );

    const memoryTopicName =
      prompt.sourceTopicName ?? topicName;

    if (!memoryTopicName) {
      return;
    }

    const storageKey =
      `topic-items-${memoryTopicName}`;

    const savedItems =
      await AsyncStorage.getItem(storageKey);

    if (!savedItems) {
      return;
    }

    const storedPrompts: Prompt[] =
      JSON.parse(savedItems);

    const updatedPrompts = storedPrompts.map(
      (storedPrompt) => {
        if (storedPrompt.id !== prompt.id) {
          return storedPrompt;
        }

        return {
          ...storedPrompt,
          memoryState: getUpdatedMemoryState(
            storedPrompt.memoryState ?? 'seeded',
            isCorrect
          ),
          fsrsCard: result.card,
        };
      }
    );

    await AsyncStorage.setItem(
      storageKey,
      JSON.stringify(updatedPrompts)
    );
  }

  function confirmQuitLesson() {
    Alert.alert(
      'Quit lesson?',
      'Your progress in this lesson will be lost.',
      [
        {
          text: 'Keep Learning',
          style: 'cancel',
        },
        {
          text: 'Quit Lesson',
          style: 'destructive',
          onPress: () => router.back(),
        },
      ]
    );
  }

  // Show feedback briefly before advancing to the next prompt.
  async function recordAnswer(answer: LessonAnswer) {
    const updatedAnswers = [...lessonAnswers, answer];

    setLessonAnswers(updatedAnswers);
    setFeedback(answer);

    Keyboard.dismiss();

    if (currentPrompt) {
      await updateMemoryAfterAnswer(
        currentPrompt,
        answer.isCorrect
      );
    }

    const isLastQuestion =
      currentIndex === shuffledPrompts.length - 1;

    setTimeout(() => {
      if (isLastQuestion) {
        router.replace({
          pathname: '/results',
          params: {
            topicName,
            results: JSON.stringify(updatedAnswers),
          },
        });

        return;
      }

      setCurrentIndex(
        (current) => current + 1
      );
      setUserAnswer('');
      setFeedback(null);

      setTimeout(() => {
        answerInputRef.current?.focus();
      }, 100);
    }, 1200);
  }

  function submitAnswer() {
    if (
      !currentPrompt ||
      !userAnswer.trim() ||
      feedback
    ) {
      return;
    }

    const submittedAnswer = userAnswer.trim();

    const isCorrect = checkAnswer(
      currentPrompt,
      submittedAnswer
    );

    recordAnswer({
      id: currentPrompt.id,
      question: currentPrompt.question,
      correctAnswer: currentPrompt.answer,
      acceptedAnswers:
        currentPrompt.acceptedAnswers ?? [],
      userAnswer: submittedAnswer,
      skipped: false,
      isCorrect,
    });
  }

  function skipQuestion() {
    if (!currentPrompt || feedback) {
      return;
    }

    recordAnswer({
      id: currentPrompt.id,
      question: currentPrompt.question,
      correctAnswer: currentPrompt.answer,
      acceptedAnswers:
        currentPrompt.acceptedAnswers ?? [],
      userAnswer: '',
      skipped: true,
      isCorrect: false,
    });
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={
        Platform.OS === 'ios'
          ? 'padding'
          : undefined
      }
    >
      {!lessonStarted ? (
        <View style={styles.countdownContainer}>
          <Text style={styles.countdown}>
            {countdown}
          </Text>
        </View>
      ) : (
        <View style={styles.lessonContainer}>
          <View style={styles.progressTrack}>
            <View
              style={[
                styles.progressFill,
                {
                  width: `${
                    ((currentIndex + 1) /
                      shuffledPrompts.length) *
                    100
                  }%`,
                },
              ]}
            />
          </View>

          <View style={styles.topRow}>
            <Text style={styles.progressText}>
              {currentIndex + 1} of{' '}
              {shuffledPrompts.length}
            </Text>

            <Pressable
              onPress={confirmQuitLesson}
            >
              <Text style={styles.quitButton}>
                Quit Lesson
              </Text>
            </Pressable>
          </View>

          <View style={styles.questionCard}>
            <Text style={styles.question}>
              {currentPrompt?.question}
            </Text>

            <TextInput
              ref={answerInputRef}
              style={styles.answerInput}
              placeholder="Enter your answer..."
              value={userAnswer}
              onChangeText={setUserAnswer}
              autoCorrect={false}
              autoCapitalize="none"
              returnKeyType="done"
              onSubmitEditing={submitAnswer}
              editable={!feedback}
            />
          </View>

          {feedback ? (
            <View
              style={styles.feedbackContainer}
            >
              <Text
                style={
                  feedback.isCorrect
                    ? styles.correctFeedback
                    : styles.incorrectFeedback
                }
              >
                {feedback.isCorrect
                  ? '✓ Correct'
                  : '✕ Incorrect'}
              </Text>

              {!feedback.isCorrect && (
                <Text
                  style={styles.correctAnswer}
                >
                  Correct answer:{' '}
                  <Text
                    style={
                      styles.correctAnswerText
                    }
                  >
                    {feedback.correctAnswer}
                  </Text>
                </Text>
              )}
            </View>
          ) : (
            <>
              <Pressable
                style={[
                  styles.submitButton,
                  !userAnswer.trim() &&
                    styles.submitButtonDisabled,
                ]}
                disabled={!userAnswer.trim()}
                onPress={submitAnswer}
              >
                <Text
                  style={styles.submitButtonText}
                >
                  Submit Answer
                </Text>
              </Pressable>

              <Pressable
                style={styles.skipButton}
                onPress={skipQuestion}
              >
                <Text
                  style={styles.skipButtonText}
                >
                  Skip
                </Text>
              </Pressable>
            </>
          )}
        </View>
      )}
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },

  countdownContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },

  countdown: {
    fontSize: 80,
    fontWeight: '600',
  },

  lessonContainer: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 60,
  },

  progressTrack: {
    width: '100%',
    height: 4,
    backgroundColor: '#E5E5E5',
    borderRadius: 2,
    overflow: 'hidden',
    marginBottom: 18,
  },

  progressFill: {
    height: '100%',
    backgroundColor: '#000000',
  },

  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 40,
  },

  progressText: {
    fontSize: 14,
    color: '#666666',
  },

  quitButton: {
    fontSize: 14,
    fontWeight: '500',
  },

  questionCard: {
    borderWidth: 1,
    borderColor: '#D8D8D8',
    borderRadius: 14,
    padding: 24,
    marginBottom: 28,
  },

  question: {
    fontSize: 32,
    fontWeight: '600',
    marginBottom: 30,
  },

  answerInput: {
    borderWidth: 1,
    borderColor: '#CCCCCC',
    borderRadius: 10,
    padding: 14,
    fontSize: 17,
  },

  submitButton: {
    backgroundColor: '#000000',
    borderRadius: 10,
    padding: 16,
    alignItems: 'center',
  },

  submitButtonDisabled: {
    backgroundColor: '#CCCCCC',
  },

  submitButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },

  skipButton: {
    alignItems: 'center',
    padding: 16,
  },

  skipButtonText: {
    fontSize: 15,
    color: '#666666',
  },

  feedbackContainer: {
    alignItems: 'center',
    paddingVertical: 16,
  },

  correctFeedback: {
    fontSize: 22,
    fontWeight: '600',
  },

  incorrectFeedback: {
    fontSize: 22,
    fontWeight: '600',
  },

  correctAnswer: {
    fontSize: 16,
    marginTop: 10,
    color: '#666666',
  },

  correctAnswerText: {
    fontWeight: '600',
    color: '#000000',
  },
});