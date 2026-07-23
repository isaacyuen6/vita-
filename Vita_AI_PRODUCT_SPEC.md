# Vita AI — Complete Product Specification and Build Plan

> **Document purpose:** This file is the implementation source of truth for Codex and human developers.
>
> **Product type:** Cross-platform mobile health, fitness, nutrition, recovery, and lifestyle assistant.
>
> **Working name:** Vita AI
>
> **Primary launch market:** Malaysia
>
> **Primary launch audience:** Students, working adults, gym beginners, recreational athletes, basketball players, and users who want simple daily health guidance.
>
> **Document status:** Initial production blueprint
>
> **Important instruction to Codex:** Do not attempt to implement the entire product in one pass. Follow the phased delivery plan, keep the application runnable after every milestone, and do not replace deterministic calculations or safety rules with unrestricted LLM output.

---

## 1. Product Vision

Vita AI is a personal health decision assistant that combines:

- Workout planning and logging
- Goal-specific athletic training
- Food-photo nutrition estimation
- Manual and barcode food tracking
- Sleep and recovery tracking
- Progress visualisation
- Body-progress assessment
- Nearby restaurant and meal recommendations
- A context-aware AI coach

The application should answer the user's most important daily question:

> **“Based on my goal, recent training, food intake, sleep, recovery, schedule, location, budget, and available equipment, what should I do today?”**

Vita AI must not behave like a collection of unrelated trackers. The modules must share data and produce one coherent daily plan.

### Example

A user:

- Slept 5 hours and 20 minutes
- Trained legs yesterday
- Reports high quadriceps soreness
- Has basketball tomorrow
- Has eaten 62 g of a 130 g protein target
- Has RM25 available for dinner
- Wants to jump higher

The application may recommend:

1. Replace heavy lower-body training with mobility and low-intensity upper-body work.
2. Avoid high-volume plyometrics today.
3. Consume approximately 55–70 g more protein before the day ends.
4. Show nearby meals within RM25 that are likely to contribute at least 30 g protein.
5. Aim for an earlier bedtime.
6. Reschedule the next lower-body power session after adequate recovery.

---

## 2. Product Principles

All product and engineering decisions must follow these principles.

### 2.1 Guidance over raw data

Do not only show numbers. Explain what the numbers mean and give the user a reasonable next action.

### 2.2 Honest uncertainty

Food calories, body analysis, recovery, and camera-based form analysis are estimates. Display confidence levels and let the user correct results.

### 2.3 Deterministic core, AI explanation

Calculations such as calorie targets, goal progress, training volume, readiness components, and safety restrictions must be implemented with explicit code and rules.

The LLM may:

- Interpret natural-language requests
- Select approved tools
- Summarise results
- Explain recommendations
- Ask for missing non-critical context
- Reformat existing structured results

The LLM must not:

- Invent health measurements
- Directly edit health records without tool confirmation
- Invent exercises outside the approved exercise database
- Ignore pain or safety rules
- Produce extreme calorie targets
- Diagnose medical conditions
- Claim exact calorie accuracy from an image
- Claim exact body-fat percentage from a photograph

### 2.4 Privacy by default

Health information, body photographs, location, and meal history are sensitive. Collect only necessary data, request explicit permissions, and give users deletion and export controls.

### 2.5 Progressive complexity

The first release must solve a small number of problems reliably. Advanced body analysis, full exercise-form scoring, delivery transactions, and predictive models are later phases.

### 2.6 Mobile-first and offline-friendly

Users must be able to:

- View downloaded workouts
- Log sets
- Record notes
- Save pending meal entries
- Review recent plans

when connectivity is poor. Synchronise when the connection returns.

---

## 3. Target Users

### 3.1 Primary persona: Health-improvement beginner

- Wants to become healthier
- May not know how to structure workouts
- Finds calorie tracking tedious
- Needs clear and non-judgmental guidance
- Uses a smartphone daily
- May or may not own a wearable
- Wants visible progress

### 3.2 Secondary persona: Recreational athlete

- Plays basketball, football, badminton, running, or another sport
- Wants a performance goal such as jumping higher, running faster, or improving endurance
- Needs training to adapt around sports sessions and recovery

### 3.3 Secondary persona: Busy working adult or student

- Has limited time
- Often eats outside
- Needs recommendations based on budget, location, and schedule
- Wants fast logging rather than detailed manual entry

### 3.4 Future persona: Personal trainer or coach

- Reviews client adherence
- Assigns plans
- Receives progress reports
- Comments on workouts

Coach functionality is out of scope for the initial MVP.

---

## 4. Product Positioning

### One-line description

**Vita AI turns training, nutrition, sleep, recovery, and nearby food choices into one adaptive daily plan.**

### Tagline options

- Know what your body needs today.
- Train smarter. Eat better. Recover properly.
- One coach for training, food, and recovery.
- Your health, turned into a daily plan.

### Differentiation

Vita AI is not only:

- A calorie tracker
- A workout log
- A sleep app
- An AI chatbot
- A restaurant finder

Its value comes from connecting all five areas and adjusting recommendations when one area changes.

---

## 5. Scope

## 5.1 MVP scope

The first production-capable MVP includes:

1. Email or social authentication
2. User onboarding and consent
3. Health and fitness profile
4. Goal creation
5. Workout-plan generation from approved rules
6. Exercise library
7. Workout logging
8. Progressive-overload recommendations
9. Food-photo upload and AI-assisted food identification
10. User confirmation and portion correction
11. Manual meal logging
12. Daily calorie and macronutrient dashboard
13. Manual sleep logging
14. Basic readiness score
15. Goal progress bars
16. AI coach using internal tools
17. Restaurant discovery by location, cuisine, budget, and distance
18. Saved meals and saved restaurants
19. Push reminders
20. Data export and account deletion

## 5.2 Post-MVP scope

- Android Health Connect integration
- Apple HealthKit integration
- Barcode scanning using Open Food Facts
- Wearable sleep import
- Camera rep counting
- Form feedback for selected exercises
- Standardised body-progress photographs
- Jump-height measurement
- Menu image recognition
- Calendar integration
- Subscription billing
- Coach accounts
- Social challenges
- Delivery-service deep links
- Direct merchant partnerships

## 5.3 Explicitly out of scope for MVP

- Medical diagnosis
- Injury diagnosis
- Medication advice
- Exact body-fat estimation from photographs
- Automatic meal calorie logging without user confirmation
- Full Grab-style ordering, payment, rider dispatch, refund, or delivery tracking
- Real-time clinical monitoring
- Emergency response
- Public social feed
- User-to-user messaging
- Marketplace
- Trainer payouts
- Continuous microphone sleep monitoring
- Background camera surveillance

---

## 6. Core User Journeys

## 6.1 First-time onboarding

1. Open application
2. View product explanation
3. Create account
4. Accept Terms and Privacy Policy
5. Select main goal
6. Enter optional profile data:
   - Date of birth or age range
   - Height
   - Weight
   - Preferred units
   - Training experience
   - Weekly availability
   - Available equipment
   - Dietary preference
   - Allergies
   - Location permission preference
   - Current limitations
7. Select data permissions
8. Generate initial plan
9. Arrive at Today screen

### Onboarding acceptance criteria

- User can skip optional data.
- Required fields are clearly marked.
- Health-related consent is separate from marketing consent.
- Body-image consent is not requested until body-image features are used.
- A default beginner plan can be generated without wearable data.
- Unsafe or unrealistic goal rates trigger a warning and safer suggestion.

---

## 6.2 Daily plan journey

1. User opens Today screen.
2. Application loads:
   - Latest sleep
   - Recent training load
   - Soreness
   - Current meal totals
   - Main active goal
   - Scheduled workout
   - Current readiness
3. Application displays:
   - Readiness score
   - Today's recommended workout
   - Calories and protein remaining
   - Goal progress
   - Up to three priorities
4. User can accept, modify, or dismiss a recommendation.
5. User actions update the recommendation history.

---

## 6.3 Start workout journey

1. Open Train tab.
2. Select scheduled workout or quick workout.
3. Review exercises.
4. Replace exercises when equipment is unavailable.
5. Start session.
6. Log:
   - Weight
   - Repetitions
   - RPE or RIR
   - Completion
   - Pain flag
   - Notes
7. Complete workout.
8. Application calculates:
   - Volume
   - Personal records
   - Adherence
   - Suggested progression
9. User provides optional session feedback.

---

## 6.4 Meal photo journey

1. Open Eat tab.
2. Tap Scan Meal.
3. Capture or upload image.
4. Client compresses and removes unnecessary metadata.
5. Image is uploaded using a signed URL.
6. Backend creates an asynchronous analysis job.
7. AI service returns candidate foods, portions, nutrients, and confidence.
8. User reviews and edits each item.
9. User confirms meal.
10. Confirmed values are saved in the food diary.
11. Daily totals update.

### Meal-photo acceptance criteria

- Results are always presented as estimates.
- The user can edit name, portion, unit, cooking method, and quantity.
- A confidence label is shown.
- The image is not used for model training by default.
- Failed analysis does not lose the image or draft entry.
- The meal is not added to nutrition totals until confirmed.

---

## 6.5 Restaurant recommendation journey

1. User types or speaks:
   - Cuisine
   - Budget
   - Distance
   - Nutrition preference
   - Dine-in or delivery
2. Application requests location only when needed.
3. Backend searches a places provider.
4. Recommendation engine filters and ranks results.
5. Application shows:
   - Restaurant
   - Distance
   - Opening state
   - Approximate price
   - Suggested order if menu data is available
   - Estimated calories and protein with confidence
   - Reason for recommendation
6. User may:
   - Open directions
   - Call
   - Open website
   - Open supported delivery app
   - Save restaurant
   - Add a meal estimate

### Limitation

Do not display exact live menu prices unless the source explicitly provides current menu data and permits use.

---

## 7. Functional Requirements

# 7.1 Authentication and accounts

### Requirements

- Email magic link or email/password
- Optional Google and Apple sign-in
- Refresh-token rotation
- Logout from current device
- Logout from all devices
- Password-reset flow when passwords are used
- Account deletion
- Data export
- User session audit
- Device registration for notifications

### Roles

Initial roles:

- `user`
- `admin`
- `support`

Future:

- `coach`
- `organisation_admin`

---

# 7.2 User profile

### Profile fields

- `id`
- `display_name`
- `timezone`
- `locale`
- `unit_system`
- `date_of_birth` or `age_range`
- `height_cm`
- `current_weight_kg`
- `activity_level`
- `training_experience`
- `weekly_training_days`
- `available_equipment`
- `dietary_preferences`
- `allergens`
- `budget_currency`
- `default_meal_budget`
- `location_permission_state`
- `health_data_permission_state`
- `created_at`
- `updated_at`

### Profile rules

- Use metric storage internally.
- Convert to imperial only in presentation.
- Do not require sex unless a calculation genuinely uses it.
- When a calculation changes based on biological variables, explain why the field is requested and permit a fallback estimate.
- Keep medical-history fields out of the MVP unless a qualified safety review defines them.

---

# 7.3 Goals

### Supported MVP goals

- Lose weight
- Gain weight
- Build muscle
- Increase strength
- Improve general fitness
- Jump higher
- Improve basketball conditioning
- Improve mobility
- Build a selected muscle group
- Improve sleep consistency
- Custom measurable goal

### Goal properties

- Goal type
- Display title
- Start date
- Optional target date
- Start value
- Target value
- Current value
- Unit
- Priority
- Status
- Progress method
- Confidence
- User motivation note
- Constraints
- Last recalculated time

### Goal statuses

- `draft`
- `active`
- `paused`
- `completed`
- `cancelled`

### Progress rules

A simple measurable goal uses:

```text
progress = clamp((current - start) / (target - start), 0, 1)
```

For decreasing targets:

```text
progress = clamp((start - current) / (start - target), 0, 1)
```

Composite goals must use weighted components.

Example jump-higher goal:

- Jump measurement: 50%
- Lower-body strength milestone: 20%
- Training adherence: 15%
- Mobility milestone: 10%
- Recovery adherence: 5%

Never display false precision. Round composite progress to a whole percentage and display component details.

---

# 7.4 Exercise library

### Exercise data

- Name
- Slug
- Description
- Primary muscles
- Secondary muscles
- Movement pattern
- Equipment
- Difficulty
- Instructions
- Common mistakes
- Easier regressions
- Harder progressions
- Contraindication notes
- Video or animation asset
- Thumbnail
- Supported goal tags
- Supported pose-analysis type
- Source attribution
- Review status

### Required movement patterns

- Squat
- Hinge
- Horizontal push
- Vertical push
- Horizontal pull
- Vertical pull
- Lunge
- Carry
- Core anti-extension
- Core anti-rotation
- Rotation
- Jump
- Landing
- Sprint
- Calf and ankle work
- Mobility

### Content policy

Only exercises marked `review_status = approved` may appear in generated workout plans.

---

# 7.5 Workout planning

Workout generation uses a deterministic plan engine.

### Inputs

- Goal
- Experience
- Weekly schedule
- Equipment
- Session duration
- Recent completed sessions
- Muscle soreness
- Pain flags
- Sport schedule
- Recovery state
- Exercise preferences
- Exercise exclusions

### Outputs

- Weekly plan
- Session names
- Exercise order
- Sets
- Repetition range
- Rest time
- Target effort
- Tempo when relevant
- Warm-up
- Cool-down
- Substitution options
- Plan explanation

### Plan engine stages

1. Validate user state.
2. Select goal template.
3. Determine weekly frequency.
4. Allocate movement patterns.
5. Allocate target weekly volume.
6. Select approved exercises.
7. Apply equipment constraints.
8. Apply soreness and pain restrictions.
9. Apply sport-interference rules.
10. Set intensity and progression.
11. Run safety validation.
12. Save structured plan.
13. Ask LLM to explain the approved plan.

### Example jump programme components

- Foundational strength
- Plyometrics
- Landing mechanics
- Ankle stiffness and calf strength
- Hip extension
- Core stability
- Mobility
- Jump testing
- Fatigue management

### Pain behavior

When a user records sharp, severe, sudden, or worsening pain:

- Stop automatic progression for affected movements.
- Do not recommend training through pain.
- Display a non-diagnostic safety message.
- Suggest appropriate professional assessment when warranted.
- Store a safety event.

---

# 7.6 Workout logging

### Loggable fields

- Exercise
- Set number
- Weight
- Repetitions
- Duration
- Distance
- RPE
- RIR
- Tempo
- Completion
- Pain flag
- Notes
- Timestamp

### Session summary

- Duration
- Total sets
- Total repetitions
- Volume load
- Personal records
- Target completion
- Muscle-group volume
- User-rated difficulty
- User-rated enjoyment
- Soreness forecast disclaimer
- Next-session suggestion

### Progressive overload

MVP uses simple double progression.

Example:

- Rep range: 8–12
- Increase load when all working sets reach the top of the range at acceptable effort.
- If the user repeatedly misses the lower bound, reduce load or sets.
- Never increase load after a pain flag.
- Cap automatic increments based on exercise type and available plate increments.

---

# 7.7 Nutrition targets

### Inputs

- Height
- Weight
- Age or age range
- Activity level
- Goal
- Preferred rate of weight change
- Training frequency
- Dietary preference

### Outputs

- Estimated maintenance calories
- Target calorie range
- Protein range
- Fat minimum range
- Carbohydrate remainder
- Fibre suggestion
- Hydration suggestion

### Safety constraints

- Use ranges instead of pretending the estimate is exact.
- Do not allow extremely aggressive weight-change targets.
- Do not automatically lower targets due to a single weight measurement.
- Use rolling weight averages.
- Do not provide eating-disorder treatment.
- When a user shows concerning restriction behavior, interrupt normal optimisation and provide a safety-oriented response.

### Nutrition display

- Calories consumed
- Target range
- Protein consumed and target
- Carbohydrates
- Fat
- Fibre
- Water
- Meal timeline
- Data confidence

---

# 7.8 Meal logging

### Supported methods

- Photo
- Manual search
- Free text
- Voice transcription
- Saved meal
- Recent meal
- Barcode
- Recipe
- Restaurant estimate

### Meal item fields

- Food name
- Brand
- Quantity
- Unit
- Estimated grams
- Preparation method
- Calories
- Protein
- Carbohydrates
- Fat
- Fibre
- Sodium
- Source
- Confidence
- User confirmed
- Image reference

### Source types

- `manual`
- `photo_ai`
- `barcode_open_food_facts`
- `saved_meal`
- `restaurant_estimate`
- `recipe`
- `imported`

---

# 7.9 Food-photo analysis

### Pipeline

```text
Image upload
  -> validation
  -> orientation correction
  -> metadata removal
  -> image-quality check
  -> food-region detection
  -> candidate food classification
  -> portion estimation
  -> nutrition lookup
  -> uncertainty calculation
  -> user confirmation
  -> final nutrition entry
```

### Required output schema

```json
{
  "analysisId": "uuid",
  "status": "completed",
  "overallConfidence": "medium",
  "items": [
    {
      "candidateName": "grilled chicken breast",
      "alternatives": ["roasted chicken", "fried chicken"],
      "estimatedServing": {
        "minGrams": 120,
        "maxGrams": 170,
        "suggestedGrams": 145
      },
      "preparationMethod": "grilled",
      "nutritionRange": {
        "caloriesMin": 190,
        "caloriesMax": 310,
        "proteinMinGrams": 32,
        "proteinMaxGrams": 48
      },
      "confidence": 0.74
    }
  ],
  "warnings": [
    "Cooking oil and hidden sauces may not be visible."
  ]
}
```

### UX requirements

- Show a range before confirmation.
- Let the user select alternatives.
- Ask about hidden oil, sauce, or fillings where important.
- Permit quick portion presets.
- Learn from user corrections only after explicit product-level consent.
- Keep original and corrected values for quality evaluation.

---

# 7.10 Sleep and recovery

### Manual sleep fields

- Bedtime
- Wake time
- Estimated sleep onset
- Number of awakenings
- Sleep quality 1–5
- Morning energy 1–5
- Notes
- Caffeine after selected time
- Source

### Imported sleep fields

- Source provider
- Start
- End
- Duration
- Stages where available
- Resting heart rate where available
- HRV where available
- Data coverage
- Import timestamp

### Readiness score

MVP readiness is a transparent weighted score.

Possible weights:

- Sleep duration: 30%
- Sleep consistency: 15%
- Recent training load: 20%
- Self-reported soreness: 15%
- Morning energy: 10%
- Nutrition adherence: 10%

When wearable data exists, a later version may include resting-heart-rate and HRV trend components.

### Readiness categories

- 0–39: Low
- 40–59: Reduced
- 60–79: Normal
- 80–100: High

### Required explanation

Show which components raised or lowered the result.

Never describe readiness as a medical measurement.

---

# 7.11 Body-progress analysis

This is post-MVP.

### Inputs

- Standardised front photograph
- Standardised side photograph
- Standardised back photograph
- Body measurements
- Weight trend
- Strength trend
- User-selected visual goal
- Training history

### Outputs

- Progress-photo comparison
- Posture observations stated as possibilities
- Symmetry observations stated as possibilities
- Measurement trend
- Muscle-priority recommendations linked to the user's stated goal
- Confidence and limitations

### Prohibited outputs

- Attractiveness score
- “Ugly” or shame-based wording
- Exact body-fat percentage from images
- Medical diagnosis
- Hormonal claims
- Claims of guaranteed appearance change
- Sexualised analysis
- Public sharing by default

### Privacy controls

- Separate explicit consent
- Private by default
- Optional face blur
- Device authentication gate
- Delete individual photos
- Delete entire assessment history
- Exclude from training by default
- Signed URLs
- Short access expiry
- Encryption at rest and in transit

---

# 7.12 Exercise form and rep analysis

This is post-MVP.

### Initial supported movements

- Bodyweight squat
- Push-up
- Lunge
- Bicep curl
- Shoulder press
- Plank
- Jump landing

### Technology

Use MediaPipe Pose Landmarker as the initial body-landmark foundation.

### Pipeline

```text
Camera setup guidance
  -> person and full-body validation
  -> pose landmarks
  -> smoothing
  -> exercise-state classifier
  -> rep segmentation
  -> joint-angle and timing rules
  -> confidence calculation
  -> feedback
```

### Feedback requirements

- Use cautious wording.
- Do not present camera analysis as a professional physical assessment.
- Require adequate confidence before showing a warning.
- Support camera-angle instructions.
- Keep processing on device where practical.
- Never store video by default.
- If video is uploaded, request explicit consent and use short retention.

---

# 7.13 Restaurant discovery

### Inputs

- Current or chosen location
- Cuisine
- Budget
- Distance
- Opening preference
- Dine-in or delivery
- Dietary preference
- Allergens
- Remaining calorie target
- Remaining protein target

### Ranking factors

- Query match
- Open now
- Distance
- Budget match
- Dietary compatibility
- Rating
- Nutrition suitability
- User history
- Confidence in menu information

### Result object

```json
{
  "placeId": "provider-id",
  "name": "Example Sushi",
  "distanceKm": 3.4,
  "openNow": true,
  "priceLevel": 2,
  "estimatedSpend": {
    "currency": "MYR",
    "min": 24,
    "max": 36
  },
  "suggestedOrder": {
    "name": "salmon don and miso soup",
    "estimatedCalories": {
      "min": 580,
      "max": 760
    },
    "estimatedProteinGrams": {
      "min": 28,
      "max": 42
    },
    "confidence": "low"
  },
  "reason": "Matches your sushi request, distance, and RM35 budget.",
  "actions": {
    "directionsUrl": "...",
    "websiteUrl": "...",
    "phone": "...",
    "deliveryDeepLink": null
  }
}
```

### Rules

- Do not fabricate a menu.
- When menu data is unavailable, recommend the restaurant only and label nutrition as unavailable.
- Mark sponsored recommendations.
- Keep sponsored status separate from organic ranking.
- Do not scrape providers in violation of their terms.

---

# 7.14 AI coach

### Coach capabilities

- Explain today's plan
- Adjust workout duration
- Substitute equipment
- Summarise weekly progress
- Suggest meals from remaining targets
- Search nearby restaurants
- Explain goal progress
- Reschedule missed workouts
- Answer exercise-library questions
- Encourage recovery
- Escalate safety scenarios

### Tool list

- `get_user_profile`
- `get_active_goals`
- `get_today_summary`
- `get_recent_workouts`
- `generate_workout`
- `modify_workout`
- `log_workout_note`
- `get_nutrition_summary`
- `search_food`
- `create_meal_draft`
- `get_sleep_summary`
- `calculate_readiness`
- `search_restaurants`
- `get_goal_progress`
- `create_reminder`
- `record_user_feedback`
- `trigger_safety_response`

### LLM system rules

1. Never invent tool results.
2. Never claim a write succeeded unless the tool confirms it.
3. Use approved exercises only.
4. Use structured nutrition values from the backend.
5. Mention uncertainty for estimates.
6. Do not diagnose.
7. Do not override pain and safety flags.
8. Ask for confirmation before destructive or significant changes.
9. Keep answers actionable and concise by default.
10. Cite the internal source type in developer logs.

### Retrieval

Use retrieval only over:

- Approved exercise content
- Approved nutrition guidance
- Product help content
- The user's own authorised history
- Safety policies

Do not index private user data into a shared vector namespace.

---

## 8. Information Architecture

### Bottom navigation

1. **Today**
2. **Train**
3. **Eat**
4. **Progress**
5. **Coach**

### Secondary screens

- Profile
- Settings
- Permissions
- Notifications
- Subscription
- Saved restaurants
- Saved meals
- Exercise library
- Sleep history
- Data export
- Account deletion
- Privacy centre
- Help and feedback

---

## 9. Screen Specifications

# 9.1 Today screen

### Components

- Greeting
- Date
- Readiness card
- Main goal card
- Today's workout card
- Nutrition progress
- Sleep summary
- Daily priorities
- AI coach prompt
- Quick actions

### Quick actions

- Scan meal
- Start workout
- Log sleep
- Ask coach
- Find food nearby

### Empty state

When no data exists:

- Explain what to log
- Offer one-tap setup
- Do not display a fake score

---

# 9.2 Train screen

### Sections

- Today's session
- Weekly plan
- Quick workout
- Exercise library
- Recent workouts
- Personal records

### Workout player

- Current exercise
- Demonstration
- Instructions
- Set table
- Rest timer
- Replace exercise
- Pain flag
- Notes
- Previous performance
- Next exercise

---

# 9.3 Eat screen

### Sections

- Calories and macro progress
- Scan meal
- Add manually
- Recent meals
- Saved meals
- Today's timeline
- Nearby food
- Water

### Meal review screen

- Image
- Detected items
- Portion controls
- Cooking method
- Nutrition range
- Confidence
- Save and confirm

---

# 9.4 Progress screen

### Sections

- Active goal progress
- Weight trend
- Workout adherence
- Strength records
- Nutrition consistency
- Sleep consistency
- Jump progress where enabled
- Weekly report

### Chart requirements

- Accessible labels
- Meaningful empty states
- Unit switching
- Date-range selector
- No misleading truncated axes
- Confidence or estimated data visually distinguished

---

# 9.5 Coach screen

### Components

- Conversation
- Suggested prompts
- Tool result cards
- Confirmation dialogs
- Safety banners
- Context controls

### Suggested prompts

- What should I train today?
- I only have 30 minutes.
- What can I eat with my remaining calories?
- Find sushi under RM35 nearby.
- Why did my readiness drop?
- How close am I to my goal?

---

## 10. Technical Architecture

## 10.1 Recommended approach

Use a **monorepo with a modular monolith backend** and a separate Python AI service.

Do not begin with many microservices.

### Monorepo

Use `pnpm` workspaces and Turborepo.

```text
vita-ai/
├── apps/
│   ├── mobile/
│   ├── api/
│   ├── ai-service/
│   └── admin/
├── packages/
│   ├── ui/
│   ├── types/
│   ├── validation/
│   ├── config/
│   ├── api-client/
│   ├── health-rules/
│   └── eslint-config/
├── infrastructure/
│   ├── docker/
│   ├── terraform/
│   └── monitoring/
├── docs/
├── scripts/
├── .github/
└── README.md
```

---

## 10.2 Mobile application

### Stack

- React Native
- Expo
- TypeScript
- Expo Router
- TanStack Query
- Zustand for small client state
- React Hook Form
- Zod
- Expo SecureStore
- Expo Image Picker or Camera
- Expo Notifications
- MMKV or SQLite for offline queue and cached workout state
- Native modules for Health Connect and HealthKit when implemented

### Mobile rules

- Server state belongs in TanStack Query.
- Authentication secrets belong in secure storage.
- Do not store body-image URLs permanently in insecure local storage.
- Use an offline mutation queue for workout and meal drafts.
- Use typed API clients generated from OpenAPI.
- Support dark mode.
- Support dynamic font sizing.
- Build accessible touch targets.

---

## 10.3 API backend

### Stack

- NestJS
- TypeScript
- PostgreSQL
- Prisma ORM
- Redis
- BullMQ
- OpenAPI
- Pino structured logging
- Sentry or equivalent error tracking
- Object storage compatible with S3

### Modules

```text
AuthModule
UsersModule
ProfilesModule
ConsentModule
GoalsModule
ExercisesModule
WorkoutPlansModule
WorkoutLogsModule
NutritionModule
MealAnalysisModule
SleepModule
ReadinessModule
ProgressModule
RestaurantsModule
CoachModule
NotificationsModule
FilesModule
SubscriptionsModule
AdminModule
AuditModule
SafetyModule
```

### Backend rules

- Controllers validate input and call services.
- Domain logic belongs in services or domain modules.
- LLM prompts do not contain business logic.
- Every write validates ownership.
- Sensitive actions produce audit entries.
- Long-running image analysis uses jobs.
- API endpoints are versioned under `/v1`.
- Use idempotency keys for meal-analysis and workout-completion writes.

---

## 10.4 AI service

### Stack

- Python 3.12+
- FastAPI
- Pydantic
- PyTorch or ONNX Runtime where needed
- MediaPipe
- OpenCV
- Pillow
- Structured JSON output
- Model registry abstraction
- Prometheus metrics

### Routes

- `POST /v1/food/analyse`
- `POST /v1/pose/analyse-frame`
- `POST /v1/pose/analyse-video`
- `POST /v1/body/analyse`
- `GET /v1/models`
- `GET /health`
- `GET /ready`

### Rules

- AI service accepts internal service credentials only.
- Validate image type and size.
- Reject unsupported or suspicious files.
- Strip metadata.
- Log model version, latency, confidence, and result status.
- Never log raw private images.
- Return typed errors.
- Support fallback models.
- Store no image unless required by the job contract.

---

## 10.5 Data layer

### PostgreSQL extensions

- `uuid-ossp` or native UUID generation
- `pgcrypto`
- `pgvector`
- `citext` where useful

### Redis use

- Rate limiting
- Background queue
- Short-lived result cache
- Distributed locks
- Notification scheduling
- Restaurant-search cache

### Object storage buckets

- `meal-images-private`
- `progress-images-private`
- `exercise-assets-public`
- `exports-private`
- `support-attachments-private`

Use separate access policies for each bucket.

---

## 10.6 Deployment environments

- `local`
- `development`
- `staging`
- `production`

Never use production data in development.

### Suggested infrastructure

MVP:

- Managed PostgreSQL
- Managed Redis
- S3-compatible storage
- Container hosting for API and AI service
- Expo EAS for builds
- GitHub Actions for CI/CD

Later:

- Infrastructure as code
- Autoscaling AI workers
- CDN for public exercise assets
- Dedicated secrets manager
- Read replicas
- Data warehouse

---

## 11. Database Schema

The exact schema may evolve, but Codex should create initial Prisma models matching these domains.

### Core identity

- `User`
- `UserProfile`
- `Device`
- `SessionAudit`
- `ConsentRecord`
- `DataExportRequest`
- `AccountDeletionRequest`

### Goals and measurements

- `Goal`
- `GoalComponent`
- `GoalProgressSnapshot`
- `BodyMeasurement`
- `WeightEntry`

### Exercise and workouts

- `Exercise`
- `ExerciseMuscle`
- `ExerciseAsset`
- `ExerciseSubstitution`
- `WorkoutPlan`
- `WorkoutWeek`
- `WorkoutSessionTemplate`
- `WorkoutExerciseTemplate`
- `WorkoutSessionLog`
- `WorkoutExerciseLog`
- `WorkoutSetLog`
- `PersonalRecord`
- `PainFlag`

### Nutrition

- `Food`
- `FoodServing`
- `Meal`
- `MealItem`
- `MealImage`
- `MealAnalysis`
- `MealAnalysisCandidate`
- `SavedMeal`
- `Recipe`
- `RecipeIngredient`
- `DailyNutritionTarget`

### Sleep and recovery

- `SleepSession`
- `RecoveryCheckIn`
- `ReadinessSnapshot`
- `HealthDataConnection`
- `HealthDataImport`

### Restaurants

- `SavedRestaurant`
- `RestaurantSearch`
- `RestaurantRecommendation`
- `RestaurantInteraction`

### AI and safety

- `CoachConversation`
- `CoachMessage`
- `ToolInvocation`
- `Recommendation`
- `RecommendationFeedback`
- `SafetyEvent`
- `ModelRun`

### Notifications

- `NotificationPreference`
- `ScheduledNotification`
- `NotificationDelivery`

### Audit fields

Most mutable tables should include:

- `id`
- `created_at`
- `updated_at`
- `created_by`
- `version`
- optional `deleted_at`

Use soft deletion only where product and legal requirements justify it. Account deletion must eventually remove or irreversibly anonymise personal data according to the retention policy.

---

## 12. API Specification

All endpoints use `/v1`.

# 12.1 Authentication

- `POST /auth/register`
- `POST /auth/login`
- `POST /auth/refresh`
- `POST /auth/logout`
- `POST /auth/logout-all`
- `POST /auth/password-reset/request`
- `POST /auth/password-reset/confirm`
- `GET /auth/me`

# 12.2 Profile

- `GET /profile`
- `PATCH /profile`
- `GET /profile/preferences`
- `PATCH /profile/preferences`
- `GET /profile/consents`
- `POST /profile/consents`
- `DELETE /profile`
- `POST /profile/export`

# 12.3 Goals

- `GET /goals`
- `POST /goals`
- `GET /goals/:id`
- `PATCH /goals/:id`
- `POST /goals/:id/activate`
- `POST /goals/:id/pause`
- `POST /goals/:id/complete`
- `GET /goals/:id/progress`

# 12.4 Exercises

- `GET /exercises`
- `GET /exercises/:id`
- `GET /exercises/:id/substitutions`
- `GET /muscle-groups`

# 12.5 Workout plans

- `POST /workout-plans/generate`
- `GET /workout-plans/current`
- `GET /workout-plans/:id`
- `PATCH /workout-plans/:id`
- `POST /workout-plans/:id/regenerate`
- `POST /workout-plans/:id/reschedule`

# 12.6 Workout logs

- `POST /workouts/start`
- `GET /workouts/:id`
- `PATCH /workouts/:id`
- `POST /workouts/:id/sets`
- `PATCH /workouts/:id/sets/:setId`
- `POST /workouts/:id/complete`
- `POST /workouts/:id/pain-flags`
- `GET /workouts/history`
- `GET /workouts/personal-records`

# 12.7 Nutrition

- `GET /nutrition/today`
- `GET /nutrition/targets`
- `PATCH /nutrition/targets`
- `GET /foods/search`
- `GET /foods/barcode/:barcode`
- `POST /meals`
- `GET /meals/:id`
- `PATCH /meals/:id`
- `DELETE /meals/:id`
- `GET /meals`
- `POST /meals/:id/confirm`

# 12.8 Meal analysis

- `POST /meal-analysis/upload-url`
- `POST /meal-analysis`
- `GET /meal-analysis/:id`
- `POST /meal-analysis/:id/corrections`
- `POST /meal-analysis/:id/confirm`

# 12.9 Sleep and readiness

- `POST /sleep`
- `GET /sleep`
- `GET /sleep/latest`
- `PATCH /sleep/:id`
- `DELETE /sleep/:id`
- `POST /recovery/check-in`
- `GET /readiness/today`
- `POST /readiness/recalculate`

# 12.10 Progress

- `GET /progress/overview`
- `GET /progress/weight`
- `GET /progress/strength`
- `GET /progress/adherence`
- `GET /progress/nutrition`
- `GET /progress/sleep`
- `GET /progress/weekly-report`

# 12.11 Restaurants

- `POST /restaurants/search`
- `GET /restaurants/saved`
- `POST /restaurants/:providerId/save`
- `DELETE /restaurants/:providerId/save`
- `POST /restaurants/:providerId/interactions`

# 12.12 Coach

- `POST /coach/conversations`
- `GET /coach/conversations`
- `GET /coach/conversations/:id`
- `POST /coach/conversations/:id/messages`
- `POST /coach/tool-confirmations/:id`
- `POST /coach/messages/:id/feedback`

# 12.13 Notifications

- `GET /notifications/preferences`
- `PATCH /notifications/preferences`
- `POST /notifications/register-device`
- `DELETE /notifications/devices/:id`

---

## 13. Error Format

All APIs must return a consistent error structure.

```json
{
  "error": {
    "code": "MEAL_ANALYSIS_LOW_QUALITY_IMAGE",
    "message": "The image is too dark to analyse reliably.",
    "details": {
      "suggestion": "Retake the photo in brighter lighting."
    },
    "requestId": "uuid"
  }
}
```

Do not expose stack traces or internal model prompts.

---

## 14. Background Jobs

### Queues

- `meal-analysis`
- `pose-analysis`
- `body-analysis`
- `health-import`
- `daily-summary`
- `weekly-report`
- `notifications`
- `data-export`
- `account-deletion`
- `restaurant-refresh`

### Job requirements

- Retry with exponential backoff
- Dead-letter handling
- Idempotency
- Timeout
- Progress state
- Correlation ID
- Sanitised logs
- Metrics
- Manual replay for admin users

---

## 15. Recommendation Engine

Recommendations should be stored as structured objects.

```json
{
  "type": "workout_adjustment",
  "priority": "high",
  "title": "Reduce lower-body load today",
  "reasonCodes": [
    "HIGH_QUAD_SORENESS",
    "LOW_SLEEP_DURATION",
    "BASKETBALL_TOMORROW"
  ],
  "evidence": {
    "sleepHours": 5.3,
    "soreness": 4,
    "scheduledSport": "basketball"
  },
  "actions": [
    {
      "type": "replace_workout",
      "targetWorkoutId": "uuid",
      "replacementTemplateId": "uuid"
    }
  ],
  "confidence": 0.83,
  "expiresAt": "ISO_DATE"
}
```

The LLM turns this into friendly language but must not change the underlying evidence.

---

## 16. Security Requirements

### Authentication

- Use secure, proven identity libraries.
- Hash passwords with Argon2id when managing passwords.
- Rotate refresh tokens.
- Store mobile tokens in secure storage.
- Detect token reuse.

### Authorisation

- Enforce ownership at the API and database layers.
- Use role-based permissions.
- Admin access must be audited.
- Support staff must not automatically access body images.

### Transport and storage

- TLS for all network traffic.
- Encrypt sensitive database fields where practical.
- Use private object-storage buckets.
- Use signed URLs with short expiry.
- Strip EXIF location metadata from images.

### Abuse prevention

- Rate limit authentication.
- Rate limit AI endpoints.
- Set per-user upload quotas.
- Scan uploads.
- Restrict content types.
- Limit image dimensions and file size.
- Protect against prompt injection in retrieved content.
- Never pass restaurant webpages or uploaded text directly into privileged tool calls without sanitisation.

### Secrets

- No secrets in source control.
- No production secrets in mobile bundles.
- Use environment variables only for non-sensitive public configuration.
- Use a secrets manager in staging and production.

---

## 17. Privacy Requirements

### Consent categories

- Core account processing
- Health profile
- Health platform connection
- Nutrition images
- Body-progress images
- Location
- Notifications
- Analytics
- Marketing
- Optional model-improvement contribution

### User controls

- View consent history
- Withdraw optional consent
- Delete meal images
- Delete body images
- Disconnect health provider
- Export data
- Delete account
- Disable personalisation
- Disable location history

### Retention

Define and document retention per data type.

Suggested defaults:

- Temporary failed upload: 24 hours
- Unconfirmed meal-analysis image: 7 days
- Confirmed meal image: until user deletes, with configurable future setting
- Body images: until user deletes
- Raw AI debug artefacts: avoid storage; otherwise maximum short retention
- Audit records: legal and security retention policy
- Deleted account backups: purge according to backup cycle

---

## 18. Safety Requirements

### Wellness boundary

The application is a wellness and fitness tool, not a medical device unless separately reviewed and regulated.

### Immediate safety triggers

Examples:

- Chest pain
- Fainting
- Severe shortness of breath
- Sudden weakness
- Severe injury
- Serious allergic reaction
- Dangerous calorie restriction
- Purging behavior
- Training through severe pain

### Safety response behavior

1. Stop normal optimisation.
2. State that the application cannot assess or diagnose the condition.
3. Recommend appropriate urgent or professional help.
4. Do not provide detailed exercise programming for the affected condition.
5. Record a safety event with minimal necessary data.
6. Do not shame or frighten the user.

### Content review

Exercise instructions, calorie rules, and safety copy must be reviewed by qualified professionals before broad public launch.

---

## 19. Accessibility

Target WCAG 2.2 AA concepts where applicable.

Requirements:

- Screen-reader labels
- Dynamic text
- Minimum touch targets
- Sufficient contrast
- Do not rely on colour alone
- Captions for exercise videos
- Reduced-motion support
- Keyboard support for web admin
- Clear error messages
- Plain language
- Charts with textual summaries

---

## 20. Localisation

Initial:

- English
- Metric units
- MYR
- Malaysia time zones and locale formatting

Future:

- Bahasa Melayu
- Chinese
- Additional currencies
- Imperial units

Do not hardcode text in components. Use translation keys from the start.

---

## 21. Analytics and Product Metrics

### North-star candidate

Percentage of active users who complete at least one recommended health action per week.

### Activation

- Completed onboarding
- Created a goal
- Generated first plan
- Logged first workout
- Confirmed first meal
- Logged first sleep session

### Engagement

- Weekly active users
- Workouts logged
- Meals confirmed
- Coach conversations
- Restaurant searches
- Goal-check frequency

### Quality

- Food correction rate
- Meal-analysis failure rate
- Recommendation acceptance
- Workout substitution rate
- Safety-trigger false-positive review
- Crash-free sessions
- API error rate
- Health-sync failure rate

### Retention

- Day 1
- Day 7
- Day 30
- Weekly plan adherence
- Goal continuation

Do not send raw health or body-image data to general analytics platforms.

---

## 22. Testing Strategy

### Unit tests

- Calorie calculations
- Goal progress
- Readiness score
- Workout volume
- Progressive overload
- Exercise substitution
- Restaurant ranking
- Permission rules
- Safety rule matching

### Integration tests

- Authentication
- Meal upload and analysis job
- Workout completion
- Nutrition daily totals
- Goal recalculation
- Sleep-to-readiness calculation
- Coach tool calls
- Account deletion
- Data export

### Mobile end-to-end tests

Use Maestro or Detox.

Critical flows:

1. Sign up
2. Complete onboarding
3. Generate plan
4. Start and complete workout
5. Upload meal
6. Confirm nutrition
7. Log sleep
8. View readiness
9. Ask coach
10. Search restaurant
11. Delete account

### AI evaluation

Maintain versioned test sets.

Food:

- Food identification
- Portion-range error
- Calorie-range coverage
- Low-light handling
- Mixed-dish handling
- User correction rate

Pose:

- Rep count
- Camera angle
- Lighting
- Clothing
- Body diversity
- False feedback

Coach:

- Correct tool selection
- No invented data
- Safety compliance
- Correct confirmation behavior
- Prompt injection resistance
- Privacy leakage resistance

### Performance targets

Initial targets:

- API p95 under 500 ms for normal reads
- Today screen usable within 2 seconds on a normal connection
- Workout logging responsive offline
- Meal analysis status visible immediately
- AI meal result target under 20 seconds, without blocking UI
- Crash-free sessions above 99.5%
- Background job success above 99% excluding invalid input

---

## 23. Observability

### Logs

- Structured JSON
- Request ID
- User ID hashed or internal ID only
- Route
- Status
- Latency
- Job ID
- Model version
- Error code

Never log:

- Passwords
- Access tokens
- Raw body images
- Raw meal images
- Full private coach conversations by default
- Exact location unless necessary and protected

### Metrics

- Request latency
- Error count
- Queue depth
- Job duration
- AI confidence
- AI failure
- Database pool usage
- Cache hit rate
- Notification delivery
- Upload failure

### Tracing

Use OpenTelemetry across API, jobs, and AI service.

---

## 24. Open-Source Repositories and External Assets

All dependencies and data sources require licence review before use.

### Recommended references

#### MediaPipe

Purpose:

- Pose landmarks
- Movement analysis foundation

Official documentation:

- https://developers.google.com/edge/mediapipe/solutions/vision/pose_landmarker
- https://github.com/google-ai-edge/mediapipe

#### Open Food Facts

Purpose:

- Packaged-food barcode lookup
- Ingredient and nutrition data

Documentation:

- https://openfoodfacts.github.io/openfoodfacts-server/api/
- https://github.com/openfoodfacts/openfoodfacts-server

Important:

- Database: Open Database License
- Individual contents: Database Contents License
- Images: Creative Commons Attribution-ShareAlike, with possible additional rights in branded imagery
- Server code and database content have different licensing considerations

#### wger

Purpose:

- Study workout-management patterns
- Exercise and nutrition product reference
- Possible API or data reference after licence review

Repository:

- https://github.com/wger-project/wger

#### Health Connect

Purpose:

- Android health and fitness data connection

Documentation:

- https://developer.android.com/health-and-fitness/health-connect

#### Apple HealthKit

Purpose:

- Apple health and fitness data connection

Documentation:

- https://developer.apple.com/documentation/healthkit

### Asset policy

Do not download random videos, food images, icons, or exercise demonstrations.

Preferred asset order:

1. Original assets produced for Vita AI
2. Properly licensed commercial assets
3. Open assets with compatible licences and attribution
4. Generated placeholder assets for development only

Create:

- `THIRD_PARTY_NOTICES.md`
- `ASSET_REGISTER.csv`
- `MODEL_REGISTER.md`
- `DATASET_REGISTER.md`

Each entry must record:

- Name
- URL
- Version
- Licence
- Commercial-use status
- Attribution
- Modification requirements
- Distribution requirements
- Owner
- Review date

---

## 25. CI/CD

### Pull-request checks

- Install
- Lint
- Type check
- Unit tests
- API integration tests
- Prisma schema validation
- OpenAPI diff
- Dependency audit
- Secret scan
- Container scan
- Mobile build smoke test

### Deployment

- Merge to `develop` deploys development
- Release candidate tag deploys staging
- Production deploy requires approval
- Database migrations use expand-and-contract strategy
- Rollback procedure documented
- Feature flags for risky AI features

### Branching

Prefer trunk-based development with short-lived branches.

---

## 26. Feature Flags

Required flags:

- `food_photo_analysis`
- `barcode_scanning`
- `restaurant_discovery`
- `ai_coach`
- `health_connect`
- `healthkit`
- `pose_analysis`
- `body_progress_analysis`
- `subscriptions`

Flags may be scoped by:

- Environment
- User
- Percentage
- App version
- Platform

---

## 27. Build Phases

# Phase 0 — Repository foundation

### Deliverables

- Monorepo
- Mobile shell
- API shell
- AI service shell
- Shared types
- Docker Compose
- PostgreSQL
- Redis
- Object storage emulator
- CI
- Environment templates
- Coding conventions
- Basic health endpoints

### Acceptance criteria

- One command starts local stack.
- Mobile app connects to API.
- API connects to PostgreSQL and Redis.
- AI service responds to health check.
- CI passes.
- No secrets committed.

---

# Phase 1 — Authentication and onboarding

### Deliverables

- Registration and login
- Profile
- Consent records
- Goal onboarding
- App navigation
- Settings
- Account deletion request
- Data export request stub

### Acceptance criteria

- User can complete onboarding.
- Profile persists.
- Consent history persists.
- User can sign out.
- Users cannot access each other's data.

---

# Phase 2 — Exercise library and workout plans

### Deliverables

- Exercise schema
- Seed data
- Exercise browser
- Goal templates
- Workout generator
- Weekly plan UI
- Exercise substitutions

### Acceptance criteria

- Plan is generated only from approved exercises.
- Plan respects equipment and weekly availability.
- Plan generation has unit tests.
- User can replace an exercise.
- Plan remains stable after app restart.

---

# Phase 3 — Workout logging and progress

### Deliverables

- Workout player
- Set logging
- Offline support
- Completion summary
- Personal records
- Progressive overload
- Strength and adherence charts
- Goal snapshots

### Acceptance criteria

- Workout can be logged offline.
- Sync is idempotent.
- Duplicate completion does not duplicate records.
- Personal records calculate correctly.
- Pain flag blocks progression.

---

# Phase 4 — Manual nutrition

### Deliverables

- Nutrition targets
- Food search abstraction
- Manual meal entry
- Saved meals
- Daily totals
- Macro dashboard
- Nutrition history

### Acceptance criteria

- Daily totals match meal items.
- User can edit and delete meals.
- Targets are shown as estimates or ranges.
- Unsafe target requests are rejected.

---

# Phase 5 — Meal-photo AI

### Deliverables

- Signed upload
- Analysis queue
- AI service image endpoint
- Candidate item result
- Portion correction
- Meal confirmation
- Confidence display
- Evaluation logging

### Acceptance criteria

- Unconfirmed results do not affect totals.
- Failed jobs can retry.
- Original and corrected predictions are stored.
- Images are private.
- EXIF location is removed.
- UI clearly shows estimate confidence.

---

# Phase 6 — Sleep and readiness

### Deliverables

- Manual sleep logging
- Recovery check-in
- Readiness engine
- Today screen
- Recommendation reasons
- Sleep and readiness history

### Acceptance criteria

- Readiness is reproducible from stored inputs.
- Missing data produces no fake score.
- User can see component reasons.
- Low sleep can adjust a workout recommendation.

---

# Phase 7 — AI coach

### Deliverables

- Conversation UI
- Tool-calling orchestration
- Approved retrieval content
- Confirmation flow
- Safety router
- Message feedback
- Model run logs

### Acceptance criteria

- Coach never invents a successful write.
- Coach uses tool results for personal data.
- Safety test suite passes.
- Prompt injection tests pass at agreed threshold.
- User can inspect action before a significant plan change.

---

# Phase 8 — Restaurant discovery

### Deliverables

- Places-provider abstraction
- Location consent flow
- Cuisine and budget search
- Ranking
- Map/directions action
- Saved restaurant
- Nutrition-estimate disclaimer

### Acceptance criteria

- Search works without storing continuous location.
- Closed restaurants can be filtered.
- Unsupported menu data is not fabricated.
- User can open directions.
- Provider terms are followed.

---

# Phase 9 — Health platform integration

### Deliverables

- Health Connect
- HealthKit
- Permission screens
- Import jobs
- Deduplication
- Source priority
- Disconnect and delete imported data

### Acceptance criteria

- Only requested data types are accessed.
- Revoked permission stops import.
- Duplicate records are prevented.
- User sees data source.
- Imported sleep updates readiness.

---

# Phase 10 — Pose and body features

### Deliverables

- Camera setup
- Pose landmarks
- Rep counting for initial exercises
- Cautious feedback
- Standardised progress-photo capture
- Face blur
- Separate consent

### Acceptance criteria

- No raw video stored by default.
- Low-confidence pose feedback is suppressed.
- Body analysis avoids prohibited outputs.
- User can delete every image.
- Model performance documented across diverse conditions.

---

# Phase 11 — Production hardening and launch

### Deliverables

- Security review
- Privacy review
- Accessibility review
- Load tests
- Store metadata
- Support process
- Incident response
- Backups
- Restore test
- Monitoring dashboards
- Beta feedback loop

### Acceptance criteria

- Account deletion tested.
- Backup restoration tested.
- Critical vulnerabilities resolved.
- Crash-free target met in beta.
- Terms and privacy documents approved.
- AI limitations visible in-app.

---

## 28. MVP Release Definition

MVP is considered complete when a user can:

1. Create an account.
2. Set a health or performance goal.
3. Receive a structured weekly workout.
4. Log workouts.
5. View progress.
6. Log food manually.
7. Photograph a meal and confirm an estimate.
8. See daily calorie and protein totals.
9. Log sleep.
10. See a transparent readiness score.
11. Ask the coach what to do today.
12. Find nearby food based on cuisine and budget.
13. Export data.
14. Delete the account.

---

## 29. Codex Working Instructions

Codex must follow these rules.

### 29.1 Before coding

For each phase:

1. Read this specification.
2. Inspect the existing repository.
3. State assumptions in `docs/decisions/`.
4. Write or update an implementation checklist.
5. Identify affected packages.
6. Add tests before or alongside implementation.
7. Keep the current application runnable.

### 29.2 Implementation style

- Use strict TypeScript.
- Avoid `any`.
- Use shared Zod schemas.
- Generate API types from OpenAPI.
- Use dependency injection.
- Keep domain logic independent of controllers.
- Keep UI components small.
- Use feature folders.
- Add comments only where logic is not obvious.
- Prefer explicit names.
- Return typed errors.
- Do not silently catch errors.
- Use transactions for multi-record writes.
- Use UTC in storage.
- Convert to user timezone at boundaries.

### 29.3 AI coding constraints

- Do not create placeholder “AI” that returns random values.
- Mock AI behind an interface in early phases.
- Every model call must have:
  - Provider
  - Model ID
  - Prompt version
  - Timeout
  - Retry policy
  - Schema validation
  - Token or cost logging
  - Safety handling
- Treat LLM output as untrusted input.
- Validate all structured output.
- Do not send unnecessary private data.
- Do not use private user data to train models by default.

### 29.4 Database changes

- Add migrations.
- Never edit production tables manually.
- Seed development data separately.
- Include rollback considerations.
- Add indexes for common access patterns.
- Use foreign keys.
- Add unique constraints for idempotency.

### 29.5 Definition of done for each task

A task is done when:

- Code is implemented
- Tests pass
- Types pass
- Lint passes
- API docs updated
- User-facing states included
- Error states included
- Loading states included
- Accessibility checked
- Security impact reviewed
- Relevant docs updated

---

## 30. Initial Codex Prompt

Use the following prompt to start implementation:

```text
You are the senior engineer responsible for implementing Vita AI.

Read PRODUCT_SPEC.md completely before changing code.

Start only with Phase 0: Repository foundation.

Requirements:
1. Create a pnpm/Turborepo monorepo.
2. Add:
   - apps/mobile: Expo React Native TypeScript app using Expo Router
   - apps/api: NestJS TypeScript API
   - apps/ai-service: Python FastAPI service
   - packages/types
   - packages/validation
   - packages/config
   - packages/api-client
3. Add Docker Compose services for PostgreSQL, Redis, and an S3-compatible local object store.
4. Add health endpoints to the API and AI service.
5. Add environment validation.
6. Add ESLint, Prettier, strict TypeScript, Python linting, and tests.
7. Add GitHub Actions for install, lint, type-check, and test.
8. Add a root README with exact local setup commands.
9. Add docs/decisions/0001-architecture.md explaining the modular monolith decision.
10. Do not implement later product features yet.
11. Keep all commands cross-platform where practical.
12. At the end, report:
    - files created
    - commands to run
    - tests performed
    - known limitations
```

---

## 31. Follow-up Codex Prompt Template

Use this for every phase.

```text
Read PRODUCT_SPEC.md and inspect the current repository.

Implement Phase [NUMBER AND NAME] only.

Before coding:
- Summarise the existing relevant architecture.
- List assumptions.
- Create or update docs/implementation/phase-[NUMBER].md with a checklist.

During implementation:
- Follow existing conventions.
- Keep the app runnable.
- Add migrations and seed data when needed.
- Add unit and integration tests.
- Add loading, empty, success, and error states.
- Do not add features from later phases.
- Do not bypass security or validation for speed.
- Do not use an LLM where deterministic code is required.

After implementation:
- Run lint, type checks, tests, and builds.
- Fix failures.
- Summarise changed files.
- Document manual test steps.
- List remaining limitations.
```

---

## 32. Recommended First Exercise Seed Set

Seed at least:

- Bodyweight squat
- Goblet squat
- Barbell back squat
- Romanian deadlift
- Conventional deadlift
- Hip thrust
- Glute bridge
- Forward lunge
- Reverse lunge
- Bulgarian split squat
- Leg press
- Leg curl
- Leg extension
- Standing calf raise
- Seated calf raise
- Box jump
- Countermovement jump
- Pogo jump
- Snap-down landing
- Push-up
- Bench press
- Incline dumbbell press
- Overhead press
- Lateral raise
- Triceps pushdown
- Pull-up
- Lat pulldown
- Barbell row
- Seated cable row
- Face pull
- Bicep curl
- Hammer curl
- Plank
- Side plank
- Dead bug
- Pallof press
- Farmer carry
- Walking
- Easy cycling
- Basketball skill session
- Ankle dorsiflexion mobility
- Hip-flexor mobility
- Thoracic rotation

Every seed exercise requires approved instructions before public launch.

---

## 33. Suggested Goal Templates

### Build muscle

- 3–5 sessions per week
- Track weekly sets per muscle
- Progressive overload
- Protein target
- Weight trend
- Recovery review

### Lose weight

- Moderate calorie deficit range
- Strength training
- Steps or general activity
- Protein target
- Rolling weight average
- Adherence focus

### Jump higher

- Baseline jump test
- Two strength/power exposures
- One or two controlled plyometric exposures
- Landing mechanics
- Ankle and calf work
- Fatigue management
- Retest interval

### General health

- Two or three strength sessions
- Walking target
- Sleep consistency
- Balanced meal logging
- Sustainable weekly score

---

## 34. Admin Application

A minimal web admin should eventually support:

- User lookup with restricted access
- Exercise content management
- Exercise approval
- Safety-event review
- AI model-run review
- Failed-job replay
- Feature flags
- Content versioning
- User support notes
- Audit logs

Admin access must use stronger authentication and auditing.

---

## 35. Business Model

### Free

- Basic workout plan
- Workout logging
- Manual food logging
- Limited meal scans
- Manual sleep
- Basic progress
- Limited coach messages

### Premium

- More meal scans
- Adaptive coaching
- Wearable integration
- Advanced progress reports
- Goal-specific performance plans
- Form analysis
- Body-progress analysis
- Restaurant nutrition matching
- Extended history

### Future business channels

- Personal trainers
- Gyms
- Corporate wellness
- Family plans
- Clearly labelled restaurant promotions
- Affiliate partnerships

Sponsored results must never be disguised as objective health recommendations.

---

## 36. Key Risks

### Risk: Meal calories are inaccurate

Mitigation:

- Ranges
- Confidence
- User correction
- Multiple input methods
- Evaluation dataset
- No automatic confirmation

### Risk: AI gives unsafe advice

Mitigation:

- Tool-based architecture
- Deterministic rules
- Approved content
- Safety router
- Evaluation suite
- Human review

### Risk: Product scope becomes too large

Mitigation:

- Strict phases
- Feature flags
- MVP definition
- No delivery transaction system
- No broad social features

### Risk: User privacy breach

Mitigation:

- Minimal collection
- Private storage
- Signed URLs
- consent
- deletion
- encryption
- access audit

### Risk: Pose feedback is unreliable

Mitigation:

- Limited exercise set
- Camera guidance
- Confidence threshold
- On-device processing
- Cautious wording
- Diverse validation data

### Risk: Restaurant information is outdated

Mitigation:

- Provider timestamp
- Open-state refresh
- Clear source
- No fabricated menu data
- User report option

---

## 37. Final Product Standard

Vita AI is ready for serious release only when it is:

- Useful without AI gimmicks
- Honest about uncertainty
- Safe in predictable failure cases
- Private by default
- Accessible
- Observable
- Testable
- Reliable with poor connectivity
- Capable of deletion and export
- Built from licensed code and assets
- Clear about being a wellness product

---

## 38. Reference Sources

These references should be rechecked before implementation because APIs, licences, and platform requirements can change.

- Android Health Connect: https://developer.android.com/health-and-fitness/health-connect
- Apple HealthKit: https://developer.apple.com/documentation/healthkit
- MediaPipe Pose Landmarker: https://developers.google.com/edge/mediapipe/solutions/vision/pose_landmarker
- MediaPipe repository: https://github.com/google-ai-edge/mediapipe
- Open Food Facts API: https://openfoodfacts.github.io/openfoodfacts-server/api/
- Open Food Facts server: https://github.com/openfoodfacts/openfoodfacts-server
- wger: https://github.com/wger-project/wger

---

# End of Specification
