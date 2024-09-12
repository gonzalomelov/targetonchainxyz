import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { getTranslations } from 'next-intl/server';

export async function generateMetadata(props: { params: { locale: string } }) {
  const t = await getTranslations({
    locale: props.params.locale,
    namespace: 'Support',
  });

  return {
    title: t('meta_title'),
    description: t('meta_description'),
  };
}

export default function Support() {
  const t = useTranslations('Support');

  return (
    <>
      <p>{t('support_paragraph')}</p>

      <p>Our support team is here to help.</p>

      <ul>
        <li>
          Email Support:{' '}
          <Link
            href="mailto:gonzalomelov+support@gmail.com"
            target="_blank"
            className="border-none text-gray-700 hover:text-gray-900"
          >
            gonzalomelov+support@gmail.com
          </Link>
        </li>
        <li>
          WhatsApp Support:
          <a href="https://wa.me/59891271974" target="_blank">
            +598 91 271 974
          </a>
        </li>
        {/* <li>Live Chat: Click the chat icon at the bottom right of the screen to chat with a support agent.</li> */}
      </ul>

      {/* <div className="mt-2 text-center text-sm">
        {`${t('translation_powered_by')} `}
        <a
          className="text-blue-700 hover:border-b-2 hover:border-blue-700"
          href="https://l.crowdin.com/next-js"
          target="_blank"
        >
          Crowdin
        </a>
      </div>

      <a href="https://l.crowdin.com/next-js" target="_blank">
        <Image
          className="mx-auto mt-2"
          src="https://support.crowdin.com/assets/logos/core-logo/svg/crowdin-core-logo-cDark.svg"
          alt="Crowdin Translation Management System"
          width={130}
          height={112}
        />
      </a> */}
    </>
  );
}
