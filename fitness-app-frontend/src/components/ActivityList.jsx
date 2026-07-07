import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import {Card, CardContent, Grid, Typography} from "@mui/material";
import { getActivities } from '../services/api';

const ActivityList = () => {
  const [activities, setActivities] = useState([]);
  const navigate = useNavigate();

  const fetchActivities = async () => {
    try {
      const response = await getActivities();
      setActivities(response.data);
    } catch (error) {
      console.error("Error:", error);
    }
  };

  useEffect(() => {
    fetchActivities();
  }, []);

  return (
    <Grid container spacing={2}>
      {activities.map((activity) => (
        <Grid key={activity.id} size={{ xs: 4, sm: 4, md: 4 }}>
          <Card sx={{cursor:'pointer'}}
            onClick={() => navigate(`/activities/${activity.id}`)}>
              <CardContent>
                <Typography variant="h6">{activity.type}</Typography>
                <Typography>Duration: {activity.duration} minutes</Typography>
                <Typography>Calories Burnt: {activity.caloriesBurnt}</Typography>
              </CardContent>
            </Card>
        </Grid>
      ))}
    </Grid>
  );
}

export default ActivityList;