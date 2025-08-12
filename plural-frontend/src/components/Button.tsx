
import React from 'react';
import { ButtonProps } from '@/types';

export default function Button({ children, className, ...props }: ButtonProps) {
  return (
    <button
      className={`w-full bg-[#63A6A0] text-white py-2 rounded-lg hover:bg-[#63A6A0]/50 transition-colors ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}