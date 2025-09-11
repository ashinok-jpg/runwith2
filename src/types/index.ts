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

export interface Profile {
  uid: string;
  age?: number;
  homeArea: {
    lat: number;
    lng: number;
    radiusKm: number;
  };
  paceBand: {
    easy: string;
    mp: string; // marathon pace
    threshold: string;
  };
  bestTimes?: {
    half?: number;
    full?: number;
    fiveK?: number;
    tenK?: number;
  };
  bio: string;
  visibility: 'public' | 'followers' | 'private';
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

export interface Event {
  id: string;
  hostUid: string;
  title: string;
  scheduledAt: string;
  meetPoint: {
    lat: number;
    lng: number;
  };
  distancePlanKm: number;
  pacePlanSecPerKm: number;
  capacity?: number;
  notes?: string;
  sourcePracticeId?: string;
  areaHash: string;
  privacy: 'public' | 'link' | 'private';
  stats: {
    attendees: number;
    bookmarks: number;
  };
  createdAt: string;
  host?: User;
}

export interface Attendance {
  id: string;
  eventId: string;
  uid: string;
  status: 'going' | 'maybe' | 'declined';
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

export interface Notification {
  id: string;
  uid: string;
  type: 'join_request' | 'event_invite' | 'comment' | 'kudos';
  payload: any;
  isRead: boolean;
  createdAt: string;
}