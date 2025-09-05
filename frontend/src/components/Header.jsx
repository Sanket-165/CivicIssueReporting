import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Menu, X, ArrowLeftCircle } from 'lucide-react';
import ConfirmationModal from './ConfirmationModal.jsx';

const Header = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  // Check if the current path is any of the dashboard pages
  const isDashboardActive = location.pathname.includes('-dashboard');
  const isLoginPage = location.pathname === '/login';
  const isRegisterPage = location.pathname === '/register';

  const handleDashboardClick = () => {
    if (user.role === 'superadmin') {
      navigate('/superadmin-dashboard');
    } else if (user.role === 'admin') {
      navigate('/admin-dashboard');
    } else {
      navigate('/citizen-dashboard');
    }
    setIsMenuOpen(false);
  };

  const handleLogoutClick = () => {
    setIsMenuOpen(false);
    setShowLogoutConfirm(true);
  };

  const confirmLogout = () => {
    logout();
    setShowLogoutConfirm(false);
  };

  const navLinks = (
    <>
      {user ? (
        <div className="flex flex-col md:flex-row items-center gap-4">
          <span className="text-text-secondary hidden md:block">Welcome, {user.name}!</span>
          <button 
            onClick={handleDashboardClick} 
            className={`w-full md:w-auto px-4 py-2 rounded-md transition-colors duration-300 font-semibold text-sm ${
              isDashboardActive 
                ? 'bg-accent text-background' 
                : 'text-text-secondary hover:bg-border'
            }`}
          >
            Dashboard
          </button>
          <button 
            onClick={handleLogoutClick}
            className="w-full md:w-auto px-4 py-2 text-white bg-red-600 hover:bg-red-700 rounded-md transition-colors duration-300 font-semibold text-sm"
          >
            Logout
          </button>
        </div>
      ) : (
        <div className="flex flex-col md:flex-row items-center gap-4">
          <Link 
            to="/login" 
            onClick={() => setIsMenuOpen(false)} 
            className={`w-full md:w-auto text-center px-4 py-2 rounded-md transition-colors duration-300 font-semibold ${
                isLoginPage 
                ? 'bg-accent text-background' 
                : 'text-text-secondary hover:text-accent'
            }`}
          >
            Login
          </Link>
          <Link 
            to="/register" 
            onClick={() => setIsMenuOpen(false)} 
            className={`w-full md:w-auto text-center px-4 py-2 rounded-md transition-colors duration-300 font-semibold ${
                isRegisterPage
                ? 'bg-accent text-background'
                : 'text-text-secondary hover:text-accent'
            }`}
          >
            Register
          </Link>
        </div>
      )}
    </>
  );

  return (
    <>
      <header className="bg-primary border-b border-border sticky top-0 z-40 shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              {isDashboardActive && (
                 <Link to="/" className="text-gray-400 hover:text-accent transition-colors">
                    <ArrowLeftCircle size={24} />
                 </Link>
              )}
              <Link to="/" className="flex items-center gap-2 text-2xl font-bold text-accent">
                <img src="/logo.png" className="h-50" alt="JanNivaran Logo" />
                
              </Link>
            </div>

            <nav className="hidden md:flex">{navLinks}</nav>

            <div className="md:hidden">
              <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="text-text-primary">
                {isMenuOpen ? <X size={28} /> : <Menu size={28} />}
              </button>
            </div>
          </div>
        </div>

        {isMenuOpen && (
          <div className="md:hidden absolute top-16 left-0 w-full bg-primary border-b border-border p-6 shadow-lg animate-in fade-in-0 slide-in-from-top-4">
            <nav className="flex flex-col items-center gap-6">
              {navLinks}
            </nav>
          </div>
        )}
      </header>
      {/* The modal is unchanged but necessary for the logout functionality */}
      <ConfirmationModal
        isOpen={showLogoutConfirm}
        onClose={() => setShowLogoutConfirm(false)}
        onConfirm={confirmLogout}
        title="Confirm Logout"
        message="Are you sure you want to log out of your account?"
      />
    </>
  );
};

export default Header;