import React from 'react';
import { useI18n } from '../../i18n/context';

interface LanguageToggleProps {
  className?: string;
}

const LanguageToggle: React.FC<LanguageToggleProps> = ({ className = '' }) => {
  const { lang, setLang, t } = useI18n();

  return (
    <button
      onClick={() => setLang(lang === 'en' ? 'ja' : 'en')}
      aria-label={t('lang.toggleLabel')}
      title={t('lang.toggleLabel')}
      className={`min-w-[2.25rem] h-9 px-2 rounded-lg text-xs font-semibold transition-colors ${className}`}
    >
      {t('lang.toggleShort')}
    </button>
  );
};

export default LanguageToggle;
