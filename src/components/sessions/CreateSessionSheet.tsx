import React, { useState } from 'react';
import { MapPin } from 'lucide-react';
import BottomSheet from '../common/BottomSheet';
import { createSession } from '../../lib/sessions';
import { getDisplayName, useAuth } from '../../lib/authContext';
import type { LatLng } from '../../lib/geo';
import { parsePace } from '../../utils/matching';
import { useI18n } from '../../i18n/context';

interface CreateSessionSheetProps {
  meetPoint: LatLng;
  // Prefilled meeting point name, e.g. from a popular spot
  initialLabel?: string;
  onClose: () => void;
  onCreated: (eventId: string) => void;
}

const pad = (n: number) => n.toString().padStart(2, '0');

// Tomorrow at 7:00 in the runner's local time
const defaultStart = () => {
  const d = new Date();
  d.setDate(d.getDate() + 1);
  return {
    date: `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`,
    time: '07:00',
  };
};

const inputClass =
  'w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent';
const labelClass = 'block text-sm font-medium text-gray-700 mb-1';

const CreateSessionSheet: React.FC<CreateSessionSheetProps> = ({ meetPoint, initialLabel = '', onClose, onCreated }) => {
  const { user, profile } = useAuth();
  const { t } = useI18n();
  const start = defaultStart();
  const [title, setTitle] = useState('');
  const [date, setDate] = useState(start.date);
  const [time, setTime] = useState(start.time);
  const [distance, setDistance] = useState('10');
  const [pace, setPace] = useState(profile?.paceBand?.easy || '6:00');
  const [capacity, setCapacity] = useState('6');
  const [meetPointLabel, setMeetPointLabel] = useState(initialLabel);
  const [notes, setNotes] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    const scheduled = new Date(`${date}T${time}`);
    const paceSec = parsePace(pace);
    const distanceKm = Number(distance);
    const capacityNum = capacity ? Number(capacity) : null;

    if (!title.trim()) return setError(t('create.error.title'));
    if (Number.isNaN(scheduled.getTime()) || scheduled.getTime() <= Date.now()) {
      return setError(t('create.error.time'));
    }
    if (!(distanceKm >= 0.5 && distanceKm <= 100)) return setError(t('create.error.distance'));
    if (paceSec === null || paceSec < 150 || paceSec > 900) return setError(t('create.error.pace'));
    if (capacityNum !== null && !(Number.isInteger(capacityNum) && capacityNum >= 2 && capacityNum <= 50)) {
      return setError(t('create.error.capacity'));
    }

    setBusy(true);
    setError('');
    try {
      const id = await createSession(
        { uid: user.uid, displayName: getDisplayName(user, profile), photoURL: profile?.photoURL ?? user.photoURL },
        {
          title: title.trim(),
          scheduledAt: scheduled.toISOString(),
          meetPoint,
          meetPointLabel: meetPointLabel.trim(),
          distancePlanKm: distanceKm,
          pacePlanSecPerKm: paceSec,
          capacity: capacityNum,
          notes: notes.trim(),
        }
      );
      onCreated(id);
    } catch (err) {
      console.error('Failed to create session', err);
      setError(t('create.error.failed'));
      setBusy(false);
    }
  };

  return (
    <BottomSheet
      title={t('create.title')}
      onClose={onClose}
      footer={
        <button
          type="submit"
          form="create-session"
          disabled={busy}
          className="w-full py-3 bg-blue-500 text-white rounded-full font-semibold hover:bg-blue-600 active:scale-[0.98] transition-all disabled:opacity-60"
        >
          {busy ? t('create.submitting') : t('create.submit')}
        </button>
      }
    >
      <form id="create-session" onSubmit={handleSubmit} className="space-y-4">
        <div className="flex items-center space-x-2 text-sm text-gray-600 bg-blue-50 rounded-lg px-3 py-2">
          <MapPin size={16} className="text-blue-600 flex-shrink-0" />
          <span>
            {t('create.pointSet', { lat: meetPoint.lat.toFixed(4), lng: meetPoint.lng.toFixed(4) })}
          </span>
        </div>

        <div>
          <label htmlFor="session-title" className={labelClass}>{t('create.field.title')}</label>
          <input
            id="session-title"
            className={inputClass}
            value={title}
            onChange={e => setTitle(e.target.value)}
            maxLength={80}
            placeholder={t('create.field.titlePlaceholder')}
          />
        </div>

        <div>
          <label htmlFor="session-place" className={labelClass}>{t('create.field.place')}</label>
          <input
            id="session-place"
            className={inputClass}
            value={meetPointLabel}
            onChange={e => setMeetPointLabel(e.target.value)}
            maxLength={80}
            placeholder={t('create.field.placePlaceholder')}
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label htmlFor="session-date" className={labelClass}>{t('create.field.date')}</label>
            <input id="session-date" type="date" className={inputClass} value={date} onChange={e => setDate(e.target.value)} />
          </div>
          <div>
            <label htmlFor="session-time" className={labelClass}>{t('create.field.time')}</label>
            <input id="session-time" type="time" className={inputClass} value={time} onChange={e => setTime(e.target.value)} />
          </div>
        </div>

        <div className="grid grid-cols-3 gap-3">
          <div>
            <label htmlFor="session-distance" className={labelClass}>{t('create.field.distance')}</label>
            <input
              id="session-distance"
              type="number"
              inputMode="decimal"
              min="0.5"
              max="100"
              step="0.5"
              className={inputClass}
              value={distance}
              onChange={e => setDistance(e.target.value)}
            />
          </div>
          <div>
            <label htmlFor="session-pace" className={labelClass}>{t('create.field.pace')}</label>
            <input
              id="session-pace"
              className={inputClass}
              value={pace}
              onChange={e => setPace(e.target.value)}
              placeholder="5:30"
              inputMode="numeric"
            />
          </div>
          <div>
            <label htmlFor="session-capacity" className={labelClass}>{t('create.field.capacity')}</label>
            <input
              id="session-capacity"
              type="number"
              inputMode="numeric"
              min="2"
              max="50"
              className={inputClass}
              value={capacity}
              onChange={e => setCapacity(e.target.value)}
              placeholder={t('create.field.noLimit')}
            />
          </div>
        </div>

        <div>
          <label htmlFor="session-notes" className={labelClass}>{t('create.field.notes')}</label>
          <textarea
            id="session-notes"
            className={`${inputClass} resize-none`}
            rows={3}
            value={notes}
            onChange={e => setNotes(e.target.value)}
            maxLength={500}
            placeholder={t('create.field.notesPlaceholder')}
          />
        </div>

        {error && <p className="text-sm text-red-600">{error}</p>}
      </form>
    </BottomSheet>
  );
};

export default CreateSessionSheet;
