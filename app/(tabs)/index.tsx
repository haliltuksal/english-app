import { View, Text, SectionList, StyleSheet, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { useState, useCallback } from 'react';
import { LevelBadge } from '../../src/components/LevelBadge';
import { ScenarioCard } from '../../src/components/ScenarioCard';
import { getScenariosByLevel, Scenario } from '../../src/scenarios/data';
import { useProgress } from '../../src/hooks/useProgress';
import { levels } from '../../src/levels/data';
import * as queries from '../../src/db/queries';
import { useFocusEffect } from 'expo-router';

interface ActiveConversation {
  id: number;
  scenario_type: string;
  message_count: number;
}

export default function ChatPickerScreen() {
  const router = useRouter();
  const { progress, isLoading: progressLoading } = useProgress();
  const [activeConversations, setActiveConversations] = useState<ActiveConversation[]>([]);
  const [showAllLevels, setShowAllLevels] = useState(false);
  const [showActiveChats, setShowActiveChats] = useState(false);

  useFocusEffect(
    useCallback(() => {
      loadActiveConversations();
    }, [])
  );

  const loadActiveConversations = async () => {
    const active = await queries.getActiveConversations();
    setActiveConversations(active);
  };

  const startConversation = async (scenarioType: string) => {
    const level = progress?.currentLevel.id ?? 'A2';
    const id = await queries.createConversation(scenarioType, level);
    router.push(`/chat/${id}?scenario=${scenarioType}`);
  };

  const startAssessment = async () => {
    if (!progress) return;
    const id = await queries.createConversation('assessment', progress.currentLevel.id);
    router.push(`/chat/${id}?scenario=assessment`);
  };

  const resumeConversation = (conv: ActiveConversation) => {
    router.push(`/chat/${conv.id}?scenario=${conv.scenario_type}`);
  };

  // Current level scenarios grouped by category
  const currentLevelId = progress?.currentLevel.id ?? 'A2';
  const currentScenarios = getScenariosByLevel(currentLevelId);

  const categories: { title: string; key: Scenario['category'] }[] = [
    { title: '💼 Work', key: 'work' },
    { title: '🗣️ Daily', key: 'daily' },
    { title: '⚙️ Technical', key: 'technical' },
  ];

  const sections = categories
    .map((cat) => ({
      title: cat.title,
      data: currentScenarios.filter((s) => s.category === cat.key),
    }))
    .filter((s) => s.data.length > 0);

  // Other levels and their scenarios (both lower and higher)
  const otherLevels = levels.filter((l) => l.id !== currentLevelId);

  const otherSections = otherLevels
    .map((level) => ({
      title: `${level.id} — ${level.name}`,
      data: getScenariosByLevel(level.id),
    }))
    .filter((s) => s.data.length > 0);

  return (
    <View style={styles.container}>
      <SectionList
        sections={[...sections, ...(showAllLevels ? otherSections : [])]}
        keyExtractor={(item) => item.id}
        ListHeaderComponent={
          <View>
            {/* Level Badge with progress */}
            {progress && (
              <LevelBadge
                progress={progress}
                onAssessment={progress.canTakeAssessment ? startAssessment : undefined}
              />
            )}

            {/* Active conversations — accordion */}
            {activeConversations.length > 0 && (
              <View style={styles.activeSection}>
                <TouchableOpacity
                  style={styles.activeSectionHeader}
                  onPress={() => setShowActiveChats(!showActiveChats)}
                >
                  <Text style={styles.activeSectionTitle}>
                    Continue Conversation ({activeConversations.length})
                  </Text>
                  <Text style={styles.activeSectionArrow}>{showActiveChats ? '▲' : '▼'}</Text>
                </TouchableOpacity>
                {showActiveChats && activeConversations.map((conv) => (
                  <TouchableOpacity
                    key={conv.id}
                    style={styles.activeCard}
                    onPress={() => resumeConversation(conv)}
                  >
                    <Text style={styles.activeCardTitle}>
                      {conv.scenario_type === 'free' ? 'Free Chat' : conv.scenario_type === 'assessment' ? 'Assessment' : conv.scenario_type}
                    </Text>
                    <Text style={styles.activeCardMeta}>{conv.message_count} messages</Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}

            {/* Free Chat button */}
            <TouchableOpacity
              style={styles.freeChat}
              onPress={() => startConversation('free')}
            >
              <Text style={styles.freeChatText}>💬 Free Chat</Text>
              <Text style={styles.freeChatSub}>Talk about anything you want</Text>
            </TouchableOpacity>

            {/* Current level section header */}
            <Text style={styles.levelSectionHeader}>
              {currentLevelId} Scenarios
            </Text>
          </View>
        }
        renderSectionHeader={({ section }) => (
          <Text style={styles.sectionTitle}>{section.title}</Text>
        )}
        renderItem={({ item }) => (
          <ScenarioCard
            scenario={item}
            onPress={() => startConversation(item.id)}
          />
        )}
        ListFooterComponent={
          otherSections.length > 0 ? (
            <TouchableOpacity
              style={styles.otherLevelsToggle}
              onPress={() => setShowAllLevels(!showAllLevels)}
            >
              <Text style={styles.otherLevelsToggleText}>
                {showAllLevels ? 'Hide Other Levels' : `Browse All Levels (${otherSections.length})`}
              </Text>
            </TouchableOpacity>
          ) : null
        }
        contentContainerStyle={styles.list}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8F8F8' },
  list: { paddingBottom: 20 },
  activeSection: { paddingHorizontal: 16, paddingTop: 12 },
  activeSectionHeader: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8,
  },
  activeSectionTitle: { fontSize: 14, fontWeight: '600', color: '#999', textTransform: 'uppercase' },
  activeSectionArrow: { fontSize: 12, color: '#999' },
  activeCard: {
    backgroundColor: '#E3F2FD', borderRadius: 12, padding: 14, marginBottom: 8,
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
  },
  activeCardTitle: { fontSize: 15, fontWeight: '600', color: '#1976D2' },
  activeCardMeta: { fontSize: 13, color: '#64B5F6' },
  freeChat: { backgroundColor: '#007AFF', borderRadius: 12, padding: 16, marginHorizontal: 16, marginTop: 12, marginBottom: 8 },
  freeChatText: { fontSize: 18, fontWeight: '700', color: '#FFF' },
  freeChatSub: { fontSize: 13, color: '#B3D9FF', marginTop: 2 },
  levelSectionHeader: {
    fontSize: 18, fontWeight: '700', color: '#333', paddingHorizontal: 16, paddingTop: 16, paddingBottom: 4,
  },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: '#333', paddingHorizontal: 16, paddingTop: 16, paddingBottom: 4 },
  otherLevelsToggle: {
    marginHorizontal: 16, marginTop: 16, marginBottom: 8, padding: 14,
    backgroundColor: '#F0F0F0', borderRadius: 10, alignItems: 'center',
  },
  otherLevelsToggleText: { fontSize: 15, fontWeight: '600', color: '#666' },
});
