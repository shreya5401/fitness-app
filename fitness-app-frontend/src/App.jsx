import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router';
import {Box, Typography, Button} from "@mui/material";
import { useContext } from 'react';
import { AuthContext } from 'react-oauth2-code-pkce';
import { useDispatch } from 'react-redux';
import { setCredentials } from './store/authSlice';
import { useEffect, useState } from 'react';
import ActivityList from './components/ActivityList';
import ActivityForm from './components/ActivityForm';
import ActivityDetail from './components/ActivityDetail';
import ActivityDateDialog from './components/ActivityDateDialog';
import LoginPage from './components/Login/LoginPage';
import Navbar from './components/Navbar';
import ActivityHeatmap from './components/Activity Heatmap/ActivityHeatmap';
import { getActivities } from './services/api';

const ActivitiesPage = ({ username }) => {
  const [activities, setActivities] = useState([]);
  const [formOpen, setFormOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState(null);

  const fetchActivities = async () => {
    try {
      const response = await getActivities();
      setActivities(response.data);
    } catch (error) {
      console.error("Error fetching activities:", error);
    }
  };

  useEffect(() => {
    fetchActivities();
  }, []);

  return(
    <Box component="section" sx={{ maxWidth: 1100, mx: 'auto' }}>
      <Typography variant="h5" sx={{ color: '#ffffff', fontWeight: 600, mb: 3 }}>
        Hi, {username}!
      </Typography>

      <ActivityHeatmap activities={activities} onDateClick={setSelectedDate} />

      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 4 }}>
        <Typography variant="h6" sx={{ color: '#ffffff' }}>Recent Activities</Typography>
        <Button variant="contained" color="primary" onClick={() => setFormOpen(true)}>
          + Add Activity
        </Button>
      </Box>

      <ActivityList activities={activities} />

      <ActivityForm
        open={formOpen}
        onClose={() => setFormOpen(false)}
        onActivityAdded={() => {
          setFormOpen(false);
          fetchActivities();
        }}
      />

      <ActivityDateDialog
        date={selectedDate}
        activities={activities}
        onClose={() => setSelectedDate(null)}
      />
    </Box>
  )
}

function App() {
  const {token, tokenData, logIn, logOut, isAuthenticated} = useContext(AuthContext);
  const dispatch = useDispatch();
  const [authReady, setAuthReady] = useState(false);
  const username = tokenData?.given_name || tokenData?.preferred_username || tokenData?.name || 'there';

  useEffect(() => {
    if(token){
      dispatch(setCredentials({token, user : tokenData}));
      setAuthReady(true);
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
              <Route path="/activities/:id" element={<ActivityDetail />} />

              <Route path="/" element={token ? <Navigate to="/activities" replace /> : <div>Please log in</div>} />
            </Routes>
          </Box>
        </Box>
      ) }

    </Router>
  )
}

export default App
