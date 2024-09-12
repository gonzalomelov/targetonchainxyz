import { ImageResponse } from 'next/og';
import React from 'react';

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const url = searchParams.get('url') || '';
  const title = searchParams.get('title') || '';
  const subtitle = searchParams.get('subtitle') || '';
  const content = searchParams.get('content') || '';
  const layoutType = searchParams.get('layoutType') || 'default';

  const styles = {
    container: {
      height: '100%',
      width: '100%',
      display: 'flex',
      backgroundColor: '#fff',
      justifyContent: 'center',
      alignItems: 'center',
      position: 'relative',
    } as React.CSSProperties,
    image: {
      maxWidth: '100%',
      objectFit: 'contain',
    } as React.CSSProperties,
    textContainer: {
      display: 'flex',
      flexDirection: 'column' as 'column',
      alignItems: 'center' as 'center',
      justifyContent: 'center' as 'center',
      padding: 20,
      fontSize: 32,
      fontWeight: 600,
      textAlign: 'center' as 'center',
    } as React.CSSProperties,
    title: {
      marginTop: 40,
    } as React.CSSProperties,
    subtitle: {
      fontSize: 24,
      fontWeight: 400,
      marginTop: 20,
    } as React.CSSProperties,
    content: {
      fontSize: 28,
      fontWeight: 500,
      marginTop: 10,
    } as React.CSSProperties,
    overlay: {
      position: 'absolute',
      bottom: 0,
      width: '100%',
      backgroundColor: 'rgba(0, 0, 0, 0.85)',
      color: 'white',
      padding: '10px 20px',
      textAlign: 'center' as 'center',
      fontSize: '64px',
      fontWeight: '600',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
    } as React.CSSProperties,
  };

  let layout;
  switch (layoutType) {
    case 'fullWidth':
      layout = (
        <div style={styles.container}>
          <img src={url} alt="Product Frame" style={styles.image} />
          <div style={styles.overlay}>{title}</div>
        </div>
      );
      break;
    default:
      layout = (
        <div style={{ ...styles.container, flexDirection: 'row' as 'row' }}>
          <div style={{ flex: 1, display: 'flex' }}>
            <img src={url} alt="Product Frame" width={600} height={630} />
          </div>
          <div style={{ flex: 1, ...styles.textContainer }}>
            <div style={styles.title}>{title}</div>
            <div style={styles.subtitle}>{subtitle}</div>
            <div style={styles.content}>{content}</div>
          </div>
        </div>
      );
  }

  return new ImageResponse(layout, {
    width: 1200,
    height: 630,
  });
}
