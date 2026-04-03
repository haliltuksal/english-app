import { View, Text, StyleSheet } from 'react-native';

interface DashboardStatsProps {
  streak: number;
  totalWordsLearned: number;
  completedSessions: number;
  averageScore: number;
  currentLevel: string;
}

interface StatBoxProps {
  value: string | number;
  label: string;
  accent: string;
}

function StatBox({ value, label, accent }: StatBoxProps) {
  return (
    <View style={[styles.statBox, { borderTopColor: accent }]}>
      <Text style={[styles.statValue, { color: accent }]}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

export function DashboardStats({
  streak,
  totalWordsLearned,
  completedSessions,
  averageScore,
  currentLevel,
}: DashboardStatsProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.heading}>Your Progress</Text>
      <View style={styles.grid}>
        <StatBox value={`${streak}d`} label="Streak" accent="#FF9800" />
        <StatBox value={totalWordsLearned} label="Words Learned" accent="#007AFF" />
        <StatBox value={completedSessions} label="Sessions" accent="#4CAF50" />
        <StatBox value={`${averageScore}%`} label="Avg Score" accent="#9C27B0" />
        <StatBox value={currentLevel} label="Level" accent="#F44336" />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFF',
    borderRadius: 16,
    padding: 20,
    marginHorizontal: 16,
    marginVertical: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  heading: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1A1A1A',
    marginBottom: 16,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  statBox: {
    flex: 1,
    minWidth: '28%',
    backgroundColor: '#FAFAFA',
    borderRadius: 12,
    padding: 14,
    alignItems: 'center',
    borderTopWidth: 3,
  },
  statValue: {
    fontSize: 22,
    fontWeight: '700',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#777',
    textAlign: 'center',
  },
});
