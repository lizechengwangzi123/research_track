import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import api from '../utils/api';

export default function ResetPassword() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const navigate = useNavigate();
  
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!token) {
      setError('Invalid or missing reset token.');
    }
  }, [token]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      return setError('Passwords do not match');
    }
    
    setLoading(true);
    setError('');
    try {
      await api.post('/auth/reset-password', { token, newPassword });
      setMessage('Password updated successfully! Redirecting to login...');
      setTimeout(() => navigate('/login'), 3000);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Reset failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto mt-20 bg-white p-10 rounded-3xl shadow-2xl border border-gray-50 animate-in fade-in zoom-in duration-500">
      <div className="text-center mb-10">
        <h2 className="text-4xl font-black text-blue-600 tracking-tighter mb-2">Security</h2>
        <p className="text-gray-400 font-medium text-sm uppercase tracking-widest">Update your access key</p>
      </div>

      {error && <div className="bg-red-50 text-red-500 px-4 py-3 rounded-2xl mb-6 text-sm font-bold border border-red-100 flex items-center space-x-2">
        <span className="material-symbols-outlined text-lg">error</span>
        <span>{error}</span>
      </div>}
      {message && <div className="bg-green-50 text-green-600 px-4 py-3 rounded-2xl mb-6 text-sm font-bold border border-green-100 flex items-center space-x-2">
        <span className="material-symbols-outlined text-lg">check_circle</span>
        <span>{message}</span>
      </div>}

      {!token ? (
        <div className="text-center">
          <Link to="/login" className="text-blue-600 font-bold hover:underline">Return to Login</Link>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-1">
            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">New Access Key</label>
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="w-full px-6 py-4 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-blue-500/20 outline-none transition-all"
              placeholder="Min 8 characters"
              required
              minLength={8}
            />
          </div>
          <div className="space-y-1">
            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Confirm Access Key</label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full px-6 py-4 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-blue-500/20 outline-none transition-all"
              placeholder="Repeat password"
              required
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white py-4 rounded-2xl font-bold text-lg hover:bg-blue-700 transition shadow-xl shadow-blue-500/20 hover:scale-[1.02] active:scale-95 disabled:opacity-50"
          >
            {loading ? 'Updating...' : 'Update Password'}
          </button>
        </form>
      )}
    </div>
  );
}
