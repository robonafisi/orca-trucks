import React, { useState } from 'react';
import { LogIn } from 'lucide-react';

const LOGO_URL = "/public/Orca.jpg";

interface LoginPageProps {
  onLogin: (username: string, password: string) => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({ onLogin }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // In a real application, you would send these credentials to a backend API.
    // For this example, we'll use simple hardcoded credentials.
    if (username === 'fleetmanager' && password === 'orca123') {
      onLogin(username, password);
    } else {
      setError('Invalid username or password.');
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 flex items-center justify-center font-sans">
      <div className="max-w-md w-full bg-white p-10 rounded-xl shadow-2xl border border-slate-200">
        
        {/* Logo and Title */}
        <div className="flex flex-col items-center mb-10">
          <img 
            src={LOGO_URL} 
            alt="Orca Cargo Logo" 
            className="h-24 w-24 rounded-full object-contain bg-slate-50 border border-slate-100 shadow-md" 
          />
          <h1 className="text-3xl font-bold text-slate-900 mt-4">Fleet Login</h1>
          <p className="text-slate-500 mt-2">Access your Orca Tech Dashboard</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          
          {/* Username Field */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1" htmlFor="username">
              Username
            </label>
            <input
              id="username"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="fleetmanager"
            />
          </div>

          {/* Password Field */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1" htmlFor="password">
              Password
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="••••••••"
            />
            <div className="text-right mt-2">
              <a href="#" className="text-sm text-blue-600 hover:text-blue-700 font-medium">Forgot Password?</a>
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative text-sm" role="alert">
              <strong className="font-bold">Error:</strong>
              <span className="block sm:inline ml-1">{error}</span>
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            className="w-full flex items-center justify-center gap-2 bg-blue-600 text-white px-4 py-3 rounded-lg font-semibold text-lg hover:bg-blue-700 transition shadow-lg hover:shadow-blue-500/25"
          >
            <LogIn size={20} />
            Login
          </button>
        </form>
        
        {/* Sign Up Link */}
        <div className="mt-8 text-center text-sm text-slate-600">
          Need an account? 
          <a href="#" className="text-blue-600 hover:text-blue-700 font-semibold ml-1">Contact Sales</a>
        </div>
      </div>
    </div>
  );
};