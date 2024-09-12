import fs from 'fs';
import { NextResponse } from 'next/server';
import path from 'path';
import { URL } from 'url';

const fetchShops = async (creator?: string, search?: string) => {
  const jsonFilePath = path.join(process.cwd(), 'data', 'stores.json');
  const jsonData = fs.readFileSync(jsonFilePath, 'utf8');
  const slicersData = JSON.parse(jsonData);

  let filteredSlicers = slicersData;

  if (creator) {
    filteredSlicers = filteredSlicers.filter(
      (slicer: any) =>
        slicer.creatorAddress &&
        slicer.creatorAddress.toLowerCase() === creator,
    );
  }

  if (search) {
    filteredSlicers = filteredSlicers.filter((slicer: any) =>
      slicer.name.toLowerCase().includes(search.toLowerCase()),
    );
  }

  // Create a new array with maxReferralFee added to each slicer
  const slicersWithReferralFee = filteredSlicers.map((slicer: any) => ({
    ...slicer,
    maxReferralFee:
      Math.max(
        ...slicer.products.map((product: any) =>
          parseInt(product.referralFeeProduct || '0', 10),
        ),
      ) / 100,
  }));

  // Sort the stores by the maximum referral fee
  slicersWithReferralFee.sort(
    (a: any, b: any) => b.maxReferralFee - a.maxReferralFee,
  );

  return slicersWithReferralFee;
};

export const GET = async (req: Request) => {
  const url = new URL(req.url);
  const creator = url.searchParams.get('creator')?.toLowerCase() || undefined;
  const search = url.searchParams.get('search')?.toLowerCase() || undefined;

  const shops = await fetchShops(creator, search);

  return NextResponse.json(shops);
};
