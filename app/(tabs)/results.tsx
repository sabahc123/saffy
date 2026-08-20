import AsyncStorage from '@react-native-async-storage/async-storage';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import {
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    View,
} from 'react-native';

type LessonAnswer = {
  question: string;
  correctAnswer: string;
  acceptedAnswers?: string[];
  userAnswer: string;
  skipped: boolean;
  isCorrect: boolean;
};

export default function ResultsScreen() {
  const { topicName, results } = useLocalSearchParams();
  const router = useRouter();

  const lessonResults: LessonAnswer[] = results
    ? JSON.parse(results as string)
    : [];

  const correctCount = lessonResults.filter(
    (result) => result.isCorrect
  ).length;

  const reviewPile = lessonResults.filter(
    (result) => !result.isCorrect
  );

  const recallPile = lessonResults.filter(
    (result) => result.isCorrect
  );

  const [answersOpen, setAnswersOpen] = useState(false);
  const [reviewOpen, setReviewOpen] = useState(false);
  const [recallOpen, setRecallOpen] = useState(false);

  // Persist the latest learning state for this topic.
  useEffect(() => {
    async function saveLearningState() {
      if (!topicName) {
        return;
      }

      const topicKey = String(topicName);

      await AsyncStorage.setItem(
        `topic-review-${topicKey}`,
        JSON.stringify(reviewPile)
      );

      await AsyncStorage.setItem(
        `topic-recall-${topicKey}`,
        JSON.stringify(recallPile)
      );

      await AsyncStorage.setItem(
        `topic-last-results-${topicKey}`,
        JSON.stringify(lessonResults)
      );

      await AsyncStorage.setItem(
        `topic-last-completed-${topicKey}`,
        new Date().toISOString()
      );
    }

    saveLearningState();
  }, [topicName]);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Results</Text>

      <Text style={styles.subtitle}>
        You’ve completed a memory lesson with Saffy!
      </Text>

      <Text style={styles.topicName}>
        {topicName}
      </Text>

      <View style={styles.scoreRow}>
        <Text style={styles.score}>
          {correctCount}/{lessonResults.length}
        </Text>

        <Text style={styles.scoreLabel}>
          correct
        </Text>
      </View>

      <View style={styles.summaryRow}>
        <Text style={styles.summaryText}>
          {reviewPile.length} Review
        </Text>

        <Text style={styles.summaryDivider}>•</Text>

        <Text style={styles.summaryText}>
          {recallPile.length} Recall
        </Text>
      </View>

      <ScrollView
        style={styles.scrollArea}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.section}>
          <Pressable
            style={styles.sectionHeader}
            onPress={() => setAnswersOpen(!answersOpen)}
          >
            <View>
              <Text style={styles.sectionTitle}>
                Your Answers
              </Text>

              <Text style={styles.sectionCount}>
                {lessonResults.length} prompts
              </Text>
            </View>

            <Text style={styles.chevron}>
              {answersOpen ? '⌃' : '⌄'}
            </Text>
          </Pressable>

          {answersOpen && (
            <View style={styles.sectionContent}>
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
                  Your Answer
                </Text>
              </View>

              {lessonResults.map((result, index) => (
                <View key={index} style={styles.resultRow}>
                  <Text
                    style={[
                      styles.cell,
                      styles.questionColumn,
                    ]}
                  >
                    {result.question}
                  </Text>

                  <View style={styles.answerColumn}>
                    <View style={styles.answerLine}>
                      <Text style={styles.cell}>
                        {result.skipped
                          ? 'Skipped'
                          : result.userAnswer}
                      </Text>

                      <Text style={styles.resultMark}>
                        {result.isCorrect ? '✓' : '✕'}
                      </Text>
                    </View>

                    {!result.isCorrect && (
                      <Text style={styles.correctAnswer}>
                        Correct: {result.correctAnswer}
                      </Text>
                    )}
                  </View>
                </View>
              ))}
            </View>
          )}
        </View>

        <View style={styles.section}>
          <Pressable
            style={styles.sectionHeader}
            onPress={() => setReviewOpen(!reviewOpen)}
          >
            <View>
              <Text style={styles.sectionTitle}>
                Review
              </Text>

              <Text style={styles.sectionCount}>
                {reviewPile.length} prompts
              </Text>
            </View>

            <Text style={styles.chevron}>
              {reviewOpen ? '⌃' : '⌄'}
            </Text>
          </Pressable>

          {reviewOpen && (
            <View style={styles.sectionContent}>
              {reviewPile.length === 0 ? (
                <Text style={styles.emptyPile}>
                  Nothing to review
                </Text>
              ) : (
                reviewPile.map((result, index) => (
                  <View
                    key={`${result.question}-${index}`}
                    style={styles.pileRow}
                  >
                    <Text style={styles.pileItem}>
                      {result.question}
                    </Text>
                  </View>
                ))
              )}
            </View>
          )}
        </View>

        <View style={styles.section}>
          <Pressable
            style={styles.sectionHeader}
            onPress={() => setRecallOpen(!recallOpen)}
          >
            <View>
              <Text style={styles.sectionTitle}>
                Recall
              </Text>

              <Text style={styles.sectionCount}>
                {recallPile.length} prompts
              </Text>
            </View>

            <Text style={styles.chevron}>
              {recallOpen ? '⌃' : '⌄'}
            </Text>
          </Pressable>

          {recallOpen && (
            <View style={styles.sectionContent}>
              {recallPile.length === 0 ? (
                <Text style={styles.emptyPile}>
                  Nothing here yet
                </Text>
              ) : (
                recallPile.map((result, index) => (
                  <View
                    key={`${result.question}-${index}`}
                    style={styles.pileRow}
                  >
                    <Text style={styles.pileItem}>
                      {result.question}
                    </Text>
                  </View>
                ))
              )}
            </View>
          )}
        </View>

        <View style={styles.bottomSpacing} />
      </ScrollView>

      <Pressable
        style={styles.exitButton}
        onPress={() => router.replace('/')}
      >
        <Text style={styles.exitButtonText}>
          Exit Classroom
        </Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 70,
    paddingBottom: 24,
    backgroundColor: '#FFFFFF',
  },

  title: {
    fontSize: 30,
    fontWeight: '700',
    marginBottom: 10,
  },

  subtitle: {
    fontSize: 20,
    color: '#777777',
    lineHeight: 26,
    marginBottom: 8,
  },

  topicName: {
    fontSize: 14,
    color: '#999999',
    marginBottom: 18,
  },

  scoreRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },

  score: {
    fontSize: 34,
    fontWeight: '700',
  },

  scoreLabel: {
    fontSize: 15,
    color: '#666666',
    marginLeft: 8,
  },

  summaryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    marginBottom: 24,
  },

  summaryText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666666',
  },

  summaryDivider: {
    fontSize: 14,
    color: '#BBBBBB',
    marginHorizontal: 8,
  },

  scrollArea: {
    flex: 1,
  },

  section: {
    borderTopWidth: 1,
    borderTopColor: '#E5E5E5',
  },

  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
  },

  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
  },

  sectionCount: {
    fontSize: 13,
    color: '#777777',
    marginTop: 3,
  },

  chevron: {
    fontSize: 22,
    color: '#666666',
  },

  sectionContent: {
    paddingBottom: 18,
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

  resultRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#EEEEEE',
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
  },

  answerLine: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
  },

  resultMark: {
    fontSize: 20,
    fontWeight: '700',
  },

  correctAnswer: {
    fontSize: 13,
    fontWeight: '600',
    marginTop: 4,
  },

  pileRow: {
    paddingVertical: 9,
    borderBottomWidth: 1,
    borderBottomColor: '#EEEEEE',
  },

  pileItem: {
    fontSize: 15,
  },

  emptyPile: {
    fontSize: 14,
    color: '#999999',
    paddingVertical: 8,
  },

  bottomSpacing: {
    height: 20,
  },

  exitButton: {
    width: '100%',
    padding: 16,
    borderRadius: 10,
    backgroundColor: '#000000',
    alignItems: 'center',
    marginTop: 16,
  },

  exitButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});