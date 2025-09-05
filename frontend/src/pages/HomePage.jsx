import React from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight, ShieldCheck, LayoutDashboard, MapPin, Camera, Send, Droplet, Construction, Trash2, Lightbulb, HeartPulse, AlertOctagon } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

// Helper component for "How it Works" cards
const HowItWorksCard = ({ icon, title, description }) => (
  <div className="bg-white p-6 rounded-lg shadow-lg border border-gray-200 text-center">
    <div className="inline-flex items-center justify-center bg-accent/10 text-accent h-16 w-16 rounded-full mb-4">
      {icon}
    </div>
    <h3 className="text-xl font-bold text-text-on-light">{title}</h3>
    <p className="mt-2 text-text-secondary-on-light">{description}</p>
  </div>
);

// Helper component for Feature cards
const FeatureCard = ({ icon, title }) => (
  <div className="bg-white p-6 rounded-lg shadow-lg border border-gray-200 flex flex-col items-center text-center group hover:border-accent hover:-translate-y-2 transition-all duration-300">
    <div className="bg-accent/10 text-accent h-16 w-16 rounded-full flex items-center justify-center transition-all duration-300 group-hover:bg-accent group-hover:text-white">
      {icon}
    </div>
    <h3 className="mt-4 font-bold text-text-on-light">{title}</h3>
  </div>
);

const HomePage = () => {
  const { user } = useAuth();

  const getDashboardPath = () => {
    if (!user) return '/';
    if (user.role === 'superadmin') return '/superadmin-dashboard';
    if (user.role === 'admin') return '/admin-dashboard';
    return '/citizen-dashboard';
  };

  const howItWorksSteps = [
    { icon: <MapPin size={32} />, title: '1. Pinpoint Location', description: 'Use our interactive map to drop a pin on the exact location of the issue.' },
    { icon: <Camera size={32} />, title: '2. Capture & Upload', description: 'Snap a geotagged photo and record a voice note to provide clear evidence.' },
    { icon: <Send size={32} />, title: '3. Submit & Track', description: 'Your report is sent directly to the relevant department. Track its status in real-time.' },
  ];

  const features = [
    { icon: <Droplet size={32} />, title: 'Water & Sewage' },
    { icon: <Construction size={32} />, title: 'Roads & Potholes' },
    { icon: <Trash2 size={32} />, title: 'Waste Management' },
    { icon: <Lightbulb size={32} />, title: 'Streetlights' },
    { icon: <HeartPulse size={32} />, title: 'Public Health' },
    { icon: <AlertOctagon size={32} />, title: 'Illegal Construction' },
  ];

  return (
    <div className="bg-background w-full">
      {/* --- Hero Section --- */}
      <div className="relative bg-white min-h-[calc(80vh-4rem)] flex items-center justify-center overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[60rem] h-[60rem] bg-gradient-to-tr from-accent/10 to-transparent rounded-full animate-spin-slow blur-3xl"></div>
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <div className="inline-flex items-center gap-2 bg-accent/10 border border-accent/20 px-3 py-1 rounded-full text-sm text-accent mb-6">
            <ShieldCheck size={16} />
            <span>Empowering Communities</span>
          </div>
          <h1 className="text-4xl md:text-6xl font-extrabold text-text-on-light tracking-tighter">
            Voice Your Concerns.
            <br />
            <span className="bg-gradient-to-r from-accent to-accent-dark bg-clip-text text-transparent">
              Drive Real Change.
            </span>
          </h1>
          <p className="max-w-2xl mx-auto mt-6 text-lg md:text-xl text-text-secondary-on-light">
            JanNivaran is your direct line to civic authorities. Report local issues like potholes, waste, or streetlight outages, and track their resolution in real-time.
          </p>
          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
            {user ? (
              <Link to={getDashboardPath()} className="group inline-flex items-center justify-center bg-accent text-white font-bold py-3 px-8 rounded-full hover:bg-accent-dark focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2 focus:ring-offset-background transition-all duration-300 shadow-lg">
                Go to Your Dashboard
                <LayoutDashboard className="w-5 h-5 ml-2 group-hover:scale-110 transition-transform" />
              </Link>
            ) : (
              <>
                <Link to="/register" className="group inline-flex items-center justify-center bg-accent text-white font-bold py-3 px-8 rounded-full hover:bg-accent-dark focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2 focus:ring-offset-background transition-all duration-300 shadow-lg">
                  Get Started Now
                  <ChevronRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                </Link>
                <Link to="/login" className="group inline-flex items-center justify-center font-medium py-3 px-8 text-text-secondary-on-light hover:text-text-on-light transition-colors">
                  I already have an account
                </Link>
              </>
            )}
          </div>
        </div>
      </div>

      {/* --- How It Works Section --- */}
      <div className="py-16 sm:py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-text-on-light tracking-tight">A Simple Path to Resolution</h2>
            <p className="mt-4 text-lg text-text-secondary-on-light">Report a civic issue in just three easy steps.</p>
          </div>
          <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8">
            {howItWorksSteps.map(step => <HowItWorksCard key={step.title} {...step} />)}
          </div>
        </div>
      </div>
      
      {/* --- Features Section --- */}
      <div className="py-16 sm:py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <h2 className="text-3xl font-bold text-text-on-light tracking-tight">Address a Wide Range of Issues</h2>
              <p className="mt-4 text-lg text-text-secondary-on-light">Our platform connects you to the right department for any civic problem.</p>
            </div>
            <div className="mt-16 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-8">
                {features.map(feature => <FeatureCard key={feature.title} {...feature} />)}
            </div>
        </div>
      </div>

      {/* --- Stats Section --- */}
       <div className="bg-primary py-16 sm:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
                <div>
                    <p className="text-5xl font-extrabold text-accent">12,000+</p>
                    <p className="mt-2 text-lg text-text-secondary">Issues Resolved</p>
                </div>
                <div>
                    <p className="text-5xl font-extrabold text-accent">5,000+</p>
                    <p className="mt-2 text-lg text-text-secondary">Active Citizens</p>
                </div>
                <div>
                    <p className="text-5xl font-extrabold text-accent">7</p>
                    <p className="mt-2 text-lg text-text-secondary">Departments on Board</p>
                </div>
            </div>
        </div>
      </div>


      {/* --- Final CTA Section --- */}
      <div className="bg-white">
        <div className="max-w-4xl mx-auto py-16 px-4 sm:px-6 sm:py-20 lg:px-8 text-center">
          <h2 className="text-3xl font-extrabold text-text-on-light tracking-tight">
            Ready to Make a Difference?
          </h2>
          <p className="mt-4 text-lg text-text-secondary-on-light">
            Join thousands of citizens improving their communities. Your voice matters.
          </p>
          <div className="mt-8 flex justify-center">
            {user ? (
              <Link to={getDashboardPath()} className="group inline-flex items-center justify-center bg-accent text-white font-bold py-3 px-8 rounded-full hover:bg-accent-dark focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2 transition-all duration-300 shadow-lg">
                Go to Your Dashboard
                <LayoutDashboard className="w-5 h-5 ml-2 group-hover:scale-110 transition-transform" />
              </Link>
            ) : (
              <Link to="/register" className="group inline-flex items-center justify-center bg-accent text-white font-bold py-3 px-8 rounded-full hover:bg-accent-dark focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2 transition-all duration-300 shadow-lg">
                Create Your Free Account
                <ChevronRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
              </Link>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomePage;