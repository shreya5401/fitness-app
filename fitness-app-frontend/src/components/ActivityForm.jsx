import React, {useState} from 'react';
import {Box, Button, TextField} from "@mui/material";
import { FormControl, InputLabel, Select, MenuItem } from '@mui/material';
import { addActivity } from '../services/api';

const ActivityForm = ({onActivityAdded}) => {
    const[activity, setActivity] = useState({ 
        type:"RUNNING" , duration: '', caloriesBurnt: '',
        additionalMetrics: {}
    });

    const handleSubmit = async (e) => {
        e.preventDefault();
        try{
            await addActivity(activity);
            onActivityAdded();
            setActivity({ type:"RUNNING" , duration: '', caloriesBurnt: ''});
        }catch(error){
            console.error("Error:", error);
        }
    }
    return (
        <Box component="form" onSubmit={handleSubmit} sx={{mb:4}}>
            <FormControl fullWidth sx={{mb:2}}>
                <InputLabel>Activity Type</InputLabel>
                <Select
                    value={activity.type}
                    onChange={(e) => setActivity({...activity, type: e.target.value})}
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
                sx={{mb:2}}
                onChange={(e) => setActivity({...activity, duration: e.target.value})} />

            <TextField fullWidth 
                label="Calories Burnt" 
                type="number"
                value={activity.caloriesBurnt}
                sx={{mb:2}}
                onChange={(e) => setActivity({...activity, caloriesBurnt: e.target.value})} />
            
            <Button type="submit" variant="contained">Add Activity</Button>
        </Box>
    );
}

export default ActivityForm;