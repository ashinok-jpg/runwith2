import { useCallback, useEffect, useState } from 'react';
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

// A shared link looks like /?session=<id>; it survives sign-in because the URL is untouched until then
const sharedSessionId = (): string | null => new URLSearchParams(window.location.search).get('session');

function SignedInApp({ uid }: { uid: string }) {
  const [activeTab, setActiveTab] = useState('feed');
  const [openSessionId, setOpenSessionId] = useState<string | null>(sharedSessionId);
  const [createRequested, setCreateRequested] = useState(false);
  const [editProfile, setEditProfile] = useState(false);
  const { location, status, locate } = useUserLocation();
  const { notifications, loading: notificationsLoading } = useNotifications(uid);
  const unreadCount = notifications.filter(n => !n.isRead).length;

  const handleCreateHandled = useCallback(() => setCreateRequested(false), []);

  // Drop ?session= once it's opened so a reload doesn't reopen it
  useEffect(() => {
    if (!sharedSessionId()) return;
    const url = new URL(window.location.href);
    url.searchParams.delete('session');
    window.history.replaceState(null, '', url.pathname + url.search + url.hash);
  }, []);

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

  // Screen fills the space above the bottom tab bar; lists scroll inside it
  return (
    <div className="h-[100dvh] flex flex-col overflow-hidden bg-gray-50">
      <main className={`flex-1 relative ${activeTab === 'map' ? '' : 'overflow-y-auto'}`}>{renderActiveScreen()}</main>
      <Header activeTab={activeTab} onTabChange={changeTab} notificationCount={unreadCount} />
      {openSessionId && <SessionDetailSheet eventId={openSessionId} onClose={() => setOpenSessionId(null)} />}
    </div>
  );
}

export default App;
