import React from 'react';

interface GraphicProps {
  imageUrl: string;
  width: number;
  height: number;
}

const Graphic: React.FC<GraphicProps> = ({
  imageUrl,
  width,
  height,
}) => {
  return (
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} xmlns="http://www.w3.org/2000/svg">
      <image href={imageUrl} width="100%" height="100%" />
    </svg>
  );
};

export default Graphic;
