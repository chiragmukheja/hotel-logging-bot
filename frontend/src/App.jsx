import { Routes, Route, Navigate, useNavigate, useLocation, Outlet } from 'react-router-dom';
import { useEffect, useState } from 'react';

// Pages & Components
import Login from './components/Login';
import Register from './components/Register';
import RoomList from './components/RoomList';
import RoomDetail from './components/RoomDetail';
import Sidebar from './components/Layout/Sidebar'; // Import the new Sidebar

// Utils
import { getToken } from './utils/auth';
import AllRequestsPage from './pages/AllRequestsPage';

// The new Layout component for authenticated users
const AppLayout = ({ handleLogout }) => (
  <div className="flex min-h-screen">
    <Sidebar handleLogout={handleLogout} />
    <main className="flex-1 ml-64 bg-[#0F172A]">
      <div className="px-4 sm:px-6 md:px-10 py-8 max-w-7xl mx-auto">
        {/* Outlet renders the matched child route component */}
        <Outlet /> 
      </div>
    </main>
  </div>
);

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(!!getToken());
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogin = () => {
    setIsLoggedIn(true);
    navigate('/dashboard');
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    setIsLoggedIn(false);
    navigate('/auth/login');
  };

  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/auth/login" element={isLoggedIn ? <Navigate to="/dashboard" /> : <Login onLogin={handleLogin} />} />
      <Route path="/auth/register" element={isLoggedIn ? <Navigate to="/dashboard" /> : <Register onRegister={() => navigate('/auth/login')} />} />

      {/* Protected Routes */}
      {isLoggedIn ? (
        <Route element={<AppLayout handleLogout={handleLogout} />}>
          <Route path="/dashboard" element={<RoomList />} />
          <Route path="/requests" element={<AllRequestsPage />} />
          <Route path="/dashboard/room/:stayId" element={<RoomDetail />} />
          <Route path="*" element={<Navigate to="/dashboard" />} />
        </Route>
      ) : (
        <Route path="*" element={<Navigate to="/auth/login" state={{ from: location }} replace />} />
      )}
    </Routes>
  );
}

export default App;