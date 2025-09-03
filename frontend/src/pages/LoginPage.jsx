import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Mail, Lock, LogIn, Loader2, AlertTriangle, Shield } from 'lucide-react';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  
  const location = useLocation();
  const navigate = useNavigate();
  // Redirect back to the page the user was trying to access, or to the homepage
  const from = location.state?.from?.pathname || "/";

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(email, password);
      // On successful login, AuthContext will handle navigation
      // We can add a fallback navigation here if needed
      navigate(from, { replace: true });
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to log in. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center bg-background p-4">
      <div className="w-full max-w-md">
        <div className="bg-primary border border-border rounded-2xl shadow-xl p-8 space-y-6">
          <div className="text-center">
            <div className="inline-flex items-center justify-center bg-border h-16 w-16 rounded-full mb-4">
                <Shield className="h-8 w-8 text-accent" />
            </div>
            <h1 className="text-3xl font-bold text-text-primary">Welcome Back</h1>
            <p className="text-text-secondary mt-2">Enter your credentials to access your dashboard.</p>
          </div>

          {error && (
            <div className="bg-priority-high/10 border border-priority-high/30 text-priority-high text-sm p-3 rounded-md flex items-center gap-3">
              <AlertTriangle size={20} />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-text-secondary" />
              <input 
                type="email" 
                placeholder="Email Address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required 
                className="w-full bg-background border border-border rounded-md py-3 pl-10 pr-3 text-text-primary focus:ring-2 focus:ring-accent focus:outline-none transition-shadow" 
              />
            </div>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-text-secondary" />
              <input 
                type="password" 
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required 
                className="w-full bg-background border border-border rounded-md py-3 pl-10 pr-3 text-text-primary focus:ring-2 focus:ring-accent focus:outline-none transition-shadow"
              />
            </div>
            <button 
              type="submit" 
              disabled={loading}
              className="w-full bg-accent text-background font-bold py-3 px-6 rounded-md hover:bg-accent-dark disabled:bg-border disabled:cursor-not-allowed flex items-center justify-center gap-2 transition-colors"
            >
              {loading ? <Loader2 className="animate-spin" /> : <LogIn size={20} />}
              <span>{loading ? 'Signing In...' : 'Sign In'}</span>
            </button>
          </form>

          <div className="text-center text-sm text-text-secondary">
            <p>
              Don't have an account?{' '}
              <Link to="/register" className="font-medium text-accent hover:underline">
                Register here
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
