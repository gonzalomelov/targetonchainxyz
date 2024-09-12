'use client';

import { getBaseUrl } from '@/utils/Helpers';

import { FrameForm } from './FrameForm';

const AddComposerFrameForm = (props: { creator: string }) => (
  <FrameForm
    defaultValues={{
      creator: props.creator,
      matchingCriteria: 'ALL',
      button: 'Show',
    }}
    onValid={async (data) => {
      const response = await fetch(`/api/frame/slice`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      const frame = await response.json();

      window.parent.postMessage(
        {
          type: 'createCast',
          data: {
            cast: {
              text: 'Tap to see what’s waiting for you in our store!',
              embeds: [`${getBaseUrl()}/api/frame/${frame.id}/html`],
            },
          },
        },
        '*',
      );
    }}
  />
);

export { AddComposerFrameForm };
