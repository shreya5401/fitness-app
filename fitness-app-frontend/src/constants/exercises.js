export const MUSCLE_GROUPS = [
    { value: 'CHEST', label: 'Chest' },
    { value: 'BACK', label: 'Back' },
    { value: 'SHOULDERS', label: 'Shoulders' },
    { value: 'TRICEPS', label: 'Triceps' },
    { value: 'BICEPS', label: 'Biceps' },
    { value: 'QUADS', label: 'Quads' },
    { value: 'GLUTES_HAMSTRINGS', label: 'Glutes & Hamstrings' },
    { value: 'CALVES', label: 'Calves' },
    { value: 'ABS_CORE', label: 'Abs & Core' },
    { value: 'CARDIO', label: 'Cardio' },
    { value: 'RECOVERY', label: 'Recovery' },
];

export const PREDEFINED_EXERCISES = {
    CHEST: [
        'Incline Dumbbell Press',
        'Machine Chest Press',
        'Pec Deck Fly (Optional)',
    ],
    BACK: [
        'Lat Pulldown',
        'Single-Arm Lat Pulldown',
        'Seated Cable Row',
        'Chest-Supported Row',
    ],
    SHOULDERS: [
        'Dumbbell Shoulder Press',
        'Dumbbell or Machine Shoulder Press',
        'Dumbbell Lateral Raise',
        'Rear Delt Fly',
    ],
    TRICEPS: [
        'Tricep Pushdown',
        'Cable Tricep Extension',
    ],
    BICEPS: [
        'Hammer Curl',
        'EZ-Bar Curl (or Dumbbell Curl)',
    ],
    QUADS: [
        'Barbell Squat',
        'Bulgarian Split Squat',
        'Leg Press',
        'Leg Extension',
        'Walking Lunges',
    ],
    GLUTES_HAMSTRINGS: [
        'Romanian Deadlift',
        'Hip Thrust',
        'Seated/Lying Leg Curl',
        'Hip Abduction Machine',
    ],
    CALVES: [
        'Standing Calf Raise',
        'Seated Calf Raise',
    ],
    ABS_CORE: [
        'Kneeling Cable Crunch',
        'Reverse Crunch',
        'Cable Wood Chop',
        'Weighted Russian Twist',
        'Side Plank',
    ],
    CARDIO: [
        'Zone 2 Cardio',
        'Incline Walk',
        'StairMaster',
        'Cycling',
        'Elliptical',
        'Swimming',
    ],
    RECOVERY: [
        'Rest',
        'Light Walking (optional)',
        'Full-body Stretching',
        'Hydration',
        'Protein Intake',
        'Quality Sleep',
    ],
};

export const MUSCLE_GROUPS_WITHOUT_SETS = ['CARDIO', 'RECOVERY'];

export const muscleGroupLabel = (value) => MUSCLE_GROUPS.find((g) => g.value === value)?.label || value;

// Reverse lookup: exercise name -> muscle group value, built from PREDEFINED_EXERCISES
// so the taxonomy is never duplicated elsewhere (e.g. the voice-logging feature).
export const EXERCISE_TO_MUSCLE_GROUP = Object.entries(PREDEFINED_EXERCISES)
    .reduce((acc, [muscleGroup, exercises]) => {
        exercises.forEach((name) => { acc[name] = muscleGroup; });
        return acc;
    }, {});

export const resolveMuscleGroup = (exerciseName) => EXERCISE_TO_MUSCLE_GROUP[exerciseName] || null;
