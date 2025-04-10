"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import {
  useAccount,
  useReadContracts,
  useWriteContract,
  useWatchContractEvent,
  useReadContract,
  useWaitForTransactionReceipt,
} from "wagmi";
import { formatEther } from "viem";
import StakeCard from "@/components/StakeCard";
import {
  SparklesIcon,
  WalletIcon,
  ArrowPathIcon,
  GiftIcon,
} from "@heroicons/react/24/outline";

import {
  ZephyrusAddress,
  ZephyrusABI,
  StakeZephyrAddress,
  StakeZephyrABI,
} from "@/constants/ZephyrusAbi";

interface NFT {
  id: string;
  tokenId: number;
  image: string;
  name: string;
  isStaked: boolean;
}

const StakePage = () => {
  const { address } = useAccount();
  const [activeTab, setActiveTab] = useState<"owned" | "staked">("owned");
  const [selectedNFTs, setSelectedNFTs] = useState<number[]>([]);
  const [totalRewards, setTotalRewards] = useState("0");
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<"newest" | "id">("newest");

  // ————— Read owned NFTs —————
  const { data: ownedResults } = useReadContracts({
    contracts: [
      {
        address: ZephyrusAddress,
        abi: ZephyrusABI,
        functionName: "tokensOfOwner",
        args: [address ?? "0x0000000000000000000000000000000000000000"],
      },
    ],
  });
  // ownedResults is an array of call results; our call is at index 0
  const ownedTokenIds =
    ownedResults?.[0]?.status === "success" &&
    Array.isArray(ownedResults[0].result)
      ? ownedResults[0].result
      : [];

  const ownedNFTs: NFT[] = ownedTokenIds.map((tid) => ({
    id: tid.toString(),
    tokenId: Number(tid),
    image: `/assets/rabbits.png`,
    name: `Ethereal #${tid.toString()}`,
    isStaked: false,
  }));

  // ————— Read staked NFTs —————
  const { data: stakedResults, refetch: refetchStakes } = useReadContracts({
    contracts: [
      {
        address: StakeZephyrAddress,
        abi: StakeZephyrABI,
        functionName: "getStakeInfo",
        args: [address ?? "0x0000000000000000000000000000000000000000"],
      },
    ],
  });
  // stakedResults[0] is StakeInfoOutput[]
  type StakeInfoOutput = {
    tokenId: bigint;
    startTime: bigint;
    claimableReward: bigint;
  };
  const stakeInfos = useMemo(() => {
    const result = stakedResults?.[0];
    if (result && "result" in result && Array.isArray(result.result)) {
      return result.result.map((info) => ({
        tokenId: info.tokenId,
        startTime: info.startTime,
        claimableReward: info.claimableReward,
      })) as StakeInfoOutput[];
    }
    return [];
  }, [stakedResults]);

  const stakedNFTs: NFT[] = stakeInfos.map((info) => ({
    id: info.tokenId.toString(),
    tokenId: Number(info.tokenId),
    image: `/assets/rabbits.png`,
    name: `Ethereal #${info.tokenId.toString()}`,
    isStaked: true,
  }));

  // ————— Watch events to refresh —————
  useWatchContractEvent({
    address: StakeZephyrAddress,
    abi: StakeZephyrABI,
    eventName: "NFTStaked",
    onLogs: () => refetchStakes(),
  });
  useWatchContractEvent({
    address: StakeZephyrAddress,
    abi: StakeZephyrABI,
    eventName: "NFTUnstaked",
    onLogs: () => refetchStakes(),
  });

  // ————— Calculate total rewards for selected NFTs —————
  useEffect(() => {
    const total = selectedNFTs.reduce((acc, tid) => {
      const info = stakeInfos.find((i) => Number(i.tokenId) === tid);
      if (info) {
        acc += parseFloat(formatEther(info.claimableReward));
      }
      return acc;
    }, 0);
    setTotalRewards(total.toFixed(4));
  }, [stakeInfos, selectedNFTs]);

  // ————— Contract writes —————
  const { writeContract, isPending } = useWriteContract();

  const handleApprove = useCallback(() => {
    writeContract({
      address: ZephyrusAddress,
      abi: ZephyrusABI,
      functionName: "setApprovalForAll",
      args: [StakeZephyrAddress, true],
    });
  }, [writeContract]);

  const handleStake = useCallback(() => {
    writeContract({
      address: StakeZephyrAddress,
      abi: StakeZephyrABI,
      functionName: "stakeNFTs",
      args: [selectedNFTs.map(BigInt)],
    });
  }, [selectedNFTs, writeContract]);

  const handleUnstake = useCallback(() => {
    writeContract({
      address: StakeZephyrAddress,
      abi: StakeZephyrABI,
      functionName: "unstakeNFTs",
      args: [selectedNFTs.map(BigInt)],
    });
  }, [selectedNFTs, writeContract]);

  const handleClaim = useCallback(() => {
    writeContract({
      address: StakeZephyrAddress,
      abi: StakeZephyrABI,
      functionName: "claimRewardsBatch",
      args: [selectedNFTs.map(BigInt)],
    });
  }, [selectedNFTs, writeContract]);

  const { data: isApproved, refetch: refetchApproval } = useReadContract({
    address: ZephyrusAddress,
    abi: ZephyrusABI,
    functionName: "isApprovedForAll",
    args: [address || "0x", StakeZephyrAddress],
    query: { enabled: !!address },
  });

  // Tambahkan useEffect untuk refresh status approval setelah transaksi sukses
  const { data: approveHash } = useWriteContract();
  const { isSuccess: isApproveConfirmed } = useWaitForTransactionReceipt({
    hash: approveHash,
  });

  useEffect(() => {
    if (isApproveConfirmed) {
      refetchApproval();
    }
  }, [isApproveConfirmed, refetchApproval]);

  // ————— Filter & sort —————
  const filteredNFTs = (activeTab === "owned" ? ownedNFTs : stakedNFTs)
    .filter((nft) => nft.name.toLowerCase().includes(searchQuery.toLowerCase()))
    .sort((a, b) =>
      sortBy === "newest" ? b.tokenId - a.tokenId : a.tokenId - b.tokenId
    );

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Header */}
        <div className="text-center mb-12 animate-fade-in">
          <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent mb-4">
            NFT Staking Platform
          </h1>
          <p className="text-gray-600 text-lg">
            Stake your NFTs to earn rewards
          </p>
        </div>

        {/* Tabs */}
        <div className="flex gap-4 mb-8 justify-center">
          <button
            onClick={() => setActiveTab("owned")}
            className={`px-6 py-2 rounded-full flex items-center gap-2 transition-all ${
              activeTab === "owned"
                ? "bg-gradient-to-r from-purple-500 to-blue-500 text-white shadow-lg"
                : "bg-white text-gray-600 hover:bg-gray-50 border"
            }`}
          >
            <WalletIcon className="w-5 h-5" />
            Owned ({ownedNFTs.length})
          </button>
          <button
            onClick={() => setActiveTab("staked")}
            className={`px-6 py-2 rounded-full flex items-center gap-2 transition-all ${
              activeTab === "staked"
                ? "bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-lg"
                : "bg-white text-gray-600 hover:bg-gray-50 border"
            }`}
          >
            <SparklesIcon className="w-5 h-5" />
            Staked ({stakedNFTs.length})
          </button>
        </div>

        <div className="grid lg:grid-cols-4 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-3">
            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200 animate-slide-up">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                <h2 className="text-xl font-semibold flex items-center gap-2">
                  {activeTab === "owned" ? "Your NFTs" : "Staked NFTs"}
                </h2>
                <div className="flex gap-3 w-full sm:w-auto">
                  <input
                    type="text"
                    placeholder="Search..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="px-4 py-2 border rounded-lg w-full focus:ring-2 focus:ring-purple-200"
                  />
                  <select
                    value={sortBy}
                    onChange={(e) =>
                      setSortBy(e.target.value as "newest" | "id")
                    }
                    className="px-4 py-2 border rounded-lg bg-white"
                  >
                    <option value="newest">Newest</option>
                    <option value="id">ID</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                {filteredNFTs.map((nft) => (
                  <StakeCard
                    key={nft.id}
                    nft={nft}
                    isSelected={selectedNFTs.includes(nft.tokenId)}
                    onSelect={() =>
                      setSelectedNFTs((prev) =>
                        prev.includes(nft.tokenId)
                          ? prev.filter((id) => id !== nft.tokenId)
                          : [...prev, nft.tokenId]
                      )
                    }
                  />
                ))}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1 space-y-6 sticky top-6 h-fit">
            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200 animate-slide-up delay-100">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <ArrowPathIcon className="w-6 h-6 text-purple-600" />
                {activeTab === "owned" ? "Stake Options" : "Unstake"}
              </h3>

              {/* Tombol Approve - hanya tampil jika belum approve */}
              {activeTab === "owned" && !isApproved && (
                <button
                  onClick={handleApprove}
                  className="w-full bg-gradient-to-r from-yellow-400 to-orange-400 text-white py-3 rounded-lg font-medium hover:shadow-lg transition-all mb-3"
                  disabled={isPending}
                >
                  {isPending ? (
                    <ArrowPathIcon className="w-5 h-5 animate-spin mx-auto" />
                  ) : (
                    "Approve Staking"
                  )}
                </button>
              )}

              {/* Tombol Stake/Unstake - hanya tampil jika approved atau di tab staked */}
              {(activeTab === "staked" ||
                (activeTab === "owned" && isApproved)) && (
                <button
                  onClick={activeTab === "owned" ? handleStake : handleUnstake}
                  disabled={!selectedNFTs.length || isPending}
                  className="w-full bg-gradient-to-r from-purple-500 to-blue-500 text-white py-3 rounded-lg font-medium hover:shadow-lg transition-all disabled:opacity-50"
                >
                  {isPending ? (
                    <ArrowPathIcon className="w-5 h-5 animate-spin mx-auto" />
                  ) : activeTab === "owned" ? (
                    "Stake Selected"
                  ) : (
                    "Unstake Selected"
                  )}
                </button>
              )}
            </div>

            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200 animate-slide-up delay-200">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <GiftIcon className="w-6 h-6 text-blue-600" />
                Rewards
              </h3>
              <div className="bg-purple-50 rounded-xl p-4 mb-4">
                <div className="text-3xl font-bold text-purple-600">
                  {totalRewards}
                </div>
                <div className="text-sm text-gray-600">TEA Earned</div>
              </div>
              <button
                onClick={handleClaim}
                disabled={!selectedNFTs.length || isPending}
                className="w-full bg-gradient-to-r from-blue-500 to-purple-500 text-white py-3 rounded-lg font-medium hover:shadow-lg transition-all disabled:opacity-50"
              >
                Claim Rewards
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StakePage;
