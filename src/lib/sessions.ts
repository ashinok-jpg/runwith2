import { useEffect, useState } from 'react';
import {
  addDoc,
  collection,
  collectionGroup,
  doc,
  endAt,
  getDoc,
  getDocs,
  limit,
  onSnapshot,
  orderBy,
  query,
  runTransaction,
  startAt,
  where,
  writeBatch,
} from 'firebase/firestore';
import { distanceBetween, geohashForLocation, geohashQueryBounds } from 'geofire-common';
import { firestore } from './firebase';
import type { LatLng } from './geo';
import type { Attendee, Event, SessionMessage } from '../types';

export const eventsCol = collection(firestore, 'events');
const notificationsCol = collection(firestore, 'notifications');

// Keep sessions on the map for a while after they start
const STARTED_GRACE_MS = 2 * 60 * 60 * 1000;

export interface Runner {
  uid: string;
  displayName: string;
  photoURL?: string | null;
}

export interface NewSessionInput {
  title: string;
  scheduledAt: string;
  meetPoint: LatLng;
  meetPointLabel?: string;
  distancePlanKm: number;
  pacePlanSecPerKm: number;
  capacity?: number | null;
  notes?: string;
}

export type NearbySession = Event & { distanceKm: number };

export type SessionErrorReason = 'gone' | 'cancelled' | 'started' | 'full' | 'hostLeave';

// Expected join/leave failures; the UI shows a translated message for each reason
export class SessionError extends Error {
  constructor(public reason: SessionErrorReason) {
    super(reason);
    this.name = 'SessionError';
  }
}

const toEvent = (id: string, data: unknown): Event => ({ ...(data as Omit<Event, 'id'>), id });

export const createSession = async (host: Runner, input: NewSessionInput): Promise<string> => {
  const ref = doc(eventsCol);
  const now = new Date().toISOString();
  const batch = writeBatch(firestore);

  batch.set(ref, {
    hostUid: host.uid,
    hostName: host.displayName,
    hostPhotoURL: host.photoURL ?? null,
    title: input.title,
    scheduledAt: input.scheduledAt,
    meetPoint: input.meetPoint,
    meetPointLabel: input.meetPointLabel ?? '',
    distancePlanKm: input.distancePlanKm,
    pacePlanSecPerKm: input.pacePlanSecPerKm,
    capacity: input.capacity ?? null,
    notes: input.notes ?? '',
    areaHash: geohashForLocation([input.meetPoint.lat, input.meetPoint.lng]),
    privacy: 'public',
    status: 'open',
    stats: { attendees: 1, bookmarks: 0 },
    createdAt: now,
  });
  // The host is the first attendee
  batch.set(doc(ref, 'attendees', host.uid), {
    uid: host.uid,
    displayName: host.displayName,
    photoURL: host.photoURL ?? null,
    joinedAt: now,
  });

  await batch.commit();
  return ref.id;
};

export const joinSession = async (eventId: string, runner: Runner): Promise<void> => {
  const eventRef = doc(eventsCol, eventId);
  const attendeeRef = doc(eventRef, 'attendees', runner.uid);

  await runTransaction(firestore, async tx => {
    const eventSnap = await tx.get(eventRef);
    const attendeeSnap = await tx.get(attendeeRef);
    if (!eventSnap.exists()) throw new SessionError('gone');
    if (attendeeSnap.exists()) return;

    const event = toEvent(eventSnap.id, eventSnap.data());
    if (event.status !== 'open') throw new SessionError('cancelled');
    if (new Date(event.scheduledAt).getTime() < Date.now()) throw new SessionError('started');
    if (event.capacity && event.stats.attendees >= event.capacity) throw new SessionError('full');

    const now = new Date().toISOString();
    tx.set(attendeeRef, {
      uid: runner.uid,
      displayName: runner.displayName,
      photoURL: runner.photoURL ?? null,
      joinedAt: now,
    });
    tx.update(eventRef, { 'stats.attendees': event.stats.attendees + 1 });
    tx.set(doc(notificationsCol), {
      uid: event.hostUid,
      type: 'session_joined',
      fromUid: runner.uid,
      fromName: runner.displayName,
      eventId,
      eventTitle: event.title,
      isRead: false,
      createdAt: now,
    });
  });
};

export const leaveSession = async (eventId: string, runner: Runner): Promise<void> => {
  const eventRef = doc(eventsCol, eventId);
  const attendeeRef = doc(eventRef, 'attendees', runner.uid);

  await runTransaction(firestore, async tx => {
    const eventSnap = await tx.get(eventRef);
    const attendeeSnap = await tx.get(attendeeRef);
    if (!eventSnap.exists() || !attendeeSnap.exists()) return;

    const event = toEvent(eventSnap.id, eventSnap.data());
    if (event.hostUid === runner.uid) throw new SessionError('hostLeave');

    tx.delete(attendeeRef);
    tx.update(eventRef, { 'stats.attendees': event.stats.attendees - 1 });
    tx.set(doc(notificationsCol), {
      uid: event.hostUid,
      type: 'session_left',
      fromUid: runner.uid,
      fromName: runner.displayName,
      eventId,
      eventTitle: event.title,
      isRead: false,
      createdAt: new Date().toISOString(),
    });
  });
};

export const cancelSession = async (event: Event, host: Runner): Promise<void> => {
  const eventRef = doc(eventsCol, event.id);
  const attendees = await getDocs(collection(eventRef, 'attendees'));
  const now = new Date().toISOString();
  const batch = writeBatch(firestore);

  batch.update(eventRef, { status: 'cancelled' });
  attendees.docs
    .filter(a => a.id !== host.uid)
    .forEach(a => {
      batch.set(doc(notificationsCol), {
        uid: a.id,
        type: 'session_cancelled',
        fromUid: host.uid,
        fromName: host.displayName,
        eventId: event.id,
        eventTitle: event.title,
        isRead: false,
        createdAt: now,
      });
    });

  await batch.commit();
};

// Host edits the details; the meeting point stays where it was set
export const updateSession = async (event: Event, host: Runner, input: NewSessionInput): Promise<void> => {
  const eventRef = doc(eventsCol, event.id);
  const attendees = await getDocs(collection(eventRef, 'attendees'));
  const now = new Date().toISOString();
  const batch = writeBatch(firestore);

  batch.update(eventRef, {
    title: input.title,
    scheduledAt: input.scheduledAt,
    meetPointLabel: input.meetPointLabel ?? '',
    distancePlanKm: input.distancePlanKm,
    pacePlanSecPerKm: input.pacePlanSecPerKm,
    capacity: input.capacity ?? null,
    notes: input.notes ?? '',
  });
  attendees.docs
    .filter(a => a.id !== host.uid)
    .forEach(a => {
      batch.set(doc(notificationsCol), {
        uid: a.id,
        type: 'session_updated',
        fromUid: host.uid,
        fromName: host.displayName,
        eventId: event.id,
        eventTitle: input.title,
        isRead: false,
        createdAt: now,
      });
    });

  await batch.commit();
};

export const sendSessionMessage = async (eventId: string, runner: Runner, text: string): Promise<void> => {
  await addDoc(collection(eventsCol, eventId, 'messages'), {
    uid: runner.uid,
    displayName: runner.displayName,
    photoURL: runner.photoURL ?? null,
    text: text.trim(),
    createdAt: new Date().toISOString(),
  });
};

// Live list of open sessions within radiusKm of center, soonest first
export const useNearbySessions = (center: LatLng | null, radiusKm: number) => {
  const [sessions, setSessions] = useState<NearbySession[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  // Round the center (~1km) so small map pans don't resubscribe
  const lat = center ? Math.round(center.lat * 100) / 100 : null;
  const lng = center ? Math.round(center.lng * 100) / 100 : null;

  useEffect(() => {
    if (lat === null || lng === null) return;

    const bounds = geohashQueryBounds([lat, lng], radiusKm * 1000);
    const buckets = new Map<number, Event[]>();
    setLoading(true);

    const publish = () => {
      const seen = new Set<string>();
      const cutoff = Date.now() - STARTED_GRACE_MS;
      const merged: NearbySession[] = [];
      buckets.forEach(events =>
        events.forEach(event => {
          if (seen.has(event.id)) return;
          seen.add(event.id);
          if (new Date(event.scheduledAt).getTime() < cutoff) return;
          const distanceKm = distanceBetween([event.meetPoint.lat, event.meetPoint.lng], [lat, lng]);
          if (distanceKm <= radiusKm) merged.push({ ...event, distanceKm });
        })
      );
      merged.sort((a, b) => a.scheduledAt.localeCompare(b.scheduledAt));
      setSessions(merged);
    };

    const unsubs = bounds.map(([start, end], i) =>
      onSnapshot(
        query(eventsCol, where('status', '==', 'open'), orderBy('areaHash'), startAt(start), endAt(end)),
        snap => {
          buckets.set(i, snap.docs.map(d => toEvent(d.id, d.data())));
          if (buckets.size === bounds.length) setLoading(false);
          setError(false);
          publish();
        },
        err => {
          console.error('Failed to load sessions', err);
          setError(true);
          setLoading(false);
        }
      )
    );

    return () => unsubs.forEach(unsub => unsub());
  }, [lat, lng, radiusKm]);

  return { sessions, loading, error };
};

export const useSession = (eventId: string | null) => {
  const [session, setSession] = useState<Event | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!eventId) {
      setSession(null);
      return;
    }
    setLoading(true);
    return onSnapshot(
      doc(eventsCol, eventId),
      snap => {
        setSession(snap.exists() ? toEvent(snap.id, snap.data()) : null);
        setLoading(false);
      },
      err => {
        console.error('Failed to load session', err);
        setLoading(false);
      }
    );
  }, [eventId]);

  return { session, loading };
};

export const useAttendees = (eventId: string | null) => {
  const [attendees, setAttendees] = useState<Attendee[]>([]);

  useEffect(() => {
    if (!eventId) return;
    return onSnapshot(
      query(collection(eventsCol, eventId, 'attendees'), orderBy('joinedAt')),
      snap => setAttendees(snap.docs.map(d => d.data() as Attendee)),
      err => console.error('Failed to load attendees', err)
    );
  }, [eventId]);

  return attendees;
};

// Only attendees can read the chat, so pass enabled=false for everyone else
export const useSessionMessages = (eventId: string | null, enabled: boolean) => {
  const [messages, setMessages] = useState<SessionMessage[]>([]);

  useEffect(() => {
    if (!eventId || !enabled) {
      setMessages([]);
      return;
    }
    return onSnapshot(
      query(collection(eventsCol, eventId, 'messages'), orderBy('createdAt'), limit(200)),
      snap => setMessages(snap.docs.map(d => ({ ...(d.data() as Omit<SessionMessage, 'id'>), id: d.id }))),
      err => console.error('Failed to load messages', err)
    );
  }, [eventId, enabled]);

  return messages;
};

// Upcoming sessions the runner is hosting or has joined, soonest first
export const useMySessions = (uid: string | null) => {
  const [sessions, setSessions] = useState<Event[]>([]);

  useEffect(() => {
    if (!uid) {
      setSessions([]);
      return;
    }
    let active = true;
    const unsub = onSnapshot(
      query(collectionGroup(firestore, 'attendees'), where('uid', '==', uid)),
      async snap => {
        const parents = await Promise.all(
          snap.docs.map(d => d.ref.parent.parent).filter(ref => ref !== null).map(ref => getDoc(ref))
        );
        if (!active) return;
        const cutoff = Date.now() - STARTED_GRACE_MS;
        setSessions(
          parents
            .filter(p => p.exists())
            .map(p => toEvent(p.id, p.data()))
            .filter(e => e.status === 'open' && new Date(e.scheduledAt).getTime() >= cutoff)
            .sort((a, b) => a.scheduledAt.localeCompare(b.scheduledAt))
        );
      },
      err => console.error('Failed to load your sessions', err)
    );
    return () => {
      active = false;
      unsub();
    };
  }, [uid]);

  return sessions;
};
