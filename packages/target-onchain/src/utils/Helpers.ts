import { getFrameHtmlResponse } from '@coinbase/onchainkit/frame';

import { AppConfig } from './AppConfig';

export const getBaseUrl = () => {
  if (process.env.NEXT_PUBLIC_APP_URL) {
    return process.env.NEXT_PUBLIC_APP_URL;
  }

  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}`;
  }

  return 'http://localhost:3000';
};

export const getI18nPath = (url: string, locale: string) => {
  if (locale === AppConfig.defaultLocale) {
    return url;
  }

  return `/${locale}${url}`;
};

export const defaultErrorFrame = getFrameHtmlResponse({
  buttons: [
    {
      action: 'link',
      label: 'Learn more',
      target: getBaseUrl(),
    },
  ],
  image: {
    src: 'https://i.imgur.com/HwF6LA3.gif',
  },
  ogDescription: 'Onchain Hyper-Personalization Commerce',
  ogTitle: 'Wallet-aware Commerce',
});
