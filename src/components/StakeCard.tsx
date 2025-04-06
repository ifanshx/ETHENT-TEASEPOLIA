"use client";

import React, { useState, useRef } from "react";

interface StakeCardProps {
  nft: { id: string; image: string; name: string };
  isSelected: boolean;
  onSelect: () => void;
}

const StakeCard: React.FC<StakeCardProps> = ({ nft, isSelected, onSelect }) => {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const cardRef = useRef<HTMLDivElement>(null);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (cardRef.current) {
      const rect = cardRef.current.getBoundingClientRect();
      const x = (e.clientX - rect.left - rect.width / 2) / rect.width;
      const y = (e.clientY - rect.top - rect.height / 2) / rect.height;
      setMousePosition({ x, y });
    }
  };

  const handleMouseLeave = () => {
    setMousePosition({ x: 0, y: 0 });
  };

  return (
    <div
      ref={cardRef}
      onClick={onSelect}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className={`relative cursor-pointer group transform transition-all duration-300 ${
        isSelected
          ? "scale-95 shadow-2xl"
          : "hover:scale-95 ring-1 ring-teal-400/20"
      } rounded-xl overflow-hidden bg-gray-800/40 backdrop-blur-sm`}
    >
      {/* Animated border gradient */}
      {isSelected && (
        <div className="absolute inset-0 rounded-xl overflow-hidden z-0">
          <div className="absolute w-[200%] h-[200%] top-[-50%] left-[-50%] bg-[conic-gradient(from_0deg,var(--tw-gradient-from),var(--tw-gradient-to))] from-teal-400/30 via-transparent to-teal-400/30 animate-rotate-border"></div>
        </div>
      )}

      <div className="relative aspect-square perspective-1000">
        <img
          src={nft.image}
          alt={nft.name}
          className="w-full h-full object-cover transform transition-transform duration-500 group-hover:scale-105"
          style={{
            transform: `scale(1.03) 
              translate(${mousePosition.x * 10}px, ${mousePosition.y * 10}px)
              rotateX(${mousePosition.y * 8}deg) 
              rotateY(${-mousePosition.x * 8}deg)`,
          }}
        />
        <div className="absolute bottom-0 left-0 right-0 p-2 bg-gradient-to-t from-gray-900/80">
          <div className="flex justify-between items-center">
            <span className="text-xs bg-teal-400/20 text-teal-300 px-2 py-1 rounded-full transition-transform duration-300 hover:-translate-y-0.5">
              ⚡ Earning
            </span>
            <span className="text-xs bg-emerald-400/20 text-emerald-300 px-2 py-1 rounded-full transition-transform duration-300 hover:-translate-y-0.5">
              +12.4/day
            </span>
          </div>
        </div>
      </div>

      <div className="p-3 bg-gray-900/60 relative z-10">
        <div className="flex justify-between items-center">
          <h3 className="font-medium text-emerald-200 truncate">{nft.name}</h3>
          <div className="text-xs text-teal-400">14d</div>
        </div>
        <p className="text-sm text-teal-400/80">#{nft.id}</p>
      </div>

      {isSelected && (
        <div className="absolute inset-0 bg-teal-400/10 flex items-center justify-center z-20">
          <div className="w-8 h-8 bg-gradient-to-r from-teal-400 to-emerald-400 rounded-full flex items-center justify-center text-white shadow-lg transform transition-transform duration-300 ease-[cubic-bezier(0.68,-0.55,0.265,1.55)] scale-100">
            ✓
          </div>
        </div>
      )}
    </div>
  );
};

export default StakeCard;
