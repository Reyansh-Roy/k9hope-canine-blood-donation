// components/ui/rolecard.tsx
import React from 'react';
import Image from 'next/image';
import { ArrowRightIcon } from '@heroicons/react/24/outline';

export interface RoleCardProps {
  image: string;
  title: string;
  description: string;
  onClick?: () => void;
  comingSoon?: boolean;
}

const RoleCard: React.FC<RoleCardProps> = ({ image, title, description, onClick, comingSoon }) => {
  return (
    <div
      onClick={comingSoon ? undefined : onClick}
      className={`flex items-center p-4 border rounded-lg transition duration-200 select-none ${comingSoon
          ? "opacity-60 cursor-not-allowed pointer-events-none border-gray-200"
          : "hover:shadow-lg transform hover:scale-105 cursor-pointer"
        }`}
    >
      {/* Fixed-size image */}
      <div className="relative w-16 h-16 flex-shrink-0">
        <Image
          src={image}
          alt={title}
          fill
          draggable={false}
          onDragStart={(e) => e.preventDefault()}
          onContextMenu={(e) => e.preventDefault()}
          className="rounded-md object-cover select-none"
        />
      </div>

      {/* Title and description */}
      <div className="ml-4 flex-grow">
        <div className="flex items-center gap-2">
          <h3 className="text-lg font-semibold">{title}</h3>
          {comingSoon && (
            <span className="text-[10px] font-bold uppercase tracking-wider bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full border border-gray-200">
              Coming Soon
            </span>
          )}
        </div>
        <p className="text-sm text-gray-500">{description}</p>
      </div>

      {/* Right arrow icon */}
      {!comingSoon && <ArrowRightIcon className="w-6 h-6 text-gray-400 flex-shrink-0" />}
    </div>
  );
};

export default RoleCard;
