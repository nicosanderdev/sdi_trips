import React from 'react';
import type { OutlineNumberProps } from '../../types';

const OutlineNumber: React.FC<OutlineNumberProps> = ({
  number,
  size = '3xl',
  className = '',
}) => {
  const sizeClasses = {
    sm: 'text-2xl',
    md: 'text-4xl',
    lg: 'text-6xl',
    xl: 'text-8xl',
    '2xl': 'text-9xl',
    '3xl': 'text-[12rem] md:text-[16rem]',
  };

  return (
    <span className={`outline-number font-thin ${sizeClasses[size]} ${className}`}>
      {number}
    </span>
  );
};

export default OutlineNumber;
