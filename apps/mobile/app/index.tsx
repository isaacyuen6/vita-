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
import { coachReply, readinessScore, targets, type TabId } from '../src/vita-data';
import { useVitaData } from '../src/use-vita-data';

type ConnectionState = 'checking' | 'connected' | 'unavailable';
const apiUrl = process.env.EXPO_PUBLIC_API_URL ?? 'http://127.0.0.1:3000';
const api = new VitaApiClient(apiUrl);

type MuscleRegion = {
  height: number;
  left: number;
  top: number;
  width: number;
};

type Exercise = {
  equipment: string;
  form: string[];
  id: string;
  name: string;
  primary: string[];
  regions: MuscleRegion[];
  secondary: string[];
  target: string;
};

const exerciseLibrary: Exercise[] = [
  {
    id: 'dumbbell-curl',
    name: 'Dumbbell bicep curl',
    target: 'Arms',
    equipment: 'Dumbbells',
    primary: ['Biceps brachii'],
    secondary: ['Brachialis', 'Forearms'],
    regions: [
      { left: 23, top: 27, width: 9, height: 14 },
      { left: 68, top: 27, width: 9, height: 14 },
    ],
    form: [
      'Stand tall with palms facing forward and elbows close to your ribs.',
      'Curl the weights without letting your elbows drift forward.',
      'Squeeze at the top, then lower slowly until your arms are long.',
    ],
  },
  {
    id: 'goblet-squat',
    name: 'Goblet squat',
    target: 'Legs',
    equipment: 'Dumbbell',
    primary: ['Quadriceps', 'Gluteus maximus'],
    secondary: ['Adductors', 'Core'],
    regions: [
      { left: 36, top: 53, width: 12, height: 20 },
      { left: 52, top: 53, width: 12, height: 20 },
    ],
    form: [
      'Hold one dumbbell close to your chest and brace your trunk.',
      'Sit between your hips while keeping knees in line with your toes.',
      'Drive the floor away and finish tall without leaning back.',
    ],
  },
  {
    id: 'incline-push-up',
    name: 'Incline push-up',
    target: 'Chest',
    equipment: 'Bench',
    primary: ['Pectoralis major'],
    secondary: ['Triceps', 'Front deltoids'],
    regions: [
      { left: 36, top: 20, width: 28, height: 13 },
      { left: 28, top: 20, width: 8, height: 10 },
      { left: 64, top: 20, width: 8, height: 10 },
    ],
    form: [
      'Place hands just wider than shoulders and make a straight body line.',
      'Lower your chest toward the support with elbows about 30–45 degrees out.',
      'Press the support away while keeping ribs and hips stacked.',
    ],
  },
  {
    id: 'romanian-deadlift',
    name: 'Romanian deadlift',
    target: 'Posterior chain',
    equipment: 'Dumbbells',
    primary: ['Hamstrings', 'Gluteus maximus'],
    secondary: ['Spinal erectors', 'Forearms'],
    regions: [
      { left: 35, top: 53, width: 13, height: 22 },
      { left: 52, top: 53, width: 13, height: 22 },
    ],
    form: [
      'Soften your knees, brace, and keep the dumbbells close to your legs.',
      'Push your hips back while maintaining a long, neutral spine.',
      'Stop when the hamstrings limit the hinge, then stand by driving hips forward.',
    ],
  },
  {
    id: 'seated-row',
    name: 'Seated cable row',
    target: 'Back',
    equipment: 'Cable machine',
    primary: ['Latissimus dorsi', 'Rhomboids'],
    secondary: ['Rear deltoids', 'Biceps'],
    regions: [
      { left: 31, top: 25, width: 14, height: 20 },
      { left: 55, top: 25, width: 14, height: 20 },
    ],
    form: [
      'Sit tall with ribs stacked over hips and shoulders relaxed.',
      'Pull elbows toward your back pockets without rocking your torso.',
      'Pause with shoulder blades together, then reach forward under control.',
    ],
  },
  {
    id: 'dead-bug',
    name: 'Dead bug',
    target: 'Core',
    equipment: 'Bodyweight',
    primary: ['Rectus abdominis', 'Transverse abdominis'],
    secondary: ['Hip flexors'],
    regions: [{ left: 42, top: 31, width: 16, height: 21 }],
    form: [
      'Lie on your back with hips and knees at 90 degrees and arms up.',
      'Gently press your lower back toward the floor and brace.',
      'Extend the opposite arm and leg only as far as you can keep your back still.',
    ],
  },
  {
    id: 'shoulder-press',
    name: 'Dumbbell shoulder press',
    target: 'Shoulders',
    equipment: 'Dumbbells',
    primary: ['Deltoids'],
    secondary: ['Triceps', 'Upper chest'],
    regions: [
      { left: 27, top: 19, width: 10, height: 12 },
      { left: 63, top: 19, width: 10, height: 12 },
    ],
    form: [
      'Start with weights around shoulder height and wrists stacked over elbows.',
      'Brace your trunk and press upward without arching your lower back.',
      'Finish with arms overhead, then lower smoothly to the start.',
    ],
  },
  {
    id: 'calf-raise',
    name: 'Standing calf raise',
    target: 'Lower legs',
    equipment: 'Bodyweight or dumbbells',
    primary: ['Gastrocnemius', 'Soleus'],
    secondary: ['Foot stabilizers'],
    regions: [
      { left: 38, top: 75, width: 9, height: 17 },
      { left: 53, top: 75, width: 9, height: 17 },
    ],
    form: [
      'Stand tall with weight spread through the balls of both feet.',
      'Rise as high as possible without rolling your ankles outward.',
      'Pause briefly, then lower your heels slowly through a comfortable range.',
    ],
  },
];

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
              setTab={setTab}
              data={data}
            />
          )}
          {tab === 'train' && <TrainScreen data={data} setData={setData} />}
          {tab === 'eat' && (
            <EatScreen data={data} setData={setData} calories={calories} protein={protein} />
          )}
          {tab === 'progress' && <ProgressScreen data={data} score={score} protein={protein} />}
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
  setTab,
  data,
}: {
  calories: number;
  protein: number;
  score: number;
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
        <ScoreRing score={score} />
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
  const [selectedExercise, setSelectedExercise] = useState<Exercise | null>(null);
  const workoutExercises = [
    ['Goblet squat', '3 × 8–10', '12 kg'],
    ['Incline push-up', '3 × 8–12', 'Bodyweight'],
    ['Romanian deadlift', '3 × 10', '16 kg'],
    ['Seated cable row', '3 × 10–12', '20 kg'],
    ['Dead bug', '2 × 8 / side', 'Controlled'],
  ];
  const filteredExercises = exerciseLibrary.filter((exercise) => {
    const searchValue = exerciseQuery.trim().toLowerCase();
    return (
      !searchValue ||
      exercise.name.toLowerCase().includes(searchValue) ||
      exercise.target.toLowerCase().includes(searchValue) ||
      exercise.primary.some((muscle) => muscle.toLowerCase().includes(searchValue))
    );
  });
  const totalSets = 14;

  if (selectedExercise) {
    return (
      <ExerciseDetail exercise={selectedExercise} onBack={() => setSelectedExercise(null)} />
    );
  }

  return (
    <View style={styles.screen}>
      <Text style={styles.kicker}>TRAIN</Text>
      <Text style={styles.pageTitle}>Full-body foundation</Text>
      <Text style={styles.pageSubtitle}>Moderate day · 32 minutes · RPE 7</Text>

      <View style={styles.exerciseSearch}>
        <MaterialCommunityIcons color="#A78BFA" name="magnify" size={23} />
        <TextInput
          accessibilityLabel="Search exercises or muscles"
          onChangeText={setExerciseQuery}
          placeholder="Search exercises or muscles"
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

      <View>
        <Text style={styles.libraryTitle}>Exercise library</Text>
        <Text style={styles.librarySubtitle}>
          {filteredExercises.length} exercises · tap for form and target muscles
        </Text>
      </View>
      <View style={styles.exerciseLibrary}>
        {filteredExercises.map((exercise) => (
          <Pressable
            key={exercise.id}
            onPress={() => setSelectedExercise(exercise)}
            style={({ pressed }) => [styles.libraryRow, pressed && styles.libraryRowPressed]}
          >
            <View style={styles.libraryIcon}>
              <MaterialCommunityIcons color="#C4B5FD" name="weight-lifter" size={23} />
            </View>
            <View style={styles.exerciseCopy}>
              <Text style={styles.exerciseName}>{exercise.name}</Text>
              <Text style={styles.mutedText}>
                {exercise.target} · {exercise.equipment}
              </Text>
            </View>
            <MaterialCommunityIcons color="#736B80" name="chevron-right" size={25} />
          </Pressable>
        ))}
        {!filteredExercises.length && (
          <View style={styles.emptySearch}>
            <Text style={styles.exerciseName}>No matching exercises</Text>
            <Text style={styles.mutedText}>Try curl, legs, chest, back, or biceps.</Text>
          </View>
        )}
      </View>

      <SectionTitle title="Today’s session" />
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
        {workoutExercises.map(([name, prescription, load], index) => (
          <View key={name} style={styles.exerciseRow}>
            <View style={styles.exerciseNumber}>
              <Text style={styles.exerciseNumberText}>{index + 1}</Text>
            </View>
            <View style={styles.exerciseCopy}>
              <Text style={styles.exerciseName}>{name}</Text>
              <Text style={styles.mutedText}>
                {prescription} · {load}
              </Text>
            </View>
            <Text style={styles.chevron}>›</Text>
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
            <Text style={styles.primaryButtonText}>✓</Text>
          </Pressable>
          <Text style={styles.safetyText}>
            Stop if you feel sharp, sudden, severe, or worsening pain. Vita does not diagnose
            injuries.
          </Text>
        </View>
      ) : (
        <View style={styles.successCard}>
          <Text style={styles.successTitle}>Workout complete</Text>
          <Text style={styles.bodyText}>Nice work. Today’s volume is saved on this device.</Text>
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
        <Text style={styles.pageTitle}>{exercise.name}</Text>
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
        <View style={styles.anatomyStage}>
          <Image
            accessibilityLabel={`Anatomy diagram showing muscles used in ${exercise.name}`}
            resizeMode="contain"
            source={require('../assets/anatomy-front.png')}
            style={styles.anatomyImage}
          />
          {exercise.regions.map((region, index) => (
            <View
              key={`${exercise.id}-region-${index}`}
              style={[
                styles.muscleHighlight,
                {
                  height: `${region.height}%`,
                  left: `${region.left}%`,
                  top: `${region.top}%`,
                  width: `${region.width}%`,
                },
              ]}
            />
          ))}
        </View>
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
            Use a weight you can control through the full movement. Stop for sharp or worsening
            pain.
          </Text>
        </View>
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
  const [mealCalories, setMealCalories] = useState('');
  const [mealProtein, setMealProtein] = useState('');

  function addMeal() {
    const parsedCalories = Number(mealCalories);
    const parsedProtein = Number(mealProtein);
    if (!mealName.trim() || !Number.isFinite(parsedCalories) || !Number.isFinite(parsedProtein))
      return;
    setData((current) => ({
      ...current,
      meals: [
        ...current.meals,
        {
          id: `${Date.now()}`,
          name: mealName.trim(),
          calories: parsedCalories,
          protein: parsedProtein,
          time: 'Just now',
        },
      ],
    }));
    setMealName('');
    setMealCalories('');
    setMealProtein('');
    setShowForm(false);
  }

  return (
    <View style={styles.screen}>
      <Text style={styles.kicker}>EAT</Text>
      <Text style={styles.pageTitle}>Fuel your day</Text>
      <Text style={styles.pageSubtitle}>Estimates stay editable until you confirm them.</Text>

      <View style={styles.nutritionHero}>
        <View>
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
          <Text style={styles.scanIconText}>▣</Text>
        </View>
        <View style={styles.scanCopy}>
          <Text style={styles.exerciseName}>Scan a meal</Text>
          <Text style={styles.mutedText}>
            Photo analysis will show ranges and ask you to confirm.
          </Text>
        </View>
        <View style={styles.soonPill}>
          <Text style={styles.soonText}>SOON</Text>
        </View>
      </View>

      <Pressable onPress={() => setShowForm((visible) => !visible)} style={styles.primaryButton}>
        <Text style={styles.primaryButtonText}>＋ Add meal manually</Text>
      </Pressable>
      {showForm && (
        <View style={styles.formCard}>
          <TextInput
            accessibilityLabel="Meal name"
            onChangeText={setMealName}
            placeholder="Meal name"
            placeholderTextColor="#746D80"
            style={styles.input}
            value={mealName}
          />
          <View style={styles.twoColumns}>
            <TextInput
              accessibilityLabel="Calories"
              keyboardType="numeric"
              onChangeText={setMealCalories}
              placeholder="Calories"
              placeholderTextColor="#746D80"
              style={[styles.input, styles.flexInput]}
              value={mealCalories}
            />
            <TextInput
              accessibilityLabel="Protein grams"
              keyboardType="numeric"
              onChangeText={setMealProtein}
              placeholder="Protein g"
              placeholderTextColor="#746D80"
              style={[styles.input, styles.flexInput]}
              value={mealProtein}
            />
          </View>
          <Pressable onPress={addMeal} style={styles.secondaryButton}>
            <Text style={styles.secondaryButtonText}>Save confirmed meal</Text>
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
  score,
  protein,
}: {
  data: ReturnType<typeof useVitaData>['data'];
  score: number;
  protein: number;
}) {
  return (
    <View style={styles.screen}>
      <Text style={styles.kicker}>PROGRESS</Text>
      <Text style={styles.pageTitle}>Small wins add up</Text>
      <Text style={styles.pageSubtitle}>This week’s summary uses only data you logged.</Text>

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

function ScoreRing({ score }: { score: number }) {
  return (
    <View style={styles.scoreRing}>
      <Text style={styles.scoreValue}>{score}</Text>
      <Text style={styles.scoreLabel}>READY</Text>
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
  emptySearch: { alignItems: 'center', gap: 5, padding: 24 },
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
  anatomyStage: {
    alignSelf: 'center',
    height: 440,
    maxWidth: 300,
    position: 'relative',
    width: '82%',
  },
  anatomyImage: { height: '100%', width: '100%' },
  muscleHighlight: {
    backgroundColor: 'rgba(239, 68, 68, 0.72)',
    borderColor: '#FCA5A5',
    borderRadius: 30,
    borderWidth: 1,
    position: 'absolute',
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
    justifyContent: 'space-between',
    padding: 20,
  },
  bigMetric: { color: '#F8F6FC', fontSize: 30, fontWeight: '800', marginVertical: 3 },
  macroRight: { alignItems: 'flex-end' },
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
  scanIconText: { color: '#FFF', fontSize: 21 },
  scanCopy: { flex: 1 },
  soonPill: {
    backgroundColor: '#302148',
    borderRadius: 9,
    paddingHorizontal: 8,
    paddingVertical: 5,
  },
  soonText: { color: '#C4B5FD', fontSize: 8, fontWeight: '900', letterSpacing: 1 },
  formCard: { backgroundColor: '#15111B', borderRadius: 18, gap: 11, padding: 15 },
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
