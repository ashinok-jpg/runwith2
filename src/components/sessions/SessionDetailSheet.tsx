import React, { useEffect, useRef, useState } from 'react';
import { Calendar, MapPin, Navigation, Pencil, Route, Send, Share2 } from 'lucide-react';
import BottomSheet from '../common/BottomSheet';
import Avatar from '../common/Avatar';
import CreateSessionSheet from './CreateSessionSheet';
import RunnerProfileSheet from './RunnerProfileSheet';
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
  // Inline confirm step; window.confirm is suppressed in some in-app browsers
  const [confirmingCancel, setConfirmingCancel] = useState(false);
  const [editing, setEditing] = useState(false);
  const [viewingRunner, setViewingRunner] = useState<{ uid: string; name: string; photoURL?: string | null } | null>(null);
  const [shareNote, setShareNote] = useState('');
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

  if (viewingRunner) {
    return (
      <RunnerProfileSheet
        uid={viewingRunner.uid}
        fallbackName={viewingRunner.name}
        fallbackPhotoURL={viewingRunner.photoURL}
        onBack={() => setViewingRunner(null)}
        onClose={onClose}
      />
    );
  }

  if (editing) {
    return (
      <CreateSessionSheet
        meetPoint={session.meetPoint}
        existing={session}
        onClose={() => setEditing(false)}
        onSaved={() => setEditing(false)}
      />
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

  const handleCancel = async () => {
    await run(() => cancelSession(session, me));
    setConfirmingCancel(false);
  };

  // Links open the session directly (see App)
  const shareUrl = `${window.location.origin}/?session=${session.id}`;

  const handleShare = async () => {
    setShareNote('');
    if (navigator.share) {
      try {
        await navigator.share({ title: session.title, text: t('detail.shareText', { title: session.title }), url: shareUrl });
        return;
      } catch (err) {
        if (err instanceof DOMException && err.name === 'AbortError') return;
        // Share sheet unavailable here; fall back to copying
      }
    }
    try {
      await navigator.clipboard.writeText(shareUrl);
      setShareNote(t('detail.linkCopied'));
    } catch {
      setShareNote(`${t('detail.copyLink')} ${shareUrl}`);
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
  } else if (isHost && confirmingCancel) {
    footer = (
      <div role="alertdialog" aria-label={t('detail.cancelConfirm')} className="space-y-3">
        <p className="text-sm text-gray-700 text-center">{t('detail.cancelConfirm')}</p>
        <div className="flex space-x-3">
          <button
            onClick={() => setConfirmingCancel(false)}
            disabled={busy}
            className="flex-1 py-3 rounded-full font-semibold text-gray-700 bg-gray-100 hover:bg-gray-200 transition-colors disabled:opacity-60"
          >
            {t('detail.cancelKeep')}
          </button>
          <button
            onClick={handleCancel}
            disabled={busy}
            className="flex-1 py-3 rounded-full font-semibold text-white bg-red-500 hover:bg-red-600 transition-colors disabled:opacity-60"
          >
            {busy ? t('detail.cancelling') : t('detail.cancelYes')}
          </button>
        </div>
      </div>
    );
  } else if (isHost) {
    footer = (
      <div className="flex space-x-3">
        {!hasStarted && (
          <button
            onClick={() => setEditing(true)}
            className="flex-1 flex items-center justify-center space-x-1.5 py-3 rounded-full font-semibold text-blue-600 bg-blue-50 hover:bg-blue-100 transition-colors"
          >
            <Pencil size={16} />
            <span>{t('detail.edit')}</span>
          </button>
        )}
        <button
          onClick={() => setConfirmingCancel(true)}
          className="flex-1 py-3 rounded-full font-semibold text-red-600 bg-red-50 hover:bg-red-100 transition-colors"
        >
          {t('detail.cancel')}
        </button>
      </div>
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
        {!isHost && match !== 'unknown' && (
          <span className={`inline-block text-xs font-medium px-2.5 py-1 rounded-full ${paceMatchColor[match]}`}>
            {t(`match.${match}`)}
          </span>
        )}

        <ul className="space-y-3 text-gray-900">
          <li className="flex items-center space-x-3">
            <Calendar size={18} className="text-gray-400 flex-shrink-0" />
            <span>{formatSessionTime(session.scheduledAt, lang)}</span>
          </li>
          <li className="flex items-center space-x-3">
            <Route size={18} className="text-gray-400 flex-shrink-0" />
            <span>
              {formatDistance(session.distancePlanKm)} · {formatPace(session.pacePlanSecPerKm)}
            </span>
          </li>
          <li className="flex items-center space-x-3">
            <MapPin size={18} className="text-gray-400 flex-shrink-0" />
            <span>{session.meetPointLabel || t('card.meetPointDefault')}</span>
          </li>
        </ul>

        <div className="flex space-x-2">
          <a
            href={directionsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 flex items-center justify-center space-x-1.5 py-2 rounded-full border border-gray-200 text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            <Navigation size={15} />
            <span>{t('detail.directions')}</span>
          </a>
          {!isCancelled && (
            <button
              onClick={handleShare}
              className="flex-1 flex items-center justify-center space-x-1.5 py-2 rounded-full border border-gray-200 text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              <Share2 size={15} />
              <span>{t('detail.share')}</span>
            </button>
          )}
        </div>
        {shareNote && (
          <p role="status" className="text-xs text-green-700 bg-green-50 rounded-lg px-3 py-2 break-all">
            {shareNote}
          </p>
        )}

        {session.notes && <p className="text-sm text-gray-700 whitespace-pre-wrap">{session.notes}</p>}

        <div>
          <h3 className="text-sm font-semibold text-gray-900 mb-2">{t('detail.going', { n: session.capacity ? `${attendees.length}/${session.capacity}` : attendees.length })}</h3>
          <div className="flex flex-wrap gap-2">
            {attendees.map(a => (
              <button
                key={a.uid}
                onClick={() => setViewingRunner({ uid: a.uid, name: a.displayName, photoURL: a.photoURL })}
                aria-label={t('detail.viewProfile', { name: a.displayName })}
                className="flex items-center space-x-2 bg-gray-50 hover:bg-blue-50 rounded-full pl-1 pr-3 py-1 transition-colors"
              >
                <Avatar name={a.displayName} photoURL={a.photoURL} size="sm" />
                <span className="text-sm text-gray-700">
                  {a.uid === user.uid ? t('detail.you') : a.displayName}
                  {a.uid === session.hostUid && <span className="text-gray-400"> · {t('detail.host')}</span>}
                </span>
              </button>
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
