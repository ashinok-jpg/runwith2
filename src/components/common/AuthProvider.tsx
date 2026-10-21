import React, { useEffect, useState, useCallback } from 'react';
import {
  GoogleAuthProvider,
  onAuthStateChanged,
  signInWithPopup,
  signInWithRedirect,
  signOut as firebaseSignOut,
  type User as FirebaseUser,
} from 'firebase/auth';
import { doc, onSnapshot, setDoc } from 'firebase/firestore';
import { FirebaseError } from 'firebase/app';
import { auth, firestore } from '../../lib/firebase';
import { AuthContext } from '../../lib/authContext';
import type { Profile } from '../../types';

const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let unsubProfile: (() => void) | undefined;

    const unsubAuth = onAuthStateChanged(auth, firebaseUser => {
      unsubProfile?.();
      unsubProfile = undefined;
      setUser(firebaseUser);

      if (!firebaseUser) {
        setProfile(null);
        setLoading(false);
        return;
      }

      const ref = doc(firestore, 'profiles', firebaseUser.uid);
      unsubProfile = onSnapshot(
        ref,
        snap => {
          if (snap.exists()) {
            setProfile({ ...(snap.data() as Profile), uid: firebaseUser.uid });
          } else {
            // First sign-in: create a profile from the Google account
            const now = new Date().toISOString();
            setDoc(ref, {
              uid: firebaseUser.uid,
              displayName: (firebaseUser.displayName || 'Runner').slice(0, 40),
              photoURL: firebaseUser.photoURL || null,
              bio: '',
              homeArea: '',
              paceBand: {},
              bestTimes: {},
              createdAt: now,
              updatedAt: now,
            }).catch(err => console.error('Failed to create profile', err));
          }
          setLoading(false);
        },
        err => {
          console.error('Failed to load profile', err);
          setLoading(false);
        }
      );
    });

    return () => {
      unsubProfile?.();
      unsubAuth();
    };
  }, []);

  const signInWithGoogle = useCallback(async () => {
    const provider = new GoogleAuthProvider();
    try {
      await signInWithPopup(auth, provider);
    } catch (err) {
      if (err instanceof FirebaseError && err.code === 'auth/popup-blocked') {
        await signInWithRedirect(auth, provider);
        return;
      }
      throw err;
    }
  }, []);

  const signOut = useCallback(() => firebaseSignOut(auth), []);

  const saveProfile = useCallback(
    async (data: Partial<Profile>) => {
      if (!user) throw new Error('Not signed in');
      await setDoc(
        doc(firestore, 'profiles', user.uid),
        { ...data, uid: user.uid, updatedAt: new Date().toISOString() },
        { merge: true }
      );
    },
    [user]
  );

  return (
    <AuthContext.Provider value={{ user, profile, loading, signInWithGoogle, signOut, saveProfile }}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthProvider;
