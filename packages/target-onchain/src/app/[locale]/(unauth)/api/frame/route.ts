// import { eq } from 'drizzle-orm';
import { NextResponse } from 'next/server';

import { db } from '@/libs/DB';
import { logger } from '@/libs/Logger';
import { frameSchema } from '@/models/Schema';
import {
  // DeleteFrameValidation,
  // EditFrameValidation,
  FrameValidation,
} from '@/validations/FrameValidation';

export const POST = async (request: Request) => {
  const json = await request.json();
  const parse = FrameValidation.safeParse(json);

  if (!parse.success) {
    return NextResponse.json(parse.error.format(), { status: 422 });
  }

  try {
    const frame = await db.insert(frameSchema).values(parse.data);

    logger.info('A new frame has been created');

    return NextResponse.json({
      id: frame[0]?.insertId,
    });
  } catch (error) {
    logger.error(error, 'An error occurred while creating a frame');

    return NextResponse.json({}, { status: 500 });
  }
};

// export const PUT = async (request: Request) => {
//   const json = await request.json();
//   const parse = EditFrameValidation.safeParse(json);

//   if (!parse.success) {
//     return NextResponse.json(parse.error.format(), { status: 422 });
//   }

//   try {
//     await db
//       .update(frameSchema)
//       .set({
//         ...parse.data,
//         // updatedAt: sql`(strftime('%s', 'now'))`,
//       })
//       .where(eq(frameSchema.id, parse.data.id));

//     logger.info('A frame entry has been updated');

//     return NextResponse.json({});
//   } catch (error) {
//     logger.error(error, 'An error occurred while updating a frame');

//     return NextResponse.json({}, { status: 500 });
//   }
// };

// export const DELETE = async (request: Request) => {
//   const json = await request.json();
//   const parse = DeleteFrameValidation.safeParse(json);

//   if (!parse.success) {
//     return NextResponse.json(parse.error.format(), { status: 422 });
//   }

//   try {
//     await db.delete(frameSchema).where(eq(frameSchema.id, parse.data.id));

//     logger.info('A frame entry has been deleted');

//     return NextResponse.json({});
//   } catch (error) {
//     logger.error(error, 'An error occurred while deleting a frame');

//     return NextResponse.json({}, { status: 500 });
//   }
// };
