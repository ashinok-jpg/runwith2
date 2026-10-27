import React from 'react';
import { Bell, List, Map as MapIcon, User } from 'lucide-react';
import { useI18n } from '../../i18n/context';
import type { MessageKey } from '../../i18n/strings';

interface HeaderProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  notificationCount?: number;
}

const tabs: { id: string; icon: typeof List; label: MessageKey }[] = [
  { id: 'feed', icon: List, label: 'nav.feed' },
  { id: 'map', icon: MapIcon, label: 'nav.map' },
  { id: 'notifications', icon: Bell, label: 'nav.notifications' },
  { id: 'profile', icon: User, label: 'nav.profile' },
];

// Bottom tab bar with labels, within thumb reach on phones
const Header: React.FC<HeaderProps> = ({ activeTab, onTabChange, notificationCount = 0 }) => {
  const { t } = useI18n();

  return (
    <nav className="flex-shrink-0 bg-white border-t border-gray-200 pb-safe z-[1050]">
      <div className="max-w-md mx-auto grid grid-cols-4">
        {tabs.map(({ id, icon: Icon, label }) => {
          const active = activeTab === id;
          return (
            <button
              key={id}
              onClick={() => onTabChange(id)}
              aria-current={active ? 'page' : undefined}
              className={`flex flex-col items-center justify-center py-2 text-[11px] font-medium transition-colors ${
                active ? 'text-blue-600' : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <span className="relative">
                <Icon size={22} strokeWidth={active ? 2.25 : 1.75} />
                {id === 'notifications' && notificationCount > 0 && (
                  <span className="absolute -top-1 -right-2 bg-red-500 text-white text-[10px] leading-none rounded-full min-w-[16px] h-4 px-1 flex items-center justify-center">
                    {notificationCount > 9 ? '9+' : notificationCount}
                  </span>
                )}
              </span>
              <span className="mt-0.5">{t(label)}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};

export default Header;
