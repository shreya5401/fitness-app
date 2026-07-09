import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080/api';

const api= axios.create({
    baseURL: API_URL,
    timeout: 15000,
});

api.interceptors.request.use((config) => {
    const userId= localStorage.getItem('userId');
    const token= localStorage.getItem('token');

    if(token){
        config.headers['Authorization']=`Bearer ${token}`;
    }
    if(userId){
        config.headers['X-User-Id']= userId;
    }
    return config;
});

api.interceptors.response.use(
    (response) => response,
    (error) => {
        const message = error.response?.data?.message || error.message || 'Something went wrong';
        if (error.response?.status === 401) {
            localStorage.clear();
            window.location.href = '/';
        }
        return Promise.reject(new Error(message));
    }
);


export const getActivities = () => api.get('/activities');
export const addActivity = (activity) => api.post('/activities', activity);
export const getActivity = (id) => api.get(`/activities/${id}`);
export const updateActivity = (id, activity) => api.put(`/activities/${id}`, activity);
export const deleteActivity = (id) => api.delete(`/activities/${id}`);

export const getDayRecommendation = (date) => api.get(`/recommendations/day/${date}`);
export const generateDayRecommendation = (date, activitySnapshots) =>
    api.post(`/recommendations/day/${date}`, activitySnapshots);

export const getCustomExercises = () => api.get('/custom-exercises');
export const addCustomExercise = (exercise) => api.post('/custom-exercises', exercise);

export const parseVoiceWorkout = (transcript, previousContext) =>
    api.post('/voice/parse', { transcript, previousContext: previousContext || null }, { timeout: 35000 });