import { defaultUserProfile, type UserProfile } from './onboarding/types';

export type TabId = 'today' | 'train' | 'eat' | 'progress' | 'coach';

export interface Meal {
  id: string;
  name: string;
  calories: number;
  carbs?: number;
  confidence?: number;
  fat?: number;
  protein: number;
  source?: 'manual' | 'photo';
  time: string;
}

export type NutritionGoalMode = 'cut' | 'maintain' | 'bulk';

export interface NutritionGoals {
  calories: number;
  mode: NutritionGoalMode;
  protein: number;
}

export type TrainingDay = string;

export type SessionType =
  | 'upper_body'
  | 'lower_body'
  | 'push'
  | 'pull'
  | 'legs'
  | 'full_body'
  | 'strength'
  | 'hypertrophy'
  | 'athletic_power'
  | 'conditioning'
  | 'mobility_recovery'
  | 'core';

export interface PlannedExercise {
  id: string;
  name: string;
  prescription: string;
  load: string;
}

export interface TrainingPlanDay {
  id: TrainingDay;
  label: string;
  sessionType: SessionType;
  exercises: PlannedExercise[];
}

export interface VitaData {
  workoutCompleted: boolean;
  completedSets: number;
  sleepHours: number;
  sleepQuality: number;
  waterMl: number;
  meals: Meal[];
  nutritionGoals: NutritionGoals;
  currentTrainingDay: TrainingDay;
  userProfile: UserProfile;
  trainingPlan: TrainingPlanDay[];
}

const sessionTemplates: Record<SessionType, Omit<TrainingPlanDay, 'id'>> = {
  upper_body: {
    label: 'Upper Body',
    sessionType: 'upper_body',
    exercises: [
      { id: 'upper-1', name: 'Bench Press', prescription: '3 x 6-10', load: 'Barbell' },
      { id: 'upper-2', name: 'Lat Pulldown', prescription: '3 x 8-12', load: 'Cable' },
      { id: 'upper-3', name: 'Shoulder Press', prescription: '3 x 8-10', load: 'Dumbbells' },
      { id: 'upper-4', name: 'Seated Cable Row', prescription: '3 x 10-12', load: 'Cable' },
    ],
  },
  lower_body: {
    label: 'Lower Body',
    sessionType: 'lower_body',
    exercises: [
      { id: 'lower-1', name: 'Squat', prescription: '3 x 6-10', load: 'Barbell' },
      { id: 'lower-2', name: 'Romanian Deadlift', prescription: '3 x 8-10', load: 'Dumbbells' },
      { id: 'lower-3', name: 'Bulgarian Split Squat', prescription: '3 x 8-10 / side', load: 'Dumbbells' },
      { id: 'lower-4', name: 'Leg Curl', prescription: '3 x 10-15', load: 'Machine' },
    ],
  },
  push: {
    label: 'Push',
    sessionType: 'push',
    exercises: [
      { id: 'push-1', name: 'Bench Press', prescription: '3 x 8-10', load: 'Barbell' },
      { id: 'push-2', name: 'Incline Dumbbell Press', prescription: '3 x 8-12', load: 'Dumbbells' },
      { id: 'push-3', name: 'Shoulder Press', prescription: '3 x 8-10', load: 'Dumbbells' },
      { id: 'push-4', name: 'Triceps Pushdown', prescription: '3 x 10-15', load: 'Cable' },
    ],
  },
  pull: {
    label: 'Pull',
    sessionType: 'pull',
    exercises: [
      { id: 'pull-1', name: 'Pull-Up', prescription: '3 x 5-10', load: 'Body Weight' },
      { id: 'pull-2', name: 'Seated Cable Row', prescription: '3 x 8-12', load: 'Cable' },
      { id: 'pull-3', name: 'Lat Pulldown', prescription: '3 x 10-12', load: 'Cable' },
      { id: 'pull-4', name: 'Dumbbell Curl', prescription: '3 x 10-12', load: 'Dumbbells' },
    ],
  },
  legs: {
    label: 'Legs',
    sessionType: 'legs',
    exercises: [
      { id: 'legs-1', name: 'Squat', prescription: '3 x 8-10', load: 'Barbell' },
      { id: 'legs-2', name: 'Leg Press', prescription: '3 x 10-12', load: 'Machine' },
      { id: 'legs-3', name: 'Romanian Deadlift', prescription: '3 x 8-10', load: 'Dumbbells' },
      { id: 'legs-4', name: 'Standing Calf Raise', prescription: '3 x 12-15', load: 'Machine' },
    ],
  },
  full_body: {
    label: 'Full Body',
    sessionType: 'full_body',
    exercises: [
      { id: 'full-1', name: 'Goblet Squat', prescription: '3 x 10-12', load: 'Dumbbell' },
      { id: 'full-2', name: 'Push-Up', prescription: '3 x 8-15', load: 'Body Weight' },
      { id: 'full-3', name: 'One Arm Dumbbell Row', prescription: '3 x 10 / side', load: 'Dumbbell' },
      { id: 'full-4', name: 'Plank', prescription: '3 x 30-45 sec', load: 'Body Weight' },
    ],
  },
  strength: {
    label: 'Strength',
    sessionType: 'strength',
    exercises: [
      { id: 'strength-1', name: 'Squat', prescription: '4 x 3-6', load: 'Barbell' },
      { id: 'strength-2', name: 'Bench Press', prescription: '4 x 3-6', load: 'Barbell' },
      { id: 'strength-3', name: 'Deadlift', prescription: '3 x 3-5', load: 'Barbell' },
    ],
  },
  hypertrophy: {
    label: 'Hypertrophy',
    sessionType: 'hypertrophy',
    exercises: [
      { id: 'hyp-1', name: 'Incline Dumbbell Press', prescription: '3 x 8-12', load: 'Dumbbells' },
      { id: 'hyp-2', name: 'Cable Row', prescription: '3 x 10-12', load: 'Cable' },
      { id: 'hyp-3', name: 'Lateral Raise', prescription: '3 x 12-20', load: 'Dumbbells' },
      { id: 'hyp-4', name: 'Leg Press', prescription: '3 x 10-15', load: 'Machine' },
    ],
  },
  athletic_power: {
    label: 'Athletic Power',
    sessionType: 'athletic_power',
    exercises: [
      { id: 'power-1', name: 'Box Jump', prescription: '4 x 3-5', load: 'Body Weight' },
      { id: 'power-2', name: 'Kettlebell Swing', prescription: '3 x 10-15', load: 'Kettlebell' },
      { id: 'power-3', name: 'Walking Lunge', prescription: '3 x 10 / side', load: 'Dumbbells' },
      { id: 'power-4', name: 'Medicine Ball Slam', prescription: '3 x 8-12', load: 'Medicine Ball' },
    ],
  },
  conditioning: {
    label: 'Conditioning',
    sessionType: 'conditioning',
    exercises: [
      { id: 'cond-1', name: 'Air Bike', prescription: '8 x 20 sec hard / 70 sec easy', load: 'Machine' },
      { id: 'cond-2', name: 'Farmer Walk', prescription: '4 x 30 m', load: 'Dumbbells' },
      { id: 'cond-3', name: 'Mountain Climber', prescription: '3 x 30 sec', load: 'Body Weight' },
    ],
  },
  mobility_recovery: {
    label: 'Mobility',
    sessionType: 'mobility_recovery',
    exercises: [
      { id: 'mob-1', name: 'Hip Flexor Stretch', prescription: '2 x 45 sec / side', load: 'Body Weight' },
      { id: 'mob-2', name: 'Thoracic Rotation', prescription: '2 x 8 / side', load: 'Body Weight' },
      { id: 'mob-3', name: 'Hamstring Stretch', prescription: '2 x 45 sec / side', load: 'Body Weight' },
      { id: 'mob-4', name: 'Dead Bug', prescription: '3 x 8 / side', load: 'Body Weight' },
    ],
  },
  core: {
    label: 'Core',
    sessionType: 'core',
    exercises: [
      { id: 'core-1', name: 'Plank', prescription: '3 x 30-60 sec', load: 'Body Weight' },
      { id: 'core-2', name: 'Hanging Leg Raise', prescription: '3 x 8-12', load: 'Body Weight' },
      { id: 'core-3', name: 'Cable Woodchop', prescription: '3 x 10 / side', load: 'Cable' },
    ],
  },
};

const weeklySplits: Record<number, SessionType[]> = {
  1: ['full_body'],
  2: ['upper_body', 'lower_body'],
  3: ['push', 'pull', 'legs'],
  4: ['upper_body', 'lower_body', 'push', 'legs'],
  5: ['push', 'pull', 'legs', 'upper_body', 'conditioning'],
  6: ['push', 'pull', 'legs', 'upper_body', 'lower_body', 'mobility_recovery'],
  7: ['upper_body', 'lower_body', 'push', 'pull', 'legs', 'athletic_power', 'mobility_recovery'],
};

export const sessionTypeOptions = Object.entries(sessionTemplates).map(([value, template]) => ({
  label: template.label,
  value: value as SessionType,
}));

export function buildSessionDay(sessionType: SessionType, index: number): TrainingPlanDay {
  const template = sessionTemplates[sessionType];
  return {
    ...template,
    id: `day-${index + 1}`,
    label: `Day ${index + 1} · ${template.label}`,
    exercises: template.exercises.map((exercise, exerciseIndex) => ({
      ...exercise,
      id: `day-${index + 1}-${exerciseIndex + 1}`,
    })),
  };
}

export function buildTrainingPlan(days: number): TrainingPlanDay[] {
  const safeDays = Math.min(Math.max(Math.round(days) || 3, 1), 7);
  const split = weeklySplits[safeDays] ?? weeklySplits[3]!;
  return split.map((sessionType, index) => buildSessionDay(sessionType, index));
}

export const initialData: VitaData = {
  workoutCompleted: false,
  completedSets: 0,
  sleepHours: 6.5,
  sleepQuality: 3,
  waterMl: 750,
  nutritionGoals: { calories: 2200, mode: 'maintain', protein: 130 },
  meals: [
    { id: 'breakfast', name: 'Oats, banana & milk', calories: 410, protein: 18, time: '8:10 AM' },
    { id: 'lunch', name: 'Chicken rice', calories: 620, protein: 36, time: '1:05 PM' },
  ],
  currentTrainingDay: 'day-1',
  userProfile: defaultUserProfile,
  trainingPlan: buildTrainingPlan(3),
};

export const targets = { calories: 2200, protein: 130, waterMl: 2500, weeklyWorkouts: 3 };

export function getNutritionGoals(data: VitaData): NutritionGoals {
  return data.nutritionGoals ?? initialData.nutritionGoals;
}

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
