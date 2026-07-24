import type { ActivityLevel, MainGoal, UserProfile } from './types';

export function heightInCm(profile: UserProfile) {
  if (profile.heightUnit === 'cm') return Number(profile.heightCm);
  return Number(profile.heightFeet) * 30.48 + Number(profile.heightInches || 0) * 2.54;
}

export function weightInKg(profile: UserProfile) {
  if (profile.weightUnit === 'kg') return Number(profile.weightKg);
  return Number(profile.weightLbs) * 0.45359237;
}

export function calculateBmi(profile: UserProfile) {
  const heightCm = heightInCm(profile);
  const weightKg = weightInKg(profile);
  if (!heightCm || !weightKg) return null;
  const meters = heightCm / 100;
  return weightKg / (meters * meters);
}

export function bmiCategory(bmi: number | null) {
  if (!bmi) return '';
  if (bmi < 18.5) return 'Underweight';
  if (bmi < 25) return 'Healthy';
  if (bmi < 30) return 'Overweight';
  return 'Obese';
}

function activityMultiplier(activity: ActivityLevel | '') {
  switch (activity) {
    case 'lightly_active':
      return 1.375;
    case 'moderately_active':
      return 1.55;
    case 'very_active':
      return 1.725;
    default:
      return 1.2;
  }
}

function goalAdjustment(goal: MainGoal | '') {
  switch (goal) {
    case 'lose_fat':
      return -350;
    case 'gain_weight':
    case 'build_muscle':
      return 250;
    default:
      return 0;
  }
}

export function estimateCalories(profile: UserProfile) {
  const age = Number(profile.age);
  const heightCm = heightInCm(profile);
  const weightKg = weightInKg(profile);
  if (!age || !heightCm || !weightKg) return null;
  const sexOffset = profile.gender === 'female' ? -161 : 5;
  const bmr = 10 * weightKg + 6.25 * heightCm - 5 * age + sexOffset;
  return Math.round((bmr * activityMultiplier(profile.activityLevel) + goalAdjustment(profile.goal)) / 10) * 10;
}

export function estimateProtein(profile: UserProfile) {
  const weightKg = weightInKg(profile);
  if (!weightKg) return null;
  const multiplier = profile.goal === 'lose_fat' || profile.goal === 'build_muscle' ? 1.9 : 1.6;
  return Math.round(weightKg * multiplier);
}
