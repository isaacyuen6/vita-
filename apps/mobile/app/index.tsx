import { useEffect, useState, type ComponentProps } from 'react';
import {
  ActivityIndicator,
  Image,
  Platform,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { VitaApiClient } from '@vita/api-client';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import * as ImagePicker from 'expo-image-picker';
import { exerciseLibrary } from '../src/exercise-library';
import type { Exercise } from '../src/exercise-types';
import {
  estimateFoodPhoto,
  estimateFoodText,
  hasGroqFoodApiKey,
  type FoodPhotoEstimate,
} from '../src/food-analysis';
import { OnboardingFlow } from '../src/onboarding/OnboardingFlow';
import {
  buildTrainingPlan,
  buildSessionDay,
  coachReply,
  readinessScore,
  sessionTypeOptions,
  targets,
  type SessionType,
  type TabId,
  type TrainingDay,
} from '../src/vita-data';
import { useVitaData } from '../src/use-vita-data';

type ConnectionState = 'checking' | 'connected' | 'unavailable';
const apiUrl = process.env.EXPO_PUBLIC_API_URL ?? 'http://127.0.0.1:3000';
const api = new VitaApiClient(apiUrl);
const searchResultLimit = 8;
const popularExerciseNames = [
  'Bench Press',
  'Barbell Bench Press',
  'Incline Bench Press',
  'Barbell Incline Bench Press',
  'Push-Up',
  'Incline Push-Up',
  'Chest Dip',
  'Shoulder Press',
  'Dumbbell Seated Shoulder Press',
  'Dumbbell Shoulder Press',
  'Lateral Raise',
  'Dumbbell Lateral Raise',
  'Triceps Pushdown',
  'Cable Triceps Pushdown (V-Bar)',
  'Overhead Triceps Extension',
  'Dumbbell Seated Triceps Extension',
  'Pull-Up',
  'Lat Pulldown',
  'Cable Bar Lateral Pulldown',
  'Seated Cable Row',
  'Cable Seated Row',
  'Barbell Row',
  'Barbell Bent Over Row',
  'Dumbbell Biceps Curl',
  'Dumbbell Curl',
  'Dumbbell Hammer Curl',
  'Dumbbell Incline Curl',
  'Dumbbell Concentration Curl',
  'Barbell Curl',
  'Cable Curl',
  'Face Pull',
  'Squat',
  'Barbell Full Squat',
  'Goblet Squat',
  'Dumbbell Goblet Squat',
  'Barbell Full Squat',
  'Lunge',
  'Dumbbell Lunge',
  'Dumbbell Single Leg Split Squat',
  'Bulgarian Split Squat',
  'Dumbbell Romanian Deadlift',
  'Romanian Deadlift',
  'Deadlift',
  'Barbell Deadlift',
  'Leg Press',
  'Lever Alternate Leg Press',
  'Leg Extension',
  'Lever Leg Extension',
  'Leg Curl',
  'Lever Lying Leg Curl',
  'Calf Raise',
  'Bodyweight Standing Calf Raise',
];
const noisyExerciseTerms = [
  'stork stance',
  'exercise ball',
  'bosu',
  'leg raised',
  'bowling motion',
  'v sit',
  'one arm single leg',
  'stretch',
  'pull in',
  'revers ',
  'v. 2',
];

const normalizeSearchText = (value: string) =>
  value
    .toLowerCase()
    .replace(/\bbiceps\b/g, 'bicep')
    .replace(/\bpectorals\b/g, 'chest')
    .replace(/\bquadriceps\b/g, 'quads')
    .replace(/\blegs\b/g, 'leg')
    .replace(/[^a-z0-9]+/g, ' ')
    .trim();

const exerciseAliases: Record<string, string> = {
  'Bench Press': 'Barbell Bench Press',
  'Incline Bench Press': 'Barbell Incline Bench Press',
  'Bulgarian Split Squat': 'Dumbbell Single Leg Split Squat',
  'Dumbbell Curl': 'Dumbbell Biceps Curl',
  'Bicep Curl': 'Dumbbell Biceps Curl',
  'Leg Curl': 'Lever Lying Leg Curl',
  'Lat Pulldown': 'Cable Bar Lateral Pulldown',
  'Triceps Pushdown': 'Cable Pushdown',
  'Goblet Squat': 'Dumbbell Goblet Squat',
  'Romanian Deadlift': 'Dumbbell Romanian Deadlift',
  'Squat': 'Barbell Full Squat',
  'Lunge': 'Dumbbell Lunge',
  'Leg Press': 'Lever Alternate Leg Press',
  'Leg Extension': 'Lever Leg Extension',
  'Calf Raise': 'Bodyweight Standing Calf Raise',
  'Standing Calf Raise': 'Bodyweight Standing Calf Raise',
  'Barbell Row': 'Barbell Bent Over Row',
  'Seated Cable Row': 'Cable Seated Row',
  'Shoulder Press': 'Dumbbell Seated Shoulder Press',
  'Lateral Raise': 'Dumbbell Lateral Raise',
  'Overhead Triceps Extension': 'Dumbbell Seated Triceps Extension',
};

const exerciseSearchTags: Record<string, string> = {
  'Barbell Full Squat': 'leg legs quads glutes squat lower body popular',
  'Bodyweight Standing Calf Raise': 'leg legs calves calf lower body popular',
  'Dumbbell Biceps Curl': 'bicep biceps curl dumbbell arms popular',
  'Dumbbell Concentration Curl': 'bicep biceps curl dumbbell arms popular',
  'Dumbbell Goblet Squat': 'leg legs quads glutes squat lower body popular',
  'Dumbbell Hammer Curl': 'bicep biceps curl dumbbell arms popular',
  'Dumbbell Incline Curl': 'bicep biceps curl dumbbell arms popular',
  'Dumbbell Single Leg Split Squat': 'bulgarian split squat leg legs quads glutes popular',
  'Dumbbell Romanian Deadlift': 'leg legs hamstrings glutes hinge lower body popular',
  'Lever Alternate Leg Press': 'leg legs quads glutes press lower body popular',
  'Lever Leg Extension': 'leg legs quads extension lower body popular',
  'Lever Lying Leg Curl': 'leg legs hamstrings curl lower body popular',
  'Split Squats': 'bulgarian split squat leg legs quads glutes popular',
};

const curatedExercises = popularExerciseNames
  .map((name) => {
    const exact = exerciseLibrary.find((exercise) => exercise.name === name);
    if (exact) return exact;
    const alias = exerciseAliases[name];
    return alias ? exerciseLibrary.find((exercise) => exercise.name === alias) : undefined;
  })
  .filter((exercise): exercise is Exercise => Boolean(exercise));

function displayExerciseName(exercise: Exercise) {
  const alias = Object.entries(exerciseAliases).find(([, datasetName]) => datasetName === exercise.name);
  return alias?.[0] ?? exercise.name;
}

function scoreExerciseMatch(exercise: Exercise, query: string) {
  const normalizedQuery = normalizeSearchText(query);
  const name = normalizeSearchText(displayExerciseName(exercise));
  const datasetName = normalizeSearchText(exercise.name);
  const target = normalizeSearchText(exercise.target);
  const equipment = normalizeSearchText(exercise.equipment);
  const muscles = normalizeSearchText([...exercise.primary, ...exercise.secondary].join(' '));
  const tags = normalizeSearchText(exerciseSearchTags[exercise.name] ?? '');
  const searchable = [name, datasetName, target, equipment, muscles, tags].join(' ');
  if (!normalizedQuery || !searchable.includes(normalizedQuery)) return 0;

  let score = 20;
  if (name === normalizedQuery || datasetName === normalizedQuery) score += 100;
  if (name.startsWith(normalizedQuery) || datasetName.startsWith(normalizedQuery)) score += 70;
  if (name.includes(normalizedQuery) || datasetName.includes(normalizedQuery)) score += 45;
  if (popularExerciseNames.includes(displayExerciseName(exercise)) || popularExerciseNames.includes(exercise.name))
    score += 35;
  if (tags.includes(normalizedQuery)) score += 32;
  if (normalizedQuery === 'leg' && tags.includes('popular')) score += 70;
  if (target.includes(normalizedQuery)) score += 12;
  if (muscles.includes(normalizedQuery)) score += 10;
  if (equipment.includes(normalizedQuery)) score += 6;
  if (noisyExerciseTerms.some((term) => name.includes(term) || datasetName.includes(term))) score -= 80;
  if (name.length > 42) score -= 18;
  return score;
}

function findExerciseMatches(query: string) {
  const trimmedQuery = query.trim();
  if (trimmedQuery.length < 2) return [];
  const seen = new Set<string>();
  return curatedExercises
    .map((exercise) => ({ exercise, score: scoreExerciseMatch(exercise, trimmedQuery) }))
    .filter(({ exercise, score }) => {
      const displayName = displayExerciseName(exercise);
      if (score <= 0 || seen.has(displayName)) return false;
      seen.add(displayName);
      return true;
    })
    .sort((a, b) => b.score - a.score || displayExerciseName(a.exercise).length - displayExerciseName(b.exercise).length)
    .slice(0, searchResultLimit)
    .map(({ exercise }) => exercise);
}

const tabs: {
  id: TabId;
  label: string;
  icon: ComponentProps<typeof MaterialCommunityIcons>['name'];
  activeIcon: ComponentProps<typeof MaterialCommunityIcons>['name'];
}[] = [
  { id: 'today', label: 'Today', icon: 'calendar-heart', activeIcon: 'calendar-heart' },
  { id: 'train', label: 'Train', icon: 'dumbbell', activeIcon: 'weight-lifter' },
  { id: 'eat', label: 'Nutrition', icon: 'food-apple-outline', activeIcon: 'food-apple' },
  { id: 'progress', label: 'Progress', icon: 'chart-box-outline', activeIcon: 'chart-box' },
  {
    id: 'coach',
    label: 'Coach',
    icon: 'account-voice',
    activeIcon: 'account-heart',
  },
];

export default function HomeScreen() {
  const [tab, setTab] = useState<TabId>('today');
  const [connection, setConnection] = useState<ConnectionState>('checking');
  const { data, setData } = useVitaData();

  useEffect(() => {
    const controller = new AbortController();
    api
      .health(controller.signal)
      .then(() => setConnection('connected'))
      .catch(() => setConnection('unavailable'));
    return () => controller.abort();
  }, []);

  const calories = data.meals.reduce((sum, meal) => sum + meal.calories, 0);
  const protein = data.meals.reduce((sum, meal) => sum + meal.protein, 0);
  const score = readinessScore(data);
  const dayConsumptionPercent = Math.round(
    ((Math.min(calories / targets.calories, 1) +
      Math.min(protein / targets.protein, 1) +
      Math.min(data.waterMl / targets.waterMl, 1)) /
      3) *
      100,
  );

  if (!data.userProfile.onboardingCompleted) {
    return (
      <OnboardingFlow
        initialProfile={data.userProfile}
        onFinish={(profile) =>
          setData((current) => {
            const trainingPlan = buildTrainingPlan(Number(profile.trainingDays) || 3);
            return {
              ...current,
              completedSets: 0,
              currentTrainingDay: trainingPlan[0]?.id ?? current.currentTrainingDay,
              trainingPlan,
              userProfile: profile,
              workoutCompleted: false,
            };
          })
        }
      />
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.appShell}>
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.header}>
            <View>
              <Text style={styles.brand}>VITA AI</Text>
              <Text style={styles.date}>Wednesday, 22 July</Text>
            </View>
            <View accessibilityLabel={`API ${connection}`} style={styles.statusWrap}>
              {connection === 'checking' ? (
                <ActivityIndicator size="small" color="#A78BFA" />
              ) : (
                <View
                  style={[
                    styles.statusDot,
                    connection === 'connected' ? styles.statusOnline : styles.statusOffline,
                  ]}
                />
              )}
            </View>
          </View>

          {tab === 'today' && (
            <TodayScreen
              calories={calories}
              protein={protein}
              score={score}
              dayConsumptionPercent={dayConsumptionPercent}
              setTab={setTab}
              data={data}
            />
          )}
          {tab === 'train' && <TrainScreen data={data} setData={setData} />}
          {tab === 'eat' && (
            <EatScreen data={data} setData={setData} calories={calories} protein={protein} />
          )}
          {tab === 'progress' && (
            <ProgressScreen data={data} setData={setData} score={score} protein={protein} />
          )}
          {tab === 'coach' && <CoachScreen data={data} />}
        </ScrollView>

        <View accessibilityRole="tablist" style={styles.tabBar}>
          {tabs.map((item) => (
            <Pressable
              accessibilityRole="tab"
              accessibilityState={{ selected: tab === item.id }}
              key={item.id}
              onPress={() => setTab(item.id)}
              style={({ pressed }) => [styles.tabButton, pressed && styles.tabButtonPressed]}
            >
              {tab === item.id && <View style={styles.activeGlow} />}
              <View style={[styles.tabIconWrap, tab === item.id && styles.tabIconWrapActive]}>
                <MaterialCommunityIcons
                color={tab === item.id ? '#FFFFFF' : '#817A90'}
                  name={tab === item.id ? item.activeIcon : item.icon}
                  size={26}
                />
              </View>
              <Text style={[styles.tabLabel, tab === item.id && styles.tabActive]}>
                {item.label}
              </Text>
            </Pressable>
          ))}
        </View>
      </View>
    </SafeAreaView>
  );
}

function TodayScreen({
  calories,
  protein,
  score,
  dayConsumptionPercent,
  setTab,
  data,
}: {
  calories: number;
  protein: number;
  score: number;
  dayConsumptionPercent: number;
  setTab: (tab: TabId) => void;
  data: ReturnType<typeof useVitaData>['data'];
}) {
  return (
    <View style={styles.screen}>
      <View style={styles.heroRow}>
        <View style={styles.heroCopy}>
          <Text style={styles.kicker}>GOOD AFTERNOON</Text>
          <Text style={styles.pageTitle}>Here’s your plan for today.</Text>
        </View>
        <DayRing percent={dayConsumptionPercent} />
      </View>

      <View style={styles.priorityCard}>
        <Text style={styles.cardEyebrow}>TODAY’S FOCUS</Text>
        <Text style={styles.darkTitle}>
          {score < 65
            ? 'Build energy, don’t chase fatigue'
            : 'Full-body strength, controlled effort'}
        </Text>
        <Text style={styles.darkBody}>
          Your sleep was below the 8-hour target. Keep 2–3 reps in reserve and finish with easy
          mobility.
        </Text>
        <Pressable onPress={() => setTab('train')} style={styles.primaryButton}>
          <Text style={styles.primaryButtonText}>
            {data.workoutCompleted ? 'View completed workout' : 'Start 32 min workout'}
          </Text>
          <Text style={styles.primaryButtonText}>→</Text>
        </Pressable>
      </View>

      <SectionTitle title="Daily targets" action="View details" />
      <View style={styles.twoColumns}>
        <MetricCard
          label="Calories"
          value={`${calories}`}
          suffix={`/ ${targets.calories}`}
          progress={calories / targets.calories}
          accent="#C084FC"
        />
        <MetricCard
          label="Protein"
          value={`${protein} g`}
          suffix={`/ ${targets.protein} g`}
          progress={protein / targets.protein}
          accent="#8B5CF6"
        />
      </View>
      <View style={styles.twoColumns}>
        <MetricCard
          label="Sleep"
          value={`${data.sleepHours} h`}
          suffix="/ 8 h"
          progress={data.sleepHours / 8}
          accent="#A78BFA"
        />
        <MetricCard
          label="Water"
          value={`${(data.waterMl / 1000).toFixed(1)} L`}
          suffix="/ 2.5 L"
          progress={data.waterMl / targets.waterMl}
          accent="#7C3AED"
        />
      </View>

      <SectionTitle title="Three priorities" />
      <View style={styles.listCard}>
        <Priority
          number="1"
          title="Complete strength session"
          detail="Moderate effort · 32 minutes"
          done={data.workoutCompleted}
        />
        <Priority
          number="2"
          title={`Add ${Math.max(targets.protein - protein, 0)} g protein`}
          detail="Two protein-rich meals will cover it"
        />
        <Priority
          number="3"
          title="Wind down by 10:45 PM"
          detail="A consistent bedtime supports recovery"
          last
        />
      </View>

      <SectionTitle title="Quick actions" />
      <View style={styles.quickGrid}>
        <QuickAction icon="＋" label="Log meal" onPress={() => setTab('eat')} />
        <QuickAction icon="◆" label="Start workout" onPress={() => setTab('train')} />
        <QuickAction icon="✦" label="Ask coach" onPress={() => setTab('coach')} />
      </View>
    </View>
  );
}

function TrainScreen({
  data,
  setData,
}: {
  data: ReturnType<typeof useVitaData>['data'];
  setData: ReturnType<typeof useVitaData>['setData'];
}) {
  const [exerciseQuery, setExerciseQuery] = useState('');
  const [manualExerciseName, setManualExerciseName] = useState('');
  const [selectedExercise, setSelectedExercise] = useState<Exercise | null>(null);
  const [weeklyDays, setWeeklyDays] = useState(String(data.trainingPlan.length || 3));
  const filteredExercises = findExerciseMatches(exerciseQuery);
  const hasExerciseQuery = exerciseQuery.trim().length >= 2;
  const selectedPlan =
    data.trainingPlan.find((day) => day.id === data.currentTrainingDay) ?? data.trainingPlan[0];
  const totalSets = Math.max((selectedPlan?.exercises.length ?? 0) * 3, 1);

  function setTrainingDay(day: TrainingDay) {
    setData((current) => ({
      ...current,
      completedSets: 0,
      currentTrainingDay: day,
      workoutCompleted: false,
    }));
  }

  function regenerateWeeklyPlan(daysText: string) {
    const nextPlan = buildTrainingPlan(Number(daysText) || 3);
    setWeeklyDays(daysText);
    setData((current) => ({
      ...current,
      completedSets: 0,
      currentTrainingDay: nextPlan[0]?.id ?? current.currentTrainingDay,
      trainingPlan: nextPlan,
      userProfile: { ...current.userProfile, trainingDays: daysText },
      workoutCompleted: false,
    }));
  }

  function updateCurrentSessionType(sessionType: SessionType) {
    setData((current) => ({
      ...current,
      completedSets: 0,
      trainingPlan: current.trainingPlan.map((day, index) =>
        day.id === current.currentTrainingDay ? buildSessionDay(sessionType, index) : day,
      ),
      workoutCompleted: false,
    }));
  }

  function addExerciseToPlan(name: string, load = 'Custom') {
    const cleanName = name.trim();
    if (!cleanName || !selectedPlan) return;
    setData((current) => ({
      ...current,
      trainingPlan: current.trainingPlan.map((day) =>
        day.id === current.currentTrainingDay
          ? {
              ...day,
              exercises: [
                ...day.exercises,
                {
                  id: `${day.id}-${Date.now()}`,
                  load,
                  name: cleanName,
                  prescription: '3 x 8-12',
                },
              ],
            }
          : day,
      ),
    }));
    setManualExerciseName('');
  }

  function removeExerciseFromPlan(id: string) {
    setData((current) => ({
      ...current,
      trainingPlan: current.trainingPlan.map((day) =>
        day.id === current.currentTrainingDay
          ? { ...day, exercises: day.exercises.filter((exercise) => exercise.id !== id) }
          : day,
      ),
    }));
  }

  if (selectedExercise) {
    return <ExerciseDetail exercise={selectedExercise} onBack={() => setSelectedExercise(null)} />;
  }

  return (
    <View style={styles.screen}>
      <Text style={styles.kicker}>TRAIN</Text>
      <Text style={styles.pageTitle}>{selectedPlan?.label ?? 'Training'} day</Text>
      <Text style={styles.pageSubtitle}>Build and remember your weekly session plan</Text>

      <View style={styles.planSetupCard}>
        <Text style={styles.cardEyebrow}>WEEKLY PLAN</Text>
        <Text style={styles.exerciseName}>How many days are you targeting?</Text>
        <View style={styles.dayPicker}>
          {[1, 2, 3, 4, 5, 6, 7].map((day) => (
            <Pressable
              key={day}
              onPress={() => regenerateWeeklyPlan(String(day))}
              style={[styles.dayPill, weeklyDays === String(day) && styles.dayPillActive]}
            >
              <Text style={[styles.dayPillText, weeklyDays === String(day) && styles.dayPillTextActive]}>
                {day}
              </Text>
            </Pressable>
          ))}
        </View>
      </View>

      <View style={styles.exerciseSearch}>
        <MaterialCommunityIcons color="#A78BFA" name="magnify" size={23} />
        <TextInput
          accessibilityLabel="Search exercises or muscles"
          onChangeText={setExerciseQuery}
          placeholder="Search exercises to add"
          placeholderTextColor="#746D80"
          style={styles.exerciseSearchInput}
          value={exerciseQuery}
        />
        {!!exerciseQuery && (
          <Pressable accessibilityLabel="Clear search" onPress={() => setExerciseQuery('')}>
            <MaterialCommunityIcons color="#918A9E" name="close-circle" size={20} />
          </Pressable>
        )}
      </View>

      {hasExerciseQuery && (
        <>
          <View>
            <Text style={styles.libraryTitle}>Top exercise matches</Text>
            <Text style={styles.librarySubtitle}>
              Showing common gym exercises for "{exerciseQuery.trim()}"
            </Text>
          </View>
          <View style={styles.exerciseLibrary}>
            {filteredExercises.map((exercise) => (
              <Pressable
                key={exercise.id}
                onPress={() => addExerciseToPlan(displayExerciseName(exercise), exercise.equipment)}
                style={({ pressed }) => [styles.libraryRow, pressed && styles.libraryRowPressed]}
              >
                <View style={styles.libraryIcon}>
                  <MaterialCommunityIcons color="#C4B5FD" name="plus" size={23} />
                </View>
                <View style={styles.exerciseCopy}>
                  <Text style={styles.exerciseName}>{displayExerciseName(exercise)}</Text>
                  <Text style={styles.mutedText}>
                    {exercise.target} - {exercise.equipment} - tap to add
                  </Text>
                </View>
                <Pressable
                  accessibilityLabel={`View form for ${displayExerciseName(exercise)}`}
                  onPress={() => setSelectedExercise(exercise)}
                  style={styles.iconButton}
                >
                  <MaterialCommunityIcons color="#AFA6BC" name="information-outline" size={22} />
                </Pressable>
              </Pressable>
            ))}
            {!filteredExercises.length && (
              <View style={styles.emptySearch}>
                <Text style={styles.exerciseName}>No common match yet</Text>
                <Text style={styles.mutedText}>
                  Try bench, row, curl, squat, lunge, leg press, or pulldown.
                </Text>
              </View>
            )}
          </View>
        </>
      )}

      <SectionTitle title="Today?s session" />
      <View style={styles.planTabs}>
        {data.trainingPlan.map((day) => (
          <Pressable
            key={day.id}
            onPress={() => setTrainingDay(day.id)}
            style={[styles.planTab, data.currentTrainingDay === day.id && styles.planTabActive]}
          >
            <Text
              style={[
                styles.planTabText,
                data.currentTrainingDay === day.id && styles.planTabTextActive,
              ]}
            >
              {day.label}
            </Text>
          </Pressable>
        ))}
      </View>

      <View style={styles.sessionTypeCard}>
        <Text style={styles.cardEyebrow}>SESSION TYPE</Text>
        <View style={styles.sessionTypeGrid}>
          {sessionTypeOptions.map((option) => (
            <Pressable
              key={option.value}
              onPress={() => updateCurrentSessionType(option.value)}
              style={[
                styles.sessionTypePill,
                selectedPlan?.sessionType === option.value && styles.sessionTypePillActive,
              ]}
            >
              <Text
                style={[
                  styles.sessionTypeText,
                  selectedPlan?.sessionType === option.value && styles.sessionTypeTextActive,
                ]}
              >
                {option.label}
              </Text>
            </Pressable>
          ))}
        </View>
      </View>

      <View style={styles.manualExerciseCard}>
        <TextInput
          accessibilityLabel="Enter exercise name"
          onChangeText={setManualExerciseName}
          placeholder="Enter exercise, e.g. Bench Press"
          placeholderTextColor="#746D80"
          style={styles.manualExerciseInput}
          value={manualExerciseName}
        />
        <Pressable onPress={() => addExerciseToPlan(manualExerciseName)} style={styles.addExerciseButton}>
          <MaterialCommunityIcons color="#FFFFFF" name="plus" size={20} />
        </Pressable>
      </View>

      <View style={styles.workoutHeader}>
        <View>
          <Text style={styles.cardEyebrow}>SESSION PROGRESS</Text>
          <Text style={styles.workoutProgress}>
            {data.completedSets} of {totalSets} sets
          </Text>
        </View>
        <Text style={styles.workoutPercent}>
          {Math.round((data.completedSets / totalSets) * 100)}%
        </Text>
      </View>
      <ProgressBar value={data.completedSets / totalSets} color="#8B5CF6" />

      <View style={styles.exerciseList}>
        {selectedPlan?.exercises.map((exercise, index) => (
          <View key={exercise.id} style={styles.exerciseRow}>
            <View style={styles.exerciseNumber}>
              <Text style={styles.exerciseNumberText}>{index + 1}</Text>
            </View>
            <View style={styles.exerciseCopy}>
              <Text style={styles.exerciseName}>{exercise.name}</Text>
              <Text style={styles.mutedText}>
                {exercise.prescription} - {exercise.load}
              </Text>
            </View>
            <Pressable accessibilityLabel={`Remove ${exercise.name}`} onPress={() => removeExerciseFromPlan(exercise.id)}>
              <MaterialCommunityIcons color="#918A9E" name="close" size={21} />
            </Pressable>
          </View>
        ))}
      </View>

      {!data.workoutCompleted ? (
        <View style={styles.actionStack}>
          <Pressable
            onPress={() =>
              setData((current) => ({
                ...current,
                completedSets: Math.min(current.completedSets + 1, totalSets),
              }))
            }
            style={styles.secondaryButton}
          >
            <Text style={styles.secondaryButtonText}>Log completed set</Text>
          </Pressable>
          <Pressable
            onPress={() =>
              setData((current) => ({
                ...current,
                completedSets: totalSets,
                workoutCompleted: true,
              }))
            }
            style={styles.primaryButton}
          >
            <Text style={styles.primaryButtonText}>Complete workout</Text>
            <MaterialCommunityIcons color="#FFFFFF" name="check" size={18} />
          </Pressable>
          <Text style={styles.safetyText}>
            Stop if you feel sharp, sudden, severe, or worsening pain. Vita does not diagnose
            injuries.
          </Text>
        </View>
      ) : (
        <View style={styles.successCard}>
          <Text style={styles.successTitle}>Workout complete</Text>
          <Text style={styles.bodyText}>Nice work. Today?s volume is saved on this device.</Text>
        </View>
      )}
    </View>
  );
}

function ExerciseDetail({
  exercise,
  onBack,
}: {
  exercise: Exercise;
  onBack: () => void;
}) {
  return (
    <View style={styles.screen}>
      <Pressable accessibilityLabel="Back to exercise library" onPress={onBack} style={styles.backButton}>
        <MaterialCommunityIcons color="#C4B5FD" name="arrow-left" size={21} />
        <Text style={styles.backButtonText}>Exercise library</Text>
      </Pressable>

      <View>
        <Text style={styles.kicker}>{exercise.target.toUpperCase()}</Text>
        <Text style={styles.pageTitle}>{displayExerciseName(exercise)}</Text>
        <Text style={styles.pageSubtitle}>{exercise.equipment}</Text>
      </View>

      <View style={styles.anatomyCard}>
        <View style={styles.anatomyHeader}>
          <View>
            <Text style={styles.cardEyebrow}>MUSCLES TARGETED</Text>
            <Text style={styles.anatomyTitle}>{exercise.primary.join(' · ')}</Text>
          </View>
          <View style={styles.primaryLegend}>
            <View style={styles.legendDot} />
            <Text style={styles.legendText}>PRIMARY</Text>
          </View>
        </View>
        <MuscleMap exercise={exercise} />
        <Text style={styles.anatomySource}>
          Muscle map uses app-native regions matched from each exercise target muscle.
        </Text>
        <View style={styles.muscleSummary}>
          <View style={styles.muscleColumn}>
            <Text style={styles.muscleLabel}>PRIMARY</Text>
            <Text style={styles.muscleValue}>{exercise.primary.join(', ')}</Text>
          </View>
          <View style={styles.muscleColumn}>
            <Text style={styles.muscleLabel}>SECONDARY</Text>
            <Text style={styles.muscleValue}>{exercise.secondary.join(', ')}</Text>
          </View>
        </View>
      </View>

      <SectionTitle title="Correct form" />
      <View style={styles.formSteps}>
        {exercise.form.map((step, index) => (
          <View key={step} style={styles.formStep}>
            <View style={styles.formStepNumber}>
              <Text style={styles.formStepNumberText}>{index + 1}</Text>
            </View>
            <Text style={styles.formStepText}>{step}</Text>
          </View>
        ))}
      </View>

      <View style={styles.formTip}>
        <MaterialCommunityIcons color="#FCA5A5" name="shield-check-outline" size={24} />
        <View style={styles.exerciseCopy}>
          <Text style={styles.formTipTitle}>Quality before load</Text>
          <Text style={styles.formTipText}>
            Use a weight you can control through every listed step. Stop for sharp or worsening
            pain, and keep each rep smooth before adding load.
          </Text>
        </View>
      </View>
    </View>
  );
}

function regionHits(exercise: Exercise, matcher: (region: Exercise['regions'][number]) => boolean) {
  return exercise.regions.some(matcher);
}

function MuscleMap({ exercise }: { exercise: Exercise }) {
  const active = {
    abs: regionHits(exercise, (region) => region.left >= 40 && region.left <= 48 && region.top >= 30 && region.top <= 42),
    arms: regionHits(exercise, (region) => region.top >= 25 && region.top <= 42 && (region.left < 34 || region.left > 66)),
    calves: regionHits(exercise, (region) => region.top >= 74),
    chest: regionHits(exercise, (region) => region.left >= 33 && region.left <= 37 && region.top >= 20 && region.width >= 25),
    forearms: regionHits(exercise, (region) => region.top >= 38 && region.top <= 53 && (region.left < 30 || region.left > 70)),
    lats: regionHits(exercise, (region) => region.top >= 25 && region.top <= 45 && region.width <= 14),
    legs: regionHits(exercise, (region) => region.top >= 52 && region.top < 74),
    neck: regionHits(exercise, (region) => region.top < 19),
    shoulders: regionHits(exercise, (region) => region.top >= 18 && region.top <= 24 && (region.left < 38 || region.left > 62)),
    traps: regionHits(exercise, (region) => region.top >= 14 && region.top <= 24 && region.width >= 20),
  };
  const hot = (isActive: boolean) => [styles.bodyMuscle, isActive && styles.bodyMuscleActive];

  return (
    <View
      accessibilityLabel={`Muscle map showing muscles used in ${displayExerciseName(exercise)}`}
      style={styles.muscleMapStage}
    >
      <View style={styles.mapStatLeft}>
        <Text style={styles.mapStatNumber}>{exercise.form.length}</Text>
        <Text style={styles.mapStatLabel}>FORM STEPS</Text>
      </View>
      <View style={styles.mapStatRight}>
        <Text style={styles.mapStatNumber}>{Math.max(exercise.primary.length + exercise.secondary.length, 1)}</Text>
        <Text style={styles.mapStatLabel}>MUSCLE GROUPS</Text>
      </View>

      <View style={styles.bodyFigure}>
        <View style={[styles.bodyPart, styles.bodyHead]} />
        <View style={[styles.bodyPart, styles.bodyNeck, active.neck && styles.bodyPartActive]} />
        <View style={[styles.bodyPart, styles.bodyTorso]} />
        <View style={[styles.bodyMuscle, styles.trapGroup, (active.traps || active.neck || active.shoulders || active.lats) && styles.bodyMuscleActive]} />
        <View style={[styles.bodyMuscle, styles.chestLeft, active.chest && styles.bodyMuscleActive]} />
        <View style={[styles.bodyMuscle, styles.chestRight, active.chest && styles.bodyMuscleActive]} />
        <View style={[styles.bodyMuscle, styles.abUpper, active.abs && styles.bodyMuscleActive]} />
        <View style={[styles.bodyMuscle, styles.abMid, active.abs && styles.bodyMuscleActive]} />
        <View style={[styles.bodyMuscle, styles.abLower, active.abs && styles.bodyMuscleActive]} />
        <View style={[styles.bodyMuscle, styles.latLeft, active.lats && styles.bodyMuscleActive]} />
        <View style={[styles.bodyMuscle, styles.latRight, active.lats && styles.bodyMuscleActive]} />
        <View style={[styles.bodyPart, styles.shoulderLeft, active.shoulders && styles.bodyPartActive]} />
        <View style={[styles.bodyPart, styles.shoulderRight, active.shoulders && styles.bodyPartActive]} />
        <View style={[styles.bodyPart, styles.upperArmLeft, active.arms && styles.bodyPartActive]} />
        <View style={[styles.bodyPart, styles.upperArmRight, active.arms && styles.bodyPartActive]} />
        <View style={[styles.bodyPart, styles.forearmLeft, active.forearms && styles.bodyPartActive]} />
        <View style={[styles.bodyPart, styles.forearmRight, active.forearms && styles.bodyPartActive]} />
        <View style={[styles.bodyPart, styles.handLeft]} />
        <View style={[styles.bodyPart, styles.handRight]} />
        <View style={[styles.bodyPart, styles.hipLeft, active.legs && styles.bodyPartActive]} />
        <View style={[styles.bodyPart, styles.hipRight, active.legs && styles.bodyPartActive]} />
        <View style={[styles.bodyPart, styles.quadLeft, active.legs && styles.bodyPartActive]} />
        <View style={[styles.bodyPart, styles.quadRight, active.legs && styles.bodyPartActive]} />
        <View style={[styles.bodyPart, styles.lowerLegLeft, (active.legs || active.calves) && styles.bodyPartActive]} />
        <View style={[styles.bodyPart, styles.lowerLegRight, (active.legs || active.calves) && styles.bodyPartActive]} />
        <View style={[styles.bodyPart, styles.footLeft]} />
        <View style={[styles.bodyPart, styles.footRight]} />
      </View>
    </View>
  );
}

function EatScreen({
  data,
  setData,
  calories,
  protein,
}: {
  data: ReturnType<typeof useVitaData>['data'];
  setData: ReturnType<typeof useVitaData>['setData'];
  calories: number;
  protein: number;
}) {
  const [showForm, setShowForm] = useState(false);
  const [mealName, setMealName] = useState('');
  const [mealItems, setMealItems] = useState<string[]>(['']);
  const [manualEstimate, setManualEstimate] = useState<FoodPhotoEstimate | null>(null);
  const [foodEstimate, setFoodEstimate] = useState<FoodPhotoEstimate | null>(null);
  const [foodPhotoUri, setFoodPhotoUri] = useState('');
  const [foodScanError, setFoodScanError] = useState('');
  const [manualMealError, setManualMealError] = useState('');
  const [groqKey, setGroqKey] = useState(() =>
    Platform.OS === 'web' ? window.localStorage.getItem('vita-groq-key') ?? '' : '',
  );
  const [isScanningFood, setIsScanningFood] = useState(false);
  const [isEstimatingManualMeal, setIsEstimatingManualMeal] = useState(false);
  const needsGroqKey = !hasGroqFoodApiKey();

  function saveEstimate(
    estimate: FoodPhotoEstimate,
    fallbackName: string,
    source: 'manual' | 'photo',
  ) {
    const mealLabel =
      mealName.trim() ||
      (estimate.items.length > 0
        ? estimate.items.map((item) => item.name).slice(0, 3).join(', ')
        : fallbackName);
    setData((current) => ({
      ...current,
      meals: [
        ...current.meals,
        {
          id: `${Date.now()}`,
          name: mealLabel,
          calories: estimate.totals.calories,
          carbs: estimate.totals.carbsG,
          confidence: estimate.confidence,
          fat: estimate.totals.fatG,
          protein: estimate.totals.proteinG,
          source,
          time: 'Just now',
        },
      ],
    }));
    setMealName('');
    setMealItems(['']);
    setManualEstimate(null);
    setShowForm(false);
  }

  function updateMealItem(index: number, value: string) {
    setMealItems((items) => items.map((item, itemIndex) => (itemIndex === index ? value : item)));
    setManualEstimate(null);
  }

  function addMealItem() {
    setMealItems((items) => [...items, '']);
  }

  function removeMealItem(index: number) {
    setMealItems((items) => {
      const next = items.filter((_, itemIndex) => itemIndex !== index);
      return next.length ? next : [''];
    });
    setManualEstimate(null);
  }

  async function estimateManualMeal() {
    const itemText = mealItems.map((item) => item.trim()).filter(Boolean);
    const description = [mealName.trim(), ...itemText].filter(Boolean).join(', ');
    if (!description) {
      setManualMealError('Enter a meal name or at least one food item first.');
      return;
    }
    setManualMealError('');
    setIsEstimatingManualMeal(true);
    try {
      if (needsGroqKey && Platform.OS === 'web') {
        window.localStorage.setItem('vita-groq-key', groqKey.trim());
      }
      setManualEstimate(await estimateFoodText(description, groqKey));
    } catch (error) {
      setManualMealError(error instanceof Error ? error.message : 'Meal estimate failed.');
    } finally {
      setIsEstimatingManualMeal(false);
    }
  }

  async function analyzeFood(source: 'camera' | 'library') {
    setFoodScanError('');
    const permission =
      source === 'camera'
        ? await ImagePicker.requestCameraPermissionsAsync()
        : await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      setFoodScanError('Photo permission is required to estimate meal calories.');
      return;
    }

    const result =
      source === 'camera'
        ? await ImagePicker.launchCameraAsync({
            allowsEditing: true,
            base64: true,
            exif: false,
            quality: 0.75,
          })
        : await ImagePicker.launchImageLibraryAsync({
            allowsEditing: true,
            base64: true,
            exif: false,
            mediaTypes: ['images'],
            quality: 0.75,
          });

    if (result.canceled) return;
    const asset = result.assets[0];
    if (!asset?.base64) {
      setFoodScanError('Could not read the selected image. Try another photo.');
      return;
    }

    setFoodPhotoUri(asset.uri);
    setIsScanningFood(true);
    try {
      if (needsGroqKey && Platform.OS === 'web') {
        window.localStorage.setItem('vita-groq-key', groqKey.trim());
      }
      setFoodEstimate(await estimateFoodPhoto(asset.base64, groqKey));
    } catch (error) {
      setFoodScanError(error instanceof Error ? error.message : 'Food analysis failed.');
    } finally {
      setIsScanningFood(false);
    }
  }

  function saveFoodEstimate() {
    if (!foodEstimate) return;
    saveEstimate(foodEstimate, 'Photo meal estimate', 'photo');
    setFoodEstimate(null);
    setFoodPhotoUri('');
  }

  return (
    <View style={styles.screen}>
      <Text style={styles.kicker}>EAT</Text>
      <Text style={styles.pageTitle}>Fuel your day</Text>
      <Text style={styles.pageSubtitle}>Estimates stay editable until you confirm them.</Text>

      <View style={styles.nutritionHero}>
        <View style={styles.nutritionMetric}>
          <Text style={styles.cardEyebrow}>CALORIES</Text>
          <Text style={styles.bigMetric}>{calories}</Text>
          <Text style={styles.mutedText}>
            {Math.max(targets.calories - calories, 0)} kcal remaining
          </Text>
        </View>
        <View style={styles.macroRight}>
          <Text style={styles.cardEyebrow}>PROTEIN</Text>
          <Text style={styles.bigMetric}>{protein} g</Text>
          <Text style={styles.mutedText}>Target {targets.protein} g</Text>
        </View>
      </View>
      <ProgressBar value={calories / targets.calories} color="#C084FC" />

      <View style={styles.scanCard}>
        <View style={styles.scanIcon}>
          <MaterialCommunityIcons color="#FFF" name="camera-iris" size={22} />
        </View>
        <View style={styles.scanCopy}>
          <Text style={styles.exerciseName}>Analyze a meal photo</Text>
          <Text style={styles.mutedText}>
            Take or upload a food photo to estimate calories, protein, carbs, and fat.
          </Text>
        </View>
      </View>
      <View style={styles.photoActions}>
        <Pressable
          disabled={isScanningFood}
          onPress={() => void analyzeFood('camera')}
          style={[styles.photoActionButton, isScanningFood && styles.disabledButton]}
        >
          <MaterialCommunityIcons color="#FFF" name="camera" size={18} />
          <Text style={styles.photoActionText}>Take photo</Text>
        </Pressable>
        <Pressable
          disabled={isScanningFood}
          onPress={() => void analyzeFood('library')}
          style={[styles.photoActionButton, styles.photoActionSecondary, isScanningFood && styles.disabledButton]}
        >
          <MaterialCommunityIcons color="#B79CFF" name="image" size={18} />
          <Text style={styles.photoActionSecondaryText}>Choose photo</Text>
        </Pressable>
      </View>
      {needsGroqKey && (
        <View style={styles.apiKeyCard}>
          <Text style={styles.exerciseName}>Groq key for photo testing</Text>
          <Text style={styles.mutedText}>
            Stored only in this browser so it does not get published inside the PWA bundle.
          </Text>
          <TextInput
            autoCapitalize="none"
            autoCorrect={false}
            onChangeText={setGroqKey}
            placeholder="Paste Groq API key"
            placeholderTextColor="#746D80"
            secureTextEntry
            style={styles.input}
            value={groqKey}
          />
        </View>
      )}
      {isScanningFood && (
        <View style={styles.analysisCard}>
          <ActivityIndicator color="#C084FC" />
          <Text style={styles.exerciseName}>Estimating nutrition…</Text>
          <Text style={styles.mutedText}>Vita is reading visible foods and portions.</Text>
        </View>
      )}
      {!!foodScanError && (
        <View style={styles.errorCard}>
          <Text style={styles.exerciseName}>Couldn’t analyze that meal</Text>
          <Text style={styles.mutedText}>{foodScanError}</Text>
        </View>
      )}
      {foodEstimate && (
        <View style={styles.analysisCard}>
          {!!foodPhotoUri && <Image source={{ uri: foodPhotoUri }} style={styles.foodPreview} />}
          <View>
            <Text style={styles.cardEyebrow}>PHOTO ESTIMATE</Text>
            <Text style={styles.sectionTitle}>{foodEstimate.totals.calories} kcal</Text>
            <Text style={styles.mutedText}>
              Confidence {Math.round(foodEstimate.confidence * 100)}% · confirm before logging
            </Text>
          </View>
          <View style={styles.analysisTotals}>
            <Stat label="Protein" trend="estimated" value={`${foodEstimate.totals.proteinG} g`} />
            <Stat label="Carbs" trend="estimated" value={`${foodEstimate.totals.carbsG} g`} />
            <Stat label="Fat" trend="estimated" value={`${foodEstimate.totals.fatG} g`} />
          </View>
          <View style={styles.foodItems}>
            {foodEstimate.items.map((item, index) => (
              <View key={`${item.name}-${index}`} style={styles.foodItemRow}>
                <View style={styles.exerciseCopy}>
                  <Text style={styles.exerciseName}>{item.name}</Text>
                  <Text style={styles.mutedText}>
                    {item.portion} · P {item.proteinG}g · C {item.carbsG}g · F {item.fatG}g
                  </Text>
                </View>
                <Text style={styles.foodCalories}>{item.calories} kcal</Text>
              </View>
            ))}
          </View>
          {!!foodEstimate.assumptions.length && (
            <Text style={styles.estimateDisclaimer}>
              Assumptions: {foodEstimate.assumptions.slice(0, 3).join(' · ')}
            </Text>
          )}
          <Text style={styles.estimateDisclaimer}>{foodEstimate.notes}</Text>
          <Pressable onPress={saveFoodEstimate} style={styles.secondaryButton}>
            <Text style={styles.secondaryButtonText}>Save estimated meal</Text>
          </Pressable>
        </View>
      )}

      <Pressable onPress={() => setShowForm((visible) => !visible)} style={styles.primaryButton}>
        <Text style={styles.primaryButtonText}>＋ Add meal manually</Text>
      </Pressable>
      {showForm && (
        <View style={styles.formCard}>
          <TextInput
            accessibilityLabel="Meal name"
            onChangeText={setMealName}
            placeholder="Meal name, e.g. chicken rice"
            placeholderTextColor="#746D80"
            style={styles.input}
            value={mealName}
          />
          <View style={styles.manualItems}>
            {mealItems.map((item, index) => (
              <View key={index} style={styles.manualItemRow}>
                <TextInput
                  accessibilityLabel={`Food item ${index + 1}`}
                  onChangeText={(value) => updateMealItem(index, value)}
                  placeholder={index === 0 ? 'Food item, e.g. grilled chicken breast' : 'Another item'}
                  placeholderTextColor="#746D80"
                  style={[styles.input, styles.flexInput]}
                  value={item}
                />
                <Pressable
                  accessibilityLabel={`Remove food item ${index + 1}`}
                  onPress={() => removeMealItem(index)}
                  style={styles.removeItemButton}
                >
                  <MaterialCommunityIcons color="#B79CFF" name="minus" size={18} />
                </Pressable>
              </View>
            ))}
          </View>
          <Pressable onPress={addMealItem} style={styles.addItemButton}>
            <MaterialCommunityIcons color="#B79CFF" name="plus" size={18} />
            <Text style={styles.secondaryButtonText}>Add item</Text>
          </Pressable>
          {!!manualMealError && (
            <View style={styles.errorCard}>
              <Text style={styles.mutedText}>{manualMealError}</Text>
            </View>
          )}
          {isEstimatingManualMeal && (
            <View style={styles.analysisCard}>
              <ActivityIndicator color="#C084FC" />
              <Text style={styles.exerciseName}>Estimating meal…</Text>
            </View>
          )}
          {manualEstimate && (
            <View style={styles.analysisCard}>
              <View>
                <Text style={styles.cardEyebrow}>AI MEAL ESTIMATE</Text>
                <Text style={styles.sectionTitle}>{manualEstimate.totals.calories} kcal</Text>
                <Text style={styles.mutedText}>
                  P {manualEstimate.totals.proteinG}g · C {manualEstimate.totals.carbsG}g · F{' '}
                  {manualEstimate.totals.fatG}g
                </Text>
              </View>
              <View style={styles.foodItems}>
                {manualEstimate.items.map((item, index) => (
                  <View key={`${item.name}-${index}`} style={styles.foodItemRow}>
                    <View style={styles.exerciseCopy}>
                      <Text style={styles.exerciseName}>{item.name}</Text>
                      <Text style={styles.mutedText}>{item.portion}</Text>
                    </View>
                    <Text style={styles.foodCalories}>{item.calories} kcal</Text>
                  </View>
                ))}
              </View>
              <Pressable
                onPress={() => saveEstimate(manualEstimate, 'Manual meal estimate', 'manual')}
                style={styles.secondaryButton}
              >
                <Text style={styles.secondaryButtonText}>Save estimated meal</Text>
              </Pressable>
            </View>
          )}
          <Pressable
            disabled={isEstimatingManualMeal}
            onPress={() => void estimateManualMeal()}
            style={[styles.secondaryButton, isEstimatingManualMeal && styles.disabledButton]}
          >
            <Text style={styles.secondaryButtonText}>Estimate with AI</Text>
          </Pressable>
        </View>
      )}

      <SectionTitle title="Today’s meals" />
      <View style={styles.listCard}>
        {data.meals.map((meal, index) => (
          <View
            key={meal.id}
            style={[styles.mealRow, index === data.meals.length - 1 && styles.noBorder]}
          >
            <View style={styles.mealTime}>
              <Text style={styles.mutedText}>{meal.time}</Text>
            </View>
            <View style={styles.exerciseCopy}>
              <Text style={styles.exerciseName}>{meal.name}</Text>
              <Text style={styles.mutedText}>
                {meal.calories} kcal · {meal.protein} g protein
                {typeof meal.carbs === 'number' ? ` · ${meal.carbs} g carbs` : ''}
                {typeof meal.fat === 'number' ? ` · ${meal.fat} g fat` : ''}
              </Text>
            </View>
            <Pressable
              accessibilityLabel={`Delete ${meal.name}`}
              onPress={() =>
                setData((current) => ({
                  ...current,
                  meals: current.meals.filter((item) => item.id !== meal.id),
                }))
              }
            >
              <Text style={styles.deleteText}>×</Text>
            </Pressable>
          </View>
        ))}
      </View>

      <Pressable
        onPress={() => setData((current) => ({ ...current, waterMl: current.waterMl + 250 }))}
        style={styles.waterCard}
      >
        <View>
          <Text style={styles.exerciseName}>Water</Text>
          <Text style={styles.mutedText}>
            {data.waterMl} ml of {targets.waterMl} ml
          </Text>
        </View>
        <Text style={styles.waterAdd}>＋ 250 ml</Text>
      </Pressable>
    </View>
  );
}

function ProgressScreen({
  data,
  setData,
  score,
  protein,
}: {
  data: ReturnType<typeof useVitaData>['data'];
  setData: ReturnType<typeof useVitaData>['setData'];
  score: number;
  protein: number;
}) {
  return (
    <View style={styles.screen}>
      <Text style={styles.kicker}>PROGRESS</Text>
      <Text style={styles.pageTitle}>Small wins add up</Text>
      <Text style={styles.pageSubtitle}>This week’s summary uses only data you logged.</Text>

      <Pressable
        onPress={() =>
          setData((current) => ({
            ...current,
            userProfile: { ...current.userProfile, onboardingCompleted: false },
          }))
        }
        style={styles.profileEditCard}
      >
        <View style={styles.exerciseCopy}>
          <Text style={styles.exerciseName}>Profile setup</Text>
          <Text style={styles.mutedText}>Edit onboarding answers and refresh Vita personalization.</Text>
        </View>
        <MaterialCommunityIcons color="#C4B5FD" name="account-edit" size={24} />
      </Pressable>

      <View style={styles.goalCard}>
        <View style={styles.goalTop}>
          <View>
            <Text style={styles.cardEyebrow}>ACTIVE GOAL</Text>
            <Text style={styles.priorityTitle}>Build strength & fitness</Text>
          </View>
          <Text style={styles.goalPercent}>42%</Text>
        </View>
        <ProgressBar value={0.42} color="#8B5CF6" />
        <Text style={styles.mutedText}>
          6 of 12 planned sessions completed · illustrative local goal
        </Text>
      </View>

      <SectionTitle title="This week" />
      <View style={styles.statsGrid}>
        <Stat value={data.workoutCompleted ? '1' : '0'} label="Workouts" trend="of 3 planned" />
        <Stat value={`${score}%`} label="Readiness" trend="today" />
        <Stat
          value={`${Math.round((protein / targets.protein) * 100)}%`}
          label="Protein"
          trend="today"
        />
        <Stat value={`${data.sleepHours}h`} label="Sleep" trend="last night" />
      </View>

      <SectionTitle title="Consistency" />
      <View style={styles.chartCard}>
        <View style={styles.barChart}>
          {[62, 76, 45, 82, 68, score, 0].map((height, index) => (
            <View key={`${height}-${index}`} style={styles.barColumn}>
              <View style={[styles.chartBar, { height: Math.max(height, 8) }]} />
              <Text style={styles.chartLabel}>{['M', 'T', 'W', 'T', 'F', 'S', 'S'][index]}</Text>
            </View>
          ))}
        </View>
        <Text style={styles.bodyText}>
          Your strongest logged day was Thursday. Missing data is shown as empty, never as a fake
          score.
        </Text>
      </View>
    </View>
  );
}

function CoachScreen({ data }: { data: ReturnType<typeof useVitaData>['data'] }) {
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<{ role: 'coach' | 'user'; text: string }[]>([
    {
      role: 'coach',
      text: 'Hi, I’m Vita. I use the information you log to explain practical next steps. What would you like help with?',
    },
  ]);
  const suggestions = ['What should I train today?', 'What can I eat?', 'Why did readiness drop?'];

  function send(text: string) {
    const clean = text.trim();
    if (!clean) return;
    setMessages((current) => [
      ...current,
      { role: 'user', text: clean },
      { role: 'coach', text: coachReply(clean, data) },
    ]);
    setInput('');
  }

  return (
    <View style={styles.screen}>
      <Text style={styles.kicker}>COACH</Text>
      <Text style={styles.pageTitle}>Ask Vita</Text>
      <Text style={styles.pageSubtitle}>
        Guidance grounded in your confirmed data—not invented measurements.
      </Text>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.suggestionScroll}>
        {suggestions.map((suggestion) => (
          <Pressable key={suggestion} onPress={() => send(suggestion)} style={styles.suggestion}>
            <Text style={styles.suggestionText}>{suggestion}</Text>
          </Pressable>
        ))}
      </ScrollView>

      <View style={styles.chatArea}>
        {messages.map((message, index) => (
          <View
            key={`${message.role}-${index}`}
            style={[
              styles.bubble,
              message.role === 'user' ? styles.userBubble : styles.coachBubble,
            ]}
          >
            {message.role === 'coach' && <Text style={styles.bubbleLabel}>VITA</Text>}
            <Text style={message.role === 'user' ? styles.userBubbleText : styles.coachBubbleText}>
              {message.text}
            </Text>
          </View>
        ))}
      </View>

      <View style={styles.composer}>
        <TextInput
          accessibilityLabel="Message Vita"
          multiline
          onChangeText={setInput}
          onSubmitEditing={() => send(input)}
          placeholder="Ask about today’s plan…"
          placeholderTextColor="#746D80"
          style={styles.composerInput}
          value={input}
        />
        <Pressable
          accessibilityLabel="Send message"
          onPress={() => send(input)}
          style={styles.sendButton}
        >
          <Text style={styles.sendText}>↑</Text>
        </Pressable>
      </View>
      <Text style={styles.safetyText}>
        Vita is a wellness tool, not a medical professional. For urgent symptoms, seek appropriate
        medical help.
      </Text>
    </View>
  );
}

function DayRing({ percent }: { percent: number }) {
  return (
    <View style={styles.scoreRing}>
      <Text style={styles.scoreValue}>{percent}%</Text>
      <Text style={styles.scoreLabel}>DAY</Text>
    </View>
  );
}
function SectionTitle({ title, action }: { title: string; action?: string }) {
  return (
    <View style={styles.sectionTitleRow}>
      <Text style={styles.sectionTitle}>{title}</Text>
      {action && <Text style={styles.sectionAction}>{action}</Text>}
    </View>
  );
}
function ProgressBar({ value, color }: { value: number; color: string }) {
  return (
    <View style={styles.progressTrack}>
      <View
        style={[
          styles.progressFill,
          { width: `${Math.min(Math.max(value, 0), 1) * 100}%`, backgroundColor: color },
        ]}
      />
    </View>
  );
}
function MetricCard({
  label,
  value,
  suffix,
  progress,
  accent,
}: {
  label: string;
  value: string;
  suffix: string;
  progress: number;
  accent: string;
}) {
  return (
    <View style={styles.metricCard}>
      <Text style={styles.metricLabel}>{label}</Text>
      <View style={styles.metricValueRow}>
        <Text style={styles.metricValue}>{value}</Text>
        <Text style={styles.metricSuffix}> {suffix}</Text>
      </View>
      <ProgressBar value={progress} color={accent} />
    </View>
  );
}
function Priority({
  number,
  title,
  detail,
  done = false,
  last = false,
}: {
  number: string;
  title: string;
  detail: string;
  done?: boolean;
  last?: boolean;
}) {
  return (
    <View style={[styles.priorityRow, last && styles.noBorder]}>
      <View style={[styles.priorityNumber, done && styles.priorityDone]}>
        <Text style={[styles.priorityNumberText, done && styles.priorityDoneText]}>
          {done ? '✓' : number}
        </Text>
      </View>
      <View style={styles.exerciseCopy}>
        <Text style={styles.exerciseName}>{title}</Text>
        <Text style={styles.mutedText}>{detail}</Text>
      </View>
    </View>
  );
}
function QuickAction({
  icon,
  label,
  onPress,
}: {
  icon: string;
  label: string;
  onPress: () => void;
}) {
  return (
    <Pressable onPress={onPress} style={styles.quickAction}>
      <Text style={styles.quickIcon}>{icon}</Text>
      <Text style={styles.quickLabel}>{label}</Text>
    </Pressable>
  );
}
function Stat({ value, label, trend }: { value: string; label: string; trend: string }) {
  return (
    <View style={styles.statCard}>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.exerciseName}>{label}</Text>
      <Text style={styles.mutedText}>{trend}</Text>
    </View>
  );
}

const shadow = Platform.select({
  web: { boxShadow: '0 8px 30px rgba(24, 56, 46, 0.07)' },
  default: { elevation: 2 },
}) as object;
const navShadow = Platform.select({
  web: { boxShadow: '0 18px 48px rgba(0, 0, 0, 0.55)' },
  default: {
    elevation: 16,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 9 },
    shadowOpacity: 0.28,
    shadowRadius: 18,
  },
}) as object;
const glowShadow = Platform.select({
  web: { boxShadow: '0 0 30px rgba(139, 92, 246, 0.55)' },
  default: {
    elevation: 8,
    shadowColor: '#8B5CF6',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.45,
    shadowRadius: 13,
  },
}) as object;
const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#050507' },
  appShell: {
    alignSelf: 'center',
    backgroundColor: '#0A080E',
    flex: 1,
    maxWidth: 520,
    overflow: 'hidden',
    width: '100%',
  },
  scrollContent: { paddingBottom: 126 },
  header: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 22,
    paddingTop: 20,
  },
  brand: { color: '#A78BFA', fontSize: 13, fontWeight: '900', letterSpacing: 2 },
  date: { color: '#918A9E', fontSize: 12, marginTop: 3 },
  statusWrap: {
    alignItems: 'center',
    backgroundColor: '#1B1722',
    borderRadius: 18,
    height: 36,
    justifyContent: 'center',
    width: 36,
  },
  statusDot: { borderRadius: 5, height: 10, width: 10 },
  statusOnline: { backgroundColor: '#A78BFA' },
  statusOffline: { backgroundColor: '#CE654F' },
  screen: { gap: 18, minWidth: 0, padding: 22, width: '100%' },
  kicker: { color: '#A78BFA', fontSize: 12, fontWeight: '800', letterSpacing: 1.5 },
  pageTitle: {
    color: '#F8F6FC',
    fontSize: 34,
    fontWeight: '800',
    letterSpacing: -1,
    lineHeight: 39,
  },
  pageSubtitle: { color: '#A39DAD', fontSize: 15, lineHeight: 22, marginTop: -10 },
  heroRow: { alignItems: 'center', flexDirection: 'row', gap: 18 },
  heroCopy: { flex: 1, flexShrink: 1, gap: 7, minWidth: 0 },
  scoreRing: {
    alignItems: 'center',
    borderColor: '#8B5CF6',
    borderRadius: 46,
    borderWidth: 7,
    height: 92,
    justifyContent: 'center',
    flexShrink: 0,
    width: 92,
  },
  scoreValue: { color: '#F8F6FC', fontSize: 28, fontWeight: '800' },
  scoreLabel: { color: '#A99FC0', fontSize: 8, fontWeight: '800', letterSpacing: 1 },
  priorityCard: {
    ...shadow,
    backgroundColor: '#17121F',
    borderColor: '#2C233A',
    borderWidth: 1,
    borderRadius: 24,
    flexShrink: 1,
    gap: 12,
    minWidth: 0,
    padding: 22,
  },
  cardEyebrow: { color: '#A99FC0', fontSize: 10, fontWeight: '900', letterSpacing: 1.2 },
  darkTitle: { color: '#FFFFFF', fontSize: 21, fontWeight: '800', lineHeight: 27 },
  darkBody: { color: '#C5BDCF', fontSize: 14, lineHeight: 21 },
  priorityTitle: { color: '#F2EEF8', fontSize: 21, fontWeight: '800', lineHeight: 27 },
  bodyText: { color: '#AAA2B4', fontSize: 14, lineHeight: 21 },
  primaryButton: {
    alignItems: 'center',
    backgroundColor: '#7C3AED',
    borderRadius: 14,
    flexDirection: 'row',
    justifyContent: 'space-between',
    minHeight: 50,
    paddingHorizontal: 18,
  },
  primaryButtonText: { color: '#FFF', fontSize: 15, fontWeight: '800' },
  disabledButton: { opacity: 0.55 },
  sectionTitleRow: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  sectionTitle: { color: '#F2EEF8', fontSize: 19, fontWeight: '800' },
  sectionAction: { color: '#A78BFA', fontSize: 12, fontWeight: '700' },
  twoColumns: { flexDirection: 'row', gap: 12, minWidth: 0 },
  metricCard: {
    ...shadow,
    backgroundColor: '#15111B',
    borderColor: '#292133',
    borderWidth: 1,
    borderRadius: 18,
    flex: 1,
    flexShrink: 1,
    gap: 8,
    minWidth: 0,
    padding: 16,
  },
  metricLabel: { color: '#A39DAD', fontSize: 12, fontWeight: '700' },
  metricValueRow: { alignItems: 'baseline', flexDirection: 'row' },
  metricValue: { color: '#F8F6FC', fontSize: 22, fontWeight: '800' },
  metricSuffix: { color: '#8E8799', fontSize: 10 },
  progressTrack: { backgroundColor: '#2A2431', borderRadius: 4, height: 6, overflow: 'hidden' },
  progressFill: { borderRadius: 4, height: 6 },
  listCard: {
    ...shadow,
    backgroundColor: '#15111B',
    borderColor: '#292133',
    borderRadius: 20,
    borderWidth: 1,
    paddingHorizontal: 17,
  },
  priorityRow: {
    alignItems: 'center',
    borderBottomColor: '#2A2431',
    borderBottomWidth: 1,
    flexDirection: 'row',
    gap: 13,
    paddingVertical: 15,
  },
  priorityNumber: {
    alignItems: 'center',
    backgroundColor: '#241B34',
    borderRadius: 16,
    height: 32,
    justifyContent: 'center',
    width: 32,
  },
  priorityNumberText: { color: '#B79CFF', fontSize: 13, fontWeight: '800' },
  priorityDone: { backgroundColor: '#7C3AED' },
  priorityDoneText: { color: '#FFF' },
  noBorder: { borderBottomWidth: 0 },
  quickGrid: { flexDirection: 'row', gap: 10 },
  quickAction: {
    alignItems: 'center',
    backgroundColor: '#1D1727',
    borderColor: '#30263F',
    borderWidth: 1,
    borderRadius: 16,
    flex: 1,
    gap: 7,
    minHeight: 84,
    justifyContent: 'center',
  },
  quickIcon: { color: '#A78BFA', fontSize: 20, fontWeight: '700' },
  quickLabel: { color: '#D8D0E5', fontSize: 11, fontWeight: '700', textAlign: 'center' },
  exerciseSearch: {
    alignItems: 'center',
    backgroundColor: '#15111B',
    borderColor: '#342A42',
    borderRadius: 16,
    borderWidth: 1,
    flexDirection: 'row',
    gap: 10,
    minHeight: 52,
    paddingHorizontal: 15,
  },
  exerciseSearchInput: { color: '#F2EEF8', flex: 1, fontSize: 14, minHeight: 50 },
  planSetupCard: {
    backgroundColor: '#15111B',
    borderColor: '#30263F',
    borderRadius: 20,
    borderWidth: 1,
    gap: 12,
    padding: 15,
  },
  dayPicker: { flexDirection: 'row', gap: 8 },
  dayPill: {
    alignItems: 'center',
    backgroundColor: '#211832',
    borderColor: '#342A42',
    borderRadius: 13,
    borderWidth: 1,
    flex: 1,
    height: 40,
    justifyContent: 'center',
  },
  dayPillActive: { backgroundColor: '#7C3AED', borderColor: '#A78BFA' },
  dayPillText: { color: '#A99FC0', fontSize: 13, fontWeight: '800' },
  dayPillTextActive: { color: '#FFF' },
  sessionTypeCard: {
    backgroundColor: '#15111B',
    borderColor: '#30263F',
    borderRadius: 20,
    borderWidth: 1,
    gap: 12,
    padding: 15,
  },
  sessionTypeGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  sessionTypePill: {
    backgroundColor: '#211832',
    borderColor: '#342A42',
    borderRadius: 999,
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 9,
  },
  sessionTypePillActive: { backgroundColor: '#7C3AED', borderColor: '#A78BFA' },
  sessionTypeText: { color: '#A99FC0', fontSize: 12, fontWeight: '800' },
  sessionTypeTextActive: { color: '#FFF' },
  libraryTitle: { color: '#F2EEF8', fontSize: 19, fontWeight: '800' },
  librarySubtitle: { color: '#918A9E', fontSize: 11, marginTop: 4 },
  exerciseLibrary: {
    backgroundColor: '#15111B',
    borderColor: '#292133',
    borderRadius: 20,
    borderWidth: 1,
    overflow: 'hidden',
  },
  libraryRow: {
    alignItems: 'center',
    borderBottomColor: '#2A2431',
    borderBottomWidth: 1,
    flexDirection: 'row',
    gap: 12,
    minHeight: 68,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  libraryRowPressed: { backgroundColor: '#21182F' },
  libraryIcon: {
    alignItems: 'center',
    backgroundColor: '#241B34',
    borderRadius: 12,
    height: 42,
    justifyContent: 'center',
    width: 42,
  },
  iconButton: { padding: 6 },
  emptySearch: { alignItems: 'center', gap: 5, padding: 24 },
  planTabs: {
    backgroundColor: '#15111B',
    borderColor: '#292133',
    borderRadius: 16,
    borderWidth: 1,
    flexDirection: 'row',
    gap: 8,
    padding: 6,
  },
  planTab: { alignItems: 'center', borderRadius: 12, flex: 1, paddingVertical: 10 },
  planTabActive: { backgroundColor: '#7C3AED' },
  planTabText: { color: '#AFA6BC', fontSize: 12, fontWeight: '900' },
  planTabTextActive: { color: '#FFFFFF' },
  manualExerciseCard: {
    alignItems: 'center',
    backgroundColor: '#15111B',
    borderColor: '#292133',
    borderRadius: 16,
    borderWidth: 1,
    flexDirection: 'row',
    gap: 10,
    padding: 8,
  },
  manualExerciseInput: { color: '#F2EEF8', flex: 1, fontSize: 13, minHeight: 42, paddingHorizontal: 8 },
  addExerciseButton: {
    alignItems: 'center',
    backgroundColor: '#7C3AED',
    borderRadius: 12,
    height: 42,
    justifyContent: 'center',
    width: 42,
  },
  backButton: {
    alignItems: 'center',
    alignSelf: 'flex-start',
    backgroundColor: '#21182F',
    borderRadius: 18,
    flexDirection: 'row',
    gap: 7,
    paddingHorizontal: 13,
    paddingVertical: 9,
  },
  backButtonText: { color: '#D8CCEA', fontSize: 12, fontWeight: '800' },
  anatomyCard: {
    backgroundColor: '#100D15',
    borderColor: '#30253D',
    borderRadius: 24,
    borderWidth: 1,
    overflow: 'hidden',
  },
  anatomyHeader: {
    alignItems: 'flex-start',
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 18,
  },
  anatomyTitle: { color: '#F8F6FC', fontSize: 16, fontWeight: '800', marginTop: 5 },
  primaryLegend: { alignItems: 'center', flexDirection: 'row', gap: 6 },
  legendDot: { backgroundColor: '#EF4444', borderRadius: 5, height: 10, width: 10 },
  legendText: { color: '#FCA5A5', fontSize: 8, fontWeight: '900', letterSpacing: 0.8 },
  muscleMapStage: {
    alignSelf: 'center',
    backgroundColor: '#151720',
    borderColor: '#242838',
    borderRadius: 28,
    borderWidth: 1,
    height: 440,
    marginTop: 4,
    maxWidth: 292,
    overflow: 'hidden',
    position: 'relative',
    width: '76%',
  },
  mapStatLeft: { left: 28, position: 'absolute', top: 32, zIndex: 3 },
  mapStatRight: { position: 'absolute', right: 26, top: 32, zIndex: 3 },
  mapStatNumber: { color: '#FFFFFF', fontSize: 24, fontWeight: '900', textAlign: 'center' },
  mapStatLabel: { color: '#A9A2B7', fontSize: 7, fontWeight: '900', letterSpacing: 0.5, marginTop: 2 },
  bodyFigure: { alignSelf: 'center', height: 360, marginTop: 62, position: 'relative', width: 200 },
  bodyPart: { backgroundColor: '#3B3E50', position: 'absolute' },
  bodyPartActive: {
    backgroundColor: '#F43F6B',
    shadowColor: '#F43F6B',
    shadowOpacity: 0.45,
    shadowRadius: 10,
  },
  bodyMuscle: {
    backgroundColor: '#56596C',
    borderColor: '#242736',
    borderWidth: 1,
    position: 'absolute',
  },
  bodyMuscleActive: {
    backgroundColor: '#EF5C83',
    borderColor: '#FF7C9D',
    shadowColor: '#F43F6B',
    shadowOpacity: 0.5,
    shadowRadius: 12,
  },
  bodyHead: { borderRadius: 18, height: 34, left: 83, top: 0, width: 34 },
  bodyNeck: { borderRadius: 8, height: 18, left: 91, top: 29, width: 18 },
  bodyTorso: {
    backgroundColor: '#333647',
    borderBottomLeftRadius: 42,
    borderBottomRightRadius: 42,
    borderTopLeftRadius: 36,
    borderTopRightRadius: 36,
    height: 148,
    left: 54,
    top: 47,
    width: 92,
  },
  trapGroup: {
    borderTopLeftRadius: 26,
    borderTopRightRadius: 26,
    height: 38,
    left: 61,
    top: 44,
    width: 78,
  },
  chestLeft: { borderRadius: 18, height: 38, left: 62, top: 76, width: 39 },
  chestRight: { borderRadius: 18, height: 38, left: 99, top: 76, width: 39 },
  abUpper: { borderRadius: 13, height: 30, left: 80, top: 116, width: 40 },
  abMid: { borderRadius: 13, height: 32, left: 78, top: 145, width: 44 },
  abLower: { borderBottomLeftRadius: 23, borderBottomRightRadius: 23, height: 36, left: 80, top: 174, width: 40 },
  latLeft: { borderRadius: 22, height: 92, left: 45, top: 88, transform: [{ rotate: '14deg' }], width: 28 },
  latRight: { borderRadius: 22, height: 92, left: 127, top: 88, transform: [{ rotate: '-14deg' }], width: 28 },
  shoulderLeft: { borderRadius: 20, height: 39, left: 31, top: 79, width: 39 },
  shoulderRight: { borderRadius: 20, height: 39, left: 130, top: 79, width: 39 },
  upperArmLeft: { borderRadius: 20, height: 76, left: 20, top: 111, transform: [{ rotate: '12deg' }], width: 28 },
  upperArmRight: { borderRadius: 20, height: 76, left: 152, top: 111, transform: [{ rotate: '-12deg' }], width: 28 },
  forearmLeft: { borderRadius: 18, height: 78, left: 10, top: 184, transform: [{ rotate: '15deg' }], width: 23 },
  forearmRight: { borderRadius: 18, height: 78, left: 167, top: 184, transform: [{ rotate: '-15deg' }], width: 23 },
  handLeft: { borderRadius: 12, height: 24, left: 5, top: 254, transform: [{ rotate: '20deg' }], width: 22 },
  handRight: { borderRadius: 12, height: 24, left: 173, top: 254, transform: [{ rotate: '-20deg' }], width: 22 },
  hipLeft: { borderRadius: 28, height: 50, left: 58, top: 194, transform: [{ rotate: '10deg' }], width: 40 },
  hipRight: { borderRadius: 28, height: 50, left: 102, top: 194, transform: [{ rotate: '-10deg' }], width: 40 },
  quadLeft: { borderRadius: 27, height: 93, left: 57, top: 238, transform: [{ rotate: '4deg' }], width: 34 },
  quadRight: { borderRadius: 27, height: 93, left: 109, top: 238, transform: [{ rotate: '-4deg' }], width: 34 },
  lowerLegLeft: { borderRadius: 22, height: 74, left: 59, top: 316, transform: [{ rotate: '4deg' }], width: 27 },
  lowerLegRight: { borderRadius: 22, height: 74, left: 114, top: 316, transform: [{ rotate: '-4deg' }], width: 27 },
  footLeft: { borderRadius: 16, height: 17, left: 48, top: 385, transform: [{ rotate: '-10deg' }], width: 39 },
  footRight: { borderRadius: 16, height: 17, left: 113, top: 385, transform: [{ rotate: '10deg' }], width: 39 },
  anatomySource: {
    color: '#8C829A',
    fontSize: 10,
    lineHeight: 15,
    paddingHorizontal: 18,
    paddingVertical: 12,
  },
  muscleSummary: {
    backgroundColor: '#17121F',
    borderTopColor: '#30253D',
    borderTopWidth: 1,
    flexDirection: 'row',
    gap: 18,
    padding: 18,
  },
  muscleColumn: { flex: 1, gap: 5 },
  muscleLabel: { color: '#EF4444', fontSize: 9, fontWeight: '900', letterSpacing: 1 },
  muscleValue: { color: '#EDE8F4', fontSize: 12, fontWeight: '700', lineHeight: 17 },
  formSteps: { gap: 11 },
  formStep: {
    alignItems: 'flex-start',
    backgroundColor: '#15111B',
    borderColor: '#292133',
    borderRadius: 16,
    borderWidth: 1,
    flexDirection: 'row',
    gap: 13,
    padding: 15,
  },
  formStepNumber: {
    alignItems: 'center',
    backgroundColor: '#7C3AED',
    borderRadius: 14,
    height: 28,
    justifyContent: 'center',
    width: 28,
  },
  formStepNumberText: { color: '#FFFFFF', fontSize: 12, fontWeight: '900' },
  formStepText: { color: '#D8D0E2', flex: 1, fontSize: 13, lineHeight: 20 },
  formTip: {
    alignItems: 'flex-start',
    backgroundColor: '#251318',
    borderColor: '#4B2329',
    borderRadius: 17,
    borderWidth: 1,
    flexDirection: 'row',
    gap: 12,
    padding: 15,
  },
  formTipTitle: { color: '#FCA5A5', fontSize: 13, fontWeight: '800' },
  formTipText: { color: '#C8ADB1', fontSize: 11, lineHeight: 17 },
  workoutHeader: { alignItems: 'flex-end', flexDirection: 'row', justifyContent: 'space-between' },
  workoutProgress: { color: '#F2EEF8', fontSize: 20, fontWeight: '800', marginTop: 5 },
  workoutPercent: { color: '#A78BFA', fontSize: 18, fontWeight: '800' },
  exerciseList: {
    ...shadow,
    backgroundColor: '#15111B',
    borderColor: '#292133',
    borderRadius: 20,
    borderWidth: 1,
    paddingHorizontal: 16,
  },
  exerciseRow: {
    alignItems: 'center',
    borderBottomColor: '#2A2431',
    borderBottomWidth: 1,
    flexDirection: 'row',
    gap: 12,
    paddingVertical: 15,
  },
  exerciseNumber: {
    alignItems: 'center',
    backgroundColor: '#241B34',
    borderRadius: 10,
    height: 38,
    justifyContent: 'center',
    width: 38,
  },
  exerciseNumberText: { color: '#B79CFF', fontWeight: '800' },
  exerciseCopy: { flex: 1, gap: 3 },
  exerciseName: { color: '#EDE8F4', fontSize: 14, fontWeight: '700' },
  mutedText: { color: '#918A9E', fontSize: 11, lineHeight: 16 },
  chevron: { color: '#736B80', fontSize: 26 },
  actionStack: { gap: 12 },
  secondaryButton: {
    alignItems: 'center',
    borderColor: '#8B5CF6',
    borderRadius: 14,
    borderWidth: 1.5,
    justifyContent: 'center',
    minHeight: 48,
  },
  secondaryButtonText: { color: '#B79CFF', fontSize: 14, fontWeight: '800' },
  safetyText: { color: '#817A8D', fontSize: 10, lineHeight: 15, textAlign: 'center' },
  successCard: { backgroundColor: '#211832', borderRadius: 18, gap: 5, padding: 18 },
  successTitle: { color: '#B79CFF', fontSize: 18, fontWeight: '800' },
  nutritionHero: {
    ...shadow,
    backgroundColor: '#15111B',
    borderColor: '#292133',
    borderWidth: 1,
    borderRadius: 22,
    flexDirection: 'row',
    gap: 12,
    padding: 16,
  },
  nutritionMetric: { flex: 1, minWidth: 0 },
  bigMetric: { color: '#F8F6FC', fontSize: 25, fontWeight: '800', marginVertical: 3 },
  macroRight: { alignItems: 'flex-start', flex: 1, minWidth: 0 },
  scanCard: {
    alignItems: 'center',
    backgroundColor: '#1D1727',
    borderColor: '#30263F',
    borderWidth: 1,
    borderRadius: 18,
    flexDirection: 'row',
    gap: 12,
    padding: 15,
  },
  scanIcon: {
    alignItems: 'center',
    backgroundColor: '#7C3AED',
    borderRadius: 12,
    height: 44,
    justifyContent: 'center',
    width: 44,
  },
  scanCopy: { flex: 1 },
  photoActions: { flexDirection: 'row', gap: 10 },
  photoActionButton: {
    alignItems: 'center',
    backgroundColor: '#7C3AED',
    borderRadius: 15,
    flex: 1,
    flexDirection: 'row',
    gap: 8,
    justifyContent: 'center',
    minHeight: 50,
    paddingHorizontal: 12,
  },
  photoActionSecondary: {
    backgroundColor: '#17111F',
    borderColor: '#3A2C4D',
    borderWidth: 1,
  },
  photoActionText: { color: '#FFF', fontSize: 14, fontWeight: '800' },
  photoActionSecondaryText: { color: '#B79CFF', fontSize: 14, fontWeight: '800' },
  analysisCard: {
    backgroundColor: '#15111B',
    borderColor: '#332640',
    borderRadius: 20,
    borderWidth: 1,
    gap: 14,
    padding: 16,
  },
  apiKeyCard: {
    backgroundColor: '#15111B',
    borderColor: '#3A2C4D',
    borderRadius: 18,
    borderWidth: 1,
    gap: 10,
    padding: 15,
  },
  errorCard: {
    backgroundColor: '#211219',
    borderColor: '#5B2638',
    borderRadius: 18,
    borderWidth: 1,
    gap: 5,
    padding: 15,
  },
  foodPreview: {
    backgroundColor: '#0A0710',
    borderRadius: 16,
    height: 190,
    width: '100%',
  },
  analysisTotals: { flexDirection: 'row', gap: 10 },
  foodItems: {
    borderColor: '#2A2431',
    borderRadius: 16,
    borderWidth: 1,
    overflow: 'hidden',
  },
  foodItemRow: {
    alignItems: 'center',
    borderBottomColor: '#2A2431',
    borderBottomWidth: 1,
    flexDirection: 'row',
    gap: 10,
    padding: 12,
  },
  foodCalories: { color: '#F8F6FC', fontSize: 13, fontWeight: '800' },
  estimateDisclaimer: { color: '#918A9E', fontSize: 11, lineHeight: 16 },
  formCard: { backgroundColor: '#15111B', borderRadius: 18, gap: 11, padding: 15 },
  manualItems: { gap: 10 },
  manualItemRow: { alignItems: 'center', flexDirection: 'row', gap: 8 },
  removeItemButton: {
    alignItems: 'center',
    backgroundColor: '#241B34',
    borderRadius: 12,
    height: 46,
    justifyContent: 'center',
    width: 46,
  },
  addItemButton: {
    alignItems: 'center',
    alignSelf: 'flex-start',
    flexDirection: 'row',
    gap: 6,
    paddingVertical: 6,
  },
  input: {
    backgroundColor: '#0F0C14',
    borderColor: '#342A42',
    borderRadius: 12,
    borderWidth: 1,
    color: '#F2EEF8',
    fontSize: 14,
    minHeight: 46,
    paddingHorizontal: 13,
  },
  flexInput: { flex: 1 },
  mealRow: {
    alignItems: 'center',
    borderBottomColor: '#2A2431',
    borderBottomWidth: 1,
    flexDirection: 'row',
    gap: 10,
    paddingVertical: 15,
  },
  mealTime: { width: 55 },
  deleteText: { color: '#B76A5B', fontSize: 24, padding: 5 },
  waterCard: {
    alignItems: 'center',
    backgroundColor: '#181321',
    borderColor: '#2D2440',
    borderWidth: 1,
    borderRadius: 18,
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 17,
  },
  waterAdd: { color: '#A78BFA', fontSize: 13, fontWeight: '800' },
  goalCard: {
    ...shadow,
    backgroundColor: '#15111B',
    borderColor: '#292133',
    borderRadius: 22,
    borderWidth: 1,
    gap: 14,
    padding: 20,
  },
  profileEditCard: {
    alignItems: 'center',
    backgroundColor: '#181321',
    borderColor: '#30263F',
    borderRadius: 18,
    borderWidth: 1,
    flexDirection: 'row',
    gap: 12,
    justifyContent: 'space-between',
    padding: 16,
  },
  goalTop: { alignItems: 'center', flexDirection: 'row', justifyContent: 'space-between' },
  goalPercent: { color: '#A78BFA', fontSize: 28, fontWeight: '800' },
  statsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  statCard: {
    ...shadow,
    backgroundColor: '#15111B',
    borderColor: '#292133',
    borderWidth: 1,
    borderRadius: 18,
    gap: 3,
    padding: 16,
    width: '48%',
  },
  statValue: { color: '#F8F6FC', fontSize: 25, fontWeight: '800' },
  chartCard: {
    ...shadow,
    backgroundColor: '#15111B',
    borderColor: '#292133',
    borderRadius: 20,
    borderWidth: 1,
    gap: 18,
    padding: 18,
  },
  barChart: {
    alignItems: 'flex-end',
    flexDirection: 'row',
    height: 120,
    justifyContent: 'space-between',
  },
  barColumn: { alignItems: 'center', gap: 7, height: 115, justifyContent: 'flex-end', width: 28 },
  chartBar: { backgroundColor: '#8B5CF6', borderRadius: 7, width: 18 },
  chartLabel: { color: '#918A9E', fontSize: 10 },
  suggestionScroll: { marginHorizontal: -22, paddingHorizontal: 22 },
  suggestion: {
    backgroundColor: '#21182F',
    borderColor: '#352649',
    borderWidth: 1,
    borderRadius: 18,
    marginRight: 8,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  suggestionText: { color: '#D8CCEA', fontSize: 12, fontWeight: '700' },
  chatArea: { gap: 12 },
  bubble: { borderRadius: 18, gap: 5, maxWidth: '88%', padding: 14 },
  coachBubble: { alignSelf: 'flex-start', backgroundColor: '#17121F', borderBottomLeftRadius: 5 },
  userBubble: { alignSelf: 'flex-end', backgroundColor: '#7C3AED', borderBottomRightRadius: 5 },
  bubbleLabel: { color: '#A78BFA', fontSize: 9, fontWeight: '900', letterSpacing: 1 },
  coachBubbleText: { color: '#D8D0E2', fontSize: 14, lineHeight: 21 },
  userBubbleText: { color: '#FFF', fontSize: 14, lineHeight: 21 },
  composer: {
    alignItems: 'flex-end',
    backgroundColor: '#15111B',
    borderColor: '#342A42',
    borderRadius: 20,
    borderWidth: 1,
    flexDirection: 'row',
    padding: 8,
  },
  composerInput: {
    color: '#F2EEF8',
    flex: 1,
    fontSize: 14,
    maxHeight: 100,
    minHeight: 42,
    paddingHorizontal: 10,
    paddingVertical: 10,
  },
  sendButton: {
    alignItems: 'center',
    backgroundColor: '#7C3AED',
    borderRadius: 18,
    height: 38,
    justifyContent: 'center',
    width: 38,
  },
  sendText: { color: '#FFF', fontSize: 20, fontWeight: '800' },
  tabBar: {
    ...navShadow,
    alignItems: 'center',
    alignSelf: 'center',
    backgroundColor: '#0D0A12',
    borderColor: '#30253D',
    borderRadius: 28,
    borderWidth: 1,
    bottom: 14,
    flexDirection: 'row',
    height: 88,
    justifyContent: 'space-around',
    maxWidth: 488,
    overflow: 'hidden',
    paddingHorizontal: 7,
    paddingVertical: 8,
    position: 'absolute',
    width: '94%',
  },
  tabButton: {
    alignItems: 'center',
    flex: 1,
    gap: 3,
    justifyContent: 'center',
    minHeight: 70,
    minWidth: 0,
    position: 'relative',
  },
  tabButtonPressed: { opacity: 0.72, transform: [{ scale: 0.96 }] },
  activeGlow: {
    ...glowShadow,
    backgroundColor: 'rgba(124, 58, 237, 0.28)',
    borderRadius: 36,
    height: 72,
    position: 'absolute',
    top: -2,
    width: 72,
  },
  tabIconWrap: {
    alignItems: 'center',
    height: 38,
    justifyContent: 'center',
    width: 44,
  },
  tabIconWrapActive: {
    backgroundColor: 'rgba(139, 92, 246, 0.18)',
    borderColor: 'rgba(196, 181, 253, 0.24)',
    borderRadius: 15,
    borderWidth: 1,
  },
  tabLabel: { color: '#817A90', fontSize: 10, fontWeight: '700' },
  tabActive: { color: '#F4FAF7', fontWeight: '800' },
});
