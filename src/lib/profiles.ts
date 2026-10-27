import { useEffect, useState } from 'react';
import { doc, onSnapshot } from 'firebase/firestore';
import { firestore } from './firebase';
import type { Profile } from '../types';

// Another runner's public profile (profiles/{uid}); null when they haven't created one
export const useProfile = (uid: string | null) => {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!uid) {
      setProfile(null);
      setLoading(false);
      return;
    }
    setLoading(true);
    return onSnapshot(
      doc(firestore, 'profiles', uid),
      snap => {
        setProfile(snap.exists() ? { ...(snap.data() as Profile), uid } : null);
        setLoading(false);
      },
      err => {
        console.error('Failed to load runner profile', err);
        setLoading(false);
      }
    );
  }, [uid]);

  return { profile, loading };
};
