import { useCallback, useState } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import { ThemeManifest, ThemeOS } from '../native/ThemeOS';

export function useThemes() {
  const [themes, setThemes] = useState<ThemeManifest[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const reload = useCallback(async () => {
    setLoading(true);
    const [list, active] = await Promise.all([ThemeOS.getInstalledThemes(), ThemeOS.getActiveTheme()]);
    if (!list.ok) setError(list.error.message); else { setError(null); setThemes(list.data); }
    setActiveId(active.ok && active.data ? active.data.id : null);
    setLoading(false);
  }, []);

  useFocusEffect(useCallback(() => { reload(); }, [reload]));
  return { themes, activeId, loading, error, reload };
}
