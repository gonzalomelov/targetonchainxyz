import {
  bigint,
  boolean,
  datetime,
  int,
  mysqlEnum,
  mysqlTable,
  primaryKey,
  text,
  varchar,
} from 'drizzle-orm/mysql-core';

export const sessionSchema = mysqlTable('Session', {
  id: varchar('id', { length: 255 }).primaryKey().notNull(),
  shop: varchar('shop', { length: 255 }).notNull(),
  state: varchar('state', { length: 255 }).notNull(),
  isOnline: boolean('isOnline').default(false).notNull(),
  scope: varchar('scope', { length: 255 }),
  expires: datetime('expires'),
  accessToken: varchar('accessToken', { length: 255 }).notNull(),
  userId: bigint('userId', { mode: 'number' }),
  clerkDbJwt: text('clerkDbJwt'),
  storefrontAccessToken: varchar('storefrontAccessToken', {
    length: 255,
  }),
});

export const frameSchema = mysqlTable('Frame', {
  id: int('id').primaryKey().autoincrement().notNull(),
  title: varchar('title', { length: 255 }).notNull(),
  shop: varchar('shop', { length: 255 }).notNull(),
  createdAt: int('createdAt').default(0).notNull(),
  updatedAt: int('updatedAt').default(0).notNull(),
  image: varchar('image', { length: 512 }).notNull(),
  button: varchar('button', { length: 255 }).notNull(),
  matchingCriteria: mysqlEnum('matchingCriteria', [
    'RECEIPTS_XYZ_ALL_TIME_RUNNING',
    'COINBASE_ONCHAIN_VERIFICATIONS_COUNTRY',
    'COINBASE_ONCHAIN_VERIFICATIONS_ACCOUNT',
    'COINBASE_ONCHAIN_VERIFICATIONS_ONE',
    'POAPS_OWNED',
    'NFTS_OWNED',
    'ALL',
  ]).notNull(),
});

export const productSchema = mysqlTable('Product', {
  id: varchar('id', { length: 255 }).primaryKey().notNull(),
  title: varchar('title', { length: 255 }).notNull(),
  description: text('description').notNull(),
  shop: varchar('shop', { length: 255 }).notNull(),
  handle: varchar('handle', { length: 255 }).notNull(),
  variantId: varchar('variantId', { length: 255 }).notNull(),
  variantFormattedPrice: varchar('variantFormattedPrice', {
    length: 255,
  }).notNull(),
  alt: text('alt').notNull(),
  image: varchar('image', { length: 255 }).notNull(),
  createdAt: datetime('createdAt'),
});

export const groupProfileSchema = mysqlTable('GroupProfile', {
  profileText: varchar('profileText', { length: 100 }).primaryKey().notNull(),
  message: text('message'),
  createdAt: int('createdAt').default(0).notNull(),
});

export const groupWalletSchema = mysqlTable(
  'GroupWallet',
  {
    profileText: varchar('profileText', { length: 100 }).notNull(),
    walletAddress: varchar('walletAddress', { length: 255 }).notNull(),
    createdAt: int('createdAt').default(0).notNull(),
  },
  (table) => ({
    pk: primaryKey({ columns: [table.profileText, table.walletAddress] }),
  }),
);

export const groupRecommendationSchema = mysqlTable(
  'GroupRecommendation',
  {
    frameId: int('frameId').notNull(),
    profileText: varchar('profileText', { length: 100 }).notNull(),
    productId: varchar('productId', { length: 255 }).notNull(),
    productTitle: varchar('productTitle', { length: 255 }).notNull(),
    message: text('message').notNull(),
    createdAt: int('createdAt').default(0).notNull(),
  },
  (table) => ({
    pk: primaryKey({
      columns: [table.frameId, table.profileText, table.productId],
    }),
  }),
);
