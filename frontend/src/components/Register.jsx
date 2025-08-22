import { useState } from 'react';
import axios from 'axios';
import { UserIcon, LockIcon } from './Layout/Icons';

function Register({ onRegister }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const handleRegister = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');
    try {
      await axios.post("https://hotel-logging-bot.onrender.com/auth/register", { username, password });
      setMessage('Registration successful! Sliding to login...');
      onRegister();
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed.');
    }
  };

  return (
    <div className="h-full w-full flex items-center justify-center ">
      <form onSubmit={handleRegister} className="w-full max-w-sm space-y-8 px-4">
        <h2 className="text-3xl font-bold text-white text-center">Create Account</h2>
        {message && <p className="text-green-400 text-sm text-center -my-4">{message}</p>}
        {error && <p className="text-red-400 text-sm text-center -my-4">{error}</p>}
        
        <div className="relative">
          <label className="absolute -top-3 left-2 text-xs text-gray-400 bg-[#111119] px-1">Username</label>
          <UserIcon className="absolute top-1/2 -translate-y-1/2 left-3 w-5 h-5 text-gray-400" />
          <input
            type="text"
            className="w-full pl-10 pr-4 py-3 bg-transparent text-white border-b-2 border-gray-600 focus:outline-none focus:border-indigo-500 transition"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />
        </div>

        <div className="relative">
          <label className="absolute -top-3 left-2 text-xs text-gray-400 bg-[#111119] px-1">Password</label>
          <LockIcon className="absolute top-1/2 -translate-y-1/2 left-3 w-5 h-5 text-gray-400" />
          <input
            type="password"
            className="w-full pl-10 pr-4 py-3 bg-transparent text-white border-b-2 border-gray-600 focus:outline-none focus:border-indigo-500 transition"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>

        <button
          type="submit"
          className="w-full font-bold py-3 px-4 rounded-lg text-white bg-indigo-600 hover:bg-indigo-700 transition-all"
        >
          Create Account
        </button>
      </form>
    </div>
  );
}

export default Register;
