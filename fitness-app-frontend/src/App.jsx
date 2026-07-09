import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate } from 'react-router';
import {Alert, Box, Button, CircularProgress, Typography} from "@mui/material";
import { useContext } from 'react';
import { AuthContext } from 'react-oauth2-code-pkce';
import { useDispatch } from 'react-redux';
import { setCredentials } from './store/authSlice';
import { useEffect, useState } from 'react';
import ActivityForm from './components/ActivityForm';
import DayPage from './components/DayPage';
import LoginPage from './components/Login/LoginPage';
import Navbar from './components/Navbar';
import ActivityHeatmap from './components/ActivityHeatmap/ActivityHeatmap';
import { getActivities } from './services/api';

const ActivitiesPage = ({ username }) => {
  const navigate = useNavigate();
  const [activities, setActivities] = useState([]);
  const [formOpen, setFormOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchActivities = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await getActivities();
      setActivities(response.data);
    } catch (err) {
      console.error("Error fetching activities:", err);
      setError(err.message || "Failed to load activities.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchActivities();
  }, []);

  return(
    <Box component="section" sx={{ maxWidth: 1100, mx: 'auto' }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h5" sx={{ color: '#ffffff', fontWeight: 600 }}>
          Hi, {username}!
        </Typography>
        <Button variant="contained" color="primary" onClick={() => setFormOpen(true)}>
          + Add Activity
        </Button>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
          <CircularProgress />
        </Box>
      ) : (
        <ActivityHeatmap activities={activities} onDateClick={(date) => navigate(`/activities/day/${date}`)} />
      )}

      <ActivityForm
        open={formOpen}
        onClose={() => setFormOpen(false)}
        onActivityAdded={() => {
          setFormOpen(false);
          fetchActivities();
        }}
      />
    </Box>
  )
}

function App() {
  const {token, tokenData, logIn, logOut} = useContext(AuthContext);
  const dispatch = useDispatch();
  const username = tokenData?.given_name || tokenData?.preferred_username || tokenData?.name || 'there';

  useEffect(() => {
    if(token){
      dispatch(setCredentials({token, user : tokenData}));
    }
  } , [token, tokenData, dispatch]);

  return(
    <Router>
      {!token ? (
        <LoginPage onLogin={() => logIn()} />
      ) : (
        <Box sx={{ minHeight: '100vh', backgroundColor: '#171717' }}>
          <Navbar onLogout={logOut} />
          <Box component="section" sx={{ p: { xs: 2, md: 4 } }}>
            <Routes>
              <Route path="/activities" element={<ActivitiesPage username={username} />} />
              <Route path="/activities/day/:date" element={<DayPage />} />

              <Route path="/" element={token ? <Navigate to="/activities" replace /> : <div>Please log in</div>} />
            </Routes>
          </Box>
        </Box>
      ) }

    </Router>
  )
}

export default App
