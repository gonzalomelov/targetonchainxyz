import { z } from 'zod';

export const MatchingCriteriaEnumSchema = z.enum([
  'RECEIPTS_XYZ_ALL_TIME_RUNNING',
  'COINBASE_ONCHAIN_VERIFICATIONS_COUNTRY',
  'COINBASE_ONCHAIN_VERIFICATIONS_ACCOUNT',
  'COINBASE_ONCHAIN_VERIFICATIONS_ONE',
  'POAPS_OWNED',
  'ALL',
]);

export type MatchingCriteriaEnum = z.infer<typeof MatchingCriteriaEnumSchema>;

export const FrameValidation = z.object({
  creator: z.string().min(1).optional(), // TODO: Use with commercePlatform. If not, delete
  title: z.string().min(1),
  shop: z.string().min(1),
  image: z.string().min(1),
  button: z.string().min(1),
  matchingCriteria: MatchingCriteriaEnumSchema,
});

// export const EditFrameValidation = z.object({
//   id: z.coerce.number(),
//   creator: z.string().min(1).optional(), // TODO: Use with commercePlatform. If not, delete
//   title: z.string().min(1),
//   shop: z.string().min(1),
//   image: z.string().min(1),
//   button: z.string().min(1),
//   matchingCriteria: MatchingCriteriaEnumSchema,
// });

// export const DeleteFrameValidation = z.object({
//   id: z.coerce.number(),
// });

export const FrameDefaultValues = FrameValidation.partial();
