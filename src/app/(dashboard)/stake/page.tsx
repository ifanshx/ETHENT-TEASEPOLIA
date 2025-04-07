// StakePage.tsx
"use client";

import { useState } from "react";
import {
  WalletIcon,
  SparklesIcon,
  ArrowPathIcon,
  GiftIcon,
} from "@heroicons/react/24/outline";
import StakeCard from "@/components/StakeCard";

const StakePage = () => {
  const [activeTab, setActiveTab] = useState<"owned" | "staked">("owned");
  const [selectedNFTs, setSelectedNFTs] = useState<string[]>([]);

  // Demo Data
  const nfts = Array(12)
    .fill(null)
    .map((_, i) => ({
      id: `${i}`,
      image: "/assets/EtherealEntities.png",
      name: `Ethereal Entities`,
      value: (Math.random() * 1).toFixed(2) + " TEA",
    }));

  const stakedNFTs = Array(4)
    .fill(null)
    .map((_, i) => ({
      id: `${i}`,
      image: "/assets/EtherealEntities.png",
      name: `Staked Entity `,
      rewards: (Math.random() * 10).toFixed(2) + " TEA",
    }));

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 to-purple-50">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Page Header */}
        <header className="text-center mb-12">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent mb-2">
            Ethereal Entities Staking
          </h1>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Earn passive rewards by securely staking your NFTs in our
            decentralized protocol
          </p>
        </header>

        {/* Tab Navigation */}
        <div className="flex gap-2 mb-8 justify-center">
          <button
            onClick={() => setActiveTab("owned")}
            className={`px-6 py-2 rounded-full flex items-center gap-2 transition-all ${
              activeTab === "owned"
                ? "bg-gradient-to-r from-pink-500 to-purple-500 text-white shadow-lg"
                : "bg-white text-gray-600 hover:bg-gray-50 border border-gray-200"
            }`}
          >
            <WalletIcon className="w-5 h-5" />
            Your Collection ({nfts.length})
          </button>
          <button
            onClick={() => setActiveTab("staked")}
            className={`px-6 py-2 rounded-full flex items-center gap-2 transition-all ${
              activeTab === "staked"
                ? "bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg"
                : "bg-white text-gray-600 hover:bg-gray-50 border border-gray-200"
            }`}
          >
            <SparklesIcon className="w-5 h-5" />
            Staked NFTs ({stakedNFTs.length})
          </button>
        </div>

        {/* Main Content Grid */}
        <div className="grid lg:grid-cols-4 gap-6">
          {/* NFT Grid Section */}
          <div className="lg:col-span-3">
            <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-200">
              {/* Grid Header */}
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                <h2 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                  {activeTab === "owned" ? (
                    <>
                      <WalletIcon className="w-6 h-6 text-purple-600" />
                      Your NFT Collection
                    </>
                  ) : (
                    <>
                      <SparklesIcon className="w-6 h-6 text-pink-600" />
                      Active Stakes
                    </>
                  )}
                </h2>
                <div className="flex gap-3 w-full sm:w-auto">
                  <input
                    type="text"
                    placeholder="Search NFTs..."
                    className="px-4 py-2 border border-gray-200 rounded-lg text-sm w-full focus:ring-2 focus:ring-purple-200 focus:border-purple-500"
                  />
                  <select className="px-4 py-2 border border-gray-200 rounded-lg text-sm bg-white">
                    <option>Newest First</option>
                    <option>Highest Value</option>
                    <option>Rarity</option>
                  </select>
                </div>
              </div>

              {/* NFT Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                {(activeTab === "owned" ? nfts : stakedNFTs).map((nft) => (
                  <StakeCard
                    key={nft.id}
                    nft={nft}
                    isSelected={selectedNFTs.includes(nft.id)}
                    onSelect={() =>
                      setSelectedNFTs((prev) =>
                        prev.includes(nft.id)
                          ? prev.filter((id) => id !== nft.id)
                          : [...prev, nft.id]
                      )
                    }
                  />
                ))}
              </div>
            </div>
          </div>

          {/* Action Sidebar */}
          <div className="lg:col-span-1 space-y-6 sticky top-6 h-fit">
            {/* Staking Actions Card */}
            <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-200">
              <h3 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
                <ArrowPathIcon className="w-6 h-6 text-purple-600" />
                {activeTab === "owned" ? "Stake NFTs" : "Manage Stakes"}
              </h3>

              <div className="space-y-4">
                <div className="flex justify-between items-center text-gray-600 mb-4">
                  <span>Selected Items</span>
                  <span className="font-semibold text-purple-600">
                    {selectedNFTs.length}
                  </span>
                </div>

                <button className="w-full bg-gradient-to-r from-pink-500 to-purple-500 text-white py-3 rounded-lg font-medium hover:shadow-lg transition-all flex items-center justify-center gap-2">
                  {activeTab === "owned" ? (
                    <>
                      <SparklesIcon className="w-5 h-5" />
                      Stake Selected
                    </>
                  ) : (
                    <>
                      <ArrowPathIcon className="w-5 h-5" />
                      Unstake Selected
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Rewards Card */}
            <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-200">
              <h3 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
                <GiftIcon className="w-6 h-6 text-pink-600" />
                Your Rewards
              </h3>

              <div className="space-y-4">
                <div className="bg-gradient-to-br from-pink-50 to-purple-50 rounded-xl p-4">
                  <div className="text-3xl font-bold text-purple-600 mb-1">
                    1,234.56
                  </div>
                  <div className="text-sm text-gray-500">Total Earned TEA</div>
                </div>

                <button className="w-full bg-gradient-to-r from-purple-500 to-pink-500 text-white py-3 rounded-lg font-medium hover:shadow-lg transition-all flex items-center justify-center gap-2">
                  <GiftIcon className="w-5 h-5" />
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
