"use client";

import Image from "next/image";
import {
  BaseError,
  useWaitForTransactionReceipt,
  useWriteContract,
} from "wagmi";
import { parseEther } from "viem";
import { ZephyrusAddress, ZephyrusABI } from "@/constants/ZephyrusAbi";

const ZephyrusPage = () => {
  const { data: hash, error, isPending, writeContract } = useWriteContract();
  const { isLoading: isConfirming, isSuccess: isConfirmed } =
    useWaitForTransactionReceipt({ hash });

  const handleMint = () => {
    writeContract({
      address: ZephyrusAddress,
      abi: ZephyrusABI,
      functionName: "mint",
      args: ["ipfs://sdasd/1sd.json"],
      value: parseEther("2"),
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 flex items-center justify-center p-6">
      <div
        className="max-w-md w-full bg-white/80 backdrop-blur-md rounded-2xl shadow-2xl border border-white/30 p-8
                      transition-transform duration-500 ease-out hover:scale-105"
      >
        <h1
          className="text-5xl font-extrabold text-center bg-clip-text text-transparent
                       bg-gradient-to-r from-purple-600 to-blue-600 mb-2"
        >
          Mint Your Zephyrus
        </h1>
        <p className="text-center text-gray-700 mb-6">
          Price: <span className="font-semibold">2 TEA</span>
        </p>

        <div
          className="w-full h-80 relative mb-6 rounded-xl overflow-hidden shadow-lg
                        transition-transform duration-500 ease-out hover:scale-105"
        >
          <Image
            src="/assets/rabbits.png"
            alt="Ethereal Echoes NFT"
            fill
            className="object-cover"
          />
        </div>

        <button
          onClick={handleMint}
          disabled={isPending}
          className="w-full flex items-center justify-center gap-2 px-6 py-4
                     bg-gradient-to-r from-purple-600 to-blue-600 text-white text-xl font-bold
                     rounded-xl shadow-lg hover:from-purple-700 hover:to-blue-700 active:scale-95
                     transition duration-200 disabled:opacity-50"
        >
          {isPending ? "Processing..." : "Mint Now"}
        </button>

        <div className="mt-6 space-y-2 text-center text-sm">
          {hash && (
            <a
              href={`https://sepolia.tea.xyz/tx/${hash}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 underline hover:text-blue-800"
            >
              🔗 View Transaction
            </a>
          )}
          {isConfirming && (
            <p className="text-yellow-600 font-medium">
              ⏳ Waiting for confirmation...
            </p>
          )}
          {isConfirmed && (
            <p className="text-green-600 font-medium">
              ✅ Transaction confirmed!
            </p>
          )}
          {error && (
            <p className="text-red-600 font-medium">
              ⚠️ Error: {(error as BaseError).shortMessage || error.message}
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default ZephyrusPage;
