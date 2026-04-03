import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { LevelProgress } from '../levels/progress';

interface LevelBadgeProps {
  progress: LevelProgress;
  onAssessment?: () => void;
}

const levelColors: Record<string, string> = {
  A1: '#78909C',
  A2: '#4CAF50',
  B1: '#2196F3',
  B2: '#9C27B0',
  C1: '#FF9800',
  C2: '#F44336',
};

export function LevelBadge({ progress, onAssessment }: LevelBadgeProps) {
  const color = levelColors[progress.currentLevel.id] || '#007AFF';
  const correctionPct = Math.round(progress.correctionRate * 100);
  const targetCorrectionPct = Math.round(progress.maxCorrectionRate * 100);

  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <View style={[styles.badge, { backgroundColor: color }]}>
          <Text style={styles.badgeText}>{progress.currentLevel.id}</Text>
        </View>
        <View style={styles.headerInfo}>
          <Text style={styles.levelName}>{progress.currentLevel.name}</Text>
          <Text style={styles.levelDesc}>{progress.currentLevel.description}</Text>
        </View>
      </View>

      {!progress.isMaxLevel && (
        <View style={styles.progressSection}>
          <ProgressRow
            label="Conversations"
            current={progress.conversationsCompleted}
            target={progress.conversationsRequired}
            color={color}
          />
          <ProgressRow
            label="Correction rate"
            current={correctionPct}
            target={targetCorrectionPct}
            suffix="%"
            inverted
            color={color}
          />
          <ProgressRow
            label="Vocabulary"
            current={progress.vocabMastered}
            target={progress.vocabRequired}
            color={color}
          />
        </View>
      )}

      {progress.isMaxLevel && (
        <View style={styles.maxLevel}>
          <Text style={styles.maxLevelText}>🏆 Max Level Reached!</Text>
        </View>
      )}

      {progress.canTakeAssessment && onAssessment && (
        <TouchableOpacity style={[styles.assessButton, { backgroundColor: color }]} onPress={onAssessment}>
          <Text style={styles.assessButtonText}>Take Assessment → {progress.nextLevel?.id}</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

function ProgressRow({ label, current, target, suffix, inverted, color }: {
  label: string;
  current: number;
  target: number;
  suffix?: string;
  inverted?: boolean;
  color: string;
}) {
  // For inverted (correction rate): lower is better
  const ratio = inverted
    ? Math.max(0, Math.min(1, current <= target ? 1 : target / current))
    : Math.min(1, target > 0 ? current / target : 1);
  const met = inverted ? current <= target : current >= target;
  const s = suffix || '';

  return (
    <View style={styles.progressRow}>
      <View style={styles.progressLabelRow}>
        <Text style={styles.progressLabel}>{label}</Text>
        <Text style={[styles.progressValue, met && styles.progressMet]}>
          {current}{s} / {inverted ? '≤' : ''}{target}{s} {met ? '✓' : ''}
        </Text>
      </View>
      <View style={styles.progressBarBg}>
        <View style={[styles.progressBarFill, { width: `${ratio * 100}%`, backgroundColor: met ? '#4CAF50' : color }]} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFF',
    borderRadius: 16,
    padding: 16,
    marginHorizontal: 16,
    marginTop: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  badge: {
    width: 52,
    height: 52,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  badgeText: {
    fontSize: 20,
    fontWeight: '800',
    color: '#FFF',
  },
  headerInfo: {
    marginLeft: 12,
    flex: 1,
  },
  levelName: {
    fontSize: 18,
    fontWeight: '700',
    color: '#333',
  },
  levelDesc: {
    fontSize: 13,
    color: '#777',
    marginTop: 2,
  },
  progressSection: {
    gap: 10,
  },
  progressRow: {
    gap: 4,
  },
  progressLabelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  progressLabel: {
    fontSize: 13,
    color: '#555',
  },
  progressValue: {
    fontSize: 13,
    color: '#777',
    fontWeight: '600',
  },
  progressMet: {
    color: '#4CAF50',
  },
  progressBarBg: {
    height: 6,
    backgroundColor: '#E0E0E0',
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: 6,
    borderRadius: 3,
  },
  assessButton: {
    marginTop: 14,
    borderRadius: 10,
    padding: 14,
    alignItems: 'center',
  },
  assessButtonText: {
    color: '#FFF',
    fontWeight: '700',
    fontSize: 16,
  },
  maxLevel: {
    alignItems: 'center',
    paddingVertical: 12,
  },
  maxLevelText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FF9800',
  },
});
