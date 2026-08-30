import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Layout } from './components/Layout';
import { StudentLayout } from './components/StudentLayout';
import { Dashboard } from './pages/Dashboard';
import { StudentProfile } from './pages/StudentProfile';
import { StudentDashboard } from './pages/StudentDashboard';
import { StudentSupport } from './pages/StudentSupport';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Navigate to="/counselor" replace />} />
        
        {/* Counselor Routes */}
        <Route element={<Layout />}>
          <Route path="/counselor" element={<Dashboard />} />
          <Route path="/counselor/students" element={<Navigate to="/counselor" replace />} />
          <Route path="/counselor/interventions" element={<Navigate to="/counselor" replace />} />
          <Route path="/counselor/students/:id" element={<StudentProfile />} />
        </Route>

        {/* Student Routes */}
        <Route path="/student" element={<StudentLayout />}>
          <Route index element={<StudentDashboard />} />
          <Route path="support" element={<StudentSupport />} />
        </Route>
        
        <Route path="*" element={
          <div className="flex flex-col items-center justify-center h-screen bg-gray-50">
            <h1 className="text-4xl font-bold text-gray-900">404</h1>
            <p className="text-gray-500 mt-2">Page not found</p>
          </div>
        } />
      </Routes>
    </Router>
  );
}

export default App;
