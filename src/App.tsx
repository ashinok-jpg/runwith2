import React, { useState } from 'react';
import Header from './components/common/Header';
import Feed from './components/screens/Feed';
import Map from './components/screens/Map';
import Notifications from './components/screens/Notifications';
import Profile from './components/screens/Profile';

function App() {
  const [activeTab, setActiveTab] = useState('feed');

  const renderActiveScreen = () => {
    switch (activeTab) {
      case 'feed':
        return <Feed />;
      case 'map':
        return <Map />;
      case 'notifications':
        return <Notifications />;
      case 'profile':
        return <Profile />;
      default:
        return <Feed />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header 
        activeTab={activeTab} 
        onTabChange={setActiveTab}
        notificationCount={3}
      />
      <main className="pb-safe">
        {renderActiveScreen()}
      </main>
    </div>
  );
}

export default App;