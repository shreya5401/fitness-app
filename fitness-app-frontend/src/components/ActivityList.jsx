import { useNavigate } from 'react-router';
import { Box, Card, CardContent, Grid, Typography, Chip } from "@mui/material";

const formatDate = (activity) => {
  const raw = activity.startTime || activity.createdAt;
  if (!raw) return '';
  return new Date(raw).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
};

const ActivityList = ({ activities = [] }) => {
  const navigate = useNavigate();

  const recentActivities = [...activities]
    .sort((a, b) => new Date(b.startTime || b.createdAt) - new Date(a.startTime || a.createdAt))
    .slice(0, 3);

  return (
    <Box sx={{ mt: 2 }}>
      {recentActivities.length === 0 ? (
        <Typography sx={{ color: '#a0a0a0' }}>No activities recorded yet.</Typography>
      ) : (
        <Grid container spacing={2}>
          {recentActivities.map((activity) => (
            <Grid key={activity.id} size={{ xs: 12, sm: 6, md: 4 }}>
              <Card
                sx={{
                  cursor: 'pointer',
                  transition: 'transform 0.15s ease, border-color 0.15s ease',
                  '&:hover': { transform: 'translateY(-2px)', borderColor: '#FF5B93' },
                }}
                onClick={() => navigate(`/activities/${activity.id}`)}
              >
                <CardContent>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                    <Typography variant="h6" sx={{ color: '#ffffff' }}>{activity.type}</Typography>
                    <Chip label={formatDate(activity)} size="small" sx={{ backgroundColor: '#2a2a2a', color: '#FFB6C1' }} />
                  </Box>
                  <Typography sx={{ color: '#a0a0a0' }}>Duration: {activity.duration} minutes</Typography>
                  <Typography sx={{ color: '#a0a0a0' }}>Calories Burnt: {activity.caloriesBurnt}</Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}
    </Box>
  );
}

export default ActivityList;
