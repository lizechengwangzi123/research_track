import { Link, useNavigate } from 'react-router-dom';
import { LogOut, LayoutDashboard, Users, MessageSquare } from 'lucide-react';

export default function Navbar({ user, setUser }: any) {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    navigate('/login');
  };

  return (
    <nav className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <Link to="/" className="text-2xl font-bold text-blue-600 tracking-tight">
          ResearchTrack
        </Link>
        
        <div className="flex items-center space-x-6">
          <Link to="/" className="flex items-center space-x-1 text-gray-600 hover:text-blue-600 transition">
            <LayoutDashboard size={20} />
            <span className="font-medium hidden sm:inline">Dashboard</span>
          </Link>
          <Link to="/network" className="flex items-center space-x-1 text-gray-600 hover:text-blue-600 transition">
            <Users size={20} />
            <span className="font-medium hidden sm:inline">Network</span>
          </Link>
          
          <div className="h-6 w-px bg-gray-200 mx-2"></div>
          
          <div className="flex items-center space-x-3">
            <span className="text-sm font-semibold text-gray-700 hidden md:inline">{user.name}</span>
            <button
              onClick={handleLogout}
              className="text-gray-500 hover:text-red-500 transition"
              title="Logout"
            >
              <LogOut size={20} />
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}
