// NFTCard.tsx
"use client";

import React from "react";

interface NFTCardProps {
  nft: { id: string; image: string; name: string };
  isSelected: boolean;
  onSelect: () => void;
}

const NFTCard: React.FC<NFTCardProps> = ({ nft, isSelected, onSelect }) => {
  return (
    <div
      onClick={onSelect}
      className={`relative cursor-pointer group transform transition-all duration-300 ${
        isSelected
          ? "scale-95 ring-2 ring-purple-400 shadow-glow"
          : "hover:scale-95 ring-1 ring-[#ffffff15]"
      } rounded-xl overflow-hidden bg-[#ffffff05]`}
    >
      <div className="relative aspect-square">
        <img
          src={nft.image}
          alt={nft.name}
          className="w-full h-full object-cover transform transition-transform duration-500 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0a0724] via-transparent to-transparent" />
      </div>

      <div className="p-3 bg-[#0a0724] ">
        <h3 className="font-medium text-gray-200 truncate">{nft.name}</h3>
        <p className="text-sm text-purple-400/80">#{nft.id}</p>
      </div>

      {/* Selection Overlay */}
      {isSelected && (
        <div className="absolute inset-0 bg-purple-400/10 flex items-center justify-center">
          <div className="w-8 h-8 bg-gradient-to-r from-purple-400 to-blue-400 rounded-full flex items-center justify-center text-white shadow-glow-inner">
            ✓
          </div>
        </div>
      )}
    </div>
  );
};

export default NFTCard;
