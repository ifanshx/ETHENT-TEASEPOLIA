"use client";

import {
  StakeZephyrABI,
  StakeZephyrAddress,
  ZephyrusABI,
  ZephyrusAddress,
} from "@/constants/ZephyrusAbi";
import { CurrencyDollarIcon, PhotoIcon } from "@heroicons/react/24/outline";
import { useMemo } from "react";
import { formatEther } from "viem";
import {
  useAccount,
  useBalance,
  useReadContract,
  useReadContracts,
} from "wagmi";

const HomePage = () => {
  const { address, isConnected } = useAccount();

  // Get user's NFT balance
  const { data: mintedCount } = useReadContract({
    address: ZephyrusAddress,
    abi: ZephyrusABI,
    functionName: "balanceOf",
    args: [address || "0x0000000000000000000000000000000000000000"],
  });

  // Get native token balance
  const { data: balanceData } = useBalance({
    address: address,
  });

  const { data: stakedResults } = useReadContracts({
    contracts: [
      {
        address: StakeZephyrAddress,
        abi: StakeZephyrABI,
        functionName: "getStakeInfo",
        args: [address ?? "0x0000000000000000000000000000000000000000"],
      },
    ],
  });

  type StakeInfoOutput = {
    tokenId: bigint;
    startTime: bigint;
    claimableReward: bigint;
  };

  const totalRewards = useMemo(() => {
    if (!stakedResults || !stakedResults[0]?.result) return "0.00";

    const stakes = stakedResults[0].result as StakeInfoOutput[];
    return stakes
      .reduce((acc, stake) => {
        return acc + parseFloat(formatEther(stake.claimableReward));
      }, 0)
      .toFixed(7);
  }, [stakedResults]);

  // Stats configuration
  const stats = [
    {
      title: "Wallet Balance",
      value: `${balanceData?.formatted.slice(0, 7) || "0.00"} ${
        balanceData?.symbol || "TEA"
      }`,
      icon: CurrencyDollarIcon,
      color: "from-purple-500 to-pink-500",
    },
    {
      title: "Your Entities",
      value: mintedCount,
      icon: PhotoIcon,
      color: "from-blue-500 to-cyan-500",
    },
    {
      title: "Staked Rewards",
      value: `${totalRewards} TEA`, // Gunakan nilai yang sudah dihitung
      icon: CurrencyDollarIcon,
      color: "from-emerald-500 to-green-500",
    },
  ];

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 md:p-6 max-w-7xl mx-auto relative overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0 -z-10 opacity-30">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl animate-float" />
        <div className="absolute top-1/3 right-1/4 w-96 h-96 bg-pink-500/20 rounded-full blur-3xl animate-float-delayed" />
      </div>

      {/* Hero Section */}
      <div className="text-center mb-8 w-full space-y-6">
        <h1 className="text-5xl md:text-7xl font-bold bg-gradient-to-r from-purple-500 to-pink-500 bg-clip-text text-transparent mb-6 animate-fade-in-up">
          Ethereal Entities
        </h1>
        <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto animate-fade-in-up delay-100">
          Where digital art meets blockchain magic. Create, collect, and trade
          unique generated entities in a tea ecosystem.
        </p>
      </div>

      {/* Stats Section */}
      {isConnected && (
        <div className="w-full max-w-6xl animate-slide-up">
          <div className="grid md:grid-cols-3 gap-6">
            {stats.map((stat, index) => (
              <div
                key={stat.title}
                className={`bg-gradient-to-br ${stat.color} backdrop-blur-xl rounded-2xl p-8 border border-white/10 shadow-2xl transition-all hover:scale-[1.02] hover:shadow-3xl relative overflow-hidden group`}
                style={{ transitionDelay: `${index * 100}ms` }}
              >
                {/* Animated Background */}
                <div className="absolute inset-0 bg-gradient-to-br opacity-0 group-hover:opacity-10 transition-opacity duration-300 from-white/30 to-transparent" />

                <div className="flex flex-col items-center space-y-4">
                  <div className="p-4 bg-white/5 rounded-2xl backdrop-blur-sm">
                    <stat.icon className="w-8 h-8 text-white/80" />
                  </div>
                  <div className="text-center">
                    <p className="text-sm font-medium text-white/80 mb-2">
                      {stat.title}
                    </p>
                    <p className="text-3xl font-bold text-white">
                      {stat.value}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Grid Pattern */}
      <div className="absolute inset-0 -z-20 opacity-10 [mask-image:linear-gradient(180deg,transparent,rgba(0,0,0,0.6))]">
        <div className="h-full w-full [background-size:24px_24px] [background-image:linear-gradient(to_right,rgba(255,255,255,0.3)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.3)_1px,transparent_1px)]" />
      </div>
    </div>
  );
};

export default HomePage;
