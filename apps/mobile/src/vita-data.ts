import { defaultUserProfile, type UserProfile } from './onboarding/types';

export type TabId = 'today' | 'train' | 'eat' | 'progress' | 'coach';

export interface Meal {
  id: string;
  name: string;
  calories: number;
  protein: number;
  time: string;
}

export type TrainingDay = 'push' | 'pull' | 'legs';

export interface PlannedExercise {
  id: string;
  name: string;
  prescription: string;
  load: string;
}

export interface TrainingPlanDay {
  id: TrainingDay;
  label: string;
  exercises: PlannedExercise[];
}

export interface VitaData {
  workoutCompleted: boolean;
  completedSets: number;
  sleepHours: number;
  sleepQuality: number;
  waterMl: number;
  meals: Meal[];
  currentTrainingDay: TrainingDay;
  userProfile: UserProfile;
  trainingPlan: TrainingPlanDay[];
}

export const initialData: VitaData = {
  workoutCompleted: false,
  completedSets: 0,
  sleepHours: 6.5,
  sleepQuality: 3,
  waterMl: 750,
  meals: [
    { id: 'breakfast', name: 'Oats, banana & milk', calories: 410, protein: 18, time: '8:10 AM' },
    { id: 'lunch', name: 'Chicken rice', calories: 620, protein: 36, time: '1:05 PM' },
  ],
  currentTrainingDay: 'push',
  userProfile: defaultUserProfile,
  trainingPlan: [
    {
      id: 'push',
      label: 'Push',
      exercises: [
        { id: 'push-1', name: 'Bench Press', prescription: '3 x 8-10', load: 'Barbell' },
        { id: 'push-2', name: 'Shoulder Press', prescription: '3 x 8-10', load: 'Dumbbells' },
        { id: 'push-3', name: 'Triceps Pushdown', prescription: '3 x 10-12', load: 'Cable' },
      ],
    },
    {
      id: 'pull',
      label: 'Pull',
      exercises: [
        { id: 'pull-1', name: 'Lat Pulldown', prescription: '3 x 8-12', load: 'Cable' },
        { id: 'pull-2', name: 'Seated Cable Row', prescription: '3 x 10-12', load: 'Cable' },
        { id: 'pull-3', name: 'Dumbbell Curl', prescription: '3 x 10-12', load: 'Dumbbells' },
      ],
    },
    {
      id: 'legs',
      label: 'Legs',
      exercises: [
        { id: 'legs-1', name: 'Squat', prescription: '3 x 8-10', load: 'Barbell' },
        { id: 'legs-2', name: 'Romanian Deadlift', prescription: '3 x 8-10', load: 'Dumbbells' },
        { id: 'legs-3', name: 'Leg Press', prescription: '3 x 10-12', load: 'Machine' },
      ],
    },
  ],
};

export const targets = { calories: 2200, protein: 130, waterMl: 2500, weeklyWorkouts: 3 };

export function readinessScore(data: VitaData): number {
  const sleep = Math.min(data.sleepHours / 8, 1) * 45;
  const quality = (data.sleepQuality / 5) * 25;
  const nutrition =
    Math.min(data.meals.reduce((sum, meal) => sum + meal.protein, 0) / targets.protein, 1) * 20;
  const hydration = Math.min(data.waterMl / targets.waterMl, 1) * 10;
  return Math.round(sleep + quality + nutrition + hydration);
}

export function coachReply(message: string, data: VitaData): string {
  const input = message.toLowerCase();
  const urgentTerms = [
    'chest pain',
    'fainting',
    'severe shortness of breath',
    'serious allergic',
    'sudden weakness',
  ];
  if (urgentTerms.some((term) => input.includes(term))) {
    return 'Stop exercising. Vita cannot assess or diagnose this. Seek urgent medical help now, and contact local emergency services if symptoms are severe or ongoing.';
  }

  const protein = data.meals.reduce((sum, meal) => sum + meal.protein, 0);
  if (input.includes('eat') || input.includes('protein') || input.includes('calorie')) {
    return `You have about ${Math.max(targets.protein - protein, 0)} g protein remaining today. A practical Malaysian option is grilled chicken with rice and vegetables; adjust the portion to your appetite and confirm the actual meal when you log it.`;
  }
  if (input.includes('readiness') || input.includes('recover') || input.includes('sleep')) {
    return `Your readiness is ${readinessScore(data)}%. The biggest opportunity is sleep: you logged ${data.sleepHours.toFixed(1)} hours. Keep today's session controlled and aim for a consistent earlier bedtime.`;
  }
  if (input.includes('train') || input.includes('workout') || input.includes('30 minute')) {
    return data.workoutCompleted
      ? 'You already completed today’s strength session. Choose an easy walk or ten minutes of mobility instead of adding another hard workout.'
      : 'Do the 32-minute full-body strength session in Train. Keep 2–3 reps in reserve, and stop any movement that causes sharp, sudden, or worsening pain.';
  }
  return 'I can help you decide what to train, explain readiness, or choose a meal using the data you have logged. I will label estimates and will not invent health measurements.';
}
