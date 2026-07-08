import { useState } from 'react';
import { Box, Button, TextField, Dialog, DialogTitle, DialogContent, DialogActions } from "@mui/material";
import { FormControl, InputLabel, Select, MenuItem } from '@mui/material';
import { addActivity } from '../services/api';

const emptyActivity = { type: "RUNNING", duration: '', caloriesBurnt: '', additionalMetrics: {} };

const ActivityForm = ({ open, onClose, onActivityAdded }) => {
    const [activity, setActivity] = useState(emptyActivity);
    const [submitting, setSubmitting] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            await addActivity(activity);
            setActivity(emptyActivity);
            onActivityAdded();
        } catch (error) {
            console.error("Error:", error);
        } finally {
            setSubmitting(false);
        }
    }

    const handleClose = () => {
        setActivity(emptyActivity);
        onClose();
    }

    return (
        <Dialog open={open} onClose={handleClose} fullWidth maxWidth="xs">
            <DialogTitle sx={{ fontWeight: 600 }}>Add Activity</DialogTitle>
            <Box component="form" onSubmit={handleSubmit}>
                <DialogContent sx={{ pt: 1 }}>
                    <FormControl fullWidth sx={{ mb: 2 }}>
                        <InputLabel>Activity Type</InputLabel>
                        <Select
                            label="Activity Type"
                            value={activity.type}
                            onChange={(e) => setActivity({ ...activity, type: e.target.value })}
                        >
                            <MenuItem value="RUNNING">Running</MenuItem>
                            <MenuItem value="WALKING">Walking</MenuItem>
                            <MenuItem value="CYCLING">Cycling</MenuItem>
                        </Select>
                    </FormControl>

                    <TextField fullWidth
                        label="Duration (Minutes)"
                        type="number"
                        value={activity.duration}
                        sx={{ mb: 2 }}
                        onChange={(e) => setActivity({ ...activity, duration: e.target.value })} />

                    <TextField fullWidth
                        label="Calories Burnt"
                        type="number"
                        value={activity.caloriesBurnt}
                        onChange={(e) => setActivity({ ...activity, caloriesBurnt: e.target.value })} />
                </DialogContent>
                <DialogActions sx={{ px: 3, pb: 3 }}>
                    <Button onClick={handleClose} sx={{ color: '#a0a0a0' }}>Cancel</Button>
                    <Button type="submit" variant="contained" color="primary" disabled={submitting}>
                        {submitting ? 'Saving...' : 'Save Activity'}
                    </Button>
                </DialogActions>
            </Box>
        </Dialog>
    );
}

export default ActivityForm;
