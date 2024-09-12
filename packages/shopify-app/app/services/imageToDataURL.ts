import React from 'react';
import ReactDOMServer from 'react-dom/server';
import Graphic from './Graphic';

export type ImageToDataURLOptions = {
  width?: number;
  height?: number;
};

export function imageToDataURL(
  imageUrl: string,
  options: ImageToDataURLOptions = {}
): string {
  const defaultOptions: Required<ImageToDataURLOptions> = {
    width: 200,
    height: 200,
  };

  const opts = { ...defaultOptions, ...options };

  // Create the React element using React.createElement
  const svgElement = React.createElement(Graphic, {
    imageUrl,
    width: opts.width,
    height: opts.height,
  });

  // Render the component to static SVG markup
  const svgString = ReactDOMServer.renderToStaticMarkup(svgElement);

  // Convert SVG to Data URI
  const svgDataUri = `data:image/svg+xml;base64,${Buffer.from(svgString).toString('base64')}`;

  return svgDataUri;
}
