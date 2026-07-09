import { resolveMuscleGroup } from '../constants/exercises';

const CONFIDENCE_THRESHOLD = 0.75;

// Expands a uniform sets/reps/weight result into the sets:[{reps,weight}] array
// shape addActivity/ActivityForm expect.
const expandSets = ({ sets, reps, weight }) => {
    const setCount = sets && sets > 0 ? sets : 1;
    if (!reps) return [];
    return Array.from({ length: setCount }, () => ({
        reps: Number(reps),
        weight: weight != null ? Number(weight) : undefined,
    }));
};

// Evaluates a raw VoiceParseResponse (from the backend) into a resolved,
// editable shape plus an ActivityForm-compatible payload, and decides whether
// the result is confident/complete enough to auto-save or needs user confirmation.
export const evaluateVoiceParse = (rawResult) => {
    if (!rawResult || rawResult.parseFailed) {
        return { error: true, needsConfirmation: true, resolved: null, payload: null };
    }

    const muscleGroup = resolveMuscleGroup(rawResult.exercise);
    const hasRequiredFields = Boolean(rawResult.exercise && muscleGroup && rawResult.reps);
    const confidence = rawResult.confidence ?? 0;
    const needsConfirmation = confidence < CONFIDENCE_THRESHOLD || !hasRequiredFields;

    const resolved = {
        exercise: rawResult.exercise || '',
        muscleGroup: muscleGroup || '',
        sets: rawResult.sets ?? (rawResult.reps ? 1 : ''),
        reps: rawResult.reps ?? '',
        weight: rawResult.weight ?? '',
        unit: rawResult.unit || 'kg',
        notes: rawResult.notes || '',
        confidence,
    };

    const payload = hasRequiredFields ? {
        muscleGroup,
        type: rawResult.exercise,
        startTime: null,
        duration: undefined,
        caloriesBurnt: undefined,
        sets: expandSets(rawResult),
    } : null;

    return { error: false, needsConfirmation, resolved, payload };
};

// Builds an ActivityForm-compatible payload from a (possibly user-edited)
// resolved preview object, for the confirmation path.
export const buildPayloadFromResolved = (resolved) => ({
    muscleGroup: resolved.muscleGroup,
    type: resolved.exercise,
    startTime: null,
    duration: undefined,
    caloriesBurnt: undefined,
    sets: expandSets({
        sets: Number(resolved.sets) || 1,
        reps: Number(resolved.reps) || 0,
        weight: resolved.weight !== '' ? Number(resolved.weight) : null,
    }),
});

// Builds the previousContext object sent to the backend on the next voice
// utterance in the same session.
export const toSessionContext = (resolved) => resolved ? {
    exercise: resolved.exercise,
    sets: Number(resolved.sets) || null,
    reps: Number(resolved.reps) || null,
    weight: resolved.weight !== '' ? Number(resolved.weight) : null,
    unit: resolved.unit,
} : null;
