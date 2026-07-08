import { useNavigate } from 'react-router';
import { Dialog, DialogTitle, DialogContent, Box, Card, CardContent, Typography } from "@mui/material";

const toDateKey = (isoString) => isoString.split("T")[0];

const ActivityDateDialog = ({ date, activities = [], onClose }) => {
  const navigate = useNavigate();
  const open = Boolean(date);

  const activitiesForDate = date
    ? activities.filter((activity) => {
        const raw = activity.startTime || activity.createdAt;
        return raw && toDateKey(raw) === date;
      })
    : [];

  const formattedDate = date
    ? new Date(`${date}T00:00:00`).toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })
    : '';

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="xs">
      <DialogTitle sx={{ fontWeight: 600 }}>{formattedDate}</DialogTitle>
      <DialogContent>
        {activitiesForDate.length === 0 ? (
          <Typography sx={{ color: '#a0a0a0', pb: 2 }}>No activities recorded on this day.</Typography>
        ) : (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5, pb: 1 }}>
            {activitiesForDate.map((activity) => (
              <Card
                key={activity.id}
                sx={{
                  cursor: 'pointer',
                  '&:hover': { borderColor: '#FF5B93' },
                }}
                onClick={() => {
                  onClose();
                  navigate(`/activities/${activity.id}`);
                }}
              >
                <CardContent>
                  <Typography variant="h6" sx={{ color: '#ffffff' }}>{activity.type}</Typography>
                  <Typography sx={{ color: '#a0a0a0' }}>Duration: {activity.duration} minutes</Typography>
                  <Typography sx={{ color: '#a0a0a0' }}>Calories Burnt: {activity.caloriesBurnt}</Typography>
                </CardContent>
              </Card>
            ))}
          </Box>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default ActivityDateDialog;
