import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useMemo, useRef, useState } from 'react';
import {
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
};

type LessonAnswer = {
  question: string;
  correctAnswer: string;
  userAnswer: string;
  skipped: boolean;
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

  // Record the response and advance to the next prompt.
  function moveToNextQuestion(answer: LessonAnswer) {
    const updatedAnswers = [...lessonAnswers, answer];
    setLessonAnswers(updatedAnswers);

    const isLastQuestion =
      currentIndex === shuffledPrompts.length - 1;

    if (isLastQuestion) {
      // Results screen will be connected here next.
      console.log(updatedAnswers);
      return;
    }

    setCurrentIndex((current) => current + 1);
    setUserAnswer('');

    setTimeout(() => {
      answerInputRef.current?.focus();
    }, 100);
  }

  function submitAnswer() {
    if (!currentPrompt || !userAnswer.trim()) {
      return;
    }

    moveToNextQuestion({
      question: currentPrompt.question,
      correctAnswer: currentPrompt.answer,
      userAnswer: userAnswer.trim(),
      skipped: false,
    });
  }

  function skipQuestion() {
    if (!currentPrompt) {
      return;
    }

    moveToNextQuestion({
      question: currentPrompt.question,
      correctAnswer: currentPrompt.answer,
      userAnswer: '',
      skipped: true,
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

            <Pressable onPress={() => router.back()}>
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
            />
          </View>

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
});