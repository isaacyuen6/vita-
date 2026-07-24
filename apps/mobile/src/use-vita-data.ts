import { useEffect, useState } from 'react';
import { Platform } from 'react-native';
import { buildTrainingPlan, initialData, type VitaData } from './vita-data';
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
    const savedPlan = parsed.trainingPlan ?? [];
    const hasModernPlan = savedPlan.length > 0 && savedPlan.every((day) => 'sessionType' in day);
    const trainingPlan = hasModernPlan
      ? savedPlan
      : buildTrainingPlan(Number(parsed.userProfile?.trainingDays) || 3);
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
      currentTrainingDay: trainingPlan[0]?.id ?? initialData.currentTrainingDay,
      trainingPlan,
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
