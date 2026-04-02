import { View, Text, StyleSheet } from 'react-native';

interface StreakBarProps {
  streak: number;
  wordsLearned: number;
}

export function StreakBar({ streak, wordsLearned }: StreakBarProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.item}>🔥 {streak} day streak</Text>
      <Text style={styles.item}>📚 {wordsLearned} words</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 8,
    paddingHorizontal: 16,
    backgroundColor: '#F5F5F5',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  item: {
    fontSize: 14,
    fontWeight: '600',
    color: '#555',
  },
});
