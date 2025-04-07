"use client";

import { CurrencyDollarIcon, PhotoIcon } from "@heroicons/react/24/outline";
import { useAccount, useBalance, useReadContract } from "wagmi";
import { mintNFTABI, mintNFTAddress } from "@/constants/ContractAbi";
import { Address } from "viem";

const HomePage = () => {
  const { address, isConnected } = useAccount();

  // Get user's NFT balance
  const { data: mintedCount } = useReadContract({
    address: mintNFTAddress,
    abi: mintNFTABI,
    functionName: "userBalance",
    args: [address as Address],
  });

  // Get native token balance
  const { data: balanceData } = useBalance({
    address: address,
  });

  // Stats configuration
  const stats = [
    {
      title: "Wallet Balance",
      value: `${balanceData?.formatted.slice(0, 7) || "0.00"} ${
        balanceData?.symbol || "TEA"
      }`,
      icon: CurrencyDollarIcon,
      color: "bg-gradient-to-br from-purple-500/20 to-pink-500/20",
    },
    {
      title: "Your Entities",
      value: mintedCount?.toString() || "0",
      icon: PhotoIcon,
      color: "bg-gradient-to-br from-blue-500/20 to-cyan-500/20",
    },
    {
      title: "Staked Rewards",
      value: "0.00 TEA",
      icon: CurrencyDollarIcon,
      color: "bg-gradient-to-br from-emerald-500/20 to-green-500/20",
    },
  ];

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 md:p-6 max-w-7xl mx-auto">
      {/* Hero Section */}
      <div className="text-center mb-8 w-full">
        <h1 className="text-5xl md:text-6xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent mb-6">
          Ethereal Entities
        </h1>
        <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
          Where digital art meets blockchain magic. Create, collect, and trade
          unique generated entities in a tea ecosystem.
        </p>
      </div>

      {/* Stats Section */}
      {isConnected && (
        <div className="w-full max-w-4xl">
          <div className="grid md:grid-cols-3 gap-6">
            {stats.map((stat) => (
              <div
                key={stat.title}
                className={`${stat.color} backdrop-blur-lg rounded-xl p-6 border border-gray-200 dark:border-gray-700 transition-all hover:-translate-y-1 text-center`}
              >
                <div className="flex flex-col items-center">
                  <div className="mb-4">
                    <stat.icon className="w-12 h-12 text-gray-400 dark:text-gray-500" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-300 mb-2">
                      {stat.title}
                    </p>
                    <p className="text-2xl font-bold text-gray-800 dark:text-gray-100">
                      {stat.value}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default HomePage;
