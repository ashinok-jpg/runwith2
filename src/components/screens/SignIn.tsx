import React, { useState } from 'react';
import { MapPin, Users, Zap } from 'lucide-react';
import { FirebaseError } from 'firebase/app';
import { useAuth } from '../../lib/authContext';
import { useI18n } from '../../i18n/context';
import type { MessageKey } from '../../i18n/strings';
import LanguageToggle from '../common/LanguageToggle';
import { isInAppBrowser } from '../../lib/platform';

const signInErrorKey = (err: unknown): MessageKey | null => {
  if (err instanceof FirebaseError) {
    switch (err.code) {
      case 'auth/popup-closed-by-user':
      case 'auth/cancelled-popup-request':
        return null;
      case 'auth/operation-not-allowed':
        return 'signin.error.notEnabled';
      case 'auth/unauthorized-domain':
        return 'signin.error.unauthorizedDomain';
      case 'auth/network-request-failed':
        return 'signin.error.network';
    }
  }
  return 'signin.error.generic';
};

const SignIn: React.FC = () => {
  const { signInWithGoogle } = useAuth();
  const { t } = useI18n();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<MessageKey | null>(null);

  const handleSignIn = async () => {
    setBusy(true);
    setError(null);
    try {
      await signInWithGoogle();
    } catch (err) {
      console.error('Sign-in failed', err);
      setError(signInErrorKey(err));
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="relative min-h-[100dvh] bg-blue-600 flex flex-col">
      <LanguageToggle className="absolute top-4 right-4 bg-white/15 text-white hover:bg-white/25" />
      <div className="flex-1 flex flex-col justify-center max-w-md w-full mx-auto px-6 py-12 text-white">
        <div className="w-14 h-14 bg-white/20 rounded-2xl flex items-center justify-center mb-6">
          <span className="text-2xl font-bold">R</span>
        </div>
        <h1 className="text-4xl font-bold tracking-tight">Runwith</h1>
        <p className="text-blue-100 text-lg mt-3">{t('signin.tagline')}</p>

        <ul className="mt-10 space-y-4">
          {[
            { icon: MapPin, text: t('signin.feature.map') },
            { icon: Zap, text: t('signin.feature.match') },
            { icon: Users, text: t('signin.feature.group') },
          ].map(({ icon: Icon, text }) => (
            <li key={text} className="flex items-center space-x-3">
              <div className="w-9 h-9 bg-white/15 rounded-full flex items-center justify-center flex-shrink-0">
                <Icon size={18} />
              </div>
              <span className="text-blue-50">{text}</span>
            </li>
          ))}
        </ul>
      </div>

      <div className="max-w-md w-full mx-auto px-6 pb-10 pb-safe">
        {isInAppBrowser() && (
          <div role="alert" className="mb-3 text-sm bg-white text-gray-900 rounded-xl px-4 py-3">
            <p className="font-semibold">{t('install.inAppTitle')}</p>
            <p className="text-gray-600 mt-0.5">{t('install.inAppSteps')}</p>
          </div>
        )}
        {error && <p className="mb-3 text-sm bg-white/15 text-white rounded-lg px-3 py-2">{t(error)}</p>}
        <button
          onClick={handleSignIn}
          disabled={busy}
          className="w-full flex items-center justify-center space-x-3 bg-white text-gray-900 font-semibold rounded-full py-3.5 shadow-lg hover:bg-gray-50 active:scale-[0.98] transition-all disabled:opacity-70"
        >
          <svg width="18" height="18" viewBox="0 0 48 48" aria-hidden="true">
            <path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3C33.7 32.7 29.2 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34 6.1 29.3 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.4-.4-3.5z" />
            <path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.7 15.1 19 12 24 12c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34 6.1 29.3 4 24 4 16.3 4 9.7 8.3 6.3 14.7z" />
            <path fill="#4CAF50" d="M24 44c5.2 0 9.9-2 13.4-5.2l-6.2-5.2C29.2 35.1 26.7 36 24 36c-5.2 0-9.6-3.3-11.3-8l-6.5 5C9.5 39.6 16.2 44 24 44z" />
            <path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-.8 2.2-2.2 4.2-4.1 5.6l6.2 5.2C37 39.2 44 34 44 24c0-1.3-.1-2.4-.4-3.5z" />
          </svg>
          <span>{busy ? t('signin.busy') : t('signin.button')}</span>
        </button>
      </div>
    </div>
  );
};

export default SignIn;
