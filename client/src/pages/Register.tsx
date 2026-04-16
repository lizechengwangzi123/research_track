import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../utils/api';

export default function Register({ setUser }: any) {
  const [formData, setFormData] = useState({ email: '', password: '', name: '' });
  const [code, setCode] = useState('');
  const [step, setStep] = useState(1); // 1: Info, 2: Verification
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await api.post('/auth/register', formData);
      setStep(2);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const { data } = await api.post('/auth/verify-email', { email: formData.email, code });
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      setUser(data.user);
      navigate('/');
    } catch (err: any) {
      setError(err.response?.data?.error || 'Verification failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto mt-20 bg-white p-10 rounded-3xl shadow-2xl border border-gray-50 animate-in fade-in zoom-in duration-500">
      <div className="text-center mb-10">
        <h2 className="text-4xl font-black text-blue-600 tracking-tighter mb-2">ResearchTrack</h2>
        <p className="text-gray-400 font-medium text-sm uppercase tracking-widest">
          {step === 1 ? 'Establish your laboratory' : 'Security Verification'}
        </p>
      </div>

      {error && <div className="bg-red-50 text-red-500 px-4 py-3 rounded-2xl mb-6 text-sm font-bold border border-red-100 flex items-center space-x-2">
        <span className="material-symbols-outlined text-lg">error</span>
        <span>{error}</span>
      </div>}

      {step === 1 ? (
        <form onSubmit={handleRegister} className="space-y-6">
          <div className="space-y-1">
            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Full Name</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-6 py-4 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-blue-500/20 outline-none transition-all"
              placeholder="Dr. Alexander Smith"
              required
            />
          </div>
          <div className="space-y-1">
            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Laboratory Email</label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="w-full px-6 py-4 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-blue-500/20 outline-none transition-all"
              placeholder="name@university.edu"
              required
            />
          </div>
          <div className="space-y-1">
            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Access Key</label>
            <input
              type="password"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              className="w-full px-6 py-4 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-blue-500/20 outline-none transition-all"
              placeholder="Min 8 characters"
              required
              minLength={8}
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white py-4 rounded-2xl font-bold text-lg hover:bg-blue-700 transition shadow-xl shadow-blue-500/20 hover:scale-[1.02] active:scale-95 disabled:opacity-50"
          >
            {loading ? 'Initializing...' : 'Create Account'}
          </button>
        </form>
      ) : (
        <form onSubmit={handleVerify} className="space-y-6 text-center">
          <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="material-symbols-outlined text-3xl">mark_email_unread</span>
          </div>
          <p className="text-sm text-gray-500 font-medium px-4">
            A 6-digit verification code has been sent to <span className="text-blue-600 font-bold">{formData.email}</span>
          </p>
          <div className="space-y-1">
            <input
              type="text"
              value={code}
              onChange={(e) => setCode(e.target.value.replace(/\D/g,''))}
              maxLength={6}
              className="w-full px-6 py-5 bg-gray-50 border-none rounded-2xl focus:ring-4 focus:ring-blue-500/10 outline-none transition-all text-center text-3xl font-black tracking-[10px] text-blue-600"
              placeholder="000000"
              required
            />
          </div>
          <button
            type="submit"
            disabled={loading || code.length !== 6}
            className="w-full bg-blue-600 text-white py-4 rounded-2xl font-bold text-lg hover:bg-blue-700 transition shadow-xl shadow-blue-500/20 hover:scale-[1.02] active:scale-95 disabled:opacity-50"
          >
            {loading ? 'Verifying...' : 'Verify & Access'}
          </button>
          <button 
            type="button" 
            onClick={() => setStep(1)}
            className="text-[10px] font-black text-gray-400 uppercase tracking-widest hover:text-blue-600"
          >
            Wrong email? Go back
          </button>
        </form>
      )}

      <p className="mt-10 text-center text-[10px] font-black text-gray-400 uppercase tracking-widest">
        Already have access? <Link to="/login" className="text-blue-600 hover:underline">Sign In</Link>
      </p>
    </div>
  );
}
