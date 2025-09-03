import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Header from './components/Header.jsx';
import HomePage from './pages/HomePage.jsx';
import LoginPage from './pages/LoginPage.jsx';
import RegisterPage from './pages/RegisterPage.jsx';
import CitizenDashboard from './components/CitizenDashboard.jsx';
import AdminDashboard from './components/AdminDashboard.jsx';
import SuperadminDashboard from './components/SuperadminDashboard.jsx';
import PrivateRoute from './components/PrivateRoute.jsx';

function App() {
  return (
    // The bg-background class from our theme is applied to the body,
    // so the entire app has our dark, modern base color.
    <div className="min-h-screen flex flex-col">
      <Header />
      {/* This main element now controls the layout for all pages.
        - `max-w-7xl`: Sets a max-width for large screens.
        - `mx-auto`: Centers the content horizontally.
        - `w-full`: Ensures it takes full width on smaller screens.
        - `px-4 sm:px-6 lg:px-8`: Provides responsive padding.
        - `py-8`: Adds vertical padding.
      */}
      <main className="flex-grow max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          
          {/* Protected Routes */}
          <Route path="/citizen-dashboard" element={<PrivateRoute component={CitizenDashboard} role="citizen" />} />
          <Route path="/admin-dashboard" element={<PrivateRoute component={AdminDashboard} role={'admin'} />} />
          {/* This Superadmin route can be removed if you combine dashboards */}
          <Route path="/superadmin-dashboard" element={<PrivateRoute component={SuperadminDashboard} role="superadmin" />} />
        </Routes>
      </main>
    </div>
  );
}

export default App;
