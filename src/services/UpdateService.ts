import Constants from 'expo-constants';

export type AppUpdate = {
  version: string;
  url: string;
  notes?: string[];
};

const UPDATE_URL =
  'https://raw.githubusercontent.com/SIDHIMUSIC/NEWMUSICAPP/main/update.json';

const versionParts = (value: string) =>
  value
    .replace(/^v/i, '')
    .split('.')
    .map((part) => Number.parseInt(part, 10) || 0);

export const getCurrentVersion = (): string =>
  Constants.expoConfig?.version ??
  Constants.manifest2?.extra?.expoClient?.version ??
  '1.0.0';

export const isNewerVersion = (latest: string, current: string): boolean => {
  const a = versionParts(latest);
  const b = versionParts(current);
  for (let i = 0; i < Math.max(a.length, b.length); i += 1) {
    if ((a[i] ?? 0) > (b[i] ?? 0)) return true;
    if ((a[i] ?? 0) < (b[i] ?? 0)) return false;
  }
  return false;
};

export async function checkForUpdate(): Promise<AppUpdate | null> {
  try {
    const response = await fetch(`${UPDATE_URL}?t=${Date.now()}`);
    if (!response.ok) return null;

    const data = (await response.json()) as AppUpdate;
    if (!data?.version || !data?.url) return null;

    return isNewerVersion(data.version, getCurrentVersion()) ? data : null;
  } catch {
    return null;
  }
}
