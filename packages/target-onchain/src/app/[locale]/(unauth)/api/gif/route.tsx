import { applyPalette, GIFEncoder, quantize } from 'gifenc';
import { ImageResponse } from 'next/og';
import fetch from 'node-fetch';
import sharp from 'sharp';

export async function GET(req: Request): Promise<Response> {
  const { searchParams } = new URL(req.url);
  const url = searchParams.get('url') || '';
  const title = searchParams.get('title') || '';
  const subtitle = searchParams.get('subtitle') || '';
  const content = searchParams.get('content') || '';
  const text = searchParams.get('text') || '';

  // Load the image once
  const imageBuffer = await fetch(url)
    .then((res) => res.arrayBuffer())
    .then((arrayBuffer) => Buffer.from(arrayBuffer));

  // Function to create a product frame
  const createProductFrame = async (
    frameTitle: string,
    frameSubtitle: string,
  ): Promise<Uint8ClampedArray> => {
    const response = new ImageResponse(
      (
        <div
          style={{
            height: '100%',
            width: '100%',
            display: 'flex',
            flexDirection: 'row',
            backgroundColor: '#fff',
          }}
        >
          <div
            style={{
              flex: 1,
              display: 'flex',
            }}
          >
            {/*
            We are using <img> here because next/image cannot be
            used in server-side code within ImageResponse. This
            is necessary to generate dynamic images on the server.
          */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={url} alt="Product Frame" width={600} height={630} />
          </div>
          <div
            style={{
              flex: 1,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'flex-start',
              justifyContent: 'center',
              padding: 20,
              fontSize: 58,
              fontWeight: 600,
            }}
          >
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
              }}
            >
              <div>{frameTitle}</div>
              <div style={{ fontSize: 48, fontWeight: 400, marginTop: 20 }}>
                {frameSubtitle}
              </div>
              <div style={{ fontSize: 48, fontWeight: 500, marginTop: 10 }}>
                {content}
              </div>
            </div>
          </div>
        </div>
      ),
      { width: 1200, height: 630 },
    );

    const frameBuffer = await sharp(imageBuffer)
      .resize(600, 630)
      .extend({
        top: 0,
        bottom: 0,
        left: 0,
        right: 600,
        background: '#fff',
      })
      .composite([
        { input: Buffer.from(await response.arrayBuffer()), gravity: 'east' },
      ])
      .raw()
      .ensureAlpha()
      .toBuffer();

    return new Uint8ClampedArray(frameBuffer);
  };

  // Function to create a text frame using next/og
  const createTextFrame = async (
    frameText: string,
  ): Promise<Uint8ClampedArray> => {
    const response = new ImageResponse(
      (
        <div
          style={{
            height: '100%',
            width: '100%',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: '#fff',
            fontSize: 48,
            fontWeight: 600,
          }}
        >
          <div
            style={{
              width: '90%',
            }}
          >
            {frameText}
          </div>
        </div>
      ),
      { width: 1200, height: 630 },
    );

    const frameBuffer = await sharp(await response.arrayBuffer())
      .resize(1200, 630)
      .extend({
        top: 0,
        bottom: 0,
        left: 0,
        right: 0,
        background: '#fff',
      })
      .raw()
      .ensureAlpha()
      .toBuffer();

    return new Uint8ClampedArray(frameBuffer);
  };

  // Create frames
  const frame1 = await createTextFrame(text);
  const frame2 = await createProductFrame(title, subtitle);

  // Generate palettes and apply them
  const palette1 = quantize(frame1, 256);
  const index1 = applyPalette(frame1, palette1);
  const palette2 = quantize(frame2, 256);
  const index2 = applyPalette(frame2, palette2);

  // Initialize GIF encoder
  const encoder = GIFEncoder();
  encoder.writeFrame(index1, 1200, 630, { palette: palette1, delay: 10000 });
  encoder.writeFrame(index2, 1200, 630, { palette: palette2, delay: 10000 });
  encoder.finish();

  // Get the Uint8ClampedArray output of the binary GIF file
  const gifBuffer = Buffer.from(encoder.bytes());

  return new Response(gifBuffer, {
    headers: { 'Content-Type': 'image/gif' },
  });
}
