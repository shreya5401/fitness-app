import { useState } from 'react';
import { Box, Button, Card, CardContent, TextField, Typography } from '@mui/material';
import { FormControl, InputLabel, Select, MenuItem } from '@mui/material';
import { MUSCLE_GROUPS, PREDEFINED_EXERCISES } from '../../constants/exercises';

const confidenceColor = (confidence) => {
    if (confidence >= 0.75) return '#4caf50';
    if (confidence >= 0.5) return '#FFB6C1';
    return '#ff3b3b';
};

// Editable review card shown when a voice parse isn't confident/complete enough
// to auto-save. Lets the user correct any field before confirming.
const VoiceParsePreviewCard = ({ initialResolved, onConfirm, onCancel, confirming }) => {
    const [resolved, setResolved] = useState(initialResolved);

    const exerciseOptions = resolved.muscleGroup ? (PREDEFINED_EXERCISES[resolved.muscleGroup] || []) : [];

    const canConfirm = Boolean(resolved.muscleGroup && resolved.exercise && resolved.reps);

    return (
        <Card sx={{ mt: 2 }}>
            <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                    <Typography variant="h6" sx={{ color: '#FF5B93' }}>Review Parsed Workout</Typography>
                    <Typography sx={{ color: confidenceColor(resolved.confidence), fontWeight: 600 }}>
                        {Math.round((resolved.confidence || 0) * 100)}% confident
                    </Typography>
                </Box>

                {!resolved.muscleGroup && (
                    <Typography sx={{ color: '#a0a0a0', mb: 2, fontStyle: 'italic' }}>
                        We couldn't confidently match an exercise from your tracker - please pick one below.
                    </Typography>
                )}

                <FormControl fullWidth sx={{ mb: 2 }}>
                    <InputLabel>Muscle Group</InputLabel>
                    <Select
                        label="Muscle Group"
                        value={resolved.muscleGroup}
                        onChange={(e) => setResolved({ ...resolved, muscleGroup: e.target.value, exercise: '' })}
                    >
                        {MUSCLE_GROUPS.map((group) => (
                            <MenuItem key={group.value} value={group.value}>{group.label}</MenuItem>
                        ))}
                    </Select>
                </FormControl>

                {resolved.muscleGroup && (
                    <FormControl fullWidth sx={{ mb: 2 }}>
                        <InputLabel>Exercise</InputLabel>
                        <Select
                            label="Exercise"
                            value={exerciseOptions.includes(resolved.exercise) ? resolved.exercise : ''}
                            onChange={(e) => setResolved({ ...resolved, exercise: e.target.value })}
                        >
                            {exerciseOptions.map((name) => (
                                <MenuItem key={name} value={name}>{name}</MenuItem>
                            ))}
                        </Select>
                    </FormControl>
                )}

                <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
                    <TextField
                        label="Sets"
                        type="number"
                        value={resolved.sets}
                        onChange={(e) => setResolved({ ...resolved, sets: e.target.value })}
                    />
                    <TextField
                        label="Reps"
                        type="number"
                        value={resolved.reps}
                        onChange={(e) => setResolved({ ...resolved, reps: e.target.value })}
                    />
                    <TextField
                        label={`Weight (${resolved.unit})`}
                        type="number"
                        value={resolved.weight}
                        onChange={(e) => setResolved({ ...resolved, weight: e.target.value })}
                    />
                </Box>

                {resolved.notes && (
                    <Typography sx={{ color: '#a0a0a0', mb: 2 }}>Notes: {resolved.notes}</Typography>
                )}

                <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
                    <Button onClick={onCancel} sx={{ color: '#a0a0a0' }}>Cancel</Button>
                    <Button
                        variant="contained"
                        color="primary"
                        disabled={!canConfirm || confirming}
                        onClick={() => onConfirm(resolved)}
                    >
                        {confirming ? 'Saving...' : 'Confirm'}
                    </Button>
                </Box>
            </CardContent>
        </Card>
    );
};

export default VoiceParsePreviewCard;
