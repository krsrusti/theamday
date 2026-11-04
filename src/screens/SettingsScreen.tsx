import React, { useCallback, useState } from 'react';
import { Button, ScrollView, Text, View } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { InstalledApp, LauncherStatus, ThemeOS } from '../native/ThemeOS';

export default function SettingsScreen() {
  const [status, setStatus] = useState<LauncherStatus | null>(null);
  const [apps, setApps] = useState<InstalledApp[]>([]);
  const [pong, setPong] = useState('');

  useFocusEffect(useCallback(() => {
    ThemeOS.getLauncherStatus().then((r) => r.ok && setStatus(r.data));
    ThemeOS.getInstalledApplications().then((r) => r.ok && setApps(r.data));
  }, []));

  return (
    <ScrollView contentContainerStyle={{ padding: 16, gap: 12 }}>
      <Text style={{ fontSize: 18, fontWeight: '600' }}>Launcher</Text>
      <Text>Default home app: {status ? (status.isDefaultHome ? 'ThemeOS ✓' : `No (${status.currentHomePackage})`) : '…'}</Text>
      <Button title="Choose default home app" onPress={() => ThemeOS.openDefaultLauncherSettings()} />
      <View style={{ height: 8 }} />
      <Text style={{ fontSize: 18, fontWeight: '600' }}>Diagnostics</Text>
      <Button title="Ping Kotlin" onPress={async () => { const r = await ThemeOS.ping(); setPong(r.ok ? r.data : r.error.message); }} />
      {!!pong && <Text>{pong}</Text>}
      <Text>Launchable apps found: {apps.length}</Text>
    </ScrollView>
  );
}
