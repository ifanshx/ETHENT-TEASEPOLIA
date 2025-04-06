// StakePage.tsx
"use client";

import NFTCard from "@/components/NFTCard";
import StakeCard from "@/components/StakeCard";
import Link from "next/link";
import React, { useState } from "react";

const StakePage = () => {
  const [activeTab, setActiveTab] = useState<"owned" | "staked">("owned");
  const [nfts] = useState(
    [...Array(20)].map((_, i) => ({
      id: String(i + 1),
      image: `/assets/rabbits.png`,
      name: `NFT #${i + 1}`,
    }))
  );

  const [stakedNFTs] = useState(
    [...Array(20)].map((_, i) => ({
      id: String(i + 51),
      image: `/assets/rabbits.png`,
      name: `Staked #${i + 51}`,
    }))
  );

  const [selectedToStake, setSelectedToStake] = useState<string[]>([]);
  const [selectedToUnstake, setSelectedToUnstake] = useState<string[]>([]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-emerald-900 to-teal-900">
      <div className="relative z-10 container mx-auto px-4 py-8">
        {/* Header Compact */}
        <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4 sticky top-0 bg-gray-800/80 backdrop-blur-sm z-20 p-3 rounded-xl border-2 border-emerald-400/20">
          <Link href="/" className="flex-1">
            <h1 className="text-3xl font-bold tracking-tighter bg-gradient-to-r from-emerald-400 via-teal-400 to-green-400 bg-clip-text text-transparent animate-text-glow">
              🍵 Ethereal Staking
            </h1>
          </Link>
          <div className="flex gap-4">
            <button
              onClick={() => setActiveTab("owned")}
              className={`px-6 py-2 rounded-full transition-all ${
                activeTab === "owned"
                  ? "bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-lg"
                  : "bg-gray-700/40 text-emerald-300 border-2 border-emerald-400/20 hover:border-emerald-400/40"
              }`}
            >
              Your NFTs ({nfts.length})
            </button>
            <button
              onClick={() => setActiveTab("staked")}
              className={`px-6 py-2 rounded-full transition-all ${
                activeTab === "staked"
                  ? "bg-gradient-to-r from-teal-500 to-emerald-500 text-white shadow-lg"
                  : "bg-gray-700/40 text-teal-300 border-2 border-teal-400/20 hover:border-teal-400/40"
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
            <div className="bg-gray-800/80 rounded-2xl shadow-xl p-4 border-2 border-emerald-400/20 backdrop-blur-sm">
              {/* List Header */}
              <div className="flex justify-between items-center mb-4 px-2">
                <h2 className="text-xl font-semibold text-emerald-400">
                  {activeTab === "owned"
                    ? "🌿 Your Collection"
                    : "🌟 Active Stakes"}
                </h2>
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Search..."
                    className="px-4 py-2 border-2 border-emerald-400/30 rounded-full text-sm w-40 bg-gray-700/40 text-emerald-200 placeholder-emerald-400/60"
                  />
                  <select className="px-4 py-2 border-2 border-emerald-400/30 rounded-full text-sm bg-gray-700/40 text-emerald-200">
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
            <div className="bg-gray-800/80 rounded-2xl shadow-xl p-6 border-2 border-emerald-400/20 backdrop-blur-sm">
              <h3 className="font-semibold mb-4 text-emerald-400">
                {activeTab === "owned"
                  ? "🚀 Staking Ready"
                  : "🌟 Active Stakes"}
              </h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center text-emerald-300">
                  <span>Selected:</span>
                  <span className="font-bold text-emerald-400">
                    {activeTab === "owned"
                      ? selectedToStake.length
                      : selectedToUnstake.length}
                  </span>
                </div>
                <button className="w-full bg-gradient-to-r from-emerald-500 to-teal-500 text-white py-3 rounded-xl hover:scale-[1.02] transition-transform shadow-lg hover:shadow-emerald-500/20">
                  {activeTab === "owned"
                    ? "Stake Selected"
                    : "Unstake Selected"}
                </button>
              </div>
            </div>

            {/* Rewards Summary */}
            <div className="bg-gray-800/80 rounded-2xl shadow-xl p-6 border-2 border-emerald-400/20 backdrop-blur-sm">
              <h3 className="font-semibold mb-4 text-emerald-400">
                ✨ Your Rewards
              </h3>
              <div className="space-y-4">
                <div className="text-3xl font-bold text-teal-400">1,234.56</div>
                <button className="w-full bg-gradient-to-r from-teal-500 to-emerald-500 text-white py-3 rounded-xl hover:scale-[1.02] transition-transform shadow-lg hover:shadow-teal-500/20">
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
