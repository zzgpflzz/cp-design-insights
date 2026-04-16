import { Designer, DESIGNERS } from '@/lib/types';
import Image from 'next/image';
import { useState } from 'react';

interface DesignerBadgeProps {
  designer: Designer;
  size?: 'sm' | 'md' | 'lg';
}

export default function DesignerBadge({ designer, size = 'md' }: DesignerBadgeProps) {
  const [imageError, setImageError] = useState(false);
  const designerInfo = DESIGNERS[designer];

  const sizeClasses = {
    sm: 'text-xs px-3 py-1.5 gap-2',
    md: 'text-sm px-4 py-2 gap-2',
    lg: 'text-base px-5 py-2.5 gap-2.5',
  };

  const imageSizes = {
    sm: 20,
    md: 24,
    lg: 28,
  };

  return (
    <span
      className={`inline-flex items-center rounded-full ${designerInfo.bgColor} ${designerInfo.color} ${sizeClasses[size]} font-semibold`}
    >
      {!imageError ? (
        <Image
          src={designerInfo.profileImage}
          alt={designerInfo.name}
          width={imageSizes[size]}
          height={imageSizes[size]}
          className="rounded-full object-cover"
          onError={() => setImageError(true)}
        />
      ) : (
        <span className="text-base">{designerInfo.emoji}</span>
      )}
      <span>{designerInfo.name}</span>
    </span>
  );
}
