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
  const fileInputRef = useRef<HTMLInputElement>(null);
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  // Notification Sound (Base64 Ding)
  const playNotificationSound = () => {
    const audio = new Audio('https://assets.mixkit.co/active_storage/sfx/2358/2358-preview.mp3');
    audio.play().catch(() => console.log('Audio play blocked by browser'));
  };

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
      // 检查当前路径，确保获取的是最新的 ID 状态
      const currentId = window.location.pathname.split('/').pop();
      
      if (message.senderId === currentId) {
        // 如果当前就在这个聊天框，立即同步已读状态
        setMessages(prev => [...prev, message]);
        api.post(`/messages/read/${message.senderId}`);
        // 关键修复：延迟一下再 fetchData 以确保数据库已更新
        setTimeout(() => fetchData(), 500);
      } else {
        // 否则才播放声音和增加未读数
        playNotificationSound();
        fetchData();
      }
    });

    return () => {
      socketRef.current.disconnect();
    };
  }, []); // 仅在挂载时执行

  useEffect(() => {
    if (id) {
      const fetchChat = async () => {
        setLoading(true);
        try {
          const { data } = await api.get(`/messages/${id}`);
          setMessages(data);
          await api.post(`/messages/read/${id}`);
          setUnreadCounts((prev: any) => ({ ...prev, [id]: 0 }));
          // 这里再次调用以同步 Layout 的全局红点
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

  // 确保消息始终翻到最下方
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollIntoView({ behavior: 'smooth', block: 'end' });
    }
  }, [messages, loading]);

  const handleSendMessage = (msgData: any) => {
    if (!id) return;
    socketRef.current.emit('send_message', { receiverId: id, ...msgData });
    
    // 乐观更新
    const tempMsg = {
      id: Date.now().toString(),
      senderId: user.id,
      receiverId: id,
      content: msgData.content || '',
      fileUrl: msgData.fileUrl,
      fileName: msgData.fileName,
      fileType: msgData.fileType,
      createdAt: new Date().toISOString()
    };
    setMessages(prev => [...prev, tempMsg]);
    setNewMessage('');
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onloadend = () => {
      handleSendMessage({
        content: `Sent a file: ${file.name}`,
        fileUrl: reader.result as string,
        fileName: file.name,
        fileType: file.type
      });
    };
    reader.readAsDataURL(file);
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    const items = e.clipboardData.items;
    for (let i = 0; i < items.length; i++) {
      if (items[i].type.indexOf('image') !== -1) {
        const file = items[i].getAsFile();
        if (!file) continue;
        const reader = new FileReader();
        reader.onloadend = () => {
          handleSendMessage({
            content: 'Pasted an image',
            fileUrl: reader.result as string,
            fileName: 'pasted-image.png',
            fileType: file.type
          });
        };
        reader.readAsDataURL(file);
      }
    }
  };

  const activeFriend = friends.find(f => f.id === id);

  return (
    <div className="h-[calc(100vh-160px)] lg:h-[calc(100vh-100px)] flex bg-white rounded-3xl shadow-xl overflow-hidden border border-outline-variant/10 animate-in fade-in duration-500">
      {/* Friends List */}
      <div className="w-full lg:w-80 border-r border-outline-variant/10 flex flex-col bg-surface-container-lowest/50">
        <div className="p-6 border-b border-outline-variant/10 flex items-center justify-between">
          <h2 className="font-headline text-xl font-black text-on-surface tracking-tight">Discussions</h2>
          <span className="material-symbols-outlined text-primary/40">forum</span>
        </div>
        <div className="flex-1 overflow-y-auto p-4 space-y-2">
          {friends.map(friend => (
            <button
              key={friend.id}
              onClick={() => navigate(`/chat/${friend.id}`)}
              className={`w-full flex items-center p-4 rounded-2xl transition-all ${
                id === friend.id ? 'bg-primary text-white shadow-lg' : 'hover:bg-surface-container-low text-on-surface-variant'
              }`}
            >
              <div className="relative">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center font-black text-lg ${id === friend.id ? 'bg-white/20' : 'bg-primary/10 text-primary'}`}>
                  {friend.name[0]}
                </div>
                {(unreadCounts[friend.id] || 0) > 0 && (
                  <span className="absolute -top-2 -right-2 bg-error text-white text-[10px] font-black w-5 h-5 rounded-full flex items-center justify-center border-2 border-white">
                    {unreadCounts[friend.id]}
                  </span>
                )}
              </div>
              <div className="ml-4 text-left min-w-0">
                <p className="font-bold truncate">{friend.name}</p>
                <p className={`text-[10px] uppercase font-black tracking-widest opacity-60 truncate ${id === friend.id ? 'text-white' : ''}`}>
                  Laboratory
                </p>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 flex flex-col relative bg-gray-50/10">
        {id ? (
          <>
            <div className="p-6 border-b border-outline-variant/10 flex items-center justify-between bg-white/80 backdrop-blur-md sticky top-0 z-10">
              <div className="flex items-center space-x-4">
                <div className="w-10 h-10 bg-primary/10 text-primary rounded-xl flex items-center justify-center font-black">{activeFriend?.name[0]}</div>
                <div>
                  <h3 className="font-headline font-bold text-on-surface leading-none mb-1">{activeFriend?.name}</h3>
                  <p className="text-[10px] text-green-500 font-black uppercase tracking-widest flex items-center">
                    <span className="w-1.5 h-1.5 bg-green-500 rounded-full mr-1.5 animate-pulse"></span>
                    Secure Link Active
                  </p>
                </div>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-4 flex flex-col">
              {loading ? (
                <div className="flex items-center justify-center h-full"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div></div>
              ) : messages.map((msg, i) => {
                const isMe = msg.senderId === user.id;
                return (
                  <div key={msg.id || i} className={`flex ${isMe ? 'justify-end' : 'justify-start'} animate-in slide-in-from-bottom-2`}>
                    <div className={`max-w-[70%] px-5 py-3 rounded-2xl shadow-sm ${isMe ? 'bg-primary text-white rounded-br-none' : 'bg-white text-on-surface rounded-bl-none border border-outline-variant/10'}`}>
                      {msg.fileUrl && (
                        <div className="mb-2">
                          {msg.fileType?.startsWith('image/') ? (
                            <img src={msg.fileUrl} alt="attachment" className="max-w-full rounded-lg border border-white/20 shadow-md cursor-pointer hover:opacity-90" onClick={() => window.open(msg.fileUrl)} />
                          ) : (
                            <a href={msg.fileUrl} download={msg.fileName} className="flex items-center space-x-2 bg-white/10 p-2 rounded-lg text-[10px] font-bold">
                              <span className="material-symbols-outlined">description</span>
                              <span className="truncate">{msg.fileName}</span>
                            </a>
                          )}
                        </div>
                      )}
                      <p className="text-sm leading-relaxed">{msg.content}</p>
                      <p className="text-[9px] mt-1 font-black opacity-60 uppercase">{new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                    </div>
                  </div>
                );
              })}
              <div ref={scrollRef} className="h-4 w-full" />
            </div>

            <form onSubmit={(e) => { e.preventDefault(); handleSendMessage({ content: newMessage }); }} className="p-6 bg-white border-t border-outline-variant/10">
              <div className="relative flex items-center space-x-3">
                <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" />
                <button type="button" onClick={() => fileInputRef.current?.click()} className="text-outline hover:text-primary transition-colors cursor-pointer">
                  <span className="material-symbols-outlined">add_circle</span>
                </button>
                <div className="relative flex-1">
                  <input
                    type="text"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onPaste={handlePaste}
                    placeholder="Message or paste image..."
                    className="w-full bg-surface-container-low border-none rounded-2xl py-4 px-6 text-on-surface outline-none focus:ring-4 focus:ring-primary/10 transition-all font-medium"
                  />
                  <button type="submit" disabled={!newMessage.trim()} className="absolute right-3 top-1/2 -translate-y-1/2 bg-primary text-white w-10 h-10 rounded-xl flex items-center justify-center shadow-lg hover:scale-110 active:scale-95 transition-all disabled:opacity-40">
                    <span className="material-symbols-outlined">send</span>
                  </button>
                </div>
              </div>
            </form>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center p-12 text-center opacity-30">
            <span className="material-symbols-outlined text-6xl mb-4">chat_bubble</span>
            <h3 className="font-headline text-2xl font-black mb-2">Internal Communications</h3>
            <p className="max-w-xs text-sm font-medium">Select a colleague to start coordinating your research projects.</p>
          </div>
        )}
      </div>
    </div>
  );
}
