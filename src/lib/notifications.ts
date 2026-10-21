import { useEffect, useState } from 'react';
import { collection, doc, limit, onSnapshot, orderBy, query, where, writeBatch } from 'firebase/firestore';
import { firestore } from './firebase';
import type { Notification } from '../types';

const notificationsCol = collection(firestore, 'notifications');

export const useNotifications = (uid: string | null) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!uid) {
      setNotifications([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    return onSnapshot(
      query(notificationsCol, where('uid', '==', uid), orderBy('createdAt', 'desc'), limit(50)),
      snap => {
        setNotifications(snap.docs.map(d => ({ ...(d.data() as Omit<Notification, 'id'>), id: d.id })));
        setLoading(false);
      },
      err => {
        console.error('Failed to load notifications', err);
        setLoading(false);
      }
    );
  }, [uid]);

  return { notifications, loading };
};

export const markNotificationsRead = async (ids: string[]): Promise<void> => {
  if (ids.length === 0) return;
  const batch = writeBatch(firestore);
  ids.forEach(id => batch.update(doc(notificationsCol, id), { isRead: true }));
  await batch.commit();
};
