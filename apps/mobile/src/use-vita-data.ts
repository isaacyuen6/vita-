import { useEffect, useState } from 'react';
import { Platform } from 'react-native';
import { initialData, type VitaData } from './vita-data';
import { defaultUserProfile, type MainGoal, type UserProfile } from './onboarding/types';

const storageKey = 'vita-ai-demo-data-v1';

function loadData(): VitaData {
  if (Platform.OS !== 'web' || typeof window === 'undefined') return initialData;
  try {
    const saved = window.localStorage.getItem(storageKey);
    if (saved === null) return initialData;
    const parsed = JSON.parse(saved) as Partial<VitaData> & {
      userProfile?: Partial<UserProfile> & { goal?: MainGoal | 'build_muscle' | 'gain_weight' | '' };
    };
    const legacyGoal = parsed.userProfile?.goal;
    return {
      ...initialData,
      ...parsed,
      userProfile: {
        ...defaultUserProfile,
        ...parsed.userProfile,
        goals:
          parsed.userProfile?.goals ??
          (legacyGoal ? [legacyGoal === 'build_muscle' || legacyGoal === 'gain_weight' ? 'build_muscle_mass' : legacyGoal] : []),
      },
    };
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
