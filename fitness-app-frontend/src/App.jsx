import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router';
import {Box, Button} from "@mui/material";
import { useContext } from 'react';
import { AuthContext } from 'react-oauth2-code-pkce';
import { useDispatch } from 'react-redux';
import { setCredentials } from './store/authSlice';
import { useEffect, useState } from 'react';
import ActivityList from './components/ActivityList';
import ActivityForm from './components/ActivityForm';
import ActivityDetail from './components/ActivityDetail';


const ActivitiesPage = () => {
  return(
    <Box component="section" sx={{ p: 2 , border: '1px dashed grey'}}>
      <ActivityForm onActivitiesAdded = {() => window.location.reload()} />
      <ActivityList />
    </Box>
  )
}

function App() {
  const {token, tokenData, logIn, logOut, isAuthenticated} = useContext(AuthContext);
  const dispatch = useDispatch();
  const [authReady, setAuthReady] = useState(false);

  useEffect(() => {
    if(token){
      dispatch(setCredentials({token, user : tokenData}));
      setAuthReady(true);
    }
  } , [token, tokenData, dispatch]);

  return(
    <Router>
      {!token ? (
        <Button variant="contained" color="#dc004e"
        onClick={() => {
          logIn();
        }}>Login</Button>
      ) : (
        // <div>
        //   <pre>{JSON.stringify(tokenData, null, 2)}</pre>
        //   <pre>{JSON.stringify(token, null, 2)}</pre>
        // </div>
        <Box component="section" sx={{ p: 2 , border: '1px dashed grey'}}>
          <Routes>
            <Route path="/activities" element={<ActivitiesPage />} />
            <Route path="/activities/:id" element={<ActivityDetail />} />

            <Route path="/" element={token ? <Navigate to="/activities" replace /> : <div>Please log in</div>} />
          </Routes>
        </Box>
      ) }
      
    </Router>
  )
}

export default App
