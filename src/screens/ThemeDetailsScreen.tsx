import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Button, Image, ScrollView, Text, View } from 'react-native';
import { ThemeManifest, ThemeOS, previewUri } from '../native/ThemeOS';

export default function ThemeDetailsScreen({ route }: any) {
  const { themeId } = route.params as { themeId: string };
  const [theme, setTheme] = useState<ThemeManifest | null>(null);
  const [applying, setApplying] = useState(false);

  useEffect(() => {
    ThemeOS.getInstalledThemes().then((r) => r.ok && setTheme(r.data.find((t) => t.id === themeId) ?? null));
  }, [themeId]);

  const apply = async () => {
    setApplying(true);
    const r = await ThemeOS.applyTheme(themeId);
    setApplying(false);
    if (r.ok) Alert.alert('Theme applied', 'Press Home to see the launcher.');
    else Alert.alert('Could not apply theme', `${r.error.code}: ${r.error.message}`);
  };

  if (!theme) return <ActivityIndicator style={{ marginTop: 40 }} />;
  return (
    <ScrollView contentContainerStyle={{ padding: 16 }}>
      <Image source={{ uri: previewUri(theme) }} style={{ height: 240, borderRadius: 12, backgroundColor: '#ddd' }} resizeMode="cover" />
      <Text style={{ fontSize: 22, fontWeight: '700', marginTop: 16 }}>{theme.name}</Text>
      <Text style={{ color: '#666', marginVertical: 8 }}>{theme.description ?? 'No description'}</Text>
      <Text>Grid: {theme.layout.columns} columns · Dock: {theme.layout.dockEnabled ? 'on' : 'off'}</Text>
      <View style={{ marginTop: 20 }}>
        {applying ? <ActivityIndicator /> : <Button title="Apply theme" onPress={apply} />}
      </View>
    </ScrollView>
  );
}
