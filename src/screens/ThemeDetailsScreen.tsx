import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  ScrollView,
  Text,
  View,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { ThemeManifest, ThemeOS } from '../native/ThemeOS';
import Ionicons from '@react-native-vector-icons/ionicons';

const iconLabels: Record<string, string> = {
  'com.android.camera': 'Camera',
  'com.android.chrome': 'Internet',
  'com.google.android.apps.photos': 'Photos',
  'com.google.android.apps.maps': 'Maps',
  'com.android.mms': 'Messages',
  'com.android.phone': 'Phone',
  'com.android.settings': 'Settings',
  'com.google.android.youtube': 'YouTube',
};

export default function ThemeDetailsScreen({ route }: any) {
  const { themeId } = route.params as { themeId: string };
  const [theme, setTheme] = useState<ThemeManifest | null>(null);
  const [applying, setApplying] = useState(false);

  useEffect(() => {
    ThemeOS.getInstalledThemes().then((result) => {
      if (result.ok) {
        setTheme(result.data.find((item) => item.id === themeId) ?? null);
      }
    });
  }, [themeId]);

  const apply = async () => {
    setApplying(true);
    const result = await ThemeOS.applyTheme(themeId);
    setApplying(false);

    if (result.ok) {
      Alert.alert(
        'Theme applied',
        'Your theme is saved. Set ThemeOS as your default launcher to see it on your home screen.',
      );
    } else {
      Alert.alert('Application failed', result.error.message);
    }
  };

  if (!theme) {
    return <View style={s.center}><ActivityIndicator size="large" color="#6366f1" /></View>;
  }

  const { appearance, icons, wallpaper, layout } = theme;

  return (
    <ScrollView style={[s.container, { backgroundColor: appearance.background }]} contentContainerStyle={{ padding: 16 }}>
      <Text style={[s.title, { color: appearance.text }]}>{theme.name}</Text>

      {/* Simulated wallpaper and icon layout */}
      <View style={s.previewContainer}>
        <Image
          source={{ uri: `asset:/themes/${theme.dir}/${wallpaper}` }}
          style={{ width: '100%', height: '100%', position: 'absolute' }}
          resizeMode="cover"
        />

        <View style={s.gridOverlay}>
          <View style={s.iconGrid}>
            {Object.entries(icons).map(([packageName, path]) => (
              <View
                key={packageName}
                style={{
                  width: `${100 / layout.columns}%`,
                  alignItems: 'center',
                  paddingVertical: 10,
                }}
              >
                <Image
                  source={{ uri: `asset:/themes/${theme.dir}/${path}` }}
                  style={{ width: 48, height: 48 }}
                  resizeMode="contain"
                />
                <Text
                  numberOfLines={1}
                  style={[s.iconLabel, { color: appearance.text }]}
                >
                  {iconLabels[packageName] ?? packageName}
                </Text>
              </View>
            ))}
          </View>
        </View>
      </View>

      {/* Apply Button Section */}
      <View style={{ marginTop: 32, marginBottom: 24 }}>
        {applying ? (
          <ActivityIndicator color="#6366f1" size="large" />
        ) : (
          <TouchableOpacity style={s.applyButton} onPress={apply}>
            <Ionicons name="color-wand" size={18} color="#fff" />
            <Text style={s.applyButtonText}>Apply Theme</Text>
          </TouchableOpacity>
        )}
      </View>
    </ScrollView>
  );
}

const s = StyleSheet.create({
  container: { flex: 1 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#0f172a' },
  title: { fontSize: 26, fontWeight: '800', marginBottom: 16 },
  previewContainer: { height: 380, borderRadius: 20, overflow: 'hidden', backgroundColor: '#1e293b', elevation: 6 },
  gridOverlay: { flex: 1, justifyContent: 'flex-end', padding: 16, backgroundColor: 'rgba(0,0,0,0.25)' },
  iconGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center' },
  iconLabel: { fontSize: 11, marginTop: 5, fontWeight: '500', textShadowColor: 'rgba(0, 0, 0, 0.75)', textShadowOffset: { width: 0, height: 1 }, textShadowRadius: 3 },
  applyButton: { backgroundColor: '#6366f1', flexDirection: 'row', height: 52, borderRadius: 14, justifyContent: 'center', alignItems: 'center', gap: 8, elevation: 4 },
  applyButtonText: { color: '#fff', fontSize: 16, fontWeight: '700' },
});