import React from 'react';

interface LogoProps {
  width?: number;
  height?: number;
}

export const Logo: React.FC<LogoProps> = ({ width = 28, height = 28 }) => {
  return (
    <svg
      width={width}
      height={height}
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Twin3 Logo - Stylized half circle */}
      <circle cx="50" cy="50" r="45" fill="none" stroke="white" strokeWidth="3" />
      <path
        d="M50 5 A45 45 0 0 1 50 95"
        fill="white"
        opacity="0.9"
      />
      <circle cx="50" cy="50" r="12" fill="black" />
    </svg>
  );
};
