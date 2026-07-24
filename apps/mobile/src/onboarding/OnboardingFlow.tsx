import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect, useMemo, useRef, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import {
  Animated,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import {
  BackButton,
  ContinueButton,
  FormInput,
  MultiSelectCards,
  OnboardingProgress,
  QuestionHeader,
  SingleSelectCards,
  UnitPicker,
  type SelectOption,
} from './components';
import { bmiCategory, calculateBmi, estimateCalories, estimateProtein } from './calculations';
import { defaultUserProfile, type UserProfile } from './types';
import { onboardingSchema, type OnboardingFormValues } from './schema';
import type {
  ActivityLevel,
  AvoidArea,
  DietPreference,
  Equipment,
  Gender,
  MainGoal,
  SleepAverage,
  TrainingExperience,
  WorkoutLocation,
} from './types';

const steps = [
  'welcome',
  'name',
  'basic',
  'goal',
  'experience',
  'availability',
  'location',
  'equipment',
  'lifestyle',
  'nutrition',
  'injuries',
  'summary',
] as const;

type StepId = (typeof steps)[number];

const goalOptions: SelectOption<MainGoal>[] = [
  { icon: 'fire', label: 'Lose Fat', value: 'lose_fat' },
  { icon: 'arm-flex', label: 'Build Muscle', value: 'build_muscle' },
  { icon: 'scale-bathroom', label: 'Gain Weight', value: 'gain_weight' },
  { icon: 'weight-lifter', label: 'Increase Strength', value: 'increase_strength' },
  { icon: 'heart-pulse', label: 'Improve Fitness', value: 'improve_fitness' },
  { icon: 'basketball-hoop', label: 'Jump Higher', value: 'jump_higher' },
  { icon: 'basketball', label: 'Basketball Performance', value: 'basketball_performance' },
  { icon: 'run-fast', label: 'Improve Endurance', value: 'improve_endurance' },
  { icon: 'human-handsup', label: 'Improve Mobility', value: 'improve_mobility' },
  { icon: 'sleep', label: 'Sleep Better', value: 'sleep_better' },
];

const experienceOptions: SelectOption<TrainingExperience>[] = [
  { label: 'Completely New', value: 'completely_new' },
  { label: 'Less than 6 months', value: 'less_than_6_months' },
  { label: '6-12 months', value: '6_12_months' },
  { label: '1-3 years', value: '1_3_years' },
  { label: '3-5 years', value: '3_5_years' },
  { label: '5+ years', value: '5_plus_years' },
];

const locationOptions: SelectOption<WorkoutLocation>[] = [
  { icon: 'office-building', label: 'Commercial Gym', value: 'commercial_gym' },
  { icon: 'garage', label: 'Home Gym', value: 'home_gym' },
  { icon: 'human', label: 'Home Bodyweight', value: 'home_bodyweight' },
  { icon: 'tree', label: 'Outdoor', value: 'outdoor' },
  { icon: 'basketball-hoop', label: 'Basketball Court', value: 'basketball_court' },
];

const equipmentOptions: SelectOption<Equipment>[] = [
  { label: 'Dumbbells', value: 'dumbbells' },
  { label: 'Barbell', value: 'barbell' },
  { label: 'Bench', value: 'bench' },
  { label: 'Squat Rack', value: 'squat_rack' },
  { label: 'Pull-up Bar', value: 'pull_up_bar' },
  { label: 'Resistance Bands', value: 'resistance_bands' },
  { label: 'Cable Machine', value: 'cable_machine' },
  { label: 'Smith Machine', value: 'smith_machine' },
  { label: 'Leg Press', value: 'leg_press' },
  { label: 'None', value: 'none' },
];

const sleepOptions: SelectOption<SleepAverage>[] = [
  { label: 'Less than 5h', value: 'less_than_5' },
  { label: '5-6h', value: '5_6' },
  { label: '6-7h', value: '6_7' },
  { label: '7-8h', value: '7_8' },
  { label: '8+ hours', value: '8_plus' },
];

const activityOptions: SelectOption<ActivityLevel>[] = [
  { label: 'Mostly Sitting', value: 'mostly_sitting' },
  { label: 'Lightly Active', value: 'lightly_active' },
  { label: 'Moderately Active', value: 'moderately_active' },
  { label: 'Very Active', value: 'very_active' },
];

const dietOptions: SelectOption<DietPreference>[] = [
  { label: 'No Preference', value: 'no_preference' },
  { label: 'High Protein', value: 'high_protein' },
  { label: 'Vegetarian', value: 'vegetarian' },
  { label: 'Vegan', value: 'vegan' },
  { label: 'Halal', value: 'halal' },
  { label: 'Keto', value: 'keto' },
  { label: 'Low Carb', value: 'low_carb' },
];

const avoidOptions: SelectOption<AvoidArea>[] = [
  { label: 'Knees', value: 'knees' },
  { label: 'Lower Back', value: 'lower_back' },
  { label: 'Shoulder', value: 'shoulder' },
  { label: 'Elbow', value: 'elbow' },
  { label: 'Wrist', value: 'wrist' },
  { label: 'Neck', value: 'neck' },
  { label: 'Ankles', value: 'ankles' },
  { label: 'None', value: 'none' },
];

const genderOptions: SelectOption<Exclude<Gender, ''>>[] = [
  { label: 'Male', value: 'male' },
  { label: 'Female', value: 'female' },
  { label: 'Non-binary', value: 'non_binary' },
  { label: 'Prefer not to say', value: 'prefer_not_to_say' },
];

function labelFor<T extends string>(options: SelectOption<T>[], value: T | '') {
  return options.find((option) => option.value === value)?.label ?? 'Not set';
}

const fieldsByStep: Record<StepId, (keyof OnboardingFormValues)[]> = {
  availability: ['trainingDays'],
  basic: ['age', 'gender', 'heightCm', 'heightFeet', 'heightInches', 'heightUnit', 'weightKg', 'weightLbs', 'weightUnit'],
  equipment: ['equipment'],
  experience: ['experience'],
  goal: ['goal'],
  injuries: ['avoidAreas', 'avoidNotes'],
  lifestyle: ['sleepAverage', 'activityLevel', 'occupation'],
  location: ['workoutLocations'],
  name: ['firstName', 'lastName'],
  nutrition: ['dietPreference', 'allergies'],
  summary: [],
  welcome: [],
};

export function OnboardingFlow({
  initialProfile,
  onFinish,
}: {
  initialProfile?: UserProfile;
  onFinish: (profile: UserProfile) => void;
}) {
  const [stepIndex, setStepIndex] = useState(0);
  const fade = useRef(new Animated.Value(1)).current;
  const slide = useRef(new Animated.Value(0)).current;
  const form = useForm<OnboardingFormValues>({
    defaultValues: { ...defaultUserProfile, ...initialProfile },
    mode: 'onChange',
    resolver: zodResolver(onboardingSchema),
  });
  const values = form.watch();
  const bmi = calculateBmi(values);
  const calories = estimateCalories(values);
  const protein = estimateProtein(values);
  const currentStep = steps[stepIndex] ?? 'welcome';
  const canGoBack = stepIndex > 0;

  useEffect(() => {
    fade.setValue(0);
    slide.setValue(18);
    Animated.parallel([
      Animated.timing(fade, { duration: 220, toValue: 1, useNativeDriver: true }),
      Animated.timing(slide, { duration: 220, toValue: 0, useNativeDriver: true }),
    ]).start();
  }, [fade, slide, stepIndex]);

  const completion = useMemo(
    () => ({
      bmiLabel: bmi ? `${bmi.toFixed(1)} (${bmiCategory(bmi)})` : 'Add height and weight',
      calories: calories ? `${calories}` : 'Add basics',
      protein: protein ? `${protein} g` : 'Add weight',
    }),
    [bmi, calories, protein],
  );

  async function next() {
    const fields = fieldsByStep[currentStep] ?? [];
    const ok = fields.length ? await form.trigger(fields) : true;
    if (!ok) return;
    if (currentStep === 'summary') {
      onFinish({ ...values, onboardingCompleted: true });
      return;
    }
    setStepIndex((index) => Math.min(index + 1, steps.length - 1));
  }

  function back() {
    setStepIndex((index) => Math.max(index - 1, 0));
  }

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.keyboard}>
        <View style={styles.shell}>
          <OnboardingProgress current={stepIndex + 1} total={steps.length} />
          <Animated.View style={[styles.card, { opacity: fade, transform: [{ translateY: slide }] }]}>
            <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
              {currentStep === 'welcome' && (
                <View style={styles.welcome}>
                  <View style={styles.orbit}>
                    <MaterialCommunityIcons color="#FFFFFF" name="heart-pulse" size={46} />
                  </View>
                  <QuestionHeader
                    subtitle="Your AI-powered fitness, nutrition, and recovery coach."
                    title="Welcome to Vita AI"
                  />
                  <ContinueButton label="Get Started" onPress={next} />
                  <Text style={styles.secondaryAction}>Already have an account</Text>
                </View>
              )}

              {currentStep === 'name' && (
                <>
                  <QuestionHeader eyebrow="PROFILE" title="What should we call you?" />
                  <Controller
                    control={form.control}
                    name="firstName"
                    render={({ field, fieldState }) => (
                      <FormInput
                        autoCapitalize="words"
                        error={fieldState.error?.message}
                        label="First Name"
                        onBlur={field.onBlur}
                        onChangeText={field.onChange}
                        value={field.value}
                      />
                    )}
                  />
                  <Controller
                    control={form.control}
                    name="lastName"
                    render={({ field, fieldState }) => (
                      <FormInput
                        autoCapitalize="words"
                        error={fieldState.error?.message}
                        label="Last Name (optional)"
                        onBlur={field.onBlur}
                        onChangeText={field.onChange}
                        value={field.value}
                      />
                    )}
                  />
                </>
              )}

              {currentStep === 'basic' && (
                <>
                  <QuestionHeader
                    eyebrow="BODY METRICS"
                    subtitle="This helps estimate training load, nutrition targets, and recovery guidance."
                    title="Basic information"
                  />
                  <Controller
                    control={form.control}
                    name="age"
                    render={({ field, fieldState }) => (
                      <FormInput
                        error={fieldState.error?.message}
                        keyboardType="number-pad"
                        label="Age"
                        onChangeText={field.onChange}
                        value={field.value}
                      />
                    )}
                  />
                  <Controller
                    control={form.control}
                    name="gender"
                    render={({ field }) => (
                      <SingleSelectCards onChange={field.onChange} options={genderOptions} value={field.value} />
                    )}
                  />
                  <Controller
                    control={form.control}
                    name="heightUnit"
                    render={({ field }) => (
                      <UnitPicker
                        onChange={field.onChange}
                        options={[
                          { label: 'cm', value: 'cm' },
                          { label: 'ft / in', value: 'ft_in' },
                        ]}
                        value={field.value}
                      />
                    )}
                  />
                  {values.heightUnit === 'cm' ? (
                    <Controller
                      control={form.control}
                      name="heightCm"
                      render={({ field, fieldState }) => (
                        <FormInput error={fieldState.error?.message} keyboardType="decimal-pad" label="Height (cm)" onChangeText={field.onChange} value={field.value} />
                      )}
                    />
                  ) : (
                    <View style={styles.row}>
                      <Controller control={form.control} name="heightFeet" render={({ field }) => <FormInput keyboardType="number-pad" label="Feet" onChangeText={field.onChange} value={field.value} />} />
                      <Controller control={form.control} name="heightInches" render={({ field }) => <FormInput keyboardType="number-pad" label="Inches" onChangeText={field.onChange} value={field.value} />} />
                    </View>
                  )}
                  <Controller
                    control={form.control}
                    name="weightUnit"
                    render={({ field }) => (
                      <UnitPicker
                        onChange={field.onChange}
                        options={[
                          { label: 'kg', value: 'kg' },
                          { label: 'lbs', value: 'lbs' },
                        ]}
                        value={field.value}
                      />
                    )}
                  />
                  <Controller
                    control={form.control}
                    name={values.weightUnit === 'kg' ? 'weightKg' : 'weightLbs'}
                    render={({ field, fieldState }) => (
                      <FormInput error={fieldState.error?.message} keyboardType="decimal-pad" label={`Weight (${values.weightUnit})`} onChangeText={field.onChange} value={field.value} />
                    )}
                  />
                  <View style={styles.metricCard}>
                    <Text style={styles.metricLabel}>BMI</Text>
                    <Text style={styles.metricValue}>{bmi ? bmi.toFixed(1) : '--'}</Text>
                    <Text style={styles.metricHint}>{bmiCategory(bmi)}</Text>
                    <Text style={styles.disclaimer}>BMI is only one health indicator and doesn't account for muscle mass.</Text>
                  </View>
                </>
              )}

              {currentStep === 'goal' && (
                <>
                  <QuestionHeader eyebrow="PRIMARY GOAL" title="What should Vita optimize for first?" />
                  <Controller control={form.control} name="goal" render={({ field }) => <SingleSelectCards onChange={field.onChange} options={goalOptions} value={field.value} />} />
                </>
              )}

              {currentStep === 'experience' && (
                <>
                  <QuestionHeader eyebrow="TRAINING AGE" title="How long have you been training?" />
                  <Controller control={form.control} name="experience" render={({ field }) => <SingleSelectCards onChange={field.onChange} options={experienceOptions} value={field.value} />} />
                </>
              )}

              {currentStep === 'availability' && (
                <>
                  <QuestionHeader eyebrow="SCHEDULE" title="How many days can you realistically train each week?" />
                  <Controller
                    control={form.control}
                    name="trainingDays"
                    render={({ field }) => (
                      <SingleSelectCards
                        onChange={field.onChange}
                        options={[1, 2, 3, 4, 5, 6, 7].map((day) => ({ label: `${day}`, value: `${day}` }))}
                        value={field.value}
                      />
                    )}
                  />
                </>
              )}

              {currentStep === 'location' && (
                <>
                  <QuestionHeader eyebrow="WHERE YOU TRAIN" title="Where will you work out most often?" />
                  <Controller control={form.control} name="workoutLocations" render={({ field }) => <MultiSelectCards onChange={field.onChange} options={locationOptions} value={field.value} />} />
                </>
              )}

              {currentStep === 'equipment' && (
                <>
                  <QuestionHeader eyebrow="EQUIPMENT" title="What equipment do you have access to?" />
                  <Controller control={form.control} name="equipment" render={({ field }) => <MultiSelectCards onChange={field.onChange} options={equipmentOptions} value={field.value} />} />
                </>
              )}

              {currentStep === 'lifestyle' && (
                <>
                  <QuestionHeader eyebrow="RECOVERY" title="What does your lifestyle look like?" />
                  <Text style={styles.fieldSection}>Average sleep</Text>
                  <Controller control={form.control} name="sleepAverage" render={({ field }) => <SingleSelectCards onChange={field.onChange} options={sleepOptions} value={field.value} />} />
                  <Text style={styles.fieldSection}>Activity level</Text>
                  <Controller control={form.control} name="activityLevel" render={({ field }) => <SingleSelectCards onChange={field.onChange} options={activityOptions} value={field.value} />} />
                  <Controller control={form.control} name="occupation" render={({ field }) => <FormInput label="Occupation (optional)" onChangeText={field.onChange} value={field.value} />} />
                </>
              )}

              {currentStep === 'nutrition' && (
                <>
                  <QuestionHeader eyebrow="NUTRITION" title="How should Vita shape meal guidance?" />
                  <Controller control={form.control} name="dietPreference" render={({ field }) => <SingleSelectCards onChange={field.onChange} options={dietOptions} value={field.value} />} />
                  <Controller control={form.control} name="allergies" render={({ field }) => <FormInput label="Food allergies (optional)" onChangeText={field.onChange} value={field.value} />} />
                </>
              )}

              {currentStep === 'injuries' && (
                <>
                  <QuestionHeader
                    eyebrow="MOVEMENT FILTERS"
                    subtitle="This is not medical advice. Vita uses it only to avoid exercises you prefer not to do."
                    title="Any movements or areas you'd like to avoid?"
                  />
                  <Controller control={form.control} name="avoidAreas" render={({ field }) => <MultiSelectCards onChange={field.onChange} options={avoidOptions} value={field.value} />} />
                  <Controller control={form.control} name="avoidNotes" render={({ field }) => <FormInput label="Notes (optional)" multiline onChangeText={field.onChange} value={field.value} />} />
                </>
              )}

              {currentStep === 'summary' && (
                <>
                  <QuestionHeader
                    eyebrow="READY"
                    subtitle="Your personalized Vita AI plan is ready."
                    title={`${values.firstName || 'Your'} profile summary`}
                  />
                  <View style={styles.summaryCard}>
                    <SummaryRow label="Name" value={values.firstName} />
                    <SummaryRow label="BMI" value={completion.bmiLabel} />
                    <SummaryRow label="Goal" value={labelFor(goalOptions, values.goal)} />
                    <SummaryRow label="Training" value={labelFor(experienceOptions, values.experience)} />
                    <SummaryRow label="Availability" value={`${values.trainingDays} Days`} />
                    <SummaryRow label="Equipment" value={values.equipment.includes('none') ? 'None' : `${values.equipment.length} selected`} />
                    <SummaryRow label="Sleep" value={labelFor(sleepOptions, values.sleepAverage)} />
                    <SummaryRow label="Estimated daily calories" value={completion.calories} />
                    <SummaryRow label="Estimated protein" value={completion.protein} />
                  </View>
                </>
              )}
            </ScrollView>
          </Animated.View>
          <View style={styles.nav}>
            <BackButton disabled={!canGoBack} onPress={back} />
            <ContinueButton label={currentStep === 'summary' ? 'Finish' : 'Continue'} onPress={next} />
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

function SummaryRow({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.summaryRow}>
      <Text style={styles.summaryLabel}>{label}</Text>
      <Text style={styles.summaryValue}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: { flex: 1 },
  content: { gap: 18, paddingBottom: 18 },
  disclaimer: { color: '#8E849D', fontSize: 11, lineHeight: 16, marginTop: 8 },
  fieldSection: { color: '#C9C1D6', fontSize: 12, fontWeight: '900', marginTop: 4 },
  keyboard: { flex: 1 },
  metricCard: {
    backgroundColor: '#15111B',
    borderColor: '#30263F',
    borderRadius: 20,
    borderWidth: 1,
    padding: 18,
  },
  metricHint: { color: '#A78BFA', fontSize: 13, fontWeight: '900', marginTop: 3 },
  metricLabel: { color: '#AFA6BC', fontSize: 11, fontWeight: '900', letterSpacing: 1 },
  metricValue: { color: '#FFFFFF', fontSize: 34, fontWeight: '900', marginTop: 4 },
  nav: { alignItems: 'center', flexDirection: 'row', justifyContent: 'space-between', gap: 12 },
  orbit: {
    alignItems: 'center',
    alignSelf: 'center',
    backgroundColor: '#7C3AED',
    borderRadius: 52,
    height: 104,
    justifyContent: 'center',
    shadowColor: '#7C3AED',
    shadowOpacity: 0.55,
    shadowRadius: 24,
    width: 104,
  },
  row: { flexDirection: 'row', gap: 10 },
  safe: { backgroundColor: '#08060D', flex: 1 },
  secondaryAction: { color: '#AFA6BC', fontSize: 13, fontWeight: '800', textAlign: 'center' },
  shell: { flex: 1, gap: 18, marginHorizontal: 'auto' as never, maxWidth: 620, padding: 22, width: '100%' },
  summaryCard: {
    backgroundColor: '#15111B',
    borderColor: '#30263F',
    borderRadius: 22,
    borderWidth: 1,
    overflow: 'hidden',
  },
  summaryLabel: { color: '#9F96AD', flex: 1, fontSize: 12, fontWeight: '800' },
  summaryRow: {
    borderBottomColor: '#282133',
    borderBottomWidth: 1,
    flexDirection: 'row',
    gap: 14,
    padding: 15,
  },
  summaryValue: { color: '#F6F1FC', flex: 1, fontSize: 13, fontWeight: '900', textAlign: 'right' },
  welcome: { flex: 1, gap: 24, justifyContent: 'center', minHeight: 520 },
});
