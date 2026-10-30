import React, { useState } from 'react';
import { Share, X } from 'lucide-react';
import { useI18n } from '../../i18n/context';
import { isInAppBrowser, isIOS, isStandalone } from '../../lib/platform';

const DISMISS_KEY = 'runwith.installHintDismissed';

const wasDismissed = (): boolean => {
  try {
    return localStorage.getItem(DISMISS_KEY) === '1';
  } catch {
    return false;
  }
};

// On iPhone Safari, explain how to add the app to the Home Screen (iOS has no install prompt)
const InstallHint: React.FC<{ className?: string }> = ({ className = '' }) => {
  const { t } = useI18n();
  const [hidden, setHidden] = useState(
    () => !isIOS() || isStandalone() || isInAppBrowser() || wasDismissed()
  );

  if (hidden) return null;

  const dismiss = () => {
    setHidden(true);
    try {
      localStorage.setItem(DISMISS_KEY, '1');
    } catch {
      // Not remembered; it shows again next visit
    }
  };

  return (
    <div className={`flex items-start space-x-3 bg-white border border-gray-200 rounded-xl px-4 py-3 ${className}`}>
      <Share size={18} className="text-blue-600 flex-shrink-0 mt-0.5" />
      <div className="flex-1 text-sm">
        <p className="font-semibold text-gray-900">{t('install.iosTitle')}</p>
        <p className="text-gray-600 mt-0.5">{t('install.iosSteps')}</p>
      </div>
      <button onClick={dismiss} aria-label={t('common.close')} className="text-gray-400 hover:text-gray-600">
        <X size={18} />
      </button>
    </div>
  );
};

export default InstallHint;
