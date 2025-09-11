import React, { useState, useEffect } from 'react';
import { Edit, MapPin, Trophy, Target, Settings, Shield, LogOut } from 'lucide-react';
import { auth, firestore } from '../../lib/RUNWITH2__codex_probe_927';
import { onAuthStateChanged, signOut, type User } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';

interface PaceBand { easy?: string; mp?: string; threshold?: string; }
interface BestTimes { fiveK?: string; tenK?: string; half?: string; full?: string; }
interface Stats { totalRuns?: number; totalDistance?: number; joinRequests?: number; eventsHosted?: number; }
interface ProfileData {
  displayName?: string;
  photoURL?: string | null;
  bio?: string;
  homeArea?: string;
  paceBand?: PaceBand;
  bestTimes?: BestTimes;
  stats?: Stats;
}

const defaultProfile: ProfileData = {
  displayName: 'Guest',
  bio: '',
  homeArea: '',
  paceBand: {},
  bestTimes: {},
  stats: { totalRuns: 0, totalDistance: 0, joinRequests: 0, eventsHosted: 0 }
};

const Profile: React.FC = () => {
  const [isEditing, setIsEditing] = useState(false);
  const [profile, setProfile] = useState<ProfileData>(defaultProfile);
  const [loading, setLoading] = useState(true);
  const [uid, setUid] = useState<string | null>(null);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (user: User | null) => {
      if (!user) {
        setUid(null);
        setProfile(defaultProfile);
        setLoading(false);
        return;
      }
      setUid(user.uid);
      try {
        const ref = doc(firestore, 'profiles', user.uid);
        const snap = await getDoc(ref);
        if (snap.exists()) {
          const data = snap.data() as ProfileData;
          setProfile({
            displayName: user.displayName || data.displayName || 'User',
            photoURL: user.photoURL || data.photoURL || null,
            bio: data.bio || '',
            homeArea: data.homeArea || '',
            paceBand: data.paceBand || {},
            bestTimes: data.bestTimes || {},
            stats: data.stats || defaultProfile.stats
          });
        } else {
          setProfile({ ...defaultProfile, displayName: user.displayName || 'User', photoURL: user.photoURL });
        }
      } catch (e) {
        console.error('Failed to load profile', e);
      } finally {
        setLoading(false);
      }
    });
    return () => unsub();
  }, []);

  if (loading) {
    return <div className="max-w-md mx-auto px-4 py-8 text-center text-sm text-gray-500">Loading profile...</div>;
  }

  if (!uid) {
    return <div className="max-w-md mx-auto px-4 py-8 text-center text-sm text-gray-600">Sign in to view your profile.</div>;
  }

  const stats = profile.stats || defaultProfile.stats;
  const paceBand = profile.paceBand || {};
  const bestTimes = profile.bestTimes || {};

  return (
    <div className="max-w-md mx-auto px-4 py-4 mb-20">
      {/* Profile Header */}
      <div className="bg-gradient-to-r from-blue-500 to-indigo-600 rounded-xl p-6 text-white mb-6">
        <div className="flex items-center space-x-4">
          <div className="w-16 h-16 bg-white bg-opacity-20 rounded-full flex items-center justify-center overflow-hidden">
            {profile.photoURL ? (
              <img src={profile.photoURL} alt={profile.displayName} className="w-full h-full object-cover" />
            ) : (
              <span className="text-2xl font-bold">{(profile.displayName || 'U')[0]}</span>
            )}
          </div>
          <div className="flex-1">
            <h1 className="text-xl font-bold">{profile.displayName}</h1>
            {profile.homeArea && <p className="text-blue-100 text-sm mt-1">{profile.homeArea}</p>}
          </div>
          <button
            onClick={() => setIsEditing(!isEditing)}
            className="p-2 bg-white bg-opacity-20 rounded-lg hover:bg-opacity-30 transition-colors"
          >
            <Edit size={18} />
          </button>
        </div>
        {profile.bio && <p className="text-blue-100 text-sm mt-4">{profile.bio}</p>}
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 gap-3 mb-6">
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
          <div className="text-2xl font-bold text-gray-900">{stats?.totalRuns ?? 0}</div>
          <div className="text-sm text-gray-600">Total Runs</div>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
          <div className="text-2xl font-bold text-gray-900">{stats?.totalDistance ?? 0}km</div>
          <div className="text-sm text-gray-600">Distance</div>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
          <div className="text-2xl font-bold text-gray-900">{stats?.joinRequests ?? 0}</div>
          <div className="text-sm text-gray-600">Connections</div>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
          <div className="text-2xl font-bold text-gray-900">{stats?.eventsHosted ?? 0}</div>
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
            <div className="text-lg font-bold text-gray-900">{bestTimes.fiveK || '-'}</div>
            <div className="text-sm text-gray-600">5K</div>
          </div>
          <div>
            <div className="text-lg font-bold text-gray-900">{bestTimes.tenK || '-'}</div>
            <div className="text-sm text-gray-600">10K</div>
          </div>
          <div>
            <div className="text-lg font-bold text-gray-900">{bestTimes.half || '-'}</div>
            <div className="text-sm text-gray-600">Half Marathon</div>
          </div>
          <div>
            <div className="text-lg font-bold text-gray-900">{bestTimes.full || '-'}</div>
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
              <span className="text-sm font-medium">{paceBand.easy || '-'}</span>
              <div className="w-3 h-3 bg-green-500 rounded-full" />
            </div>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600">Marathon Pace</span>
            <div className="flex items-center space-x-2">
              <span className="text-sm font-medium">{paceBand.mp || '-'}</span>
              <div className="w-3 h-3 bg-blue-500 rounded-full" />
            </div>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600">Threshold</span>
            <div className="flex items-center space-x-2">
              <span className="text-sm font-medium">{paceBand.threshold || '-'}</span>
              <div className="w-3 h-3 bg-orange-500 rounded-full" />
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
        <button onClick={() => signOut(auth)} className="w-full text-left p-4 bg-white rounded-xl shadow-sm border border-gray-100 hover:bg-red-50 text-red-600 transition-colors flex items-center">
          <LogOut size={18} className="mr-3" />
          <span>Sign Out</span>
        </button>
      </div>
    </div>
  );
};

export default Profile;