import { getTranslations } from 'next-intl/server';

import { AddComposerFrameForm } from '@/components/AddComposerFrameForm';

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

const Frame = (req: any) => {
  const { searchParams } = req;
  const { creator } = searchParams;

  return <AddComposerFrameForm creator={creator} />;
};

export default Frame;
