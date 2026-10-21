import { createContext, useContext } from 'react';
import type { User as FirebaseUser } from 'firebase/auth';
import type { Profile } from '../types';

export interface AuthContextValue {
  user: FirebaseUser | null;
  profile: Profile | null;
  loading: boolean;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
  saveProfile: (data: Partial<Profile>) => Promise<void>;
}

export const AuthContext = createContext<AuthContextValue | null>(null);

export const useAuth = (): AuthContextValue => {
  const value = useContext(AuthContext);
  if (!value) throw new Error('useAuth must be used inside <AuthProvider>');
  return value;
};

// Display name to store on sessions, attendees and messages
export const getDisplayName = (user: FirebaseUser, profile: Profile | null): string =>
  (profile?.displayName || user.displayName || 'Runner').slice(0, 40);
