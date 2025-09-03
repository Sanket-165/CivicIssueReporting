import React from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight, ShieldCheck, LayoutDashboard } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const HomePage = () => {
  const { user } = useAuth();

  const getDashboardPath = () => {
    if (!user) return '/';
    if (user.role === 'superadmin') return '/superadmin-dashboard';
    if (user.role === 'admin') return '/admin-dashboard';
    return '/citizen-dashboard';
  };

  return (
    // Added `bg-primary` to make the background a lighter shade of our dark theme
    <div className="relative bg-primary min-h-[calc(100vh-4rem)] flex items-center justify-center overflow-hidden">
      {/* Background decorative gradients */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[60rem] h-[60rem] bg-gradient-to-tr from-accent/10 to-transparent rounded-full animate-spin-slow blur-3xl opacity-50"></div>
      
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
        <div className="inline-flex items-center gap-2 bg-border border-border-dark px-3 py-1 rounded-full text-sm text-accent mb-6">
          <ShieldCheck size={16} />
          <span>Empowering Communities, One Report at a Time</span>
        </div>

        <h1 className="text-4xl md:text-6xl font-extrabold text-text-primary tracking-tighter">
          Voice Your Concerns.
          <br />
          <span className="bg-gradient-to-r from-accent to-accent-dark bg-clip-text text-transparent">
            Drive Real Change.
          </span>
        </h1>
        
        <p className="max-w-2xl mx-auto mt-6 text-lg md:text-xl text-text-secondary">
          JanNivaran is your direct line to civic authorities. Report local issues like potholes, waste, or streetlight outages, and track their resolution in real-time.
        </p>
        
        <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
          {user ? (
            <Link 
              to={getDashboardPath()} 
              className="group inline-flex items-center justify-center bg-accent text-background font-bold py-3 px-8 rounded-full hover:bg-accent-dark focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2 focus:ring-offset-background transition-all duration-300"
            >
              Go to Your Dashboard
              <LayoutDashboard className="w-5 h-5 ml-2 group-hover:scale-110 transition-transform" />
            </Link>
          ) : (
            <>
              <Link 
                to="/register" 
                className="group inline-flex items-center justify-center bg-accent text-background font-bold py-3 px-8 rounded-full hover:bg-accent-dark focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2 focus:ring-offset-background transition-all duration-300"
              >
                Get Started Now
                <ChevronRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link 
                to="/login" 
                className="group inline-flex items-center justify-center font-medium py-3 px-8 text-text-secondary hover:text-text-primary transition-colors"
              >
                I already have an account
              </Link>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default HomePage;

