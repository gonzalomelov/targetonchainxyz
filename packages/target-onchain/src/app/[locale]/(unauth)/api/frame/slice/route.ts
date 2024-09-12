import { getStoreProducts } from '@slicekit/core'; // TODO: Remove if moved to the recommender
import { createConfig, http } from '@wagmi/core';
import { base } from '@wagmi/core/chains';
import { sql } from 'drizzle-orm';
import { NextResponse } from 'next/server';

import { db } from '@/libs/DB';
import { logger } from '@/libs/Logger';
import { frameSchema, productSchema } from '@/models/Schema';
import { defaultErrorFrame, getBaseUrl } from '@/utils/Helpers';
import { FrameValidation } from '@/validations/FrameValidation';

const config = createConfig({
  chains: [base],
  transports: {
    [base.id]: http(`https://mainnet.base.org`),
  },
});

export const POST = async (request: Request) => {
  const json = await request.json();
  const parse = FrameValidation.safeParse(json);

  if (!parse.success) {
    return NextResponse.json(parse.error.format(), { status: 422 });
  }

  try {
    const url = new URL(parse.data.shop);
    const urlParts = url.pathname.split('/');
    const idPart = urlParts[urlParts.length - 1];

    if (!idPart) {
      logger.info('Invalid URL structure', { idPart });
      return NextResponse.json(
        { error: 'Invalid URL structure' },
        { status: 422 },
      );
    }

    const slicerId = parseInt(idPart, 10);

    if (Number.isNaN(slicerId)) {
      logger.info('Invalid ID', { idPart });
      return new NextResponse(defaultErrorFrame);
    }

    const products = await getStoreProducts(config, { slicerId });

    const upsertOperations = products.cartProducts.map((product) => {
      const image = product.images.length > 0 ? product.images[0] : null;
      const { currency } = product; // Assuming product.currency contains the currency address
      let formattedPrice;

      if (currency === '0x0000000000000000000000000000000000000000') {
        formattedPrice = `${((product.price as unknown as number) / 10 ** 18).toFixed(2)} ETH`;
      } else if (currency === '0x833589fcd6edb6e08f4c7c32d4f71b54bda02913') {
        formattedPrice = `${((product.price as unknown as number) / 1_000_000).toFixed(2)} USDC`;
      } else {
        formattedPrice = `${((product.price as unknown as number) / 1_000_000).toFixed(2)} UNKNOWN`;
      }

      return {
        id: `${slicerId.toString()}-${product.productId.toString()}`,
        title: product.name,
        description: product.shortDescription!,
        shop: parse.data.shop,
        handle: product.productId.toString(),
        variantId: product.externalVariantId
          ? product.externalVariantId.toString()
          : product.productId.toString(),
        variantFormattedPrice: formattedPrice,
        alt: product.name,
        image:
          image || `${getBaseUrl()}/assets/images/slice-product-default.png`,
        createdAt: new Date(),
      };
    });

    if (upsertOperations.length > 0) {
      await db
        .insert(productSchema)
        .values(upsertOperations)
        .onDuplicateKeyUpdate({
          set: {
            title: sql`values(title)`,
            description: sql`values(description)`,
            shop: sql`values(shop)`,
            handle: sql`values(handle)`,
            variantId: sql`values(variantId)`,
            variantFormattedPrice: sql`values(variantFormattedPrice)`,
            alt: sql`values(alt)`,
            image: sql`values(image)`,
            createdAt: sql`values(createdAt)`,
          },
        });
    }

    const frame = await db.insert(frameSchema).values(parse.data);

    return NextResponse.json({
      id: frame[0]?.insertId,
    });
  } catch (error) {
    logger.error(error, 'An error occurred while creating a frame');

    return NextResponse.json({}, { status: 500 });
  }
};
