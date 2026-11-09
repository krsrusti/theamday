import React from 'react';
import { Image, Pressable, StyleSheet, Text, View } from 'react-native';
import { ThemeManifest, previewUri } from '../native/ThemeOS';
import Ionicons from '@react-native-vector-icons/ionicons';

export default function ThemeCard({ theme, active, onPress }: { theme: ThemeManifest; active?: boolean; onPress: () => void }) {
  return (
    <Pressable onPress={onPress} style={[s.card, active && s.activeCard]}>
      <Image source={{ uri: previewUri(theme) }} style={s.preview} resizeMode="cover" />
      <View style={s.row}>
        <View style={{ flex: 1 }}>
          <View style={s.titleRow}>
            <Text style={s.name}>{theme.name}</Text>
            {active && (
              <View style={s.activeBadge}>
                <Ionicons name="checkmark-circle" size={14} color="#6366f1" />
                <Text style={s.activeText}>Active</Text>
              </View>
            )}
          </View>
          <Text style={s.meta}>Version {theme.version}</Text>
        </View>
      </View>
    </Pressable>
  );
}

const s = StyleSheet.create({
  card: {
    backgroundColor: '#1e293b',
    borderRadius: 16,
    marginBottom: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#334155',
    elevation: 4,
  },
  activeCard: { borderColor: '#6366f1', borderWidth: 2 },
  preview: { height: 180, backgroundColor: '#0f172a' },
  row: { padding: 14 },
  titleRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  name: { fontSize: 18, fontWeight: '700', color: '#f8fafc' },
  meta: { color: '#94a3b8', fontSize: 13, marginTop: 4 },
  activeBadge: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#312e81', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 12, gap: 4 },
  activeText: { color: '#818cf8', fontSize: 12, fontWeight: '600' },
});