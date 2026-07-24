import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { Pressable, StyleSheet, Text, TextInput, View, type TextInputProps } from 'react-native';

export type SelectOption<T extends string> = {
  description?: string;
  icon?: keyof typeof MaterialCommunityIcons.glyphMap;
  label: string;
  value: T;
};

export function OnboardingProgress({ current, total }: { current: number; total: number }) {
  const percent = Math.round((current / total) * 100);
  return (
    <View style={styles.progressWrap}>
      <View style={styles.progressTrack}>
        <View style={[styles.progressFill, { width: `${percent}%` }]} />
      </View>
      <Text style={styles.progressText}>{percent}%</Text>
    </View>
  );
}

export function QuestionHeader({
  eyebrow,
  subtitle,
  title,
}: {
  eyebrow?: string;
  subtitle?: string;
  title: string;
}) {
  return (
    <View style={styles.header}>
      {!!eyebrow && <Text style={styles.eyebrow}>{eyebrow}</Text>}
      <Text style={styles.title}>{title}</Text>
      {!!subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
    </View>
  );
}

export function SingleSelectCards<T extends string>({
  onChange,
  options,
  value,
}: {
  onChange: (value: T) => void;
  options: SelectOption<T>[];
  value: T | '';
}) {
  return (
    <View style={styles.grid}>
      {options.map((option) => {
        const active = value === option.value;
        return (
          <Pressable
            key={option.value}
            onPress={() => onChange(option.value)}
            style={[styles.optionCard, active && styles.optionCardActive]}
          >
            {!!option.icon && (
              <MaterialCommunityIcons color={active ? '#FFFFFF' : '#A78BFA'} name={option.icon} size={22} />
            )}
            <Text style={[styles.optionLabel, active && styles.optionLabelActive]}>{option.label}</Text>
            {!!option.description && <Text style={styles.optionDescription}>{option.description}</Text>}
          </Pressable>
        );
      })}
    </View>
  );
}

export function MultiSelectCards<T extends string>({
  onChange,
  options,
  value,
}: {
  onChange: (value: T[]) => void;
  options: SelectOption<T>[];
  value: T[];
}) {
  function toggle(next: T) {
    if (next === 'none') {
      onChange(value.includes(next) ? [] : [next]);
      return;
    }
    const withoutNone = value.filter((item) => item !== 'none');
    onChange(withoutNone.includes(next) ? withoutNone.filter((item) => item !== next) : [...withoutNone, next]);
  }

  return (
    <View style={styles.grid}>
      {options.map((option) => {
        const active = value.includes(option.value);
        return (
          <Pressable
            key={option.value}
            onPress={() => toggle(option.value)}
            style={[styles.optionCard, active && styles.optionCardActive]}
          >
            <View style={styles.optionTop}>
              {!!option.icon && (
                <MaterialCommunityIcons color={active ? '#FFFFFF' : '#A78BFA'} name={option.icon} size={22} />
              )}
              {active && <MaterialCommunityIcons color="#FFFFFF" name="check-circle" size={18} />}
            </View>
            <Text style={[styles.optionLabel, active && styles.optionLabelActive]}>{option.label}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

export function UnitPicker<T extends string>({
  onChange,
  options,
  value,
}: {
  onChange: (value: T) => void;
  options: { label: string; value: T }[];
  value: T;
}) {
  return (
    <View style={styles.unitPicker}>
      {options.map((option) => (
        <Pressable
          key={option.value}
          onPress={() => onChange(option.value)}
          style={[styles.unitOption, value === option.value && styles.unitOptionActive]}
        >
          <Text style={[styles.unitText, value === option.value && styles.unitTextActive]}>{option.label}</Text>
        </Pressable>
      ))}
    </View>
  );
}

export function FormInput({ error, label, ...props }: TextInputProps & { error?: string | undefined; label: string }) {
  return (
    <View style={styles.inputGroup}>
      <Text style={styles.inputLabel}>{label}</Text>
      <TextInput
        placeholderTextColor="#746D80"
        style={[styles.input, !!error && styles.inputError]}
        {...props}
      />
      {!!error && <Text style={styles.errorText}>{error}</Text>}
    </View>
  );
}

export function ContinueButton({
  disabled,
  label = 'Continue',
  onPress,
}: {
  disabled?: boolean;
  label?: string;
  onPress: () => void;
}) {
  return (
    <Pressable
      disabled={disabled}
      onPress={onPress}
      style={[styles.continueButton, disabled && styles.continueDisabled]}
    >
      <Text style={styles.continueText}>{label}</Text>
      <MaterialCommunityIcons color="#FFFFFF" name="arrow-right" size={19} />
    </Pressable>
  );
}

export function BackButton({ disabled, onPress }: { disabled?: boolean; onPress: () => void }) {
  return (
    <Pressable disabled={disabled} onPress={onPress} style={[styles.backButton, disabled && styles.backDisabled]}>
      <MaterialCommunityIcons color="#C4B5FD" name="arrow-left" size={19} />
      <Text style={styles.backText}>Back</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  backButton: {
    alignItems: 'center',
    borderRadius: 14,
    flexDirection: 'row',
    gap: 7,
    justifyContent: 'center',
    minHeight: 48,
    minWidth: 92,
    paddingHorizontal: 14,
  },
  backDisabled: { opacity: 0.25 },
  backText: { color: '#C4B5FD', fontSize: 13, fontWeight: '800' },
  continueButton: {
    alignItems: 'center',
    backgroundColor: '#7C3AED',
    borderRadius: 18,
    flexDirection: 'row',
    gap: 10,
    justifyContent: 'center',
    minHeight: 56,
    minWidth: 156,
    paddingHorizontal: 24,
    shadowColor: '#7C3AED',
    shadowOpacity: 0.32,
    shadowRadius: 18,
  },
  continueDisabled: { opacity: 0.45 },
  continueText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '900',
    includeFontPadding: false,
    lineHeight: 19,
    textAlign: 'center',
  },
  errorText: { color: '#FCA5A5', fontSize: 11, fontWeight: '700', marginTop: 5 },
  eyebrow: { color: '#A78BFA', fontSize: 11, fontWeight: '900', letterSpacing: 1.1 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, justifyContent: 'space-between' },
  header: { gap: 8 },
  input: {
    backgroundColor: '#15111B',
    borderColor: '#342A42',
    borderRadius: 15,
    borderWidth: 1,
    color: '#F8F6FC',
    fontSize: 15,
    minHeight: 52,
    paddingHorizontal: 15,
  },
  inputError: { borderColor: '#EF4444' },
  inputGroup: { flex: 1, gap: 7, minWidth: 0 },
  inputLabel: { color: '#C9C1D6', fontSize: 12, fontWeight: '800' },
  optionCard: {
    backgroundColor: '#15111B',
    borderColor: '#2D2439',
    borderRadius: 18,
    borderWidth: 1,
    gap: 7,
    justifyContent: 'center',
    minHeight: 86,
    padding: 14,
    width: '48.5%',
  },
  optionCardActive: { backgroundColor: '#7C3AED', borderColor: '#C4B5FD' },
  optionDescription: { color: '#AFA6BC', fontSize: 11, lineHeight: 16 },
  optionLabel: { color: '#F2EEF8', fontSize: 13, fontWeight: '900', lineHeight: 17 },
  optionLabelActive: { color: '#FFFFFF' },
  optionTop: { alignItems: 'center', flexDirection: 'row', justifyContent: 'space-between' },
  progressFill: { backgroundColor: '#A78BFA', borderRadius: 999, height: '100%' },
  progressText: { color: '#C9C1D6', fontSize: 11, fontWeight: '900', textAlign: 'right', width: 38 },
  progressTrack: { backgroundColor: '#241B34', borderRadius: 999, flex: 1, height: 8, overflow: 'hidden' },
  progressWrap: { alignItems: 'center', flexDirection: 'row', gap: 10 },
  subtitle: { color: '#AFA6BC', fontSize: 14, lineHeight: 21 },
  title: { color: '#FFFFFF', fontSize: 30, fontWeight: '900', lineHeight: 36 },
  unitOption: {
    alignItems: 'center',
    borderRadius: 12,
    flex: 1,
    justifyContent: 'center',
    minHeight: 42,
    paddingHorizontal: 10,
  },
  unitOptionActive: { backgroundColor: '#7C3AED' },
  unitPicker: {
    alignItems: 'center',
    backgroundColor: '#15111B',
    borderRadius: 16,
    flexDirection: 'row',
    minHeight: 54,
    padding: 6,
  },
  unitText: {
    color: '#AFA6BC',
    fontSize: 12,
    fontWeight: '900',
    includeFontPadding: false,
    lineHeight: 16,
    textAlign: 'center',
  },
  unitTextActive: { color: '#FFFFFF' },
});
