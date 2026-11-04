import React from 'react';
import { Image, Pressable, StyleSheet, Text, View } from 'react-native';
import { ThemeManifest, previewUri } from '../native/ThemeOS';

export default function ThemeCard({ theme, active, onPress }: { theme: ThemeManifest; active?: boolean; onPress: () => void }) {
  const a = theme.appearance;
  return (
    <Pressable onPress={onPress} style={[s.card, active && s.active]}>
      <Image source={{ uri: previewUri(theme) }} style={s.preview} resizeMode="cover" />
      <View style={s.row}>
        <View style={{ flex: 1 }}>
          <Text style={s.name}>{theme.name}{active ? '  ✓ active' : ''}</Text>
          <Text style={s.meta}>v{theme.version}</Text>
        </View>
        {[a.background, a.surface, a.primary, a.text].map((c, i) => (
          <View key={i} style={[s.swatch, { backgroundColor: c }]} />
        ))}
      </View>
    </Pressable>
  );
}

const s = StyleSheet.create({
  card: { backgroundColor: '#fff', borderRadius: 14, marginBottom: 16, overflow: 'hidden', borderWidth: 2, borderColor: 'transparent' },
  active: { borderColor: '#6B4EFF' },
  preview: { height: 160, backgroundColor: '#ddd' },
  row: { flexDirection: 'row', alignItems: 'center', padding: 12 },
  name: { fontSize: 16, fontWeight: '600' },
  meta: { color: '#666', marginTop: 2 },
  swatch: { width: 18, height: 18, borderRadius: 9, marginLeft: 6, borderWidth: 1, borderColor: '#0002' },
});
