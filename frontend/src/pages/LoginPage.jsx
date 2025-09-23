import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Mail, Lock, LogIn, Loader2, AlertTriangle, Shield, Eye, EyeOff } from 'lucide-react';
import toast from 'react-hot-toast';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false); // State for password visibility
  const { login } = useAuth();
  
  const location = useLocation();
  const navigate = useNavigate();
  const from = location.state?.from?.pathname || "/";

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(email, password);
      navigate(from, { replace: true });
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to log in. Please check your credentials.');
      toast.error('Failed to log in. Please check your credentials.');
    } finally {
      setLoading(false);
   
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center bg-gray-50 p-4">
      <div className="w-full max-w-md">
        <div className="bg-white border border-gray-200 rounded-2xl shadow-xl p-8 space-y-6">
          <div className="text-center">
            <div className="inline-flex items-center justify-center bg-gray-100 h-16 w-16 rounded-full mb-4">
                <Shield className="h-8 w-8 text-accent" />
            </div>
            <h1 className="text-3xl font-bold text-text-on-light">Welcome Back</h1>
            <p className="text-text-secondary-on-light mt-2">Enter your credentials to access your dashboard.</p>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 text-sm p-3 rounded-md flex items-center gap-3">
              <AlertTriangle size={20} />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input 
                type="email" 
                placeholder="Email Address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required 
                className="w-full bg-gray-50 border border-gray-300 rounded-md py-3 pl-10 pr-3 text-text-on-light focus:ring-2 focus:ring-accent focus:outline-none transition-shadow shadow-sm" 
              />
            </div>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input 
                type={showPassword ? 'text' : 'password'} 
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required 
                className="w-full bg-gray-50 border border-gray-300 rounded-md py-3 pl-10 pr-10 text-text-on-light focus:ring-2 focus:ring-accent focus:outline-none transition-shadow shadow-sm"
              />
              <button 
                type="button" 
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showPassword ?  <Eye size={20}/> : <EyeOff size={20} />}
              </button>
            </div>
            <button 
              type="submit" 
              disabled={loading}
              className="w-full bg-accent text-white font-bold py-3 px-6 rounded-md hover:bg-accent-dark disabled:bg-gray-200 disabled:cursor-not-allowed flex items-center justify-center gap-2 transition-colors shadow-md"
            >
              {loading ? <Loader2 className="animate-spin" /> : <LogIn size={20} />}
              <span>{loading ? 'Signing In...' : 'Sign In'}</span>
            </button>
          </form>

          <div className="text-center text-sm text-text-secondary-on-light">
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