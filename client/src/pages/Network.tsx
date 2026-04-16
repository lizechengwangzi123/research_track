import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../utils/api';

export default function Network() {
  const [friends, setFriends] = useState<any[]>([]);
  const [pendingRequests, setPendingRequests] = useState<any[]>([]);
  const [searchEmail, setSearchEmail] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [showProgressModal, setShowProgressModal] = useState(false);
  const [selectedFriend, setSelectedFriend] = useState<any>(null);
  
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  const fetchData = async () => {
    try {
      const [friendsRes, requestsRes] = await Promise.all([
        api.get('/friends'),
        api.get('/friends/requests')
      ]);
      setFriends(friendsRes.data);
      setPendingRequests(requestsRes.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchEmail) return;
    setLoading(true);
    try {
      const { data } = await api.get(`/auth/search?email=${searchEmail}`);
      setSearchResults(data.filter((u: any) => u.id !== user.id));
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
      fetchData();
    } catch (err: any) {
      alert(err.response?.data?.error || 'Failed to send request');
    }
  };

  const acceptRequest = async (requestId: string) => {
    try {
      await api.put(`/friends/accept/${requestId}`);
      fetchData();
    } catch (err) {
      console.error(err);
    }
  };

  const calculatePassedTime = (date: string) => {
    if (!date) return null;
    const submitted = new Date(date);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - submitted.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays < 30) return `${diffDays}d`;
    const diffMonths = Math.floor(diffDays / 30);
    if (diffMonths < 12) return `${diffMonths}mo`;
    return `${Math.floor(diffMonths / 12)}y`;
  };

  return (
    <div className="space-y-12 max-w-5xl mx-auto animate-in fade-in duration-500">
      {/* Hero Search Section */}
      <section>
        <div className="mb-2">
          <span className="font-label text-[10px] uppercase tracking-[0.2em] text-on-surface-variant font-black">Discovery Engine</span>
        </div>
        <h1 className="font-headline text-4xl font-extrabold tracking-tight text-on-surface mb-8">Expand your network</h1>
        
        <form onSubmit={handleSearch} className="relative group max-w-2xl">
          <div className="absolute inset-y-0 left-6 flex items-center pointer-events-none">
            <span className="material-symbols-outlined text-outline group-focus-within:text-primary transition-colors">search</span>
          </div>
          <input
            type="email"
            value={searchEmail}
            onChange={(e) => setSearchEmail(e.target.value)}
            placeholder="Search colleagues by email..."
            className="w-full bg-surface-container-low border-none rounded-2xl py-5 pl-16 pr-32 text-on-surface placeholder:text-outline focus:ring-4 focus:ring-primary/10 transition-all font-body text-lg shadow-sm"
          />
          <button
            type="submit"
            disabled={loading}
            className="absolute right-3 top-1/2 -translate-y-1/2 bg-primary text-white px-6 py-2.5 rounded-xl font-headline font-bold text-sm shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-50"
          >
            {loading ? '...' : 'Search'}
          </button>
        </form>
      </section>

      {/* Search Results */}
      {searchResults.length > 0 && (
        <section className="space-y-4 animate-in slide-in-from-top-4 duration-500">
          <span className="font-label text-[10px] uppercase tracking-widest text-on-surface-variant font-bold px-2">Matching Experts</span>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {searchResults.map(result => {
              const isFriend = friends.some(f => f.id === result.id);
              const isPending = pendingRequests.some(r => r.requesterId === user.id && r.addresseeId === result.id) || 
                                pendingRequests.some(r => r.requesterId === result.id && r.addresseeId === user.id);

              return (
                <div key={result.id} className="bg-surface-container-lowest p-6 rounded-2xl shadow-[0_12px_32px_rgba(25,28,30,0.06)] border border-outline-variant/5 hover:border-primary/20 transition-all flex items-center gap-6">
                  <div className="w-16 h-16 rounded-2xl bg-surface-container-high flex items-center justify-center text-2xl font-black text-primary overflow-hidden">
                    {result.name[0]}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-headline font-bold text-on-surface truncate">{result.name}</h3>
                    <p className="text-sm text-primary font-medium truncate mb-3">{result.email}</p>
                    
                    {isFriend ? (
                      <span className="inline-flex items-center space-x-1 text-green-600 font-black text-[10px] uppercase tracking-widest bg-green-50 px-3 py-1 rounded-full">
                        <span className="material-symbols-outlined text-xs">check</span>
                        <span>Friends</span>
                      </span>
                    ) : isPending ? (
                      <span className="inline-flex items-center space-x-1 text-orange-600 font-black text-[10px] uppercase tracking-widest bg-orange-50 px-3 py-1 rounded-full">
                        <span className="material-symbols-outlined text-xs">schedule</span>
                        <span>Pending</span>
                      </span>
                    ) : (
                      <button
                        onClick={() => addFriend(result.id)}
                        className="bg-primary text-white px-4 py-2 rounded-xl font-headline font-bold text-xs shadow-lg shadow-primary/10 hover:brightness-110 transition-all"
                      >
                        Connect
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* Pending Invitations */}
      {pendingRequests.filter(r => r.addresseeId === user.id).length > 0 && (
        <section className="bg-primary/5 p-8 rounded-3xl border border-primary/10">
          <div className="flex items-center justify-between mb-6">
            <h2 className="font-headline text-xl font-bold text-primary flex items-center space-x-2">
              <span className="material-symbols-outlined">notifications_active</span>
              <span>Pending Invitations</span>
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {pendingRequests.filter(r => r.addresseeId === user.id).map(request => (
              <div key={request.id} className="bg-white p-4 rounded-2xl shadow-sm flex items-center justify-between border border-primary/5">
                <div className="flex items-center space-x-4">
                  <div className="w-10 h-10 bg-primary-container text-white rounded-full flex items-center justify-center font-bold">
                    {request.requester.name[0]}
                  </div>
                  <div>
                    <p className="font-bold text-on-surface text-sm">{request.requester.name}</p>
                    <p className="text-[10px] uppercase font-bold text-outline tracking-wider">Wants to connect</p>
                  </div>
                </div>
                <button
                  onClick={() => acceptRequest(request.id)}
                  className="bg-primary text-white p-2.5 rounded-xl hover:scale-105 transition-all shadow-md shadow-primary/20"
                >
                  <span className="material-symbols-outlined">check</span>
                </button>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Network List */}
      <section>
        <h2 className="font-headline text-2xl font-bold mb-8 flex items-center space-x-3 text-on-surface">
          <span className="material-symbols-outlined text-primary">group</span>
          <span>My Network ({friends.length})</span>
        </h2>
        
        {friends.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {friends.map(friend => (
              <div key={friend.id} className="bg-surface-container-lowest p-6 rounded-2xl border border-outline-variant/5 shadow-[0_8px_24px_rgba(25,28,30,0.04)] hover:shadow-md transition-all group flex flex-col">
                <div className="flex items-center space-x-4 mb-6">
                  <div className="w-14 h-14 bg-primary/10 text-primary rounded-2xl flex items-center justify-center font-black text-xl shadow-inner">
                    {friend.name[0]}
                  </div>
                  <div className="min-w-0">
                    <h3 className="font-bold text-on-surface truncate">{friend.name}</h3>
                    <div className="flex items-center space-x-1 text-on-surface-variant/60">
                      <span className="material-symbols-outlined text-sm">article</span>
                      <span className="text-[10px] font-bold uppercase tracking-wider">{friend.papers?.length || 0} Papers</span>
                    </div>
                  </div>
                </div>
                <div className="mt-auto flex gap-2">
                  <button
                    onClick={() => {
                      setSelectedFriend(friend);
                      setShowProgressModal(true);
                    }}
                    className="flex-1 bg-primary/10 text-primary py-3 rounded-xl font-black text-[10px] uppercase tracking-[0.1em] hover:bg-primary hover:text-white transition-all text-center"
                  >
                    Track Progress
                  </button>
                  <Link
                    to={`/chat/${friend.id}`}
                    className="flex-1 bg-surface-container-low text-on-surface-variant py-3 rounded-xl font-black text-[10px] uppercase tracking-[0.1em] hover:bg-surface-container-high transition-all text-center"
                  >
                    Message
                  </Link>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-20 bg-surface-container-low rounded-3xl border-2 border-dashed border-outline-variant/30 opacity-60">
            <span className="material-symbols-outlined text-4xl text-outline mb-4">person_search</span>
            <p className="font-headline font-bold text-on-surface-variant">Your network is empty</p>
            <p className="text-xs text-outline mt-1 uppercase tracking-widest">Search above to find peers</p>
          </div>
        )}
      </section>

      {/* Progress Tracking Modal */}
      {showProgressModal && selectedFriend && (
        <div className="fixed inset-0 bg-on-background/20 backdrop-blur-md flex items-center justify-center z-[100] p-4 animate-in fade-in duration-300">
          <div className="bg-white w-full max-w-3xl rounded-3xl shadow-2xl animate-in zoom-in duration-300 border border-outline-variant/10 flex flex-col max-h-[85vh]">
            <div className="p-8 border-b border-outline-variant/10 flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-primary/10 text-primary rounded-2xl flex items-center justify-center font-black text-xl">
                  {selectedFriend.name[0]}
                </div>
                <div>
                  <h2 className="font-headline text-2xl font-bold text-on-surface">{selectedFriend.name}'s Research</h2>
                  <p className="text-[10px] font-bold text-outline uppercase tracking-widest">Active Pipeline Tracking</p>
                </div>
              </div>
              <button 
                onClick={() => setShowProgressModal(false)}
                className="w-10 h-10 rounded-full hover:bg-surface-container-low transition-colors flex items-center justify-center"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto flex-1">
              {selectedFriend.papers && selectedFriend.papers.length > 0 ? (
                <div className="space-y-4">
                  {selectedFriend.papers.sort((a: any, b: any) => a.order - b.order).map((paper: any) => (
                    <div key={paper.id} className="bg-surface-container-low p-5 rounded-2xl border border-outline-variant/5">
                      <div className="flex items-start justify-between mb-3">
                        <h3 className="font-headline font-bold text-on-surface text-lg leading-tight flex-1 mr-4">
                          {paper.title}
                        </h3>
                        <span className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-widest whitespace-nowrap ${
                          paper.status === 'Published' ? 'bg-green-100 text-green-700' :
                          paper.status === 'Under Review' ? 'bg-orange-100 text-orange-700' :
                          'bg-blue-100 text-blue-700'
                        }`}>
                          {paper.status}
                        </span>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4 mb-4">
                        <div className="flex items-center space-x-2 text-on-surface-variant">
                          <span className="material-symbols-outlined text-sm">auto_stories</span>
                          <span className="text-[11px] font-bold truncate">{paper.journalName || 'Not specified'}</span>
                        </div>
                        <div className="flex items-center space-x-2 text-on-surface-variant justify-end">
                          <span className="material-symbols-outlined text-sm">schedule</span>
                          <span className="text-[11px] font-bold">
                            {paper.submittedAt ? `Submitted ${new Date(paper.submittedAt).toLocaleDateString()}` : 'Not submitted'}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center justify-between pt-4 border-t border-outline-variant/10">
                        <div className="flex space-x-3">
                          {paper.submittedAt && (
                            <div className="flex items-center space-x-1">
                              <span className="text-[9px] font-black text-primary uppercase tracking-tighter">In Journal:</span>
                              <span className="text-[9px] font-bold text-on-surface-variant">{calculatePassedTime(paper.submittedAt)}</span>
                            </div>
                          )}
                        </div>
                        <span className="text-[9px] font-bold text-outline uppercase tracking-wider">
                          Updated {new Date(paper.updatedAt).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 opacity-50">
                  <span className="material-symbols-outlined text-4xl mb-2">article_off</span>
                  <p className="font-bold">No public research found</p>
                </div>
              )}
            </div>
            
            <div className="p-6 bg-surface-container-lowest border-t border-outline-variant/10 text-center">
              <button 
                onClick={() => setShowProgressModal(false)}
                className="px-8 py-3 bg-primary text-white rounded-xl font-headline font-bold text-sm shadow-lg shadow-primary/20 hover:scale-105 transition-all"
              >
                Close Tracking
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
