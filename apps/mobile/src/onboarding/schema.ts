import { z } from 'zod';

const maxText = (max: number) => z.string().trim().max(max);
const positiveNumberText = z.string().trim().refine((value) => Number(value) > 0, 'Required');

export const onboardingSchema = z
  .object({
    activityLevel: z.enum(['mostly_sitting', 'lightly_active', 'moderately_active', 'very_active']).or(z.literal('')),
    age: positiveNumberText.refine((value) => Number(value) >= 13 && Number(value) <= 100, 'Enter a valid age'),
    allergies: maxText(160),
    avoidAreas: z.array(
      z.enum(['knees', 'lower_back', 'shoulder', 'elbow', 'wrist', 'neck', 'ankles', 'none']),
    ),
    avoidNotes: maxText(240),
    dietPreference: z
      .enum(['no_preference', 'high_protein', 'vegetarian', 'vegan', 'halal', 'keto', 'low_carb'])
      .or(z.literal('')),
    equipment: z.array(
      z.enum([
        'dumbbells',
        'barbell',
        'bench',
        'squat_rack',
        'pull_up_bar',
        'resistance_bands',
        'cable_machine',
        'smith_machine',
        'leg_press',
        'none',
      ]),
    ),
    experience: z
      .enum(['completely_new', 'less_than_6_months', '6_12_months', '1_3_years', '3_5_years', '5_plus_years'])
      .or(z.literal('')),
    firstName: z.string().trim().min(1, 'First name is required').max(50, 'Maximum 50 characters'),
    gender: z.enum(['male', 'female', 'non_binary', 'prefer_not_to_say']).or(z.literal('')),
    goal: z
      .enum([
        'lose_fat',
        'build_muscle',
        'gain_weight',
        'increase_strength',
        'improve_fitness',
        'jump_higher',
        'basketball_performance',
        'improve_endurance',
        'improve_mobility',
        'sleep_better',
      ])
      .or(z.literal('')),
    heightCm: z.string().trim(),
    heightFeet: z.string().trim(),
    heightInches: z.string().trim(),
    heightUnit: z.enum(['cm', 'ft_in']),
    lastName: maxText(50),
    occupation: maxText(80),
    onboardingCompleted: z.boolean(),
    sleepAverage: z.enum(['less_than_5', '5_6', '6_7', '7_8', '8_plus']).or(z.literal('')),
    trainingDays: positiveNumberText.refine((value) => Number(value) >= 1 && Number(value) <= 7, 'Choose 1-7 days'),
    weightKg: z.string().trim(),
    weightLbs: z.string().trim(),
    weightUnit: z.enum(['kg', 'lbs']),
    workoutLocations: z.array(
      z.enum(['commercial_gym', 'home_gym', 'home_bodyweight', 'outdoor', 'basketball_court']),
    ),
  })
  .superRefine((value, ctx) => {
    if (value.heightUnit === 'cm' && Number(value.heightCm) <= 0) {
      ctx.addIssue({ code: 'custom', message: 'Height is required', path: ['heightCm'] });
    }
    if (value.heightUnit === 'ft_in' && Number(value.heightFeet) <= 0) {
      ctx.addIssue({ code: 'custom', message: 'Feet are required', path: ['heightFeet'] });
    }
    if (value.weightUnit === 'kg' && Number(value.weightKg) <= 0) {
      ctx.addIssue({ code: 'custom', message: 'Weight is required', path: ['weightKg'] });
    }
    if (value.weightUnit === 'lbs' && Number(value.weightLbs) <= 0) {
      ctx.addIssue({ code: 'custom', message: 'Weight is required', path: ['weightLbs'] });
    }
    if (!value.goal) ctx.addIssue({ code: 'custom', message: 'Choose a goal', path: ['goal'] });
    if (!value.experience) ctx.addIssue({ code: 'custom', message: 'Choose an experience level', path: ['experience'] });
    if (!value.sleepAverage) ctx.addIssue({ code: 'custom', message: 'Choose average sleep', path: ['sleepAverage'] });
    if (!value.activityLevel) ctx.addIssue({ code: 'custom', message: 'Choose activity level', path: ['activityLevel'] });
    if (!value.dietPreference) ctx.addIssue({ code: 'custom', message: 'Choose a diet preference', path: ['dietPreference'] });
    if (!value.workoutLocations.length) {
      ctx.addIssue({ code: 'custom', message: 'Choose at least one location', path: ['workoutLocations'] });
    }
    if (!value.equipment.length) ctx.addIssue({ code: 'custom', message: 'Choose equipment or None', path: ['equipment'] });
    if (!value.avoidAreas.length) ctx.addIssue({ code: 'custom', message: 'Choose an area or None', path: ['avoidAreas'] });
  });

export type OnboardingFormValues = z.infer<typeof onboardingSchema>;
