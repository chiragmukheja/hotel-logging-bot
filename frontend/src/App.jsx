import { Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom';
import { useEffect, useState } from 'react';
import Login from './components/Login';
import Register from './components/Register';
import { getToken } from './utils/auth';
import RoomList from './components/RoomList';
import RoomDetail from './components/RoomDetail';

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(null); // null = unknown, true/false = known
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const token = getToken();
    setIsLoggedIn(!!token);
  }, []);

  const handleLogin = () => {
    setIsLoggedIn(true);
    navigate('/dashboard');
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    setIsLoggedIn(false);
    navigate('/auth/login');
  };

  if (isLoggedIn === null) {
    // Wait until token is checked
    return <p className="text-center text-gray-400 mt-10">Checking session...</p>;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-black text-white font-sans">
      <header className="flex items-center justify-between py-6 px-22 border-b border-gray-800 bg-transparent">
        <div>
          <h1 className="text-4xl font-bold text-yellow-400 tracking-wide">
            LuxeStay Guest Dashboard
          </h1>
          <p className="text-gray-400 mt-1">
            Manage and monitor guest service requests efficiently
          </p>
        </div>

        {isLoggedIn && (
          <button
            onClick={handleLogout}
            className="bg-red-500 hover:bg-red-600 text-white font-medium py-2 px-4 rounded-lg shadow transition"
          >
            Logout
          </button>
        )}
      </header>

      <main className="px-4 sm:px-6 md:px-10 py-8 max-w-7xl mx-auto">
        <Routes>
          <Route
            path="/auth/login"
            element={
              isLoggedIn ? <Navigate to="/dashboard" /> : <Login onLogin={handleLogin} />
            }
          />
          <Route
            path="/auth/register"
            element={
              isLoggedIn ? <Navigate to="/dashboard" /> : <Register onRegister={() => navigate('/auth/login')} />
            }
          />
          <Route 
            path="/dashboard" 
            element={
              isLoggedIn ? <RoomList /> : <Navigate to="/auth/login" state={{ from: location }} replace />
            } 
          />
          <Route 
            path="/dashboard/room/:stayId"
            element={
              isLoggedIn ? <RoomDetail /> : <Navigate to="/auth/login" state={{ from: location }} replace />
            } 
          />
          <Route path="*" element={<Navigate to="/auth/login" />} />
        </Routes>
      </main>
    </div>
  );
}

export default App;
