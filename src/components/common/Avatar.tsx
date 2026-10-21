import React from 'react';

interface AvatarProps {
  name: string;
  photoURL?: string | null;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const sizeClasses = {
  sm: 'w-7 h-7 text-xs',
  md: 'w-10 h-10 text-sm',
  lg: 'w-16 h-16 text-2xl',
};

const Avatar: React.FC<AvatarProps> = ({ name, photoURL, size = 'md', className = '' }) => (
  <div
    className={`${sizeClasses[size]} rounded-full bg-gradient-to-r from-indigo-400 to-indigo-600 text-white font-semibold flex items-center justify-center overflow-hidden flex-shrink-0 ${className}`}
  >
    {photoURL ? (
      <img src={photoURL} alt={name} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
    ) : (
      <span>{(name || '?')[0].toUpperCase()}</span>
    )}
  </div>
);

export default Avatar;
