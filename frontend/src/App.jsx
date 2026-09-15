import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
//import Navbar from './components/Navbar';
import LandingPage from './pages/LandingPage';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import UploadMaterial from './pages/UploadMaterial';
import MyMaterials from './pages/MyMaterials';
import MaterialDetails from './pages/MaterialDetails';
import Flashcards from './pages/Flashcards';
import QuizInterface from './pages/QuizInterface';
import QuizResult from './pages/QuizResult';
import Progress from './pages/Progress';
import Profile from './pages/Profile';
import { AuthProvider, useAuth } from './context/AuthContext';

const ProtectedRoute = ({ children }) => {
  const { user } = useAuth();
  return user ? children : <Navigate to="/login" />;
};

const PublicRoute = ({ children }) => {
  const { user } = useAuth();
  return !user ? children : <Navigate to="/dashboard" />;
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="App">
          
          <Routes>
            <Route path="/" element={<PublicRoute><LandingPage /></PublicRoute>} />
            <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
            <Route path="/register" element={<PublicRoute><Register /></PublicRoute>} />
            <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
            <Route path="/upload" element={<ProtectedRoute><UploadMaterial /></ProtectedRoute>} />
            <Route path="/materials" element={<ProtectedRoute><MyMaterials /></ProtectedRoute>} />
            <Route path="/materials/:id" element={<ProtectedRoute><MaterialDetails /></ProtectedRoute>} />
            <Route path="/flashcards" element={<ProtectedRoute><Flashcards /></ProtectedRoute>} />
            <Route path="/flashcards/:materialId" element={<ProtectedRoute><Flashcards /></ProtectedRoute>} />
            <Route path="/quiz/:id" element={<ProtectedRoute><QuizInterface /></ProtectedRoute>} />
            <Route path="/quiz/result/:attemptId" element={<ProtectedRoute><QuizResult /></ProtectedRoute>} />
            <Route path="/progress" element={<ProtectedRoute><Progress /></ProtectedRoute>} />
            <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
