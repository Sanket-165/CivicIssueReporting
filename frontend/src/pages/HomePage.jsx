import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  ChevronRight,
  ShieldCheck,
  LayoutDashboard,
  MapPin,
  Camera,
  Send,
  Droplet,
  Construction,
  Trash2,
  Lightbulb,
  HeartPulse,
  AlertOctagon,
  Loader2,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import api from '../api/api';

// ======================== Image Slider Component ========================
const SimpleImageSlider = () => {
  const [currentSlide, setCurrentSlide] = useState(0);

  const slides = [
    '/Home-page_1.jpg',
    '/2_image.jpg',
    '/3_image.jpg',
    '/5_image.jpg',
    '/6_image.jpg',
    '/7_image.jpg',
  ];

  // Auto-play
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 4000);
    return () => clearInterval(interval);
  }, [slides.length]);

  return (
    <div className="relative w-full h-96 overflow-hidden rounded-2xl shadow-2xl">
      {/* Slide container */}
      <div
        className="flex transition-transform duration-1000 ease-in-out h-full"
        style={{ transform: `translateX(-${currentSlide * 100}%)` }}
      >
        {slides.map((image, index) => (
          <div key={index} className="w-full h-full flex-shrink-0 relative">
            <img
              src={image}
              alt={`Slide ${index + 1}`}
              className="w-full h-full object-cover"
              onError={(e) => {
                e.target.src = `https://via.placeholder.com/800x400/4a5568/ffffff?text=Image+${
                  index + 1
                }`;
              }}
            />
            {/* Overlay text */}
            
          </div>
        ))}
      </div>

      {/* Prev button */}
      <button
        onClick={() =>
          setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length)
        }
        className="absolute left-4 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-3 rounded-full transition"
      >
        ‹
      </button>

      {/* Next button */}
      <button
        onClick={() => setCurrentSlide((prev) => (prev + 1) % slides.length)}
        className="absolute right-4 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-3 rounded-full transition"
      >
        ›
      </button>

      {/* Dots */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex space-x-3">
        {slides.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentSlide(index)}
            className={`w-3 h-3 rounded-full transition ${
              index === currentSlide ? 'bg-white scale-125' : 'bg-gray-400'
            }`}
          />
        ))}
      </div>
    </div>
  );
};

// ======================== Card Components ========================
const HowItWorksCard = ({ icon, title, description }) => (
  <div className="bg-white p-6 rounded-xl shadow-md border border-gray-200 text-center hover:shadow-2xl transition transform hover:-translate-y-2">
    <div className="inline-flex items-center justify-center bg-accent/10 text-accent h-16 w-16 rounded-full mb-4">
      {icon}
    </div>
    <h3 className="text-xl font-bold">{title}</h3>
    <p className="mt-2 text-gray-600">{description}</p>
  </div>
);

const FeatureCard = ({ icon, title }) => (
  <div className="bg-white p-6 rounded-xl shadow-md border border-gray-200 flex flex-col items-center text-center group hover:border-accent hover:-translate-y-2 transition">
    <div className="bg-accent/10 text-accent h-16 w-16 rounded-full flex items-center justify-center group-hover:bg-accent group-hover:text-white transition">
      {icon}
    </div>
    <h3 className="mt-4 font-bold">{title}</h3>
  </div>
);

// ======================== Home Page ========================
const HomePage = () => {
  const { user } = useAuth();
  const [resolvedCount, setResolvedCount] = useState(0);
  const [totalUsers, setTotalUsers] = useState(0);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  const getDashboardPath = () => {
    if (!user) return '/';
    if (user.role === 'superadmin') return '/superadmin-dashboard';
    if (user.role === 'admin') return '/admin-dashboard';
    return '/citizen-dashboard';
  };

  // Fetch stats
  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        const [complaintsResponse, usersResponse] = await Promise.all([
          api.get('/stats/getAllComplaints'),
          api.get('/stats/getAllUsers'),
        ]);

        const complaints = Array.isArray(
          complaintsResponse.data.complaints
        )
          ? complaintsResponse.data.complaints
          : [];
        const resolved = complaints.filter((c) => c.status === 'resolved').length;

        const allUsers = Array.isArray(usersResponse.data.users)
          ? usersResponse.data.users
          : [];
        const users = allUsers.filter((u) => u.role === 'citizen').length;

        setResolvedCount(resolved);
        setTotalUsers(users);
      } catch (err) {
        console.error('Failed to fetch homepage stats:', err);
        setError('Could not load community statistics.');
        setResolvedCount(0);
        setTotalUsers(0);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  const howItWorksSteps = [
    {
      icon: <MapPin size={32} />,
      title: '1. Fetch Location',
      description:
        'Using Geotag fetching the exact location of the issue on our interactive map.',
    },
    {
      icon: <Camera size={32} />,
      title: '2. Capture & Upload',
      description:
        'Snap a geotagged photo and record a voice note to provide clear evidence.',
    },
    {
      icon: <Send size={32} />,
      title: '3. Submit & Track',
      description:
        'Your report is sent directly to the relevant department. Track its status in real-time.',
    },
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
      <section className="relative bg-gradient-to-r from-blue-50 to-white py-20 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-tr from-accent/10 to-transparent blur-3xl"></div>
        <div className="container mx-auto px-6 text-center relative z-10">
          <div className="inline-flex items-center gap-2 bg-accent/10 border border-accent/20 px-4 py-2 rounded-full text-sm text-accent mb-6">
            <ShieldCheck size={18} />
            <span className="font-medium">
              Empowering Communities Through Technology
            </span>
          </div>
          <h1 className="text-5xl md:text-6xl font-extrabold leading-tight">
            Voice Your Concerns.{' '}
            <span className="bg-gradient-to-r from-accent to-blue-600 bg-clip-text text-transparent">
              Drive Real Change.
            </span>
          </h1>
          <p className="max-w-2xl mx-auto mt-6 text-lg text-gray-600 leading-relaxed">
            JanNivaran is your direct line to civic authorities. Report local
            issues like potholes, waste, or streetlight outages, and track their
            resolution in real-time.
          </p>
          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
            {user ? (
              <Link
                to={getDashboardPath()}
                className="group inline-flex items-center justify-center bg-accent text-white font-bold py-3 px-8 rounded-lg hover:bg-accent-dark transition shadow-lg hover:shadow-xl"
              >
                Go to Your Dashboard
                <LayoutDashboard className="w-5 h-5 ml-2 group-hover:scale-110 transition-transform" />
              </Link>
            ) : (
              <>
                <Link
                  to="/register"
                  className="group inline-flex items-center justify-center bg-accent text-white font-bold py-3 px-8 rounded-lg hover:bg-accent-dark transition shadow-lg hover:shadow-xl"
                >
                  Get Started Now
                  <ChevronRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                </Link>
                <Link
                  to="/login"
                  className="group inline-flex items-center justify-center font-medium py-3 px-8 text-gray-600 hover:text-gray-900 border border-gray-300 rounded-lg hover:border-accent transition"
                >
                  I already have an account
                </Link>
              </>
            )}
          </div>
        </div>
      </section>

      {/* --- Image Slider Section --- */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-6">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-bold">Transforming Civic Engagement</h2>
            <p className="mt-4 text-lg text-gray-600">
              See how JanNivaran is making a difference across communities
            </p>
          </div>
          <SimpleImageSlider />
        </div>
      </section>

      {/* --- How It Works Section --- */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold">A Simple Path to Resolution</h2>
            <p className="mt-4 text-lg text-gray-600">
              Report a civic issue in just three easy steps.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
            {howItWorksSteps.map((step) => (
              <HowItWorksCard key={step.title} {...step} />
            ))}
          </div>
        </div>
      </section>

      {/* --- Features Section --- */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold">Address a Wide Range of Issues</h2>
            <p className="mt-4 text-lg text-gray-600">
              Our platform connects you to the right department for any civic
              problem.
            </p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
            {features.map((feature) => (
              <FeatureCard key={feature.title} {...feature} />
            ))}
          </div>
        </div>
      </section>

      {/* --- Stats Section --- */}
      <section className="bg-gradient-to-r from-blue-600 to-accent py-20 text-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold">Our Impact in Numbers</h2>
            <p className="mt-4 text-lg text-blue-100">
              Join thousands of citizens making a difference
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            <div className="bg-white/10 backdrop-blur-md rounded-xl p-8 hover:bg-white/20 transition">
              <p className="text-5xl font-extrabold">
                {loading ? (
                  <Loader2 className="h-12 w-12 mx-auto animate-spin" />
                ) : (
                  `${resolvedCount}+`
                )}
              </p>
              <p className="mt-2 text-lg">Issues Resolved</p>
            </div>
            <div className="bg-white/10 backdrop-blur-md rounded-xl p-8 hover:bg-white/20 transition">
              <p className="text-5xl font-extrabold">
                {loading ? (
                  <Loader2 className="h-12 w-12 mx-auto animate-spin" />
                ) : (
                  `${totalUsers}+`
                )}
              </p>
              <p className="mt-2 text-lg">Active Citizens</p>
            </div>
            <div className="bg-white/10 backdrop-blur-md rounded-xl p-8 hover:bg-white/20 transition">
              <p className="text-5xl font-extrabold">7+</p>
              <p className="mt-2 text-lg">Departments on Board</p>
            </div>
          </div>
          {error && <p className="text-center text-red-300 mt-4">{error}</p>}
        </div>
      </section>

      {/* --- Final CTA Section --- */}
      <section className="bg-gradient-to-tr from-white via-gray-50 to-gray-100 py-20">
        <div className="max-w-6xl mx-auto px-6">
          <h2 className="text-4xl font-extrabold text-center text-gray-900 mb-16">
            Ready to <span className="text-accent">Make a Difference?</span>
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-10">
            {/* Card 1 */}
            <Link
              to="/login"
              className="group flex flex-col items-center justify-center rounded-2xl bg-white/80 backdrop-blur-md border border-gray-200 p-10 shadow-lg hover:shadow-2xl hover:border-accent transition transform hover:-translate-y-2"
            >
              <img
                src="/register_image.jpg"
                alt="Register"
                className="w-20 h-20 mb-6 transition-transform group-hover:scale-110"
              />
              <button className="bg-gradient-to-r from-pink-600 to-pink-800 text-white font-bold py-3 px-6 rounded-lg shadow-md hover:shadow-xl transition">
                REGISTER / LOGIN
              </button>
            </Link>

            {/* Card 2 */}
            <Link
              to="/status"
              className="group flex flex-col items-center justify-center rounded-2xl bg-white/80 backdrop-blur-md border border-gray-200 p-10 shadow-lg hover:shadow-2xl hover:border-blue-500 transition transform hover:-translate-y-2"
            >
              <img
                src="/status.jpg"
                alt="View Status"
                className="w-20 h-20 mb-6 transition-transform group-hover:rotate-6"
              />
              <button className="bg-gradient-to-r from-blue-700 to-blue-900 text-white font-bold py-3 px-6 rounded-lg shadow-md hover:shadow-xl transition">
                VIEW STATUS
              </button>
            </Link>

            {/* Card 3 */}
            <Link
              to="/contact"
              className="group flex flex-col items-center justify-center rounded-2xl bg-white/80 backdrop-blur-md border border-gray-200 p-10 shadow-lg hover:shadow-2xl hover:border-orange-500 transition transform hover:-translate-y-2"
            >
              <img
                src="/contact_us.jpg"
                alt="Contact Us"
                className="w-20 h-20 mb-6 transition-transform group-hover:scale-110 group-hover:-rotate-3"
              />
              <button className="bg-gradient-to-r from-orange-500 to-orange-600 text-white font-bold py-3 px-6 rounded-lg shadow-md hover:shadow-xl transition">
                CONTACT US
              </button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;
