import React, { useState } from 'react';
import { Edit, LogOut, Target, Trophy } from 'lucide-react';
import Avatar from '../common/Avatar';
import { useAuth } from '../../lib/authContext';
import type { BestTimes, PaceBand } from '../../types';
import { parsePace } from '../../utils/matching';
import { useI18n } from '../../i18n/context';
import type { Lang, MessageKey } from '../../i18n/strings';

interface ProfileProps {
  startEditing?: boolean;
}

const inputClass =
  'w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent';
const labelClass = 'block text-sm font-medium text-gray-700 mb-1';

const paceFields: { key: keyof PaceBand; label: MessageKey; hint: string; dot: string }[] = [
  { key: 'easy', label: 'pace.easy', hint: '6:00', dot: 'bg-green-500' },
  { key: 'mp', label: 'pace.mp', hint: '5:15', dot: 'bg-blue-500' },
  { key: 'threshold', label: 'pace.threshold', hint: '4:45', dot: 'bg-orange-500' },
];

const bestTimeFields: { key: keyof BestTimes; label: MessageKey; hint: string }[] = [
  { key: 'fiveK', label: 'best.fiveK', hint: '22:30' },
  { key: 'tenK', label: 'best.tenK', hint: '47:00' },
  { key: 'half', label: 'best.half', hint: '1:45:00' },
  { key: 'full', label: 'best.full', hint: '3:45:00' },
];

const languageNames: Record<Lang, string> = { en: 'English', ja: '日本語' };

const Profile: React.FC<ProfileProps> = ({ startEditing = false }) => {
  const { user, profile, saveProfile, signOut } = useAuth();
  const { lang, setLang, t } = useI18n();
  const [isEditing, setIsEditing] = useState(startEditing);
  const [form, setForm] = useState({
    displayName: profile?.displayName || user?.displayName || '',
    homeArea: profile?.homeArea || '',
    bio: profile?.bio || '',
    paceBand: { ...profile?.paceBand },
    bestTimes: { ...profile?.bestTimes },
  });
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string>('');

  if (!user) return null;

  const displayName = profile?.displayName || user.displayName || 'Runner';
  const photoURL = profile?.photoURL ?? user.photoURL;
  const paceBand = profile?.paceBand || {};
  const bestTimes = profile?.bestTimes || {};

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.displayName.trim()) return setError(t('profile.error.name'));
    const badPace = paceFields.find(f => form.paceBand[f.key] && parsePace(form.paceBand[f.key]) === null);
    if (badPace) return setError(t('profile.error.pace', { label: t(badPace.label) }));

    setBusy(true);
    setError('');
    try {
      await saveProfile({
        displayName: form.displayName.trim(),
        homeArea: form.homeArea.trim(),
        bio: form.bio.trim(),
        paceBand: form.paceBand,
        bestTimes: form.bestTimes,
      });
      setIsEditing(false);
    } catch (err) {
      console.error('Failed to save profile', err);
      setError(t('profile.error.failed'));
    } finally {
      setBusy(false);
    }
  };

  if (isEditing) {
    return (
      <form onSubmit={handleSave} className="max-w-md mx-auto px-4 py-4 mb-20 space-y-5">
        <h1 className="text-xl font-bold text-gray-900">{t('profile.edit')}</h1>

        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 space-y-4">
          <div>
            <label htmlFor="profile-name" className={labelClass}>{t('profile.displayName')}</label>
            <input
              id="profile-name"
              className={inputClass}
              value={form.displayName}
              maxLength={40}
              onChange={e => setForm({ ...form, displayName: e.target.value })}
            />
          </div>
          <div>
            <label htmlFor="profile-area" className={labelClass}>{t('profile.homeArea')}</label>
            <input
              id="profile-area"
              className={inputClass}
              value={form.homeArea}
              maxLength={60}
              placeholder={t('profile.homeAreaPlaceholder')}
              onChange={e => setForm({ ...form, homeArea: e.target.value })}
            />
          </div>
          <div>
            <label htmlFor="profile-bio" className={labelClass}>{t('profile.bio')}</label>
            <textarea
              id="profile-bio"
              rows={3}
              className={`${inputClass} resize-none`}
              value={form.bio}
              maxLength={300}
              placeholder={t('profile.bioPlaceholder')}
              onChange={e => setForm({ ...form, bio: e.target.value })}
            />
          </div>
        </div>

        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
          <h2 className="font-semibold text-gray-900 mb-1">{t('profile.paceTitle')}</h2>
          <p className="text-sm text-gray-500 mb-3">{t('profile.paceHint')}</p>
          <div className="grid grid-cols-3 gap-3">
            {paceFields.map(f => (
              <div key={f.key}>
                <label htmlFor={`pace-${f.key}`} className={labelClass}>{t(f.label)}</label>
                <input
                  id={`pace-${f.key}`}
                  className={inputClass}
                  placeholder={f.hint}
                  value={form.paceBand[f.key] || ''}
                  onChange={e => setForm({ ...form, paceBand: { ...form.paceBand, [f.key]: e.target.value.trim() } })}
                />
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
          <h2 className="font-semibold text-gray-900 mb-3">{t('profile.records')}</h2>
          <div className="grid grid-cols-2 gap-3">
            {bestTimeFields.map(f => (
              <div key={f.key}>
                <label htmlFor={`best-${f.key}`} className={labelClass}>{t(f.label)}</label>
                <input
                  id={`best-${f.key}`}
                  className={inputClass}
                  placeholder={f.hint}
                  value={form.bestTimes[f.key] || ''}
                  onChange={e => setForm({ ...form, bestTimes: { ...form.bestTimes, [f.key]: e.target.value.trim() } })}
                />
              </div>
            ))}
          </div>
        </div>

        {error && <p className="text-sm text-red-600">{error}</p>}

        <div className="flex space-x-3">
          <button
            type="button"
            onClick={() => setIsEditing(false)}
            className="flex-1 py-3 rounded-full font-semibold text-gray-700 bg-gray-100 hover:bg-gray-200"
          >
            {t('profile.cancel')}
          </button>
          <button
            type="submit"
            disabled={busy}
            className="flex-1 py-3 rounded-full font-semibold text-white bg-blue-500 hover:bg-blue-600 disabled:opacity-60"
          >
            {busy ? t('profile.saving') : t('profile.save')}
          </button>
        </div>
      </form>
    );
  }

  return (
    <div className="max-w-md mx-auto px-4 py-4 mb-20">
      <div className="bg-gradient-to-r from-blue-500 to-indigo-600 rounded-xl p-6 text-white mb-6">
        <div className="flex items-center space-x-4">
          <Avatar name={displayName} photoURL={photoURL} size="lg" className="ring-2 ring-white/40" />
          <div className="flex-1 min-w-0">
            <h1 className="text-xl font-bold truncate">{displayName}</h1>
            {profile?.homeArea && <p className="text-blue-100 text-sm mt-1">{profile.homeArea}</p>}
          </div>
          <button
            onClick={() => setIsEditing(true)}
            aria-label={t('profile.edit')}
            className="p-2 bg-white/20 rounded-lg hover:bg-white/30 transition-colors"
          >
            <Edit size={18} />
          </button>
        </div>
        {profile?.bio && <p className="text-blue-100 text-sm mt-4">{profile.bio}</p>}
      </div>

      <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 mb-6">
        <h2 className="font-semibold text-gray-900 mb-4 flex items-center">
          <Target size={18} className="mr-2 text-blue-500" />
          {t('profile.paceBands')}
        </h2>
        <div className="space-y-3">
          {paceFields.map(f => (
            <div key={f.key} className="flex justify-between items-center">
              <span className="text-sm text-gray-600">{t(f.label)}</span>
              <div className="flex items-center space-x-2">
                <span className="text-sm font-medium">{paceBand[f.key] ? `${paceBand[f.key]}/km` : '-'}</span>
                <div className={`w-3 h-3 rounded-full ${f.dot}`} />
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 mb-6">
        <h2 className="font-semibold text-gray-900 mb-4 flex items-center">
          <Trophy size={18} className="mr-2 text-yellow-500" />
          {t('profile.records')}
        </h2>
        <div className="grid grid-cols-2 gap-4">
          {bestTimeFields.map(f => (
            <div key={f.key}>
              <div className="text-lg font-bold text-gray-900">{bestTimes[f.key] || '-'}</div>
              <div className="text-sm text-gray-600">{t(f.label)}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 mb-6 flex items-center justify-between">
        <span className="font-semibold text-gray-900">{t('profile.language')}</span>
        <div className="flex bg-gray-100 rounded-full p-1" role="group" aria-label={t('profile.language')}>
          {(Object.keys(languageNames) as Lang[]).map(l => (
            <button
              key={l}
              onClick={() => setLang(l)}
              aria-pressed={lang === l}
              className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                lang === l ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-600'
              }`}
            >
              {languageNames[l]}
            </button>
          ))}
        </div>
      </div>

      <button
        onClick={() => signOut()}
        className="w-full text-left p-4 bg-white rounded-xl shadow-sm border border-gray-100 hover:bg-red-50 text-red-600 transition-colors flex items-center"
      >
        <LogOut size={18} className="mr-3" />
        <span>{t('profile.signOut')}</span>
      </button>
    </div>
  );
};

export default Profile;
