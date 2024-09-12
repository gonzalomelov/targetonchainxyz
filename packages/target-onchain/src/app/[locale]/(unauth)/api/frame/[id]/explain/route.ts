import type { FrameRequest } from '@coinbase/onchainkit/frame';
import {
  getFrameHtmlResponse,
  getFrameMessage,
} from '@coinbase/onchainkit/frame';
import { NextResponse } from 'next/server';

import { Env } from '@/libs/Env';
import { logger } from '@/libs/Logger';
import { defaultErrorFrame, getBaseUrl } from '@/utils/Helpers';

export const POST = async (req: Request) => {
  const body: FrameRequest = await req.json();

  const { isValid, message } = await getFrameMessage(body, {
    neynarApiKey: Env.NEYNAR_API_KEY,
  });

  if (!isValid) {
    logger.info('Message not valid');
    return new NextResponse(defaultErrorFrame);
  }

  let state = {
    description: '',
  };
  try {
    state = JSON.parse(decodeURIComponent(message.state?.serialized));
  } catch (e) {
    console.error(e);
  }

  return new NextResponse(
    getFrameHtmlResponse({
      buttons: [
        {
          action: 'link',
          label: 'Learn more',
          target: getBaseUrl(),
        },
      ],
      image: {
        src: `${getBaseUrl()}/api/og?title=${encodeURIComponent('Why is this product recommended?')}&subtitle=${encodeURIComponent(state.description)}&content=&url=https://i.imgur.com/RHsQP4b.jpg`,
      },
      ogDescription: 'Target Onchain',
      ogTitle: 'Target Onchain',
    }),
  );
};
