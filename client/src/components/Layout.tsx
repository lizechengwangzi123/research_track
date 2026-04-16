import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import api from '../utils/api';
import { io } from 'socket.io-client';

export default function Layout({ children, user }: any) {
  const location = useLocation();
  const [unreadCount, setUnreadCount] = useState(0);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = '/login';
  };

  useEffect(() => {
    if (!user) return;

    const fetchUnread = async () => {
      try {
        const { data } = await api.get('/messages/unread-counts');
        const total = data.reduce((acc: number, curr: any) => acc + curr._count, 0);
        setUnreadCount(total);
      } catch (err) {
        console.error(err);
      }
    };

    fetchUnread();

    const socketUrl = (import.meta.env.VITE_API_URL || 'http://localhost:3001').replace('/api', '');
    const socket = io(socketUrl, {
      auth: { token: localStorage.getItem('token') }
    });

    socket.on('unread_count_update', (data: any) => {
      setUnreadCount(data.totalUnread);
    });

    return () => {
      socket.disconnect();
    };
  }, [user]);

  const navLinks = [
    { to: '/', icon: 'dashboard', label: 'Dashboard' },
    { to: '/network', icon: 'group', label: 'Network' },
    { to: '/chat', icon: 'chat_bubble', label: 'Messages', badge: unreadCount },
    { to: '/statistics', icon: 'monitoring', label: 'Statistics' },
    { to: '/nature', icon: 'science', label: 'Nature Feed' },
  ];

  return (
    <div className="min-h-screen bg-surface flex">
      {/* SideNavBar (Desktop) */}
      <aside className="fixed left-0 top-0 bottom-0 w-64 h-full bg-surface-variant/30 hidden lg:flex flex-col py-8 px-4 space-y-2 z-50 border-r border-outline-variant/10">
        <div className="px-6 mb-8">
          <h1 className="text-xl font-black text-primary font-headline tracking-tighter">ResearchTrack</h1>
          <p className="font-headline uppercase tracking-widest text-[10px] font-bold text-on-surface-variant">Clinical Editorial</p>
        </div>

        {/* User Identity Display */}
        <div className="mx-2 mb-6 p-4 bg-white rounded-2xl shadow-sm border border-outline-variant/10">
          <div className="flex items-center space-x-3 mb-1">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary font-black text-lg">
              {user?.name?.[0]}
            </div>
            <div className="min-w-0">
              <p className="text-xs font-black text-on-surface truncate">{user?.name}</p>
              <p className="text-[9px] font-bold text-outline truncate">{user?.email}</p>
            </div>
          </div>
          <div className="mt-2 pt-2 border-t border-outline-variant/5 flex items-center space-x-1">
            <span className="w-1.5 h-1.5 bg-green-500 rounded-full"></span>
            <span className="text-[8px] font-black uppercase text-green-600 tracking-tighter">Active Session</span>
          </div>
        </div>

        <nav className="flex-1 space-y-2">
          {navLinks.map((link) => (
            <Link 
              key={link.to}
              to={link.to === '/chat' ? (location.pathname.startsWith('/chat') ? location.pathname : '/chat') : link.to} 
              className={`flex items-center justify-between px-6 py-3 rounded-full transition-all duration-300 ${
                (link.to === '/' ? location.pathname === '/' : location.pathname.startsWith(link.to)) 
                  ? 'bg-primary-container text-white shadow-lg shadow-primary/20' 
                  : 'text-on-surface-variant hover:bg-surface-container-high'
              }`}
            >
              <div className="flex items-center space-x-3">
                <span className="material-symbols-outlined">{link.icon}</span>
                <span className="font-headline uppercase tracking-widest text-[11px] font-bold">{link.label}</span>
              </div>
              {(link.badge || 0) > 0 && (
                <span className="bg-error text-white text-[10px] font-black px-2 py-0.5 rounded-full animate-bounce">
                  {link.badge}
                </span>
              )}
            </Link>
          ))}
        </nav>
        <div className="pt-4 border-t border-outline-variant/10 space-y-2">
          <button onClick={handleLogout} className="flex items-center space-x-3 text-on-surface-variant px-6 py-3 hover:bg-error-container/20 hover:text-error rounded-full transition-all duration-300 w-full">
            <span className="material-symbols-outlined">logout</span>
            <span className="font-headline uppercase tracking-widest text-[11px] font-bold">Logout</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 lg:ml-64 pb-32 lg:pb-12">
        {/* Top Header (Mobile) */}
        <header className="lg:hidden sticky top-0 w-full z-40 bg-surface/80 backdrop-blur-md px-6 h-16 flex items-center justify-between border-b border-outline-variant/10">
          <h1 className="text-xl font-black text-primary font-headline tracking-tighter">ResearchTrack</h1>
          <div className="flex items-center space-x-4">
            <Link to="/chat" className="relative">
              <span className="material-symbols-outlined text-on-surface-variant">chat_bubble</span>
              {(unreadCount || 0) > 0 && (
                <span className="absolute -top-1 -right-1 bg-error text-white text-[8px] font-black w-4 h-4 rounded-full flex items-center justify-center">
                  {unreadCount}
                </span>
              )}
            </Link>
            <div className="flex items-center space-x-2 bg-white/50 px-2 py-1 rounded-full border border-outline-variant/10">
              <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-xs">
                {user?.name?.[0]}
              </div>
              <span className="text-[10px] font-black pr-1">{user?.name?.split(' ')[0]}</span>
            </div>
          </div>
        </header>

        <div className="p-6 lg:p-12">
          {children}
        </div>
      </main>

      {/* BottomNavBar (Mobile) */}
      <nav className="fixed bottom-0 left-0 w-full z-50 lg:hidden bg-white/80 backdrop-blur-xl flex justify-around items-center px-4 h-20 pb-safe shadow-[0_-12px_32px_rgba(25,28,30,0.06)] rounded-t-3xl border-t border-slate-200/20">
        {navLinks.map((link) => (
          <Link 
            key={link.to}
            to={link.to === '/chat' ? (location.pathname.startsWith('/chat') ? location.pathname : '/chat') : link.to}
            className={`flex flex-col items-center justify-center transition-all ${
              (link.to === '/' ? location.pathname === '/' : location.pathname.startsWith(link.to)) 
                ? 'text-primary scale-110' 
                : 'text-slate-400'
            }`}
          >
            <div className="relative">
              <span className="material-symbols-outlined">{link.icon}</span>
              {(link.badge || 0) > 0 && (
                <span className="absolute -top-2 -right-2 bg-error text-white text-[8px] font-black w-4 h-4 rounded-full flex items-center justify-center">
                  {link.badge}
                </span>
              )}
            </div>
            <span className="font-body text-[8px] uppercase tracking-widest mt-1 font-bold">{link.label}</span>
          </Link>
        ))}
      </nav>
    </div>
  );
}
