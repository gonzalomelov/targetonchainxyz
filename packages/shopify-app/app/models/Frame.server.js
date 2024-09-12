import invariant from "tiny-invariant";
import db from "../db.server";
/**
 * @typedef {import('../services/imageToDataURL').ImageToDataURLOptions} ImageToDataURLOptions
 */
import { imageToDataURL } from '../services/imageToDataURL';

// [START get-frame]
export async function getFrame(id, graphql) {
  const frame = await db.frame.findFirst({ where: { id } });

  if (!frame) {
    return null;
  }

  return supplementFrame(frame, graphql);
}
// [END get-frame]

// [START get-frames]
export async function getFrames(shop, graphql) {
  const frames = await db.frame.findMany({
    where: { shop },
    orderBy: { id: "desc" },
  });

  if (frames.length === 0) return [];

  return Promise.all(
    frames.map((frame) => supplementFrame(frame, graphql))
  );
}
// [END get-frames]

// [START get-frame-image]
export function getFrameImage(id, imageUrl) {
  /** @type {ImageToDataURLOptions} */
  const opts = {
    width: 300,
    height: 300,
  };

  return imageToDataURL(imageUrl, opts);
}
// [END get-frame-image]

// [START hydrate-frame]
async function supplementFrame(frame, graphql) {
  // const frameImagePromise = getFrameImage(frame.id, frame.image);

  const frameProducts = await db.product.findMany({
    where: { shop: frame.shop },
    orderBy: { id: "desc" },
  });

  return {
    ...frame,
    // image: await frameImagePromise,
    products: frameProducts,
  };
}
// [END hydrate-frame]

// [START validate-frame]
export function validateFrame(data) {
  const errors = {};

  if (!data.title) {
    errors.title = "Title is required";
  }

  if (!data.products || data.products.length === 0) {
    errors.products = "Products are required";
  }

  if (Object.keys(errors).length) {
    return errors;
  }
}
// [END validate-frame]
