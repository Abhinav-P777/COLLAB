import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import bgImage from "../assets/10994876-hd_1080_1920_25fps (2).mp4";

const Register = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const { data } = await axios.post('http://localhost:5000/api/auth/register', {
        name,
        email,
        password,
      });

      // Save user info
      localStorage.setItem(
        'user',
        JSON.stringify({ username: data.username, token: data.token })
      );

      navigate('/dashboard'); // redirect
    } catch (error) {
      setError(error.response?.data?.message || 'An unexpected error occurred.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative flex items-center justify-center min-h-screen">
      {/* Background Video */}
      <video
        src={bgImage}
        autoPlay
        loop
        muted
        className="absolute inset-0 w-full h-full object-cover"
      />
      {/* Dark Overlay */}
      <div className="absolute inset-0 bg-black/50"></div>

      {/* Register Card */}
      <div className="relative w-full max-w-md rounded-2xl shadow-lg p-8 transform transition duration-300 hover:scale-105 font-LIBRE bg-white/10 backdrop-blur-md">
        <h2 className="text-2xl font-bold text-center mb-6 text-white">Register</h2>
        <form onSubmit={handleRegister} className="space-y-4">
          {/* Username */}
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-100">
              Username
            </label>
            <input
              type="text"
              id="name"
              className="mt-1 block w-full px-4 py-2 bg-gray-900 text-white border border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-400 focus:outline-none"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>
          {/* Email */}
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-100">
              Email address
            </label>
            <input
              type="email"
              id="email"
              className="mt-1 block w-full px-4 py-2 bg-gray-900 text-white border border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-400 focus:outline-none"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          {/* Password */}
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-100">
              Password
            </label>
            <input
              type="password"
              id="password"
              className="mt-1 block w-full px-4 py-2 bg-gray-900 text-white border border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-400 focus:outline-none"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          {/* Error */}
          {error && <p className="text-red-500 text-sm">{error}</p>}
          {/* Button */}
          <button
            type="submit"
            disabled={loading}
            className={`w-full py-2 rounded-lg shadow-md transition ${
              loading ? "bg-gray-500 cursor-not-allowed" : "bg-indigo-600 hover:bg-indigo-700"
            }`}
          >
            {loading ? "Registering..." : "Register"}
          </button>
        </form>
        <p className="mt-4 text-center text-gray-100 text-sm">
          Already have an account?{' '}
          <a href="/login" className="text-indigo-400 hover:underline font-medium">
            Login
          </a>
        </p>
      </div>
    </div>
  );
};

export default Register;
