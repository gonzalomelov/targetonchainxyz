import { render, screen } from '@testing-library/react';
import { NextIntlClientProvider } from 'next-intl';

import messages from '@/locales/en.json';

import Support from './page';

describe('Support page', () => {
  describe('Render method', () => {
    it('should have a text starting with `Welcome to our Support page`', () => {
      render(
        <NextIntlClientProvider locale="en" messages={messages}>
          <Support />
        </NextIntlClientProvider>,
      );

      const paragraph = screen.getByText(/Welcome to our Support page/);

      expect(paragraph).toBeInTheDocument();
    });
  });
});
