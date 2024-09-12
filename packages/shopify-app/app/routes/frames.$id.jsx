import { json } from "@remix-run/node";
import invariant from "tiny-invariant";
import { useLoaderData } from "@remix-run/react";

import db from "../db.server";
import { getFrameImage } from "../models/Frame.server";

// [START loader]
export const loader = async ({ params }) => {
  invariant(params.id, "Could not find Frame id");

  const id = Number(params.id);
  const frame = await db.frame.findFirst({ where: { id } });

  invariant(frame, "Could not find Frame");

  return json({
    title: frame.title,
    image: await getFrameImage(id, frame.image),
  });
};
// [END loader]

// [START component]
export default function Frame() {
  const { image, title } = useLoaderData();

  return (
    <>
      <h1>{title}</h1>
      <img src={image} alt={`Frame for product`} />
    </>
  );
}
// [START component]
