import { useEffect, useState } from 'react';
import { Alert, Box, Button, TextField, Dialog, DialogTitle, DialogContent, DialogActions, IconButton, Typography } from "@mui/material";
import { FormControl, InputLabel, Select, MenuItem } from '@mui/material';
import { addActivity, updateActivity, getCustomExercises, addCustomExercise } from '../services/api';
import { MUSCLE_GROUPS, PREDEFINED_EXERCISES, MUSCLE_GROUPS_WITHOUT_SETS } from '../constants/exercises';

const OTHER_OPTION = '__OTHER__';

const pad = (n) => String(n).padStart(2, '0');
const todayLocal = () => {
    const now = new Date();
    return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;
};

const emptyActivity = { muscleGroup: '', type: '', duration: '', caloriesBurnt: '', sets: [], activityDate: todayLocal() };

const toActivityState = (initialActivity) => ({
    muscleGroup: initialActivity.muscleGroup || '',
    type: initialActivity.type || '',
    duration: initialActivity.duration ?? '',
    caloriesBurnt: initialActivity.caloriesBurnt ?? '',
    sets: (initialActivity.sets || []).map((set) => ({
        reps: set.reps ?? '',
        weight: set.weight ?? '',
    })),
    activityDate: (initialActivity.startTime || '').split('T')[0] || todayLocal(),
});

const ActivityForm = ({ open, onClose, onActivityAdded, initialActivity = null, defaultDate = null }) => {
    const [activity, setActivity] = useState(emptyActivity);
    const [submitting, setSubmitting] = useState(false);
    const [customExercises, setCustomExercises] = useState([]);
    const [addingCustom, setAddingCustom] = useState(false);
    const [newExerciseName, setNewExerciseName] = useState('');
    const [savingCustom, setSavingCustom] = useState(false);
    const [submitError, setSubmitError] = useState(null);

    const isEditing = Boolean(initialActivity);

    useEffect(() => {
        if (!open) return;
        setActivity(initialActivity ? toActivityState(initialActivity) : { ...emptyActivity, activityDate: defaultDate || todayLocal() });
        setSubmitError(null);
        getCustomExercises()
            .then((response) => setCustomExercises(response.data))
            .catch((error) => console.error("Error fetching custom exercises:", error));
    }, [open, initialActivity, defaultDate]);

    const exerciseOptions = activity.muscleGroup
        ? [
            ...(PREDEFINED_EXERCISES[activity.muscleGroup] || []),
            ...customExercises
                .filter((ce) => ce.muscleGroup === activity.muscleGroup)
                .map((ce) => ce.name),
        ]
        : [];

    const showSets = activity.muscleGroup && !MUSCLE_GROUPS_WITHOUT_SETS.includes(activity.muscleGroup);

    const handleMuscleGroupChange = (muscleGroup) => {
        setActivity({ ...activity, muscleGroup, type: '', sets: [] });
        setAddingCustom(false);
        setNewExerciseName('');
    };

    const handleTypeChange = (value) => {
        if (value === OTHER_OPTION) {
            setAddingCustom(true);
            return;
        }
        setAddingCustom(false);
        setActivity({ ...activity, type: value });
    };

    const handleAddCustomExercise = async () => {
        if (!newExerciseName.trim()) return;
        setSavingCustom(true);
        try {
            const response = await addCustomExercise({ name: newExerciseName.trim(), muscleGroup: activity.muscleGroup });
            const created = response.data;
            setCustomExercises([...customExercises, created]);
            setActivity({ ...activity, type: created.name });
            setAddingCustom(false);
            setNewExerciseName('');
        } catch (error) {
            console.error("Error adding custom exercise:", error);
        } finally {
            setSavingCustom(false);
        }
    };

    const handleAddSet = () => {
        setActivity({ ...activity, sets: [...activity.sets, { reps: '', weight: '' }] });
    };

    const handleSetChange = (index, field, value) => {
        const sets = activity.sets.map((set, i) => (i === index ? { ...set, [field]: value } : set));
        setActivity({ ...activity, sets });
    };

    const handleRemoveSet = (index) => {
        setActivity({ ...activity, sets: activity.sets.filter((_, i) => i !== index) });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        setSubmitError(null);
        try {
            let timeOfDay;
            if (isEditing && initialActivity.startTime) {
                const originalDate = initialActivity.startTime.split('T')[0];
                timeOfDay = originalDate === activity.activityDate
                    ? initialActivity.startTime.split('T')[1]
                    : `${pad(new Date().getHours())}:${pad(new Date().getMinutes())}:${pad(new Date().getSeconds())}`;
            } else {
                const now = new Date();
                timeOfDay = `${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())}`;
            }
            const payload = {
                muscleGroup: activity.muscleGroup,
                type: activity.type,
                startTime: `${activity.activityDate}T${timeOfDay}`,
                duration: activity.duration === '' ? undefined : Number(activity.duration),
                caloriesBurnt: activity.caloriesBurnt === '' ? undefined : Number(activity.caloriesBurnt),
                sets: activity.sets
                    .filter((set) => set.reps !== '')
                    .map((set) => ({
                        reps: Number(set.reps),
                        weight: set.weight === '' ? undefined : Number(set.weight),
                    })),
            };
            if (isEditing) {
                await updateActivity(initialActivity.id, payload);
            } else {
                await addActivity(payload);
            }
            setActivity(emptyActivity);
            setAddingCustom(false);
            setNewExerciseName('');
            onActivityAdded();
        } catch (error) {
            console.error("Error saving activity:", error);
            setSubmitError(error.message || "Failed to save activity.");
        } finally {
            setSubmitting(false);
        }
    }

    const handleClose = () => {
        setActivity(emptyActivity);
        setAddingCustom(false);
        setNewExerciseName('');
        setSubmitError(null);
        onClose();
    }

    return (
        <Dialog open={open} onClose={handleClose} fullWidth maxWidth="xs">
            <DialogTitle sx={{ fontWeight: 600 }}>{isEditing ? 'Edit Activity' : 'Add Activity'}</DialogTitle>
            <Box component="form" onSubmit={handleSubmit}>
                <DialogContent sx={{ pt: 1 }}>
                    <TextField
                        fullWidth
                        label="Date"
                        type="date"
                        value={activity.activityDate}
                        sx={{ mb: 2 }}
                        slotProps={{ inputLabel: { shrink: true } }}
                        onChange={(e) => setActivity({ ...activity, activityDate: e.target.value })}
                    />

                    <FormControl fullWidth sx={{ mb: 2 }}>
                        <InputLabel>Muscle Group</InputLabel>
                        <Select
                            label="Muscle Group"
                            value={activity.muscleGroup}
                            onChange={(e) => handleMuscleGroupChange(e.target.value)}
                        >
                            {MUSCLE_GROUPS.map((group) => (
                                <MenuItem key={group.value} value={group.value}>{group.label}</MenuItem>
                            ))}
                        </Select>
                    </FormControl>

                    {activity.muscleGroup && (
                        <FormControl fullWidth sx={{ mb: 2 }}>
                            <InputLabel>Exercise</InputLabel>
                            <Select
                                label="Exercise"
                                value={addingCustom ? OTHER_OPTION : activity.type}
                                onChange={(e) => handleTypeChange(e.target.value)}
                            >
                                {exerciseOptions.map((name) => (
                                    <MenuItem key={name} value={name}>{name}</MenuItem>
                                ))}
                                <MenuItem value={OTHER_OPTION}>Other (add new)</MenuItem>
                            </Select>
                        </FormControl>
                    )}

                    {addingCustom && (
                        <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
                            <TextField
                                fullWidth
                                label="New Exercise Name"
                                value={newExerciseName}
                                onChange={(e) => setNewExerciseName(e.target.value)}
                            />
                            <Button
                                variant="outlined"
                                disabled={savingCustom || !newExerciseName.trim()}
                                onClick={handleAddCustomExercise}
                            >
                                Add
                            </Button>
                        </Box>
                    )}

                    <TextField fullWidth
                        label="Duration (Minutes, optional)"
                        type="number"
                        value={activity.duration}
                        sx={{ mb: 2 }}
                        onChange={(e) => setActivity({ ...activity, duration: e.target.value })} />

                    <TextField fullWidth
                        label="Calories Burnt (optional)"
                        type="number"
                        value={activity.caloriesBurnt}
                        sx={{ mb: showSets ? 2 : 0 }}
                        onChange={(e) => setActivity({ ...activity, caloriesBurnt: e.target.value })} />

                    {showSets && (
                        <Box>
                            <Typography variant="subtitle2" sx={{ color: '#a0a0a0', mb: 1 }}>Sets</Typography>
                            {activity.sets.map((set, index) => (
                                <Box key={index} sx={{ display: 'flex', gap: 1, alignItems: 'center', mb: 1 }}>
                                    <Typography sx={{ color: '#a0a0a0', minWidth: 48 }}>Set {index + 1}</Typography>
                                    <TextField
                                        label="Reps"
                                        type="number"
                                        size="small"
                                        value={set.reps}
                                        onChange={(e) => handleSetChange(index, 'reps', e.target.value)}
                                    />
                                    <TextField
                                        label="Weight (optional)"
                                        type="number"
                                        size="small"
                                        value={set.weight}
                                        onChange={(e) => handleSetChange(index, 'weight', e.target.value)}
                                    />
                                    <IconButton size="small" onClick={() => handleRemoveSet(index)} aria-label="Remove set">
                                        &times;
                                    </IconButton>
                                </Box>
                            ))}
                            <Button size="small" onClick={handleAddSet}>Add Set</Button>
                        </Box>
                    )}

                    {submitError && (
                        <Alert severity="error" sx={{ mt: 2 }}>
                            {submitError}
                        </Alert>
                    )}
                </DialogContent>
                <DialogActions sx={{ px: 3, pb: 3 }}>
                    <Button onClick={handleClose} sx={{ color: '#a0a0a0' }}>Cancel</Button>
                    <Button
                        type="submit"
                        variant="contained"
                        color="primary"
                        disabled={submitting || !activity.muscleGroup || !activity.type}
                    >
                        {submitting ? 'Saving...' : (isEditing ? 'Save Changes' : 'Save Activity')}
                    </Button>
                </DialogActions>
            </Box>
        </Dialog>
    );
}

export default ActivityForm;
