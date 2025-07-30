import { MenuIcon } from './Icons'; 

const Header = ({ onMenuClick }) => {
  return (
    <header className="sticky top-0 bg-[#0F172A]/80 backdrop-blur-lg z-10 lg:hidden mb-6">
      <div className="px-4 sm:px-6 md:px-10 flex items-center justify-between h-16 border-b border-white/10">
        <h1 className="text-xl font-bold text-yellow-400">
          LuxeStay
        </h1>
        <button
          onClick={onMenuClick}
          className="p-2 text-gray-400 hover:text-white"
        >
          <MenuIcon className="w-6 h-6" />
        </button>
      </div>
    </header>
  );
};

export default Header;