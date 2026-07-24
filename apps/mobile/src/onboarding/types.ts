export type Gender = 'male' | 'female' | 'non_binary' | 'prefer_not_to_say' | '';
export type HeightUnit = 'cm' | 'ft_in';
export type WeightUnit = 'kg' | 'lbs';

export type MainGoal =
  | 'lose_fat'
  | 'build_muscle'
  | 'gain_weight'
  | 'increase_strength'
  | 'improve_fitness'
  | 'jump_higher'
  | 'basketball_performance'
  | 'improve_endurance'
  | 'improve_mobility'
  | 'sleep_better';

export type TrainingExperience =
  | 'completely_new'
  | 'less_than_6_months'
  | '6_12_months'
  | '1_3_years'
  | '3_5_years'
  | '5_plus_years';

export type WorkoutLocation =
  | 'commercial_gym'
  | 'home_gym'
  | 'home_bodyweight'
  | 'outdoor'
  | 'basketball_court';

export type Equipment =
  | 'dumbbells'
  | 'barbell'
  | 'bench'
  | 'squat_rack'
  | 'pull_up_bar'
  | 'resistance_bands'
  | 'cable_machine'
  | 'smith_machine'
  | 'leg_press'
  | 'none';

export type SleepAverage = 'less_than_5' | '5_6' | '6_7' | '7_8' | '8_plus';
export type ActivityLevel = 'mostly_sitting' | 'lightly_active' | 'moderately_active' | 'very_active';
export type DietPreference =
  | 'no_preference'
  | 'high_protein'
  | 'vegetarian'
  | 'vegan'
  | 'halal'
  | 'keto'
  | 'low_carb';

export type AvoidArea =
  | 'knees'
  | 'lower_back'
  | 'shoulder'
  | 'elbow'
  | 'wrist'
  | 'neck'
  | 'ankles'
  | 'none';

export interface UserProfile {
  activityLevel: ActivityLevel | '';
  age: string;
  allergies: string;
  avoidAreas: AvoidArea[];
  avoidNotes: string;
  dietPreference: DietPreference | '';
  equipment: Equipment[];
  experience: TrainingExperience | '';
  firstName: string;
  gender: Gender;
  goal: MainGoal | '';
  heightCm: string;
  heightFeet: string;
  heightInches: string;
  heightUnit: HeightUnit;
  lastName: string;
  occupation: string;
  onboardingCompleted: boolean;
  sleepAverage: SleepAverage | '';
  trainingDays: string;
  weightKg: string;
  weightLbs: string;
  weightUnit: WeightUnit;
  workoutLocations: WorkoutLocation[];
}

export const defaultUserProfile: UserProfile = {
  activityLevel: '',
  age: '',
  allergies: '',
  avoidAreas: [],
  avoidNotes: '',
  dietPreference: '',
  equipment: [],
  experience: '',
  firstName: '',
  gender: '',
  goal: '',
  heightCm: '',
  heightFeet: '',
  heightInches: '',
  heightUnit: 'cm',
  lastName: '',
  occupation: '',
  onboardingCompleted: false,
  sleepAverage: '',
  trainingDays: '',
  weightKg: '',
  weightLbs: '',
  weightUnit: 'kg',
  workoutLocations: [],
};
