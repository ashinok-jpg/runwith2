import React from 'react';
import { ArrowLeft, MapPin, Target, Trophy } from 'lucide-react';
import BottomSheet from '../common/BottomSheet';
import Avatar from '../common/Avatar';
import { useAuth } from '../../lib/authContext';
import { useProfile } from '../../lib/profiles';
import { useI18n } from '../../i18n/context';
import type { MessageKey } from '../../i18n/strings';
import type { BestTimes, PaceBand } from '../../types';
import { getPaceMatch, paceMatchColor, parsePace } from '../../utils/matching';

interface RunnerProfileSheetProps {
  uid: string;
  // Shown while the profile loads, and if the runner never created one
  fallbackName: string;
  fallbackPhotoURL?: string | null;
  onBack: () => void;
  onClose: () => void;
}

const paceFields: { key: keyof PaceBand; label: MessageKey; dot: string }[] = [
  { key: 'easy', label: 'pace.easy', dot: 'bg-green-500' },
  { key: 'mp', label: 'pace.mp', dot: 'bg-blue-500' },
  { key: 'threshold', label: 'pace.threshold', dot: 'bg-orange-500' },
];

const bestTimeFields: { key: keyof BestTimes; label: MessageKey }[] = [
  { key: 'fiveK', label: 'best.fiveK' },
  { key: 'tenK', label: 'best.tenK' },
  { key: 'half', label: 'best.half' },
  { key: 'full', label: 'best.full' },
];

const RunnerProfileSheet: React.FC<RunnerProfileSheetProps> = ({
  uid,
  fallbackName,
  fallbackPhotoURL,
  onBack,
  onClose,
}) => {
  const { user, profile: myProfile } = useAuth();
  const { t } = useI18n();
  const { profile, loading } = useProfile(uid);

  const name = profile?.displayName || fallbackName;
  const isMe = user?.uid === uid;
  const paceBand = profile?.paceBand ?? {};
  const bestTimes = profile?.bestTimes ?? {};
  const hasRecords = bestTimeFields.some(f => bestTimes[f.key]);

  // Compare their usual easy run with the viewer's pace band
  const theirPace = parsePace(paceBand.easy) ?? parsePace(paceBand.mp) ?? parsePace(paceBand.threshold);
  const match = theirPace === null ? null : getPaceMatch(theirPace, myProfile);

  return (
    <BottomSheet
      title={name}
      onClose={onClose}
      footer={
        <button
          onClick={onBack}
          className="w-full flex items-center justify-center space-x-2 py-3 rounded-full font-semibold text-gray-700 bg-gray-100 hover:bg-gray-200 transition-colors"
        >
          <ArrowLeft size={18} />
          <span>{t('runner.back')}</span>
        </button>
      }
    >
      <div className="space-y-5">
        <div className="flex items-center space-x-4">
          <Avatar name={name} photoURL={profile?.photoURL ?? fallbackPhotoURL} size="lg" />
          <div className="min-w-0">
            <div className="text-lg font-semibold text-gray-900 truncate">
              {name}
              {isMe && <span className="text-gray-400 font-normal"> · {t('detail.you')}</span>}
            </div>
            {profile?.homeArea && (
              <div className="flex items-center space-x-1 text-sm text-gray-500 mt-0.5">
                <MapPin size={14} />
                <span className="truncate">{profile.homeArea}</span>
              </div>
            )}
          </div>
        </div>

        {loading ? (
          <p className="text-sm text-gray-500">{t('detail.loading')}</p>
        ) : !profile ? (
          <p className="text-sm text-gray-500">{t('runner.notFound')}</p>
        ) : (
          <>
            {profile.bio && <p className="text-sm text-gray-700 whitespace-pre-wrap">{profile.bio}</p>}

            {!isMe && (
              <div className="bg-gray-50 rounded-xl p-3">
                <div className="text-sm font-semibold text-gray-900 mb-1.5">{t('runner.compat')}</div>
                {match ? (
                  <span className={`inline-block text-xs font-medium px-2.5 py-1 rounded-full ${paceMatchColor[match]}`}>
                    {t(`match.${match}`)}
                  </span>
                ) : (
                  <p className="text-sm text-gray-500">{t('runner.noPace')}</p>
                )}
              </div>
            )}

            <div>
              <h3 className="text-sm font-semibold text-gray-900 mb-2 flex items-center">
                <Target size={16} className="mr-1.5 text-blue-500" />
                {t('profile.paceBands')}
              </h3>
              <div className="space-y-2">
                {paceFields.map(f => (
                  <div key={f.key} className="flex justify-between items-center text-sm">
                    <span className="text-gray-600">{t(f.label)}</span>
                    <div className="flex items-center space-x-2">
                      <span className="font-medium">{paceBand[f.key] ? `${paceBand[f.key]}/km` : '-'}</span>
                      <div className={`w-2.5 h-2.5 rounded-full ${f.dot}`} />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {hasRecords && (
              <div>
                <h3 className="text-sm font-semibold text-gray-900 mb-2 flex items-center">
                  <Trophy size={16} className="mr-1.5 text-yellow-500" />
                  {t('profile.records')}
                </h3>
                <div className="grid grid-cols-2 gap-3">
                  {bestTimeFields
                    .filter(f => bestTimes[f.key])
                    .map(f => (
                      <div key={f.key}>
                        <div className="font-bold text-gray-900">{bestTimes[f.key]}</div>
                        <div className="text-xs text-gray-500">{t(f.label)}</div>
                      </div>
                    ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </BottomSheet>
  );
};

export default RunnerProfileSheet;
