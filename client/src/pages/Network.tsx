import { useState, useEffect } from 'react';
import { UserPlus, MessageCircle, Check, Users } from 'lucide-react';
import { Link } from 'react-router-dom';
import api from '../utils/api';

export default function Network() {
  const [friends, setFriends] = useState<any[]>([]);
  const [searchEmail, setSearchEmail] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchFriends = async () => {
    try {
      const { data } = await api.get('/friends');
      setFriends(data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchFriends();
  }, []);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchEmail) return;
    setLoading(true);
    try {
      // For MVP, we'll just have a simple endpoint or search logic
      // Since I didn't implement a search API, I'll add one to the backend later
      // For now, let's assume it exists or search by email
      const { data } = await api.get(`/auth/search?email=${searchEmail}`);
      setSearchResults(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const addFriend = async (id: string) => {
    try {
      await api.post('/friends/request', { addresseeId: id });
      alert('Friend request sent!');
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
        <h2 className="text-2xl font-bold mb-4">Find Researchers</h2>
        <form onSubmit={handleSearch} className="flex space-x-3">
          <input
            type="email"
            value={searchEmail}
            onChange={(e) => setSearchEmail(e.target.value)}
            placeholder="Enter friend's email..."
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
          />
          <button
            type="submit"
            className="bg-blue-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-blue-700 transition"
          >
            Search
          </button>
        </form>
        
        {searchResults.length > 0 && (
          <div className="mt-6 space-y-3">
            {searchResults.map(user => (
              <div key={user.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                <div>
                  <p className="font-bold text-gray-900">{user.name}</p>
                  <p className="text-sm text-gray-500">{user.email}</p>
                </div>
                <button
                  onClick={() => addFriend(user.id)}
                  className="flex items-center space-x-2 bg-white text-blue-600 border border-blue-600 px-4 py-2 rounded-lg font-semibold hover:bg-blue-50 transition"
                >
                  <UserPlus size={18} />
                  <span>Add Friend</span>
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      <div>
        <h2 className="text-2xl font-bold mb-6 flex items-center space-x-2">
          <Users className="text-blue-600" />
          <span>My Network</span>
        </h2>
        
        {friends.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {friends.map(friend => (
              <div key={friend.id} className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center font-bold text-xl">
                    {friend.name[0]}
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900">{friend.name}</h3>
                    <p className="text-sm text-gray-500">{friend.papers?.length || 0} papers tracked</p>
                  </div>
                </div>
                <Link
                  to={`/chat/${friend.id}`}
                  className="p-3 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition"
                >
                  <MessageCircle size={24} />
                </Link>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 bg-white rounded-2xl border border-gray-100">
            <p className="text-gray-500">You haven't added any friends yet.</p>
          </div>
        )}
      </div>
    </div>
  );
}
