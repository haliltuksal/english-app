import { TouchableOpacity, Text, StyleSheet, View } from 'react-native';
import { Scenario } from '../scenarios/data';

interface ScenarioCardProps {
  scenario: Scenario;
  onPress: () => void;
}

const difficultyColors = {
  easy: '#4CAF50',
  medium: '#FF9800',
  hard: '#F44336',
};

export function ScenarioCard({ scenario, onPress }: ScenarioCardProps) {
  return (
    <TouchableOpacity style={styles.card} onPress={onPress}>
      <View style={styles.header}>
        <Text style={styles.title}>{scenario.title}</Text>
        <View style={[styles.badge, { backgroundColor: difficultyColors[scenario.difficulty] }]}>
          <Text style={styles.badgeText}>{scenario.difficulty}</Text>
        </View>
      </View>
      <Text style={styles.description}>{scenario.description}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: 16,
    marginHorizontal: 16,
    marginVertical: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  title: {
    fontSize: 16,
    fontWeight: '700',
    color: '#333',
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#FFF',
  },
  description: {
    fontSize: 13,
    color: '#777',
  },
});
