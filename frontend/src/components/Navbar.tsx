import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const Navbar: React.FC = () => {
  const location = useLocation();
  const { isLoggedIn, user, logout } = useAuth();

  const publicNavItems = [
    { path: '/', label: 'Home', icon: '🏠' },
    { path: '/login', label: 'Login', icon: '🔑' },
    { path: '/register', label: 'Register', icon: '👤' },
  ];

  const privateNavItems = [
    { path: '/', label: 'Home', icon: '🏠' },
    { path: '/learn', label: 'Learn', icon: '📚' },
    { path: '/history', label: 'History', icon: '📜' },
    ...(user?.is_admin ? [{ path: '/admin', label: 'Admin', icon: '⚙️' }] : []),
  ];

  const navItems = isLoggedIn ? privateNavItems : publicNavItems;

  const isActive = (path: string) => location.pathname === path;

  const handleLogout = () => {
    logout();
  };

  return (
    <nav className="bg-white shadow-lg border-b border-gray-200">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center py-4">
          <div className="flex items-center space-x-2">
            <div className="text-2xl">🧠</div>
            <h1 className="text-2xl font-bold text-primary-600">
              AI Learning Platform
            </h1>
          </div>
          
          <div className="flex items-center space-x-1">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`
                  flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-all duration-200
                  ${
                    isActive(item.path)
                      ? 'bg-primary-100 text-primary-700 shadow-sm'
                      : 'text-gray-600 hover:text-primary-600 hover:bg-gray-100'
                  }
                `}
              >
                <span className="text-lg">{item.icon}</span>
                <span>{item.label}</span>
              </Link>
            ))}

            {isLoggedIn && (
              <div className="flex items-center ml-4 space-x-3">
                <div className="flex items-center space-x-2 px-3 py-2 bg-gray-100 rounded-lg">
                  <span className="text-sm">👋</span>
                  <div className="text-sm">
                    <div className="font-medium text-gray-900">{user?.full_name}</div>
                    <div className="text-xs text-gray-500">
                      {user?.is_admin ? 'Admin' : 'User'}
                    </div>
                  </div>
                </div>
                <button
                  onClick={handleLogout}
                  className="flex items-center space-x-2 px-3 py-2 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-lg font-medium transition-all duration-200"
                >
                  <span>🚪</span>
                  <span>Logout</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;