// Browser checks for installing the app and signing in

const ua = () => navigator.userAgent;

export const isIOS = (): boolean =>
  /iPhone|iPad|iPod/.test(ua()) ||
  // iPadOS reports itself as a Mac
  (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);

// Already opened from the Home Screen icon
export const isStandalone = (): boolean =>
  window.matchMedia('(display-mode: standalone)').matches ||
  (navigator as Navigator & { standalone?: boolean }).standalone === true;

// Instagram, Facebook and LINE open links in their own browser, where Google blocks sign-in
// and "Add to Home Screen" isn't offered
export const isInAppBrowser = (): boolean => /Instagram|FBAN|FBAV|Line\//i.test(ua());
