import React from 'react';
import { ActivityIndicator, FlatList, Text, View } from 'react-native';
import ThemeCard from './ThemeCard';
import { useThemes } from './useThemes';

export default function DiscoverScreen({ navigation }: any) {
  const { themes, activeId, loading, error } = useThemes();
  if (loading) return <ActivityIndicator style={{ marginTop: 40 }} />;
  if (error) return <Text style={{ padding: 16, color: 'crimson' }}>{error}</Text>;
  return (
    <FlatList
      contentContainerStyle={{ padding: 16 }}
      data={themes}
      keyExtractor={(t) => t.id}
      ListEmptyComponent={<Text>No themes found in assets/themes.</Text>}
      renderItem={({ item }) => (
        <ThemeCard theme={item} active={item.id === activeId} onPress={() => navigation.navigate('ThemeDetails', { themeId: item.id })} />
      )}
    />
  );
}
