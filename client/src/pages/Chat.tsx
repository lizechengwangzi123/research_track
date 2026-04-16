import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../utils/api';
import { io } from 'socket.io-client';

export default function Chat() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [friends, setFriends] = useState<any[]>([]);
  const [unreadCounts, setUnreadCounts] = useState<any>({});
  const [messages, setMessages] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const socketRef = useRef<any>(null);
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  const fetchData = async () => {
    try {
      const [friendsRes, unreadRes] = await Promise.all([
        api.get('/friends'),
        api.get('/messages/unread-counts')
      ]);
      setFriends(friendsRes.data);
      
      const counts: any = {};
      unreadRes.data.forEach((item: any) => {
        counts[item.senderId] = item._count;
      });
      setUnreadCounts(counts);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchData();

    const socketUrl = (import.meta.env.VITE_API_URL || 'http://localhost:3001').replace('/api', '');
    socketRef.current = io(socketUrl, {
      auth: { token: localStorage.getItem('token') }
    });

    socketRef.current.on('receive_message', (message: any) => {
      setMessages(prev => {
        const currentPath = window.location.pathname;
        if (currentPath === `/chat/${message.senderId}`) {
          api.post(`/messages/read/${message.senderId}`).then(() => fetchData());
          return [...prev, message];
        } else {
          fetchData();
          return prev;
        }
      });
    });

    return () => {
      socketRef.current.disconnect();
    };
  }, []);

  useEffect(() => {
    if (id) {
      const fetchChat = async () => {
        setLoading(true);
        try {
          const { data } = await api.get(`/messages/${id}`);
          setMessages(data);
          await api.post(`/messages/read/${id}`);
          setUnreadCounts((prev: any) => ({ ...prev, [id]: 0 }));
          fetchData(); 
        } catch (err) {
          console.error(err);
        } finally {
          setLoading(false);
        }
      };
      fetchChat();
    }
  }, [id]);

  // Handle scrolling within the chat box ONLY
  useEffect(() => {
    if (scrollRef.current) {
      // Use scrollIntoView with 'nearest' to avoid whole page jumping
      scrollRef.current.scrollIntoView({ behavior: 'auto', block: 'nearest' });
    }
  }, [messages]);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !id) return;

    const messageData = { receiverId: id, content: newMessage };
    socketRef.current.emit('send_message', messageData);
    
    const tempMsg = {
      id: Date.now().toString(),
      senderId: user.id,
      receiverId: id,
      content: newMessage,
      createdAt: new Date().toISOString()
    };
    setMessages(prev => [...prev, tempMsg]);
    setNewMessage('');
  };

  const activeFriend = friends.find(f => f.id === id);

  return (
    <div className="h-[calc(100vh-160px)] lg:h-[calc(100vh-100px)] flex bg-white rounded-3xl shadow-xl overflow-hidden border border-outline-variant/10 animate-in fade-in duration-500">
      {/* Friends List Column */}
      <div className="w-full lg:w-80 border-r border-outline-variant/10 flex flex-col bg-surface-container-lowest/50">
        <div className="p-6 border-b border-outline-variant/10">
          <h2 className="font-headline text-xl font-black text-on-surface tracking-tight flex items-center space-x-2">
            <span className="material-symbols-outlined text-primary">forum</span>
            <span>Discussions</span>
          </h2>
        </div>
        <div className="flex-1 overflow-y-auto p-4 space-y-2">
          {friends.length > 0 ? friends.map(friend => (
            <button
              key={friend.id}
              onClick={() => navigate(`/chat/${friend.id}`)}
              className={`w-full flex items-center p-4 rounded-2xl transition-all ${
                id === friend.id 
                  ? 'bg-primary text-white shadow-lg shadow-primary/20 scale-[1.02]' 
                  : 'hover:bg-surface-container-low text-on-surface-variant'
              }`}
            >
              <div className="relative">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center font-black text-lg ${id === friend.id ? 'bg-white/20' : 'bg-primary/10 text-primary'}`}>
                  {friend.name[0]}
                </div>
                {unreadCounts[friend.id] > 0 && (
                  <span className="absolute -top-2 -right-2 bg-error text-white text-[10px] font-black w-5 h-5 rounded-full flex items-center justify-center border-2 border-white">
                    {unreadCounts[friend.id]}
                  </span>
                )}
              </div>
              <div className="ml-4 text-left min-w-0">
                <p className={`font-bold truncate ${id === friend.id ? 'text-white' : 'text-on-surface'}`}>{friend.name}</p>
                <p className={`text-[10px] uppercase font-black tracking-widest opacity-60 truncate ${id === friend.id ? 'text-white' : ''}`}>
                  Active Pipeline
                </p>
              </div>
            </button>
          )) : (
            <div className="text-center py-10 opacity-40">
              <span className="material-symbols-outlined text-4xl mb-2">person_search</span>
              <p className="text-xs font-bold uppercase tracking-widest">No connections yet</p>
            </div>
          )}
        </div>
      </div>

      {/* Chat Area Column */}
      <div className="flex-1 flex flex-col relative bg-gray-50/10">
        {id ? (
          <>
            <div className="p-6 border-b border-outline-variant/10 flex items-center justify-between bg-white/80 backdrop-blur-md sticky top-0 z-10">
              <div className="flex items-center space-x-4">
                <div className="w-10 h-10 bg-primary/10 text-primary rounded-xl flex items-center justify-center font-black">
                  {activeFriend?.name[0]}
                </div>
                <div>
                  <h3 className="font-headline font-bold text-on-surface leading-none mb-1">{activeFriend?.name}</h3>
                  <p className="text-[10px] text-green-500 font-black uppercase tracking-widest flex items-center">
                    <span className="w-1.5 h-1.5 bg-green-500 rounded-full mr-1.5 animate-pulse"></span>
                    Laboratory Active
                  </p>
                </div>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              {loading ? (
                <div className="flex items-center justify-center h-full">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                </div>
              ) : messages.map((msg, i) => {
                const isMe = msg.senderId === user.id;
                return (
                  <div key={msg.id || i} className={`flex ${isMe ? 'justify-end' : 'justify-start'} animate-in slide-in-from-bottom-2 duration-300`}>
                    <div className={`max-w-[70%] px-5 py-3 rounded-2xl shadow-sm ${
                      isMe ? 'bg-primary text-white rounded-br-none' : 'bg-white text-on-surface rounded-bl-none border border-outline-variant/10'
                    }`}>
                      <p className="text-sm leading-relaxed">{msg.content}</p>
                      <p className={`text-[9px] mt-1 font-bold uppercase tracking-tighter opacity-60 ${isMe ? 'text-white' : 'text-outline'}`}>
                        {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                  </div>
                );
              })}
              {/* This dummy div is the target for scrollIntoView */}
              <div ref={scrollRef} className="h-1" />
            </div>

            <form onSubmit={handleSendMessage} className="p-6 bg-white border-t border-outline-variant/10">
              <div className="relative group">
                <input
                  type="text"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="Type your collaborative message..."
                  className="w-full bg-surface-container-low border-none rounded-2xl py-4 pl-6 pr-16 text-on-surface placeholder:text-outline focus:ring-4 focus:ring-primary/10 transition-all font-medium"
                />
                <button
                  type="submit"
                  disabled={!newMessage.trim()}
                  className="absolute right-3 top-1/2 -translate-y-1/2 bg-primary text-white w-10 h-10 rounded-xl flex items-center justify-center shadow-lg shadow-primary/20 hover:scale-110 active:scale-95 transition-all disabled:opacity-40 disabled:scale-100"
                >
                  <span className="material-symbols-outlined text-lg">send</span>
                </button>
              </div>
            </form>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center p-12 text-center opacity-30">
            <div className="w-24 h-24 bg-surface-container-high rounded-3xl flex items-center justify-center mb-6">
              <span className="material-symbols-outlined text-5xl">chat_bubble</span>
            </div>
            <h3 className="font-headline text-2xl font-black mb-2">Select a Discussion</h3>
            <p className="max-w-xs font-medium text-sm">Choose a colleague from the list to start collaborating on your research manuscripts.</p>
          </div>
        )}
      </div>
    </div>
  );
}
