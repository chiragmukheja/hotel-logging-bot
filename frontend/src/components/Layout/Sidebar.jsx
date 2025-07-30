import { NavLink } from 'react-router-dom';
import { HomeIcon, ListIcon, SettingsIcon } from './Icons'; // We will create this file next

const Sidebar = ({ handleLogout }) => {
  const navLinkClasses =
    'flex items-center px-4 py-3 text-gray-400 hover:bg-gray-700/50 hover:text-white rounded-lg transition-colors duration-200';
  const activeLinkClasses = 'bg-gray-700 text-white';

  return (
    <div className="fixed left-0 top-0 h-full w-64 bg-[#0B0F2B]/80 backdrop-blur-lg border-r border-white/10 flex flex-col">
      {/* Logo/Header */}
      <div className="flex items-center justify-center h-24 border-b border-white/10">
        <h1 className="text-3xl font-bold text-yellow-400 tracking-wide">
          LuxeStay
        </h1>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 py-6 space-y-2">
        <NavLink
          to="/dashboard"
          end
          className={({ isActive }) =>
            `${navLinkClasses} ${isActive ? activeLinkClasses : ''}`
          }
        >
          <HomeIcon className="w-6 h-6 mr-3" />
          Dashboard
        </NavLink>
        <NavLink
          to="/requests"
          className={({ isActive }) =>
            `${navLinkClasses} ${isActive ? activeLinkClasses : ''}`
          }
        >
          <ListIcon className="w-6 h-6 mr-3" />
          All Requests
        </NavLink>
        {/* Add more links here as we build them */}
      </nav>

      {/* Footer/Logout */}
      <div className="px-4 py-6 border-t border-white/10">
        <button
          onClick={handleLogout}
          className="w-full bg-red-500/80 hover:bg-red-600 text-white font-medium py-3 px-4 rounded-lg shadow transition"
        >
          Logout
        </button>
      </div>
    </div>
  );
};

export default Sidebar;