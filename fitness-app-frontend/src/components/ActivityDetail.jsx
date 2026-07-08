import { Box, Card, CardContent, Divider, Typography } from '@mui/material';
import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router';
import { getActivity, getActivityRecommendation } from '../services/api';

const ActivityDetail = () => {
  const {id} = useParams();
  const [activity, setActivity] = useState(null);
  const [recommendation, setRecommendation] = useState(null);

  useEffect(() => {
    let cancelled = false;

    const fetchActivity = async () => {
      try {
        const response = await getActivity(id);
        if (!cancelled) {
          setActivity(response.data);
        }
      } catch (error) {
        console.error("Error fetching activity:", error);
      }
    };

    const fetchRecommendation = async () => {
      try {
        const response = await getActivityRecommendation(id);
        if (!cancelled) {
          setRecommendation(response.data);
        }
      } catch (error) {
        // Recommendation may not be generated yet (AI processing is async), so this is expected initially.
        console.error("Error fetching recommendation:", error);
      }
    };

    fetchActivity();
    fetchRecommendation();

    return () => { cancelled = true; };
  }, [id]);

  if(!activity){
    return <Typography sx={{ color: '#a0a0a0', p: 3 }}>Loading...</Typography>
  }

  return (
    <Box sx={{maxWidth: 800, mx: 'auto'}}>
        <Card sx={{mb:3}}>
            <CardContent>
                <Typography variant="h5" gutterBottom sx={{ color: '#FF5B93' }}>Activity Details</Typography>
                <Typography sx={{ color: '#ffffff' }}>Type: {activity.type}</Typography>
                <Typography sx={{ color: '#a0a0a0' }}>Duration: {activity.duration} minutes</Typography>
                <Typography sx={{ color: '#a0a0a0' }}>Calories Burnt: {activity.caloriesBurnt}</Typography>
                <Typography sx={{ color: '#a0a0a0' }}>Date: {new Date(activity.startTime || activity.createdAt).toLocaleString()}</Typography>
            </CardContent>
        </Card>

        {recommendation ? (
            <Card>
                <CardContent>
                    <Typography variant="h5" gutterBottom sx={{ color: '#FF5B93' }}>AI Recommendation</Typography>
                    <Typography variant="h6" sx={{ color: '#ffffff' }}>Analysis</Typography>
                    <Typography sx={{ color: '#a0a0a0' }}>{recommendation.recommendation}</Typography>

                    <Divider sx={{my:2, borderColor: '#2a2a2a'}} />

                    <Typography variant="h6" sx={{ color: '#ffffff' }}>Improvements</Typography>
                    {recommendation?.improvements?.map((improvement, index) => (
                        <Typography key={index} sx={{ color: '#a0a0a0' }}>• {improvement}</Typography>
                    ))}

                    <Divider sx={{my:2, borderColor: '#2a2a2a'}} />

                    <Typography variant="h6" sx={{ color: '#ffffff' }}>Suggestions</Typography>
                    {recommendation?.suggestions?.map((suggestion, index) => (
                        <Typography key={index} sx={{ color: '#a0a0a0' }}>• {suggestion}</Typography>
                    ))}

                    <Divider sx={{my:2, borderColor: '#2a2a2a'}} />
                    <Typography variant="h6" sx={{ color: '#ffffff' }}>Safety Guidelines</Typography>
                    {recommendation?.safety?.map((safety, index) => (
                        <Typography key={index} sx={{ color: '#a0a0a0' }}>• {safety}</Typography>
                    ))}
                </CardContent>
            </Card>
        ) : (
            <Card>
                <CardContent>
                    <Typography sx={{ color: '#a0a0a0' }}>AI recommendation is still being generated...</Typography>
                </CardContent>
            </Card>
        )}
    </Box>
  );
}

export default ActivityDetail;