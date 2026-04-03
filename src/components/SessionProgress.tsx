import { View, Text, StyleSheet } from 'react-native';

interface SessionProgressProps {
  current: number;
  total: number;
  phase: 'teaching' | 'quiz';
}

export function SessionProgress({ current, total, phase }: SessionProgressProps) {
  const progress = total > 0 ? Math.min(current / total, 1) : 0;
  const isQuiz = phase === 'quiz';
  const barColor = isQuiz ? '#4CAF50' : '#007AFF';
  const label = isQuiz ? `Quiz ${current}/${total}` : `Learning ${current}/${total}`;

  return (
    <View style={styles.container}>
      <Text style={[styles.label, { color: barColor }]}>{label}</Text>
      <View style={styles.track}>
        <View style={[styles.fill, { width: `${progress * 100}%`, backgroundColor: barColor }]} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    gap: 6,
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
  },
  track: {
    height: 8,
    backgroundColor: '#E0E0E0',
    borderRadius: 4,
    overflow: 'hidden',
  },
  fill: {
    height: '100%',
    borderRadius: 4,
  },
});
