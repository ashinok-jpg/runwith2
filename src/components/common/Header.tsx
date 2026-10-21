import React from 'react';
import { Bell, MapPin, User, Menu } from 'lucide-react';
import LanguageToggle from './LanguageToggle';
import { useI18n } from '../../i18n/context';
import type { MessageKey } from '../../i18n/strings';

interface HeaderProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  notificationCount?: number;
}

const tabs: { id: string; icon: typeof Menu; label: MessageKey }[] = [
  { id: 'feed', icon: Menu, label: 'nav.feed' },
  { id: 'map', icon: MapPin, label: 'nav.map' },
  { id: 'notifications', icon: Bell, label: 'nav.notifications' },
  { id: 'profile', icon: User, label: 'nav.profile' },
];

const Header: React.FC<HeaderProps> = ({ activeTab, onTabChange, notificationCount = 0 }) => {
  const { t } = useI18n();

  return (
    <header className="bg-white shadow-sm sticky top-0 z-[1050] flex-shrink-0">
      <div className="max-w-md mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">R</span>
            </div>
            <h1 className="text-xl font-bold text-gray-900">Runwith</h1>
          </div>

          <nav className="flex items-center space-x-1">
            {tabs.map(({ id, icon: Icon, label }) => (
              <button
                key={id}
                onClick={() => onTabChange(id)}
                aria-label={t(label)}
                aria-current={activeTab === id ? 'page' : undefined}
                title={t(label)}
                className={`p-2 rounded-lg transition-colors relative ${
                  activeTab === id ? 'bg-blue-50 text-blue-600' : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                <Icon size={20} />
                {id === 'notifications' && notificationCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                    {notificationCount > 9 ? '9+' : notificationCount}
                  </span>
                )}
              </button>
            ))}
            <LanguageToggle className="text-gray-600 hover:bg-gray-50 border border-gray-200" />
          </nav>
        </div>
      </div>
    </header>
  );
};

export default Header;
