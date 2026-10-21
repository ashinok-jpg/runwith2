import { useCallback, useState } from 'react';
import Header from './components/common/Header';
import Feed from './components/screens/Feed';
import Map from './components/screens/Map';
import Notifications from './components/screens/Notifications';
import Profile from './components/screens/Profile';
import SignIn from './components/screens/SignIn';
import SessionDetailSheet from './components/sessions/SessionDetailSheet';
import { useAuth } from './lib/authContext';
import { useUserLocation } from './lib/geo';
import { useNotifications } from './lib/notifications';

function App() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-[100dvh] flex items-center justify-center bg-gray-50">
        <div className="w-10 h-10 border-4 border-blue-200 border-t-blue-500 rounded-full animate-spin" />
      </div>
    );
  }

  return user ? <SignedInApp uid={user.uid} /> : <SignIn />;
}

function SignedInApp({ uid }: { uid: string }) {
  const [activeTab, setActiveTab] = useState('feed');
  const [openSessionId, setOpenSessionId] = useState<string | null>(null);
  const [createRequested, setCreateRequested] = useState(false);
  const [editProfile, setEditProfile] = useState(false);
  const { location, status, locate } = useUserLocation();
  const { notifications, loading: notificationsLoading } = useNotifications(uid);
  const unreadCount = notifications.filter(n => !n.isRead).length;

  const handleCreateHandled = useCallback(() => setCreateRequested(false), []);

  const changeTab = (tab: string) => {
    setEditProfile(false);
    setActiveTab(tab);
  };

  const renderActiveScreen = () => {
    switch (activeTab) {
      case 'map':
        return (
          <Map
            userLocation={location}
            locationStatus={status}
            onLocate={locate}
            onOpenSession={setOpenSessionId}
            createRequested={createRequested}
            onCreateHandled={handleCreateHandled}
          />
        );
      case 'notifications':
        return (
          <Notifications
            notifications={notifications}
            loading={notificationsLoading}
            onOpenSession={setOpenSessionId}
          />
        );
      case 'profile':
        return <Profile key={editProfile ? 'edit' : 'view'} startEditing={editProfile} />;
      default:
        return (
          <Feed
            userLocation={location}
            locationStatus={status}
            onOpenSession={setOpenSessionId}
            onCreateSession={() => {
              setCreateRequested(true);
              changeTab('map');
            }}
            onEditProfile={() => {
              setActiveTab('profile');
              setEditProfile(true);
            }}
          />
        );
    }
  };

  const isMap = activeTab === 'map';

  return (
    <div className={isMap ? 'h-[100dvh] flex flex-col overflow-hidden bg-gray-50' : 'min-h-screen bg-gray-50'}>
      <Header activeTab={activeTab} onTabChange={changeTab} notificationCount={unreadCount} />
      <main className={isMap ? 'flex-1 relative' : 'pb-safe'}>{renderActiveScreen()}</main>
      {openSessionId && <SessionDetailSheet eventId={openSessionId} onClose={() => setOpenSessionId(null)} />}
    </div>
  );
}

export default App;
