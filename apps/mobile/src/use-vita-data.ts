import { useEffect, useState } from 'react';
import { Platform } from 'react-native';
import { initialData, type VitaData } from './vita-data';

const storageKey = 'vita-ai-demo-data-v1';

function loadData(): VitaData {
  if (Platform.OS !== 'web' || typeof window === 'undefined') return initialData;
  try {
    const saved = window.localStorage.getItem(storageKey);
    if (saved === null) return initialData;
    return { ...initialData, ...(JSON.parse(saved) as Partial<VitaData>) };
  } catch {
    return initialData;
  }
}

export function useVitaData() {
  const [data, setData] = useState<VitaData>(loadData);

  useEffect(() => {
    if (Platform.OS === 'web' && typeof window !== 'undefined') {
      window.localStorage.setItem(storageKey, JSON.stringify(data));
    }
  }, [data]);

  return { data, setData };
}
