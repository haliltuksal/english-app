import { View, Text, SectionList, StyleSheet, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { useEffect, useState, useCallback } from 'react';
import { StreakBar } from '../../src/components/StreakBar';
import { ScenarioCard } from '../../src/components/ScenarioCard';
import { scenarios, Scenario } from '../../src/scenarios/data';
import * as queries from '../../src/db/queries';
import { getDatabase } from '../../src/db/database';
import { useFocusEffect } from 'expo-router';

interface ActiveConversation {
  id: number;
  scenario_type: string;
  message_count: number;
}

export default function ChatPickerScreen() {
  const router = useRouter();
  const [streak, setStreak] = useState(0);
  const [wordsLearned, setWordsLearned] = useState(0);
  const [activeConversations, setActiveConversations] = useState<ActiveConversation[]>([]);

  useFocusEffect(
    useCallback(() => {
      loadStats();
    }, [])
  );

  const loadStats = async () => {
    await getDatabase();
    const [s, w, active] = await Promise.all([
      queries.getStreak(),
      queries.getTotalWordsLearned(),
      queries.getActiveConversations(),
    ]);
    setStreak(s);
    setWordsLearned(w);
    setActiveConversations(active);
  };

  const startConversation = async (scenarioType: string) => {
    await getDatabase();
    const id = await queries.createConversation(scenarioType);
    router.push(`/chat/${id}?scenario=${scenarioType}`);
  };

  const resumeConversation = (conv: ActiveConversation) => {
    router.push(`/chat/${conv.id}?scenario=${conv.scenario_type}`);
  };

  const categories: { title: string; key: Scenario['category'] }[] = [
    { title: '💼 Work', key: 'work' },
    { title: '🗣️ Daily', key: 'daily' },
    { title: '⚙️ Technical', key: 'technical' },
  ];

  const sections = categories.map((cat) => ({
    title: cat.title,
    data: scenarios.filter((s) => s.category === cat.key),
  }));

  return (
    <View style={styles.container}>
      <StreakBar streak={streak} wordsLearned={wordsLearned} />
      <SectionList
        sections={sections}
        keyExtractor={(item) => item.id}
        ListHeaderComponent={
          <View>
            {activeConversations.length > 0 && (
              <View style={styles.activeSection}>
                <Text style={styles.activeSectionTitle}>Continue Conversation</Text>
                {activeConversations.map((conv) => (
                  <TouchableOpacity
                    key={conv.id}
                    style={styles.activeCard}
                    onPress={() => resumeConversation(conv)}
                  >
                    <Text style={styles.activeCardTitle}>
                      {conv.scenario_type === 'free' ? 'Free Chat' : conv.scenario_type}
                    </Text>
                    <Text style={styles.activeCardMeta}>{conv.message_count} messages</Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}
            <TouchableOpacity
              style={styles.freeChat}
              onPress={() => startConversation('free')}
            >
              <Text style={styles.freeChatText}>💬 Free Chat</Text>
              <Text style={styles.freeChatSub}>Talk about anything you want</Text>
            </TouchableOpacity>
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
        contentContainerStyle={styles.list}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8F8F8' },
  list: { paddingBottom: 20 },
  activeSection: { paddingHorizontal: 16, paddingTop: 12 },
  activeSectionTitle: { fontSize: 14, fontWeight: '600', color: '#999', marginBottom: 8, textTransform: 'uppercase' },
  activeCard: {
    backgroundColor: '#E3F2FD', borderRadius: 12, padding: 14, marginBottom: 8,
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
  },
  activeCardTitle: { fontSize: 15, fontWeight: '600', color: '#1976D2' },
  activeCardMeta: { fontSize: 13, color: '#64B5F6' },
  freeChat: { backgroundColor: '#007AFF', borderRadius: 12, padding: 16, marginHorizontal: 16, marginTop: 12, marginBottom: 8 },
  freeChatText: { fontSize: 18, fontWeight: '700', color: '#FFF' },
  freeChatSub: { fontSize: 13, color: '#B3D9FF', marginTop: 2 },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: '#333', paddingHorizontal: 16, paddingTop: 16, paddingBottom: 4 },
});
