import { useEffect, useState } from 'react';

const getDimensions = () => {
  const { innerWidth: width, innerHeight: height } = window;
  return { width, height };
};

export const useWindowDimensions = () => {
  const [dimensions, setDimensions] = useState(getDimensions());

  useEffect(() => {
    const handleResize = () => setDimensions(getDimensions());
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return dimensions;
};
