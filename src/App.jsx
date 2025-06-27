import React, { useEffect } from 'react';
import { useAuth } from './context/AuthContext';
import { toast } from 'sonner';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import MapPage from './pages/Map';
import Fields from './pages/Fields';
import PrivateRoute from './components/PrivateRoute';
import Profile from './pages/Profile';
import Feedback from './pages/Feedback';
import LandingPage from './pages/LandingPage';
import ForgotPassword from './pages/ForgotPassword';


function App() {
  const { user } = useAuth();
  useEffect(() => {
    if (
      user &&
      (user.name || user.email) &&
      localStorage.getItem('showWelcome') === '1'
    ) {
      toast.success(`Welcome, ${user.name || user.email}!`);
      localStorage.removeItem('showWelcome');
    }
  }, [user]);
  return (
    <Router>
      <Navbar />
      <Routes>
        <Route path="/map" element={
          <PrivateRoute>
            <MapPage />
          </PrivateRoute>
        } />
        <Route path="/login" element={<div className="container mx-auto mt-4"><Login /></div>} />
        <Route path="/forgot-password" element={<div className="container mx-auto mt-4"><ForgotPassword /></div>} />
        <Route path="/register" element={<div className="container mx-auto mt-4"><Register /></div>} />
        <Route path="/" element={<div className="container mx-auto mt-4"><LandingPage /></div>} />
        <Route path="/dashboard" element={<div className="container mx-auto mt-4"><PrivateRoute><Dashboard /></PrivateRoute></div>} />
        <Route path="/fields" element={<PrivateRoute><Fields /></PrivateRoute>} />
        <Route path="/profile" element={<div className="container mx-auto mt-4"><PrivateRoute><Profile /></PrivateRoute></div>} />
        <Route path="/feedback" element={<div className="container mx-auto mt-4"><PrivateRoute><Feedback /></PrivateRoute></div>} />
      </Routes>
    </Router>
  );
}

export default App;
