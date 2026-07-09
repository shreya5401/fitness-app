import { useEffect, useMemo, useState, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router';
import { Box, Button, Card, CardContent, Divider, IconButton, Typography } from '@mui/material';
import MicIcon from '@mui/icons-material/Mic';
import { getActivities, deleteActivity, getDayRecommendation, generateDayRecommendation } from '../services/api';
import { muscleGroupLabel } from '../constants/exercises';
import ActivityForm from './ActivityForm';
import VoiceLogDialog from './VoiceLog/VoiceLogDialog';

const toDateKey = (isoString) => isoString.split('T')[0];

function isRecommendationStale(dayRecommendation, currentActivities) {
    if (!dayRecommendation) return false;
    const snapshot = dayRecommendation.activitySnapshot || [];
    const snapshotIds = new Set(snapshot.map((s) => s.activityId));
    const currentIds = new Set(currentActivities.map((a) => a.id));

    if (snapshotIds.size !== currentIds.size) return true;
    for (const id of currentIds) {
        if (!snapshotIds.has(id)) return true;
    }
    const updatedAtById = new Map(snapshot.map((s) => [s.activityId, new Date(s.updatedAt).getTime()]));
    for (const activity of currentActivities) {
        const storedTime = updatedAtById.get(activity.id);
        const currentTime = new Date(activity.updatedAt).getTime();
        if (storedTime === undefined || currentTime > storedTime) return true;
    }
    return false;
}

const ActivityCard = ({ activity, onEdit, onDelete }) => (
    <Card sx={{ mb: 2 }}>
        <CardContent>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <Typography variant="h6" sx={{ color: '#ffffff' }}>{activity.type}</Typography>
                <Box sx={{ display: 'flex', gap: 1 }}>
                    <Button size="small" aria-label={`Edit ${activity.type}`} onClick={(e) => { e.currentTarget.blur(); onEdit(activity); }} sx={{ color: '#a0a0a0', minWidth: 'auto', '&:hover': { color: '#FF5B93' } }}>
                        Edit
                    </Button>
                    <Button size="small" aria-label={`Delete ${activity.type}`} onClick={(e) => { e.currentTarget.blur(); onDelete(activity.id); }} sx={{ color: '#a0a0a0', minWidth: 'auto', '&:hover': { color: '#FF5B93' } }}>
                        Delete
                    </Button>
                </Box>
            </Box>
            {activity.muscleGroup && (
                <Typography sx={{ color: '#a0a0a0' }}>Muscle Group: {muscleGroupLabel(activity.muscleGroup)}</Typography>
            )}
            {activity.duration != null && (
                <Typography sx={{ color: '#a0a0a0' }}>Duration: {activity.duration} minutes</Typography>
            )}
            {activity.caloriesBurnt != null && (
                <Typography sx={{ color: '#a0a0a0' }}>Calories Burnt: {activity.caloriesBurnt}</Typography>
            )}
            {activity.sets?.length > 0 && (
                <Box sx={{ mt: 1 }}>
                    {activity.sets.map((set, index) => (
                        <Typography key={index} sx={{ color: '#a0a0a0' }}>
                            Set {index + 1}: {set.reps} reps{set.weight != null ? ` @ ${set.weight}` : ''}
                        </Typography>
                    ))}
                </Box>
            )}
        </CardContent>
    </Card>
);

const DayPage = () => {
    const { date } = useParams();
    const navigate = useNavigate();
    const [activities, setActivities] = useState([]);
    const [dayRecommendation, setDayRecommendation] = useState(null);
    const [loading, setLoading] = useState(true);
    const [generating, setGenerating] = useState(false);
    const [formOpen, setFormOpen] = useState(false);
    const [editingActivity, setEditingActivity] = useState(null);
    const [voiceLogOpen, setVoiceLogOpen] = useState(false);

    const fetchActivities = useCallback(async () => {
        try {
            const response = await getActivities();
            const forDate = response.data.filter((activity) => {
                const raw = activity.startTime || activity.createdAt;
                return raw && toDateKey(raw) === date;
            });
            setActivities(forDate);
        } catch (error) {
            console.error('Error fetching activities:', error);
        }
    }, [date]);

    const fetchDayRecommendation = useCallback(async () => {
        try {
            const response = await getDayRecommendation(date);
            setDayRecommendation(response.status === 204 ? null : response.data);
        } catch (error) {
            console.error('Error fetching day recommendation:', error);
        }
    }, [date]);

    useEffect(() => {
        let cancelled = false;
        setLoading(true);
        Promise.all([fetchActivities(), fetchDayRecommendation()]).finally(() => {
            if (!cancelled) setLoading(false);
        });
        return () => { cancelled = true; };
    }, [fetchActivities, fetchDayRecommendation]);

    const stale = useMemo(() => isRecommendationStale(dayRecommendation, activities), [dayRecommendation, activities]);

    const handleDelete = async (activityId) => {
        try {
            await deleteActivity(activityId);
            fetchActivities();
        } catch (error) {
            console.error('Error deleting activity:', error);
        }
    };

    const handleEdit = (activity) => {
        setEditingActivity(activity);
        setFormOpen(true);
    };

    const handleAdd = () => {
        setEditingActivity(null);
        setFormOpen(true);
    };

    const handleGenerate = async () => {
        setGenerating(true);
        try {
            const payload = activities.map((a) => ({
                activityId: a.id,
                type: a.type,
                muscleGroup: a.muscleGroup,
                sets: a.sets,
                duration: a.duration,
                caloriesBurnt: a.caloriesBurnt,
                updatedAt: a.updatedAt,
            }));
            const response = await generateDayRecommendation(date, payload);
            setDayRecommendation(response.data);
        } catch (error) {
            console.error('Error generating recommendation:', error);
        } finally {
            setGenerating(false);
        }
    };

    const formattedDate = date
        ? new Date(`${date}T00:00:00`).toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })
        : '';

    if (loading) {
        return <Typography sx={{ color: '#a0a0a0', p: 3 }}>Loading...</Typography>;
    }

    const generateDisabled = generating || activities.length === 0 || (dayRecommendation != null && !stale);
    const generateLabel = generating
        ? 'Generating...'
        : dayRecommendation && stale
            ? 'Regenerate AI Recommendation'
            : 'Generate AI Recommendation';

    return (
        <Box sx={{ maxWidth: 800, mx: 'auto' }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Button onClick={() => navigate('/activities')} sx={{ color: '#a0a0a0' }}>
                    &larr; Back
                </Button>
                <Typography variant="h6" sx={{ color: '#ffffff' }}>{formattedDate}</Typography>
                <Box sx={{ display: 'flex', gap: 1 }}>
                    <IconButton onClick={() => setVoiceLogOpen(true)} sx={{ color: '#FF5B93' }} aria-label="Log workout by voice">
                        <MicIcon />
                    </IconButton>
                    <Button variant="contained" color="primary" onClick={handleAdd}>
                        + Add Activity
                    </Button>
                </Box>
            </Box>

            {activities.length === 0 ? (
                <Card sx={{ mb: 3 }}>
                    <CardContent>
                        <Typography sx={{ color: '#a0a0a0' }}>No activities recorded on this day.</Typography>
                    </CardContent>
                </Card>
            ) : (
                <Box sx={{ mb: 3 }}>
                    {activities.map((activity) => (
                        <ActivityCard key={activity.id} activity={activity} onEdit={handleEdit} onDelete={handleDelete} />
                    ))}
                </Box>
            )}

            <Box sx={{ mb: 2 }}>
                <Button variant="contained" color="primary" disabled={generateDisabled} onClick={handleGenerate}>
                    {generateLabel}
                </Button>
            </Box>

            {dayRecommendation ? (
                <Card sx={{ opacity: stale ? 0.5 : 1, transition: 'opacity 0.2s' }}>
                    <CardContent>
                        <Typography variant="h5" gutterBottom sx={{ color: '#FF5B93' }}>AI Recommendation</Typography>
                        {stale && (
                            <Typography sx={{ color: '#a0a0a0', mb: 2, fontStyle: 'italic' }}>
                                Outdated — activities changed, regenerate for updated insights.
                            </Typography>
                        )}
                        <Typography variant="h6" sx={{ color: '#ffffff' }}>Analysis</Typography>
                        <Typography sx={{ color: '#a0a0a0' }}>{dayRecommendation.recommendation}</Typography>

                        <Divider sx={{ my: 2, borderColor: '#2a2a2a' }} />

                        <Typography variant="h6" sx={{ color: '#ffffff' }}>Improvements</Typography>
                        {dayRecommendation.improvements?.map((improvement, index) => (
                            <Typography key={index} sx={{ color: '#a0a0a0' }}>• {improvement}</Typography>
                        ))}

                        <Divider sx={{ my: 2, borderColor: '#2a2a2a' }} />

                        <Typography variant="h6" sx={{ color: '#ffffff' }}>Suggestions</Typography>
                        {dayRecommendation.suggestions?.map((suggestion, index) => (
                            <Typography key={index} sx={{ color: '#a0a0a0' }}>• {suggestion}</Typography>
                        ))}

                        <Divider sx={{ my: 2, borderColor: '#2a2a2a' }} />
                        <Typography variant="h6" sx={{ color: '#ffffff' }}>Safety Guidelines</Typography>
                        {dayRecommendation.safety?.map((safety, index) => (
                            <Typography key={index} sx={{ color: '#a0a0a0' }}>• {safety}</Typography>
                        ))}
                    </CardContent>
                </Card>
            ) : (
                <Card>
                    <CardContent>
                        <Typography sx={{ color: '#a0a0a0' }}>No recommendation yet for this day.</Typography>
                    </CardContent>
                </Card>
            )}

            <ActivityForm
                open={formOpen}
                initialActivity={editingActivity}
                defaultDate={date}
                onClose={() => setFormOpen(false)}
                onActivityAdded={() => {
                    setFormOpen(false);
                    fetchActivities();
                }}
            />

            <VoiceLogDialog
                open={voiceLogOpen}
                defaultDate={date}
                onClose={() => setVoiceLogOpen(false)}
                onActivityAdded={() => fetchActivities()}
            />
        </Box>
    );
};

export default DayPage;
