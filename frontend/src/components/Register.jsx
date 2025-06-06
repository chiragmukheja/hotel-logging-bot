import { useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';

function Register({ onRegister }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');

  const handleRegister = async (e) => {
    e.preventDefault();
    try {
      await axios.post("https://hotel-logging-bot.onrender.com/auth/register", {
        username,
        password,
      });
      setMessage('Registration successful. Please login.');
      onRegister(); // switch to login screen
    } catch (err) {
      setMessage('Registration failed. Email may already be in use.');
    }
  };

  return (
    <div className="flex m-25 items-center justify-center ">
      <form
        onSubmit={handleRegister}
        className="bg-sky-950 p-8 rounded-xl shadow-md w-full max-w-md"
      >
        <h2 className="text-2xl font-semibold mb-6 text-center">Register Admin</h2>
        {message && <p className="text-sm mb-4 text-center text-blue-500">{message}</p>}
        <input
          type="text"
          placeholder="Username"
          className="w-full mb-4 px-4 py-2 border rounded-lg"
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
          className="w-full bg-yellow-500 text-white font-medium py-2 rounded-lg hover:bg-yellow-600 transition"
        >
          Register
        </button>
        <p className="text-center mt-4 text-sm">
        Already have an account?{' '}
        <Link to="/auth/login" className="text-yellow-400 hover:underline">
            Login here
        </Link>
        </p>
      </form>
      
    </div>
  );
}

export default Register;
