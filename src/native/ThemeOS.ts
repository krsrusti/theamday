import { NativeModules } from 'react-native';

export type NativeError = { code: string; message: string };
export type Result<T> = { ok: true; data: T } | { ok: false; error: NativeError };

export interface ThemeManifest {
  schemaVersion: number;
  id: string;
  name: string;
  version: string;
  description?: string;
  appearance: { background: string; surface: string; primary: string; text: string };
  wallpaper: string;
  icons: Record<string, string>;
  layout: { columns: number; dockEnabled: boolean };
  dir: string; // folder name inside assets/themes (added by native)
}
export interface LauncherStatus { isDefaultHome: boolean; currentHomePackage: string | null; sdkInt: number }
export interface InstalledApp { label: string; packageName: string }

const native = NativeModules.ThemeOS;

async function call<T>(method: string, ...args: unknown[]): Promise<Result<T>> {
  try {
    if (!native) return { ok: false, error: { code: 'NO_MODULE', message: 'ThemeOS native module not registered' } };
    return JSON.parse(await native[method](...args));
  } catch (e: any) {
    return { ok: false, error: { code: 'BRIDGE_ERROR', message: String(e?.message ?? e) } };
  }
}

export const ThemeOS = {
  ping: () => call<string>('ping'),
  getLauncherStatus: () => call<LauncherStatus>('getLauncherStatus'),
  getInstalledApplications: () => call<InstalledApp[]>('getInstalledApplications'),
  getInstalledThemes: () => call<ThemeManifest[]>('getInstalledThemes'),
  getActiveTheme: () => call<ThemeManifest | null>('getActiveTheme'),
  applyTheme: (themeId: string) => call<ThemeManifest>('applyTheme', themeId),
  openDefaultLauncherSettings: () => call<boolean>('openDefaultLauncherSettings'),
};

// RN's Image can read Android assets via the asset:/ scheme
export const previewUri = (t: ThemeManifest) => `asset:/themes/${t.dir}/previews/home.webp`;
