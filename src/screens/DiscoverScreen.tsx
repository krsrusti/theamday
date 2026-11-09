import React from 'react';
import { ActivityIndicator, FlatList, Text, View, StyleSheet } from 'react-native';
import ThemeCard from './ThemeCard';
import { useThemes } from './useThemes';

export default function DiscoverScreen({ navigation }: any) {
  const { themes, activeId, loading, error } = useThemes();
  
  if (loading) return <View style={s.center}><ActivityIndicator size="large" color="#6366f1" /></View>;
  if (error) return <View style={s.center}><Text style={s.error}>{error}</Text></View>;

  return (
    <View style={s.container}>
      <FlatList
        contentContainerStyle={{ padding: 16 }}
        data={themes}
        keyExtractor={(t) => t.id}
        ListEmptyComponent={<Text style={s.empty}>No themes found in assets/themes.</Text>}
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
  empty: { color: '#94a3b8', textAlign: 'center', marginTop: 40, fontSize: 15 },
});