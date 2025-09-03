import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Menu, X } from 'lucide-react'; // Modern icons for the mobile menu

const Header = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleDashboardClick = () => {
    // This logic correctly navigates users based on their role
    if (user.role === 'superadmin') {
      navigate('/superadmin-dashboard');
    } else if (user.role === 'admin') {
      navigate('/admin-dashboard');
    } else {
      navigate('/citizen-dashboard');
    }
    setIsMenuOpen(false); // Close mobile menu on navigation
  };

  const handleLogout = () => {
    logout();
    setIsMenuOpen(false); // Close mobile menu on logout
  }

  const navLinks = (
    <>
      {user ? (
        <div className="flex flex-col md:flex-row items-center gap-4">
          <span className="text-text-secondary">Welcome, {user.name}!</span>
          <button onClick={handleDashboardClick} className="w-full md:w-auto px-4 py-2 text-text-primary bg-primary hover:bg-border rounded-md transition-colors duration-300">
            Dashboard
          </button>
          <button onClick={handleLogout} className="w-full md:w-auto px-4 py-2 text-text-primary bg-accent hover:bg-accent-dark rounded-md transition-colors duration-300">
            Logout
          </button>
        </div>
      ) : (
        <div className="flex flex-col md:flex-row items-center gap-4">
          <Link to="/login" onClick={() => setIsMenuOpen(false)} className="w-full md:w-auto text-center px-4 py-2 text-text-primary hover:text-accent transition-colors duration-300">
            Login
          </Link>
          <Link to="/register" onClick={() => setIsMenuOpen(false)} className="w-full md:w-auto px-4 py-2 text-background bg-accent hover:bg-accent-dark rounded-md transition-colors duration-300">
            Register
          </Link>
        </div>
      )}
    </>
  );

  return (
    <header className="bg-primary border-b border-border sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="text-2xl font-bold text-accent">
            JanNivaran
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex">{navLinks}</nav>

          {/* Mobile Menu Button */}
          <div className="md:hidden">
            <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="text-text-primary">
              {isMenuOpen ? <X size={28} /> : <Menu size={28} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Overlay */}
      {isMenuOpen && (
        <div className="md:hidden absolute top-16 left-0 w-full bg-primary border-b border-border p-6">
          <nav className="flex flex-col items-center gap-6">
            {navLinks}
          </nav>
        </div>
      )}
    </header>
  );
};

export default Header;
