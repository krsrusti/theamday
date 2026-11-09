import React from 'react';
import { ActivityIndicator, FlatList, Text, View, StyleSheet } from 'react-native';
import ThemeCard from './ThemeCard';
import { useThemes } from './useThemes';

export default function MyThemesScreen({ navigation }: any) {
  const { themes, activeId, loading, error } = useThemes();
  
  if (loading) return <View style={s.center}><ActivityIndicator size="large" color="#6366f1" /></View>;
  if (error) return <View style={s.center}><Text style={s.error}>{error}</Text></View>;

  const sorted = [...themes].sort((a, b) => (a.id === activeId ? -1 : b.id === activeId ? 1 : 0));

  return (
    <View style={s.container}>
      <FlatList
        contentContainerStyle={{ padding: 16 }}
        data={sorted}
        keyExtractor={(t) => t.id}
        renderItem={({ item }) => (
          <ThemeCard theme={item} active={item.id === activeId} onPress={() => navigation.navigate('ThemeDetails', { themeId: item.id })} />
        )}
      />
    </View>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0f172a' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#0f172a' },
  error: { padding: 16, color: '#f87171', fontSize: 16 },
});