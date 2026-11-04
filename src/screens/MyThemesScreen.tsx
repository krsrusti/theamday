import React from 'react';
import { ActivityIndicator, FlatList, Text } from 'react-native';
import ThemeCard from './ThemeCard';
import { useThemes } from './useThemes';

// MVP: every bundled theme counts as "installed". Active theme is listed first.
export default function MyThemesScreen({ navigation }: any) {
  const { themes, activeId, loading, error } = useThemes();
  if (loading) return <ActivityIndicator style={{ marginTop: 40 }} />;
  if (error) return <Text style={{ padding: 16, color: 'crimson' }}>{error}</Text>;
  const sorted = [...themes].sort((a, b) => (a.id === activeId ? -1 : b.id === activeId ? 1 : 0));
  return (
    <FlatList
      contentContainerStyle={{ padding: 16 }}
      data={sorted}
      keyExtractor={(t) => t.id}
      renderItem={({ item }) => (
        <ThemeCard theme={item} active={item.id === activeId} onPress={() => navigation.navigate('ThemeDetails', { themeId: item.id })} />
      )}
    />
  );
}
