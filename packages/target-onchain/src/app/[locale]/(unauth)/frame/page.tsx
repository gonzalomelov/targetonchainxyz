import { useTranslations } from 'next-intl';
import { getTranslations } from 'next-intl/server';
import { Suspense } from 'react';

import { AddFrameForm } from '@/components/AddFrameForm';
import { FrameList } from '@/components/FrameList';

export async function generateMetadata(props: { params: { locale: string } }) {
  const t = await getTranslations({
    locale: props.params.locale,
    namespace: 'Frame',
  });

  return {
    title: t('meta_title'),
    description: t('meta_description'),
  };
}

const Frame = () => {
  const t = useTranslations('Frame');

  return (
    <>
      <AddFrameForm />

      <Suspense fallback={<p>{t('loading_frame')}</p>}>
        <FrameList />
      </Suspense>
    </>
  );
};

export default Frame;
