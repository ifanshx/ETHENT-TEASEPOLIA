// StakePage.tsx
"use client";

import NFTCard from "@/components/NFTCard";
import StakeCard from "@/components/StakeCard";
import React, { useState } from "react";

const StakePage = () => {
  const [activeTab, setActiveTab] = useState<"owned" | "staked">("owned");
  const [nfts] = useState(
    [...Array(50)].map((_, i) => ({
      id: String(i + 1),
      image: `/assets/Background/Daylight.png`,
      name: `NFT #${i + 1}`,
    }))
  );

  const [stakedNFTs] = useState(
    [...Array(10)].map((_, i) => ({
      id: String(i + 51),
      image: `/assets/Background/Daylight.png`,
      name: `Staked #${i + 51}`,
    }))
  );

  const [selectedToStake, setSelectedToStake] = useState<string[]>([]);
  const [selectedToUnstake, setSelectedToUnstake] = useState<string[]>([]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#fff5f5] via-[#f0f9ff] to-[#fdf2f8]">
      <div className="relative z-10 container mx-auto px-4 py-8">
        {/* Header Compact */}
        <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4 sticky top-0 bg-white/80 backdrop-blur-sm z-20 py-4">
          <h1 className="text-3xl font-bold text-pink-500">
            🪐 Cosmic Staking
          </h1>
          <div className="flex gap-4">
            <button
              onClick={() => setActiveTab("owned")}
              className={`px-6 py-2 rounded-full ${
                activeTab === "owned"
                  ? "bg-pink-400 text-white"
                  : "bg-white text-pink-400 border border-pink-200"
              }`}
            >
              Your NFTs ({nfts.length})
            </button>
            <button
              onClick={() => setActiveTab("staked")}
              className={`px-6 py-2 rounded-full ${
                activeTab === "staked"
                  ? "bg-blue-400 text-white"
                  : "bg-white text-blue-400 border border-blue-200"
              }`}
            >
              Staked ({stakedNFTs.length})
            </button>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid lg:grid-cols-4 gap-8">
          {/* NFT List Section */}
          <div className="lg:col-span-3">
            <div className="bg-white rounded-2xl shadow-sm p-4">
              {/* List Header */}
              <div className="flex justify-between items-center mb-4 px-2">
                <h2 className="text-xl font-semibold">
                  {activeTab === "owned"
                    ? "🌌 Your Collection"
                    : "⭐ Active Stakes"}
                </h2>
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Search..."
                    className="px-4 py-2 border rounded-full text-sm w-40"
                  />
                  <select className="px-4 py-2 border rounded-full text-sm">
                    <option>Sort by Newest</option>
                    <option>Sort by Value</option>
                  </select>
                </div>
              </div>

              {/* Compact NFT Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2">
                {(activeTab === "owned" ? nfts : stakedNFTs).map((nft) =>
                  activeTab === "owned" ? (
                    <NFTCard
                      key={nft.id}
                      nft={nft}
                      isSelected={selectedToStake.includes(nft.id)}
                      onSelect={() =>
                        setSelectedToStake((prev) =>
                          prev.includes(nft.id)
                            ? prev.filter((id) => id !== nft.id)
                            : [...prev, nft.id]
                        )
                      }
                    />
                  ) : (
                    <StakeCard
                      key={nft.id}
                      nft={nft}
                      isSelected={selectedToUnstake.includes(nft.id)}
                      onSelect={() =>
                        setSelectedToUnstake((prev) =>
                          prev.includes(nft.id)
                            ? prev.filter((id) => id !== nft.id)
                            : [...prev, nft.id]
                        )
                      }
                    />
                  )
                )}
              </div>
            </div>
          </div>

          {/* Sidebar Actions */}
          <div className="lg:col-span-1 space-y-6 sticky top-20 h-fit">
            {/* Selection Summary */}
            <div className="bg-white rounded-2xl shadow-sm p-6">
              <h3 className="font-semibold mb-4">
                {activeTab === "owned"
                  ? "🚀 Staking Ready"
                  : "🌟 Active Stakes"}
              </h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span>Selected:</span>
                  <span className="font-bold text-pink-500">
                    {activeTab === "owned"
                      ? selectedToStake.length
                      : selectedToUnstake.length}
                  </span>
                </div>
                <button className="w-full bg-gradient-to-r from-pink-400 to-purple-400 text-white py-3 rounded-xl hover:scale-[1.02] transition-transform">
                  {activeTab === "owned"
                    ? "Stake Selected"
                    : "Unstake Selected"}
                </button>
              </div>
            </div>

            {/* Rewards Summary */}
            <div className="bg-white rounded-2xl shadow-sm p-6">
              <h3 className="font-semibold mb-4">✨ Your Rewards</h3>
              <div className="space-y-4">
                <div className="text-3xl font-bold text-blue-500">1,234.56</div>
                <button className="w-full bg-gradient-to-r from-blue-400 to-purple-400 text-white py-3 rounded-xl hover:scale-[1.02] transition-transform">
                  Claim All Rewards
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StakePage;
