// StakeCard.tsx
"use client";

import React from "react";

interface StakeCardProps {
  nft: { id: string; image: string; name: string };
  isSelected: boolean;
  onSelect: () => void;
}

const StakeCard: React.FC<StakeCardProps> = ({ nft, isSelected, onSelect }) => {
  return (
    <div
      onClick={onSelect}
      className={`relative cursor-pointer group transform transition-all duration-300 ${
        isSelected
          ? "scale-95 ring-2 ring-blue-400 shadow-glow"
          : "hover:scale-95 ring-1 ring-[#ffffff15]"
      } rounded-xl overflow-hidden bg-[#ffffff05]`}
    >
      <div className="relative aspect-square">
        <img
          src={nft.image}
          alt={nft.name}
          className="w-full h-full object-cover transform transition-transform duration-500 group-hover:scale-105"
        />
        <div className="absolute bottom-0 left-0 right-0 p-2 bg-gradient-to-t from-[#0a0724]">
          <div className="flex justify-between items-center">
            <span className="text-xs bg-blue-400/20 text-blue-300 px-2 py-1 rounded-full">
              ⚡ Earning
            </span>
            <span className="text-xs bg-purple-400/20 text-purple-300 px-2 py-1 rounded-full">
              +12.4/day
            </span>
          </div>
        </div>
      </div>

      <div className="p-3 bg-[#0a0724] ">
        <div className="flex justify-between items-center">
          <h3 className="font-medium text-gray-200 truncate">{nft.name}</h3>
          <div className="text-xs text-blue-400">14d</div>
        </div>
        <p className="text-sm text-blue-400/80">#{nft.id}</p>
      </div>

      {isSelected && (
        <div className="absolute inset-0 bg-blue-400/10 flex items-center justify-center">
          <div className="w-8 h-8 bg-gradient-to-r from-blue-400 to-purple-400 rounded-full flex items-center justify-center text-white shadow-glow-inner">
            ✓
          </div>
        </div>
      )}
    </div>
  );
};

export default StakeCard;
