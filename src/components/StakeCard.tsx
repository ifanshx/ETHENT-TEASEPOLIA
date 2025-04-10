// StakeCard.tsx
"use client";

import { SparklesIcon } from "@heroicons/react/24/outline";
import { useState, useRef, CSSProperties } from "react";

interface StakeCardProps {
  nft: {
    id: string;
    tokenId: number;
    image: string;
    name: string;
    isStaked: boolean;
  };
  isSelected: boolean;
  onSelect: () => void;
}

const StakeCard = ({ nft, isSelected, onSelect }: StakeCardProps) => {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const cardRef = useRef<HTMLDivElement>(null);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = (e.clientX - rect.left - rect.width / 2) * 0.1;
    const y = (e.clientY - rect.top - rect.height / 2) * -0.1;
    setMousePosition({ x, y });
  };

  const cardStyle: CSSProperties = {
    transform: `perspective(1000px) 
      rotateX(${mousePosition.y}deg) 
      rotateY(${mousePosition.x}deg) 
      scale(${isSelected ? 0.95 : 1})`,
    transition: "all 0.3s ease-out",
  };

  return (
    <div
      ref={cardRef}
      onClick={onSelect}
      onMouseMove={handleMouseMove}
      onMouseLeave={() => setMousePosition({ x: 0, y: 0 })}
      className={`relative cursor-pointer group overflow-hidden rounded-2xl border-2
        ${isSelected ? "border-purple-400" : "border-purple-400/20"}
        ${nft.isStaked ? "opacity-75" : "hover:border-purple-400/40"}`}
      style={cardStyle}
    >
      <div className="relative aspect-square">
        <img
          src={nft.image}
          alt={nft.name}
          className="w-full h-full object-cover transform transition-transform duration-500 group-hover:scale-105"
        />

        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-purple-900/30 to-purple-900/60" />
      </div>

      <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-purple-900/80 via-transparent to-transparent">
        <h3 className="font-medium text-purple-100 truncate">{nft.name}</h3>
        <p className="text-sm text-purple-300/80">#{nft.tokenId}</p>
      </div>

      {nft.isStaked && (
        <div className="absolute top-2 right-2 bg-purple-500/80 text-white px-2 py-1 rounded-full text-xs flex items-center gap-1">
          <SparklesIcon className="w-3 h-3" />
          <span>Staked</span>
        </div>
      )}

      {isSelected && (
        <div className="absolute inset-0 bg-purple-400/10 backdrop-blur-sm flex items-center justify-center">
          <div className="w-8 h-8 bg-gradient-to-r from-pink-400 to-purple-500 rounded-full flex items-center justify-center text-white animate-pulse-slow">
            ✓
          </div>
        </div>
      )}
    </div>
  );
};

export default StakeCard;
