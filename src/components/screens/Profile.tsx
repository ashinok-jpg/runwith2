import React, { useState } from 'react';
import { Edit, MapPin, Trophy, Clock, Target, Settings, Shield, LogOut } from 'lucide-react';

const Profile: React.FC = () => {
  const [isEditing, setIsEditing] = useState(false);

  // Mock user data
  const user = {
    displayName: 'Current User',
    photoURL: null,
    bio: 'Weekend warrior turned daily runner. Love exploring new routes in Tokyo!',
    age: 28,
    homeArea: 'Shibuya, Tokyo',
    paceBand: {
      easy: '5:30/km',
      mp: '4:45/km',
      threshold: '4:20/km'
    },
    bestTimes: {
      fiveK: '22:15',
      tenK: '46:30',
      half: '1:42:18',
      full: '3:35:22'
    },
    stats: {
      totalRuns: 127,
      totalDistance: 892.5,
      joinRequests: 23,
      eventsHosted: 8
    }
  };

  return (
    <div className="max-w-md mx-auto px-4 py-4 mb-20">
      {/* Profile Header */}
      <div className="bg-gradient-to-r from-blue-500 to-indigo-600 rounded-xl p-6 text-white mb-6">
        <div className="flex items-center space-x-4">
          <div className="w-16 h-16 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
            <span className="text-2xl font-bold">
              {user.displayName[0]}
            </span>
          </div>
          <div className="flex-1">
            <h1 className="text-xl font-bold">{user.displayName}</h1>
            <p className="text-blue-100 text-sm mt-1">{user.homeArea}</p>
          </div>
          <button
            onClick={() => setIsEditing(!isEditing)}
            className="p-2 bg-white bg-opacity-20 rounded-lg hover:bg-opacity-30 transition-colors"
          >
            <Edit size={18} />
          </button>
        </div>

        {user.bio && (
          <p className="text-blue-100 text-sm mt-4">{user.bio}</p>
        )}
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 gap-3 mb-6">
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
          <div className="text-2xl font-bold text-gray-900">{user.stats.totalRuns}</div>
          <div className="text-sm text-gray-600">Total Runs</div>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
          <div className="text-2xl font-bold text-gray-900">{user.stats.totalDistance}km</div>
          <div className="text-sm text-gray-600">Distance</div>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
          <div className="text-2xl font-bold text-gray-900">{user.stats.joinRequests}</div>
          <div className="text-sm text-gray-600">Connections</div>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
          <div className="text-2xl font-bold text-gray-900">{user.stats.eventsHosted}</div>
          <div className="text-sm text-gray-600">Events</div>
        </div>
      </div>

      {/* Personal Records */}
      <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 mb-6">
        <h2 className="font-semibold text-gray-900 mb-4 flex items-center">
          <Trophy size={18} className="mr-2 text-yellow-500" />
          Personal Records
        </h2>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <div className="text-lg font-bold text-gray-900">{user.bestTimes.fiveK}</div>
            <div className="text-sm text-gray-600">5K</div>
          </div>
          <div>
            <div className="text-lg font-bold text-gray-900">{user.bestTimes.tenK}</div>
            <div className="text-sm text-gray-600">10K</div>
          </div>
          <div>
            <div className="text-lg font-bold text-gray-900">{user.bestTimes.half}</div>
            <div className="text-sm text-gray-600">Half Marathon</div>
          </div>
          <div>
            <div className="text-lg font-bold text-gray-900">{user.bestTimes.full}</div>
            <div className="text-sm text-gray-600">Marathon</div>
          </div>
        </div>
      </div>

      {/* Pace Bands */}
      <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 mb-6">
        <h2 className="font-semibold text-gray-900 mb-4 flex items-center">
          <Target size={18} className="mr-2 text-blue-500" />
          Pace Bands
        </h2>
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600">Easy</span>
            <div className="flex items-center space-x-2">
              <span className="text-sm font-medium">{user.paceBand.easy}</span>
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
            </div>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600">Marathon Pace</span>
            <div className="flex items-center space-x-2">
              <span className="text-sm font-medium">{user.paceBand.mp}</span>
              <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
            </div>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600">Threshold</span>
            <div className="flex items-center space-x-2">
              <span className="text-sm font-medium">{user.paceBand.threshold}</span>
              <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
            </div>
          </div>
        </div>
      </div>

      {/* Settings */}
      <div className="space-y-2">
        <button className="w-full text-left p-4 bg-white rounded-xl shadow-sm border border-gray-100 hover:bg-gray-50 transition-colors flex items-center">
          <MapPin size={18} className="mr-3 text-gray-500" />
          <span>Location & Privacy</span>
        </button>
        
        <button className="w-full text-left p-4 bg-white rounded-xl shadow-sm border border-gray-100 hover:bg-gray-50 transition-colors flex items-center">
          <Shield size={18} className="mr-3 text-gray-500" />
          <span>Safety Settings</span>
        </button>
        
        <button className="w-full text-left p-4 bg-white rounded-xl shadow-sm border border-gray-100 hover:bg-gray-50 transition-colors flex items-center">
          <Settings size={18} className="mr-3 text-gray-500" />
          <span>App Settings</span>
        </button>
        
        <button className="w-full text-left p-4 bg-white rounded-xl shadow-sm border border-gray-100 hover:bg-red-50 text-red-600 transition-colors flex items-center">
          <LogOut size={18} className="mr-3" />
          <span>Sign Out</span>
        </button>
      </div>
    </div>
  );
};

export default Profile;