import React from 'react';
import type { CardProps } from '../../types';

const Card: React.FC<CardProps> = ({
  children,
  variant = 'default',
  padding = 'md',
  className = '',
}) => {
  const baseClasses = 'rounded-2xl transition-all duration-200';

  const variantClasses = {
    default: 'bg-warm-gray border border-gray-200 shadow-lg',
    elevated: 'bg-warm-gray border border-gray-200 shadow-gold-lg hover:shadow-gold',
    glass: 'glass-effect shadow-lg',
  };

  const paddingClasses = {
    sm: 'p-4',
    md: 'p-6',
    lg: 'p-8',
    xl: 'p-10',
  };

  return (
    <div className={`${baseClasses} ${variantClasses[variant]} ${paddingClasses[padding]} ${className}`}>
      {children}
    </div>
  );
};

export default Card;
