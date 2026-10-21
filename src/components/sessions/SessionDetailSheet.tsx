import React, { useEffect, useRef, useState } from 'react';
import { Calendar, MapPin, Navigation, Route, Send, Timer, Users } from 'lucide-react';
import BottomSheet from '../common/BottomSheet';
import Avatar from '../common/Avatar';
import { getDisplayName, useAuth } from '../../lib/authContext';
import {
  cancelSession,
  joinSession,
  leaveSession,
  sendSessionMessage,
  useAttendees,
  useSession,
  useSessionMessages,
  SessionError,
} from '../../lib/sessions';
import { useI18n } from '../../i18n/context';
import { formatDistance, formatPace, formatSessionTime, formatTime } from '../../utils/formatters';
import { getPaceMatch, paceMatchColor } from '../../utils/matching';

interface SessionDetailSheetProps {
  eventId: string;
  onClose: () => void;
}

const SessionDetailSheet: React.FC<SessionDetailSheetProps> = ({ eventId, onClose }) => {
  const { user, profile } = useAuth();
  const { lang, t } = useI18n();
  const { session, loading } = useSession(eventId);
  const attendees = useAttendees(eventId);
  const isAttending = !!user && attendees.some(a => a.uid === user.uid);
  const messages = useSessionMessages(eventId, isAttending);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [draft, setDraft] = useState('');
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ block: 'nearest' });
  }, [messages.length]);

  if (!user) return null;

  const me = { uid: user.uid, displayName: getDisplayName(user, profile), photoURL: profile?.photoURL ?? user.photoURL };

  if (loading || !session) {
    return (
      <BottomSheet title={loading ? t('detail.loading') : t('detail.notFound')} onClose={onClose}>
        <p className="text-sm text-gray-500">{loading ? t('detail.loadingSession') : t('detail.removed')}</p>
      </BottomSheet>
    );
  }

  const isHost = session.hostUid === user.uid;
  const isCancelled = session.status === 'cancelled';
  const hasStarted = new Date(session.scheduledAt).getTime() < Date.now();
  const isFull = !!session.capacity && session.stats.attendees >= session.capacity;
  const match = getPaceMatch(session.pacePlanSecPerKm, profile);
  const directionsUrl = `https://www.google.com/maps/dir/?api=1&destination=${session.meetPoint.lat},${session.meetPoint.lng}`;

  const run = async (action: () => Promise<void>) => {
    setBusy(true);
    setError('');
    try {
      await action();
    } catch (err) {
      console.error(err);
      setError(err instanceof SessionError ? t(`error.${err.reason}`) : t('error.generic'));
    } finally {
      setBusy(false);
    }
  };

  const handleCancel = () => {
    if (window.confirm(t('detail.cancelConfirm'))) {
      run(() => cancelSession(session, me));
    }
  };

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    const text = draft.trim();
    if (!text) return;
    setDraft('');
    run(() => sendSessionMessage(session.id, me, text));
  };

  let footer: React.ReactNode;
  if (isCancelled) {
    footer = <p className="text-center text-sm font-medium text-red-600">{t('detail.cancelled')}</p>;
  } else if (isHost) {
    footer = (
      <button
        onClick={handleCancel}
        disabled={busy}
        className="w-full py-3 rounded-full font-semibold text-red-600 bg-red-50 hover:bg-red-100 transition-colors disabled:opacity-60"
      >
        {t('detail.cancel')}
      </button>
    );
  } else if (isAttending) {
    footer = (
      <button
        onClick={() => run(() => leaveSession(session.id, me))}
        disabled={busy}
        className="w-full py-3 rounded-full font-semibold text-gray-700 bg-gray-100 hover:bg-gray-200 transition-colors disabled:opacity-60"
      >
        {busy ? t('detail.leaving') : t('detail.leave')}
      </button>
    );
  } else {
    footer = (
      <button
        onClick={() => run(() => joinSession(session.id, me))}
        disabled={busy || isFull || hasStarted}
        className="w-full py-3 rounded-full font-semibold text-white bg-blue-500 hover:bg-blue-600 active:scale-[0.98] transition-all disabled:bg-gray-300 disabled:active:scale-100"
      >
        {hasStarted ? t('detail.started') : isFull ? t('detail.full') : busy ? t('detail.joining') : t('detail.join')}
      </button>
    );
  }

  return (
    <BottomSheet title={session.title} onClose={onClose} footer={footer}>
      <div className="space-y-5">
        <div className="flex items-center space-x-3">
          <Avatar name={session.hostName} photoURL={session.hostPhotoURL} />
          <div className="flex-1 min-w-0">
            <div className="text-sm text-gray-500">{t('detail.hostedBy')}</div>
            <div className="font-medium text-gray-900 truncate">{isHost ? t('detail.you') : session.hostName}</div>
          </div>
          <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${paceMatchColor[match]}`}>
            {t(`match.${match}`)}
          </span>
        </div>

        <div className="grid grid-cols-3 gap-2 text-center">
          <div className="bg-gray-50 rounded-xl py-3">
            <Route size={16} className="mx-auto text-gray-500 mb-1" />
            <div className="font-semibold text-gray-900">{formatDistance(session.distancePlanKm)}</div>
          </div>
          <div className="bg-gray-50 rounded-xl py-3">
            <Timer size={16} className="mx-auto text-gray-500 mb-1" />
            <div className="font-semibold text-gray-900">{formatPace(session.pacePlanSecPerKm)}</div>
          </div>
          <div className="bg-gray-50 rounded-xl py-3">
            <Users size={16} className="mx-auto text-gray-500 mb-1" />
            <div className="font-semibold text-gray-900">
              {session.stats.attendees}
              {session.capacity ? `/${session.capacity}` : ''}
            </div>
          </div>
        </div>

        <div className="space-y-2 text-sm text-gray-700">
          <div className="flex items-center space-x-2">
            <Calendar size={16} className="text-gray-500 flex-shrink-0" />
            <span>{formatSessionTime(session.scheduledAt, lang)}</span>
          </div>
          <div className="flex items-center space-x-2">
            <MapPin size={16} className="text-gray-500 flex-shrink-0" />
            <span className="flex-1">{session.meetPointLabel || t('card.meetPointDefault')}</span>
            <a
              href={directionsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center space-x-1 text-blue-600 font-medium hover:underline"
            >
              <Navigation size={14} />
              <span>{t('detail.directions')}</span>
            </a>
          </div>
        </div>

        {session.notes && <p className="text-sm text-gray-700 bg-gray-50 rounded-lg p-3 whitespace-pre-wrap">{session.notes}</p>}

        <div>
          <h3 className="text-sm font-semibold text-gray-900 mb-2">{t('detail.going', { n: attendees.length })}</h3>
          <div className="flex flex-wrap gap-2">
            {attendees.map(a => (
              <div key={a.uid} className="flex items-center space-x-2 bg-gray-50 rounded-full pl-1 pr-3 py-1">
                <Avatar name={a.displayName} photoURL={a.photoURL} size="sm" />
                <span className="text-sm text-gray-700">
                  {a.uid === user.uid ? t('detail.you') : a.displayName}
                  {a.uid === session.hostUid && <span className="text-gray-400"> · {t('detail.host')}</span>}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div>
          <h3 className="text-sm font-semibold text-gray-900 mb-2">{t('detail.chat')}</h3>
          {isAttending ? (
            <div className="bg-gray-50 rounded-xl p-3">
              <div className="space-y-3 max-h-60 overflow-y-auto">
                {messages.length === 0 && (
                  <p className="text-sm text-gray-500 text-center py-2">{t('detail.chatEmpty')}</p>
                )}
                {messages.map(m => (
                  <div key={m.id} className={`flex items-end space-x-2 ${m.uid === user.uid ? 'flex-row-reverse space-x-reverse' : ''}`}>
                    <Avatar name={m.displayName} photoURL={m.photoURL} size="sm" />
                    <div className={`max-w-[75%] rounded-2xl px-3 py-2 text-sm ${m.uid === user.uid ? 'bg-blue-500 text-white' : 'bg-white text-gray-800 border border-gray-100'}`}>
                      {m.uid !== user.uid && <div className="text-xs font-medium text-gray-500 mb-0.5">{m.displayName}</div>}
                      <div className="whitespace-pre-wrap break-words">{m.text}</div>
                      <div className={`text-[10px] mt-1 ${m.uid === user.uid ? 'text-blue-100' : 'text-gray-400'}`}>{formatTime(m.createdAt, lang)}</div>
                    </div>
                  </div>
                ))}
                <div ref={chatEndRef} />
              </div>
              {!isCancelled && (
                <form onSubmit={handleSend} className="flex items-center space-x-2 mt-3">
                  <input
                    value={draft}
                    onChange={e => setDraft(e.target.value)}
                    maxLength={500}
                    placeholder={t('detail.chatPlaceholder')}
                    aria-label={t('detail.chatPlaceholder')}
                    className="flex-1 rounded-full border border-gray-200 bg-white px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <button
                    type="submit"
                    aria-label={t('detail.send')}
                    disabled={!draft.trim()}
                    className="w-9 h-9 rounded-full bg-blue-500 text-white flex items-center justify-center disabled:bg-gray-300"
                  >
                    <Send size={16} />
                  </button>
                </form>
              )}
            </div>
          ) : (
            <p className="text-sm text-gray-500 bg-gray-50 rounded-xl p-3">{t('detail.chatLocked')}</p>
          )}
        </div>

        {error && <p className="text-sm text-red-600">{error}</p>}
      </div>
    </BottomSheet>
  );
};

export default SessionDetailSheet;
