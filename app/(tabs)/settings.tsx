import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { useState, useEffect } from 'react';
import { getApiKey, setApiKey, deleteApiKey } from '../../src/ai/gemini';

export default function SettingsScreen() {
  const [key, setKey] = useState('');
  const [hasKey, setHasKey] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    loadKey();
  }, []);

  const loadKey = async () => {
    const stored = await getApiKey();
    if (stored) {
      setHasKey(true);
      setKey(stored);
    }
  };

  const saveKey = async () => {
    if (!key.trim()) {
      Alert.alert('Error', 'Please enter a valid API key');
      return;
    }
    await setApiKey(key.trim());
    setHasKey(true);
    setIsEditing(false);
    Alert.alert('Saved', 'API key saved successfully');
  };

  const removeKey = async () => {
    Alert.alert('Remove API Key', 'Are you sure?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Remove',
        style: 'destructive',
        onPress: async () => {
          await deleteApiKey();
          setKey('');
          setHasKey(false);
          setIsEditing(false);
        },
      },
    ]);
  };

  return (
    <View style={styles.container}>
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Gemini API Key</Text>
        <Text style={styles.sectionDescription}>
          Get your free API key from Google AI Studio (aistudio.google.com)
        </Text>

        {hasKey && !isEditing ? (
          <View style={styles.keyStatus}>
            <Text style={styles.keyStatusText}>✅ API key is set</Text>
            <View style={styles.keyActions}>
              <TouchableOpacity style={styles.actionButton} onPress={() => setIsEditing(true)}>
                <Text style={styles.actionButtonText}>Edit</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.actionButton, styles.dangerButton]} onPress={removeKey}>
                <Text style={[styles.actionButtonText, styles.dangerText]}>Remove</Text>
              </TouchableOpacity>
            </View>
          </View>
        ) : (
          <View>
            <TextInput
              style={styles.input}
              value={key}
              onChangeText={setKey}
              placeholder="Paste your Gemini API key here"
              placeholderTextColor="#999"
              autoCapitalize="none"
              autoCorrect={false}
              secureTextEntry
            />
            <TouchableOpacity style={styles.saveButton} onPress={saveKey}>
              <Text style={styles.saveButtonText}>Save API Key</Text>
            </TouchableOpacity>
            {isEditing && (
              <TouchableOpacity style={styles.cancelButton} onPress={() => { setIsEditing(false); loadKey(); }}>
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
            )}
          </View>
        )}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>About</Text>
        <Text style={styles.aboutText}>English Coach v1.0</Text>
        <Text style={styles.aboutText}>Conversation-focused English learning app</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8F8F8', padding: 16 },
  section: { backgroundColor: '#FFF', borderRadius: 12, padding: 16, marginBottom: 16 },
  sectionTitle: { fontSize: 18, fontWeight: '700', color: '#333', marginBottom: 4 },
  sectionDescription: { fontSize: 13, color: '#999', marginBottom: 12 },
  input: { backgroundColor: '#F0F0F0', borderRadius: 8, padding: 12, fontSize: 15, marginBottom: 12 },
  saveButton: { backgroundColor: '#007AFF', borderRadius: 8, padding: 14, alignItems: 'center' },
  saveButtonText: { color: '#FFF', fontWeight: '600', fontSize: 15 },
  cancelButton: { padding: 14, alignItems: 'center' },
  cancelButtonText: { color: '#999', fontSize: 15 },
  keyStatus: { gap: 12 },
  keyStatusText: { fontSize: 16, fontWeight: '600', color: '#4CAF50' },
  keyActions: { flexDirection: 'row', gap: 12 },
  actionButton: { backgroundColor: '#F0F0F0', paddingHorizontal: 16, paddingVertical: 8, borderRadius: 8 },
  actionButtonText: { fontSize: 14, fontWeight: '600', color: '#333' },
  dangerButton: { backgroundColor: '#FFEBEE' },
  dangerText: { color: '#D32F2F' },
  aboutText: { fontSize: 14, color: '#777', marginTop: 4 },
});
