import { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { Send, ArrowLeft } from 'lucide-react';
import { io } from 'socket.io-client';
import api from '../utils/api';

export default function Chat() {
  const { id: friendId } = useParams();
  const [messages, setMessages] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [friend, setFriend] = useState<any>(null);
  const socketRef = useRef<any>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  useEffect(() => {
    // Connect to socket
    const token = localStorage.getItem('token');
    socketRef.current = io(import.meta.env.VITE_SOCKET_URL || 'http://localhost:3001', {
      auth: { token }
    });

    socketRef.current.on('receive_message', (message: any) => {
      if (message.senderId === friendId || message.receiverId === friendId) {
        setMessages(prev => [...prev, message]);
      }
    });

    socketRef.current.on('message_sent', (message: any) => {
      setMessages(prev => [...prev, message]);
    });

    return () => {
      socketRef.current.disconnect();
    };
  }, [friendId]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const friendData = await api.get(`/friends`); // Filter in frontend for MVP
        const currentFriend = friendData.data.find((f: any) => f.id === friendId);
        setFriend(currentFriend);

        const msgData = await api.get(`/messages/${friendId}`);
        setMessages(msgData.data);
      } catch (err) {
        console.error(err);
      }
    };
    fetchData();
  }, [friendId]);

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    socketRef.current.emit('send_message', {
      receiverId: friendId,
      content: newMessage
    });
    setNewMessage('');
  };

  return (
    <div className="max-w-2xl mx-auto flex flex-col h-[calc(100vh-160px)] bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden animate-in slide-in-from-bottom duration-500">
      <div className="p-4 border-b border-gray-100 flex items-center bg-white z-10">
        <button onClick={() => window.history.back()} className="mr-4 text-gray-400 hover:text-blue-600">
          <ArrowLeft size={24} />
        </button>
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center font-bold">
            {friend?.name?.[0] || '?'}
          </div>
          <div>
            <h2 className="font-bold text-gray-900">{friend?.name}</h2>
            <div className="flex items-center space-x-1">
              <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
              <span className="text-xs text-gray-400">Online</span>
            </div>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-6 space-y-4">
        {messages.map((msg, i) => (
          <div
            key={msg.id || i}
            className={`flex ${msg.senderId === user.id ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[80%] px-4 py-2 rounded-2xl shadow-sm text-sm ${
                msg.senderId === user.id
                  ? 'bg-blue-600 text-white rounded-tr-none'
                  : 'bg-gray-100 text-gray-800 rounded-tl-none'
              }`}
            >
              {msg.content}
              <p className={`text-[10px] mt-1 text-right opacity-60`}>
                {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </p>
            </div>
          </div>
        ))}
        <div ref={scrollRef} />
      </div>

      <form onSubmit={handleSendMessage} className="p-4 bg-gray-50 border-t border-gray-100 flex items-center space-x-3">
        <input
          type="text"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          placeholder="Type your message..."
          className="flex-1 px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none bg-white shadow-inner"
        />
        <button
          type="submit"
          className="bg-blue-600 text-white p-2.5 rounded-xl hover:bg-blue-700 transition shadow-md disabled:opacity-50"
          disabled={!newMessage.trim()}
        >
          <Send size={20} />
        </button>
      </form>
    </div>
  );
}
