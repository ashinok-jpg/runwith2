export interface User {
  id: string;
  displayName: string;
  photoURL?: string;
  email: string;
  createdAt: string;
  roles?: {
    admin?: boolean;
  };
}

export interface PaceBand {
  easy?: string; // "m:ss" per km
  mp?: string; // marathon pace
  threshold?: string;
}

export interface BestTimes {
  fiveK?: string;
  tenK?: string;
  half?: string;
  full?: string;
}

// Stored at profiles/{uid}
export interface Profile {
  uid: string;
  displayName: string;
  photoURL?: string | null;
  bio?: string;
  homeArea?: string;
  paceBand?: PaceBand;
  bestTimes?: BestTimes;
  createdAt?: string;
  updatedAt?: string;
}

export interface Practice {
  id: string;
  ownerUid: string;
  startedAt: string;
  durationSec: number;
  distanceKm: number;
  avgPaceSecPerKm: number;
  intensity: 'easy' | 'moderate' | 'hard' | 'workout' | 'race';
  tags: string[];
  route: {
    start: {
      lat: number;
      lng: number;
    };
    end?: {
      lat: number;
      lng: number;
    };
    polyline?: string;
  };
  areaHash: string;
  inviteOpen: boolean;
  privacy: 'public' | 'area' | 'private';
  stats: {
    kudos: number;
    comments: number;
    requests: number;
  };
  createdAt: string;
  owner?: User;
}

export interface PracticeReaction {
  id: string;
  practiceId: string;
  fromUid: string;
  type: 'kudos' | 'join_request';
  message?: string;
  createdAt: string;
  from?: User;
}

// A group run session, stored at events/{id}. Shown as "Session" in the UI.
export interface Event {
  id: string;
  hostUid: string;
  hostName: string;
  hostPhotoURL?: string | null;
  title: string;
  scheduledAt: string;
  meetPoint: {
    lat: number;
    lng: number;
  };
  meetPointLabel?: string;
  distancePlanKm: number;
  pacePlanSecPerKm: number;
  capacity?: number | null;
  notes?: string;
  areaHash: string; // geohash of meetPoint, used for nearby queries
  privacy: 'public';
  status: 'open' | 'cancelled';
  stats: {
    attendees: number;
    bookmarks: number;
  };
  createdAt: string;
}

// Stored at events/{eventId}/attendees/{uid}
export interface Attendee {
  uid: string;
  displayName: string;
  photoURL?: string | null;
  joinedAt: string;
}

// Stored at events/{eventId}/messages/{id}
export interface SessionMessage {
  id: string;
  uid: string;
  displayName: string;
  photoURL?: string | null;
  text: string;
  createdAt: string;
}

export interface Comment {
  id: string;
  targetType: 'practice' | 'event';
  targetId: string;
  uid: string;
  text: string;
  createdAt: string;
  author?: User;
}

// Stored at notifications/{id}; uid is the recipient
export interface Notification {
  id: string;
  uid: string;
  type: 'session_joined' | 'session_left' | 'session_cancelled' | 'session_updated';
  fromUid: string;
  fromName: string;
  eventId: string;
  eventTitle: string;
  isRead: boolean;
  createdAt: string;
}
