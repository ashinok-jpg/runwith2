import React from 'react';
import { Bell, MapPin, User, Menu } from 'lucide-react';

interface HeaderProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  notificationCount?: number;
}

const Header: React.FC<HeaderProps> = ({ activeTab, onTabChange, notificationCount = 0 }) => {
  return (
    <header className="bg-white shadow-sm sticky top-0 z-50">
      <div className="max-w-md mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">R</span>
            </div>
            <h1 className="text-xl font-bold text-gray-900">Runwith</h1>
          </div>
          
          <nav className="flex items-center space-x-1">
            <button
              onClick={() => onTabChange('feed')}
              className={`p-2 rounded-lg transition-colors ${
                activeTab === 'feed' ? 'bg-blue-50 text-blue-600' : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              <Menu size={20} />
            </button>
            
            <button
              onClick={() => onTabChange('map')}
              className={`p-2 rounded-lg transition-colors ${
                activeTab === 'map' ? 'bg-blue-50 text-blue-600' : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              <MapPin size={20} />
            </button>
            
            <button
              onClick={() => onTabChange('notifications')}
              className={`p-2 rounded-lg transition-colors relative ${
                activeTab === 'notifications' ? 'bg-blue-50 text-blue-600' : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              <Bell size={20} />
              {notificationCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                  {notificationCount > 9 ? '9+' : notificationCount}
                </span>
              )}
            </button>
            
            <button
              onClick={() => onTabChange('profile')}
              className={`p-2 rounded-lg transition-colors ${
                activeTab === 'profile' ? 'bg-blue-50 text-blue-600' : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              <User size={20} />
            </button>
          </nav>
        </div>
      </div>
    </header>
  );
};

export default Header;