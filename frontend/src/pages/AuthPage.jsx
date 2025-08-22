// frontend/src/pages/AuthPage.jsx

import { useState } from 'react';
import Login from '../components/Login';
import Register from '../components/Register';

const AuthHeader = () => (
    <header className="absolute top-0 left-0 w-full p-6 z-10">
        <h1 className="text-3xl font-bold text-yellow-400 tracking-wide">LuxeStay</h1>
    </header>
);

const AuthPage = ({ onLogin }) => {
  const [isSignUpActive, setIsSignUpActive] = useState(false);

  const handleRegisterClick = () => setIsSignUpActive(true);
  const handleLoginClick = () => setIsSignUpActive(false);

  const onRegisterSuccess = () => {
    setTimeout(() => {
      setIsSignUpActive(false);
    }, 2000);
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4">
      <AuthHeader />
      <div 
        className="relative w-full max-w-sm lg:max-w-4xl min-h-[36rem] rounded-2xl shadow-2xl overflow-hidden bg-[#111119] 
                   transition-all duration-700 ease-in-out lg:min-h-[34rem]"
      >
        {/* Sign Up Form Container */}
        <div 
          className={`absolute top-0 h-full w-full lg:w-1/2 left-0 transition-all duration-700 ease-in-out z-10 transform 
                      ${isSignUpActive 
                        ? 'translate-y-0 opacity-100 z-20 lg:translate-x-full' 
                        : 'translate-y-full opacity-0 lg:translate-y-0 lg:opacity-100'}`}
        >
          <Register onRegister={onRegisterSuccess} />
        </div>
        
        {/* Login Form Container */}
        <div 
          className={`absolute top-0 h-full w-full lg:w-1/2 left-0 transition-all duration-700 ease-in-out z-20 transform 
                      ${isSignUpActive 
                        ? '-translate-y-full opacity-0 lg:-translate-x-full lg:opacity-100' 
                        : 'translate-y-0 opacity-100'}`}
        >
          <Login onLogin={onLogin} />
        </div>
        
        {/* Desktop-only Sliding Overlay Panel */}
        <div 
          className={`absolute top-0 left-1/2 w-1/2 h-full overflow-hidden 
                      transition-transform duration-700 ease-in-out z-50 hidden lg:block
                      transform 
                      ${isSignUpActive ? '-translate-x-full' : 'translate-x-0'}`}
        >
          <div 
            className={`relative -left-full h-full w-[200%] 
                        bg-gradient-to-br from-indigo-600 to-indigo-900
                        transition-transform duration-700 ease-in-out text-white transform 
                        ${isSignUpActive ? 'translate-x-1/2' : 'translate-x-0'}`}
          >
            <div className="absolute top-0 left-0 flex flex-col items-center justify-center h-full w-1/2 px-10 text-center">
              <h1 className="text-3xl font-bold">Welcome Back!</h1>
              <p className="mt-4 text-indigo-200">Please login to access your dashboard</p>
              <button onClick={handleLoginClick} className="mt-8 bg-transparent border-2 border-white font-bold uppercase py-2 px-8 rounded-full">
                Sign In
              </button>
            </div>
            <div className="absolute top-0 right-0 flex flex-col items-center justify-center h-full w-1/2 px-10 text-center">
              <h1 className="text-3xl font-bold">New Here?</h1>
              <p className="mt-4 text-indigo-200">Sign up to get started</p>
              <button onClick={handleRegisterClick} className="mt-8 bg-transparent border-2 border-white font-bold uppercase py-2 px-8 rounded-full">
                Sign Up
              </button>
            </div>
          </div>
        </div>

        {/* Mobile-only toggle buttons */}
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 w-full text-center lg:hidden z-30">
            {isSignUpActive ? (
                <p className="text-sm text-gray-400">Already have an account?{' '}
                    <button onClick={handleLoginClick} className="font-medium text-indigo-400 hover:underline">Sign In</button>
                </p>
            ) : (
                <p className="text-sm text-gray-400">Don't have an account?{' '}
                    <button onClick={handleRegisterClick} className="font-medium text-indigo-400 hover:underline">Sign Up</button>
                </p>
            )}
        </div>
      </div>
    </div>
  );
};

export default AuthPage;