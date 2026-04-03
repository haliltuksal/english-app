import { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput } from 'react-native';

interface QuizCardProps {
  question: {
    type: 'multiple_choice' | 'fill_blank';
    question: string;
    correctAnswer: string;
    options?: string[];
    hint?: string;
  };
  onAnswer: (answer: string) => void;
  questionIndex: number;
  totalQuestions: number;
}

export function QuizCard({ question, onAnswer, questionIndex, totalQuestions }: QuizCardProps) {
  const [inputText, setInputText] = useState('');

  const handleCheck = () => {
    if (inputText.trim()) {
      onAnswer(inputText.trim());
      setInputText('');
    }
  };

  return (
    <View style={styles.card}>
      <Text style={styles.counter}>
        {questionIndex} / {totalQuestions}
      </Text>

      <Text style={styles.questionText}>{question.question}</Text>

      {question.type === 'multiple_choice' ? (
        <View style={styles.optionsContainer}>
          {question.options?.map((option, index) => (
            <TouchableOpacity
              key={index}
              style={styles.optionButton}
              onPress={() => onAnswer(option)}
            >
              <Text style={styles.optionText}>{option}</Text>
            </TouchableOpacity>
          ))}
        </View>
      ) : (
        <View style={styles.fillBlankContainer}>
          {question.hint ? (
            <Text style={styles.hintText}>{question.hint}</Text>
          ) : null}
          <TextInput
            style={styles.textInput}
            value={inputText}
            onChangeText={setInputText}
            placeholder="Type your answer..."
            placeholderTextColor="#AAA"
            autoCapitalize="none"
            autoCorrect={false}
            returnKeyType="done"
            onSubmitEditing={handleCheck}
          />
          <TouchableOpacity
            style={[styles.checkButton, !inputText.trim() && styles.checkButtonDisabled]}
            onPress={handleCheck}
            disabled={!inputText.trim()}
          >
            <Text style={styles.checkButtonText}>Check</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFF',
    borderRadius: 16,
    padding: 24,
    marginHorizontal: 16,
    marginVertical: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  counter: {
    fontSize: 14,
    fontWeight: '600',
    color: '#999',
    textAlign: 'right',
    marginBottom: 16,
  },
  questionText: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1A1A1A',
    lineHeight: 28,
    marginBottom: 24,
  },
  optionsContainer: {
    gap: 12,
  },
  optionButton: {
    backgroundColor: '#F5F5F5',
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 18,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  optionText: {
    fontSize: 16,
    fontWeight: '400',
    color: '#333',
  },
  fillBlankContainer: {
    gap: 12,
  },
  hintText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#FF9800',
    letterSpacing: 2,
    marginBottom: 4,
  },
  textInput: {
    borderWidth: 1.5,
    borderColor: '#007AFF',
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 16,
    fontSize: 16,
    fontWeight: '400',
    color: '#1A1A1A',
    backgroundColor: '#FAFAFA',
  },
  checkButton: {
    backgroundColor: '#007AFF',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  checkButtonDisabled: {
    backgroundColor: '#B0BEC5',
  },
  checkButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFF',
  },
});
