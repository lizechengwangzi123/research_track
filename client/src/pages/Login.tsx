import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../utils/api';

export default function Login({ setUser }: any) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [showForgot, setShowForgot] = useState(false);
  const [forgotLoading, setForgotLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setMessage('');
    try {
      const { data } = await api.post('/auth/login', { email, password });
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      setUser(data.user);
      navigate('/');
    } catch (err: any) {
      setError(err.response?.data?.error || 'Login failed');
    }
  };

  const handleForgot = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setMessage('');
    setForgotLoading(true);
    try {
      const { data } = await api.post('/auth/forgot-password', { email });
      setMessage(data.message);
      setShowForgot(false);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Request failed');
    } finally {
      setForgotLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto mt-20 bg-white p-10 rounded-3xl shadow-2xl border border-gray-50 animate-in fade-in zoom-in duration-500">
      <div className="text-center mb-10">
        <h2 className="text-4xl font-black text-blue-600 tracking-tighter mb-2">ResearchTrack</h2>
        <p className="text-gray-400 font-medium text-sm uppercase tracking-widest">
          {showForgot ? 'Recover your lab access' : 'Welcome back to your lab'}
        </p>
      </div>

      {error && <div className="bg-red-50 text-red-500 px-4 py-3 rounded-2xl mb-6 text-sm font-bold border border-red-100 flex items-center space-x-2">
        <span className="material-symbols-outlined text-lg">error</span>
        <span>{error}</span>
      </div>}
      {message && <div className="bg-green-50 text-green-600 px-4 py-3 rounded-2xl mb-6 text-sm font-bold border border-green-100 flex items-center space-x-2">
        <span className="material-symbols-outlined text-lg">info</span>
        <span>{message}</span>
      </div>}

      {!showForgot ? (
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-1">
            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Laboratory Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-6 py-4 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-blue-500/20 outline-none transition-all placeholder:text-gray-300 font-medium"
              placeholder="name@university.edu"
              required
            />
          </div>
          <div className="space-y-1">
            <div className="flex justify-between items-center px-1">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Access Key</label>
              <button 
                type="button"
                onClick={() => setShowForgot(true)}
                className="text-[10px] font-black text-blue-600 uppercase tracking-widest hover:underline"
              >
                Forgot?
              </button>
            </div>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-6 py-4 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-blue-500/20 outline-none transition-all placeholder:text-gray-300"
              placeholder="••••••••"
              required
            />
          </div>
          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-4 rounded-2xl font-bold text-lg hover:bg-blue-700 transition shadow-xl shadow-blue-500/20 hover:scale-[1.02] active:scale-95"
          >
            Sign In
          </button>
        </form>
      ) : (
        <form onSubmit={handleForgot} className="space-y-6">
          <div className="space-y-1">
            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Registered Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-6 py-4 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-blue-500/20 outline-none transition-all"
              placeholder="name@university.edu"
              required
            />
          </div>
          <div className="flex space-x-4">
            <button
              type="button"
              onClick={() => setShowForgot(false)}
              className="flex-1 py-4 text-gray-400 font-bold uppercase tracking-widest text-xs hover:bg-gray-50 rounded-2xl transition-all"
            >
              Back
            </button>
            <button
              type="submit"
              disabled={forgotLoading}
              className="flex-1 bg-blue-600 text-white py-4 rounded-2xl font-bold text-xs uppercase tracking-widest hover:bg-blue-700 transition shadow-lg shadow-blue-500/10 disabled:opacity-50"
            >
              {forgotLoading ? '...' : 'Send Reset Link'}
            </button>
          </div>
          <p className="text-[10px] text-center text-gray-400 font-medium px-4">
            We will send a secure link to your email to verify your identity.
          </p>
        </form>
      )}

      <p className="mt-10 text-center text-[10px] font-black text-gray-400 uppercase tracking-widest">
        No laboratory access? <Link to="/register" className="text-blue-600 hover:underline">Request Account</Link>
      </p>
    </div>
  );
}
