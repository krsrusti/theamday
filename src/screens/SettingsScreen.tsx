import React, { useCallback, useState } from 'react';
import { ScrollView, Text, View, TouchableOpacity, StyleSheet } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { InstalledApp, LauncherStatus, ThemeOS } from '../native/ThemeOS';
import Ionicons from '@react-native-vector-icons/ionicons';

export default function SettingsScreen() {
  const [status, setStatus] = useState<LauncherStatus | null>(null);
  const [apps, setApps] = useState<InstalledApp[]>([]);
  const [pong, setPong] = useState('');

  useFocusEffect(useCallback(() => {
    ThemeOS.getLauncherStatus().then((r) => r.ok && setStatus(r.data));
    ThemeOS.getInstalledApplications().then((r) => r.ok && setApps(r.data));
  }, []));

  return (
    <ScrollView contentContainerStyle={s.container}>
      {/* Launcher Section */}
      <View style={s.sectionCard}>
        <View style={s.headerRow}>
          <Ionicons name="home" size={20} color="#6366f1" />
          <Text style={s.sectionTitle}>Launcher Settings</Text>
        </View>
        <Text style={s.subText}>
          Default home app:{' '}
          <Text style={s.highlight}>
            {status ? (status.isDefaultHome ? 'ThemeOS ✓' : `No (${status.currentHomePackage})`) : '…'}
          </Text>
        </Text>
        <TouchableOpacity style={s.primaryButton} onPress={() => ThemeOS.openDefaultLauncherSettings()}>
          <Ionicons name="open-outline" size={16} color="#fff" />
          <Text style={s.buttonText}>Choose Default Home App</Text>
        </TouchableOpacity>
      </View>

      {/* Diagnostics Section */}
      <View style={s.sectionCard}>
        <View style={s.headerRow}>
          <Ionicons name="pulse" size={20} color="#6366f1" />
          <Text style={s.sectionTitle}>Diagnostics & Bridge</Text>
        </View>

        <TouchableOpacity
          style={s.secondaryButton}
          onPress={async () => {
            const r = await ThemeOS.ping();
            setPong(r.ok ? r.data : r.error.message);
          }}
        >
          <Ionicons name="swap-horizontal" size={16} color="#6366f1" />
          <Text style={s.secondaryButtonText}>Ping Kotlin Native</Text>
        </TouchableOpacity>

        {!!pong && (
          <View style={s.pongBox}>
            <Text style={s.pongText}>{pong}</Text>
          </View>
        )}

        <View style={s.statsRow}>
          <Ionicons name="apps-outline" size={16} color="#94a3b8" />
          <Text style={s.statsText}>Launchable apps found: <Text style={{ fontWeight: '700', color: '#f8fafc' }}>{apps.length}</Text></Text>
        </View>
      </View>
    </ScrollView>
  );
}

const s = StyleSheet.create({
  container: { padding: 16, backgroundColor: '#0f172a', flexGrow: 1, gap: 16 },
  sectionCard: { backgroundColor: '#1e293b', borderRadius: 16, padding: 18, borderWidth: 1, borderColor: '#334155', elevation: 3 },
  headerRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 12 },
  sectionTitle: { fontSize: 18, fontWeight: '700', color: '#f8fafc' },
  subText: { fontSize: 14, color: '#94a3b8', marginBottom: 16, lineHeight: 20 },
  highlight: { color: '#38bdf8', fontWeight: '600' },
  primaryButton: { backgroundColor: '#6366f1', flexDirection: 'row', height: 46, borderRadius: 12, justifyContent: 'center', alignItems: 'center', gap: 8 },
  buttonText: { color: '#fff', fontSize: 14, fontWeight: '600' },
  secondaryButton: { backgroundColor: '#312e81', flexDirection: 'row', height: 46, borderRadius: 12, justifyContent: 'center', alignItems: 'center', gap: 8, borderWidth: 1, borderColor: '#4f46e5' },
  secondaryButtonText: { color: '#818cf8', fontSize: 14, fontWeight: '600' },
  pongBox: { marginTop: 12, padding: 10, backgroundColor: '#0f172a', borderRadius: 8, borderWidth: 1, borderColor: '#334155' },
  pongText: { color: '#34d399', fontSize: 13, fontFamily: 'monospace' },
  statsRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 16 },
  statsText: { fontSize: 14, color: '#94a3b8' },
});