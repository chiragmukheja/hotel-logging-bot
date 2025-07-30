import { Routes, Route, Navigate, useNavigate, useLocation, Outlet } from 'react-router-dom';
import { useEffect, useState } from 'react';

// Pages & Components
import Login from './components/Login';
import Register from './components/Register';
import DashboardPage from './components/RoomList'; 
import RoomDetail from './components/RoomDetail';
import AllRequestsPage from './pages/AllRequestsPage';
import Sidebar from './components/Layout/Sidebar';
import Header from './components/Layout/Header'; 

// Utils
import { getToken } from './utils/auth';

// The new Layout component for authenticated users
const AppLayout = ({ handleLogout }) => {
  const [isSidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[#0F172A]">
      <Sidebar isSidebarOpen={isSidebarOpen} handleLogout={handleLogout} />
      {/* Overlay for mobile when sidebar is open */}
      {isSidebarOpen && <div onClick={() => setSidebarOpen(false)} className="fixed inset-0 bg-black/50 z-10 lg:hidden"></div>}
      
      {/* ✅ Margin is now responsive */}
      <div className="lg:ml-64">
        <Header onMenuClick={() => setSidebarOpen(true)} />
        <main className="px-4 sm:px-6 md:px-10 py-8 max-w-7xl mx-auto">
          <Outlet /> 
        </main>
      </div>
    </div>
  );
};


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
      <Route path="/auth/login" element={isLoggedIn ? <Navigate to="/dashboard" /> : <Login onLogin={handleLogin} />} />
      <Route path="/auth/register" element={isLoggedIn ? <Navigate to="/dashboard" /> : <Register onRegister={() => navigate('/auth/login')} />} />

      {isLoggedIn ? (
        <Route element={<AppLayout handleLogout={handleLogout} />}>
          <Route path="/dashboard" element={<DashboardPage />} />
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