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

type Prompt = {
  question: string;
  answer: string;
  acceptedAnswers?: string[];
};

type LessonAnswer = {
  question: string;
  correctAnswer: string;
  userAnswer: string;
  skipped: boolean;
  isCorrect: boolean;
};

export default function LessonScreen() {
  const { topicName, items } = useLocalSearchParams();
  const router = useRouter();

  const originalPrompts: Prompt[] = items
    ? JSON.parse(items as string)
    : [];

  // Randomise the prompts once at the beginning of each lesson.
  const shuffledPrompts = useMemo(() => {
    return [...originalPrompts].sort(() => Math.random() - 0.5);
  }, [items]);

  // Track the user's progress through the current lesson.
  const [countdown, setCountdown] = useState(3);
  const [lessonStarted, setLessonStarted] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [userAnswer, setUserAnswer] = useState('');
  const [lessonAnswers, setLessonAnswers] = useState<LessonAnswer[]>([]);
  const [feedback, setFeedback] = useState<LessonAnswer | null>(null);

  const answerInputRef = useRef<TextInput>(null);

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

  /*
   * Normalise answers before comparing them.
   * Capitalisation, extra spaces and leading English articles
   * should not affect whether an answer is considered correct.
   */
  function normaliseAnswer(answer: string) {
    return answer
      .trim()
      .toLowerCase()
      .replace(/\s+/g, ' ')
      .replace(/^(a|an|the)\s+/i, '');
  }

  // Check the primary answer and any alternatives the user has chosen to accept.
  function checkAnswer(prompt: Prompt, submittedAnswer: string) {
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

  // Ask for confirmation before abandoning the current lesson.
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

  // Show feedback briefly before moving to the next prompt.
  function recordAnswer(answer: LessonAnswer) {
    const updatedAnswers = [...lessonAnswers, answer];

    setLessonAnswers(updatedAnswers);
    setFeedback(answer);

    Keyboard.dismiss();

    const isLastQuestion =
      currentIndex === shuffledPrompts.length - 1;

    setTimeout(() => {
      if (isLastQuestion) {
        // Results screen will be connected here next.
        console.log(updatedAnswers);
        return;
      }

      setCurrentIndex((current) => current + 1);
      setUserAnswer('');
      setFeedback(null);

      setTimeout(() => {
        answerInputRef.current?.focus();
      }, 100);
    }, 1200);
  }

  function submitAnswer() {
    if (!currentPrompt || !userAnswer.trim() || feedback) {
      return;
    }

    const submittedAnswer = userAnswer.trim();

    const isCorrect = checkAnswer(
      currentPrompt,
      submittedAnswer
    );

    recordAnswer({
      question: currentPrompt.question,
      correctAnswer: currentPrompt.answer,
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
      question: currentPrompt.question,
      correctAnswer: currentPrompt.answer,
      userAnswer: '',
      skipped: true,
      isCorrect: false,
    });
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
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
              {currentIndex + 1} of {shuffledPrompts.length}
            </Text>

            <Pressable onPress={confirmQuitLesson}>
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
            <View style={styles.feedbackContainer}>
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
                <Text style={styles.correctAnswer}>
                  Correct answer:{' '}
                  <Text style={styles.correctAnswerText}>
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
                <Text style={styles.submitButtonText}>
                  Submit Answer
                </Text>
              </Pressable>

              <Pressable
                style={styles.skipButton}
                onPress={skipQuestion}
              >
                <Text style={styles.skipButtonText}>
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

// Lesson screen styling.
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