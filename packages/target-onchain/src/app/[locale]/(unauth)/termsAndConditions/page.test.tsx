import { render, screen } from '@testing-library/react';
import { NextIntlClientProvider } from 'next-intl';

import messages from '@/locales/en.json';

import TermsAndConditions from './page';

describe('Terms and Conditions page', () => {
  describe('Render method', () => {
    it('should have a text starting with `Welcome to the Onchain Hyper-Personalization Shopify App`', () => {
      render(
        <NextIntlClientProvider locale="en" messages={messages}>
          <TermsAndConditions />
        </NextIntlClientProvider>,
      );

      const paragraph = screen.getByText(
        /Welcome to the Onchain Hyper-Personalization Shopify App/,
      );

      expect(paragraph).toBeInTheDocument();
    });
  });
});
