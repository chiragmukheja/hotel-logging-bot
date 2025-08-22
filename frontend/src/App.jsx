import { Routes, Route, Navigate, useNavigate, useLocation, Outlet } from 'react-router-dom';
import { useState, useEffect } from 'react';
import AuthPage from './pages/AuthPage';
import DashboardPage from './components/RoomList';
import RoomDetail from './components/RoomDetail';
import AllRequestsPage from './pages/AllRequestsPage';
import Sidebar from './components/Layout/Sidebar';
import Header from './components/Layout/Header';
import { getToken } from './utils/auth';


const AppLayout = ({ handleLogout }) => {
  const [isSidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen">
      <div className="relative z-10">
        <Sidebar isSidebarOpen={isSidebarOpen} handleLogout={handleLogout} />
        {isSidebarOpen && <div onClick={() => setSidebarOpen(false)} className="fixed inset-0 bg-black/50 lg:hidden"></div>}
        
        <div className="lg:ml-64">
          <Header onMenuClick={() => setSidebarOpen(true)} />
          <main className="px-4 sm:px-6 md:px-10 py-8 max-w-7xl mx-auto">
            <Outlet /> 
          </main>
        </div>
      </div>
    </div>
  );
};

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(!!getToken());
  const navigate = useNavigate();

  const handleLogin = () => {
    setIsLoggedIn(true);
    navigate('/dashboard');
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    setIsLoggedIn(false);
    navigate('/auth');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0B0F2B] via-[#120E2A] to-[#0A0A10]">
      <Routes>
        <Route 
          path="/auth" 
          element={isLoggedIn ? <Navigate to="/dashboard" /> : <AuthPage onLogin={handleLogin} />} 
        />
        
        {isLoggedIn ? (
          <Route element={<AppLayout handleLogout={handleLogout} />}>
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/requests" element={<AllRequestsPage />} />
            <Route path="/dashboard/room/:stayId" element={<RoomDetail />} />
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Route>
        ) : (
          <Route path="*" element={<Navigate to="/auth" replace />} />
        )}
      </Routes>
    </div>
  );
}

export default App;
