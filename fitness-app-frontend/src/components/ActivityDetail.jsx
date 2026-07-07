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
    return <Typography>Loading...</Typography>
  }

  return (
    <Box sx={{maxWidth: 800, mx: 'auto', p:2}}>
        <Card sx={{mb:2}}>
            <CardContent>
                <Typography variant="h5" gutterBottom>Activity Details</Typography>
                <Typography>Type: {activity.type}</Typography>
                <Typography>Duration: {activity.duration} minutes</Typography>
                <Typography>Calories Burnt: {activity.caloriesBurnt}</Typography>
                <Typography>Date: {new Date(activity.createdAt).toLocaleString()}</Typography>
            </CardContent>
        </Card>

        {recommendation ? (
            <Card>
                <CardContent>
                    <Typography variant="h5" gutterBottom>AI Recommendation</Typography>
                    <Typography variant="h6">Analysis</Typography>
                    <Typography>{recommendation.recommendation}</Typography>

                    <Divider sx={{my:2}} />

                    <Typography variant="h6">Improvements</Typography>
                    {recommendation?.improvements?.map((improvement, index) => (
                        <Typography key={index}>• {improvement}</Typography>
                    ))}

                    <Divider sx={{my:2}} />

                    <Typography variant="h6">Suggestions</Typography>
                    {recommendation?.suggestions?.map((suggestion, index) => (
                        <Typography key={index}>• {suggestion}</Typography>
                    ))}

                    <Divider sx={{my:2}} />
                    <Typography variant="h6">Safety Guidelines</Typography>
                    {recommendation?.safety?.map((safety, index) => (
                        <Typography key={index}>• {safety}</Typography>
                    ))}
                </CardContent>
            </Card>
        ) : (
            <Card>
                <CardContent>
                    <Typography>AI recommendation is still being generated...</Typography>
                </CardContent>
            </Card>
        )}
    </Box>
  );
}

export default ActivityDetail;