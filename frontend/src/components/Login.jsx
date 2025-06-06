import { useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';

function Login({ onLogin }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post("https://hotel-logging-bot.onrender.com/auth/login", {
        username,
        password,
      });
      localStorage.setItem('token', res.data.token);
      onLogin();
    } catch (err) {
      setError('Invalid credentials');
    }
  };

  return (
    <div className="flex m-25 items-center justify-center ">
      <form
        onSubmit={handleLogin}
        className="bg-sky-950 p-8 rounded-xl shadow-md w-full max-w-md"
      >
        <h2 className="text-2xl font-semibold mb-6 text-center text-yellow-400">Admin Login</h2>
        {error && <p className="text-red-500 text-sm mb-4">{error}</p>}
        <input
          type="text"
          placeholder="Username"
          className="w-full mb-4 px-4 py-2 border rounded-lg "
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          required
        />
        <input
          type="password"
          placeholder="Password"
          className="w-full mb-6 px-4 py-2 border rounded-lg"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <button
          type="submit"
          className="w-full bg-white text-black py-2 rounded-lg hover:bg-gray-200 transition"
        >
          Login
        </button>
        <p className="text-center mt-5 text-sm">
        Don&apos;t have an account?{' '}
        <Link to="/auth/register" className="text-yellow-400 hover:underline">
          Register here
        </Link>
      </p>
      </form>
      
    </div>
    
  );
}

export default Login;
