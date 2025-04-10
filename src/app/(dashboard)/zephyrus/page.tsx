"use client";

import Image from "next/image";
import {
  BaseError,
  useWaitForTransactionReceipt,
  useWriteContract,
} from "wagmi";
import { parseEther } from "viem";
import { ZephyrusAddress, ZephyrusABI } from "@/constants/ZephyrusAbi";
import { useToast } from "@/context/ToastContext";
import { useEffect, useRef } from "react";
import { SparklesIcon, CurrencyDollarIcon } from "@heroicons/react/24/outline";

const ZephyrusPage = () => {
  const { showToast } = useToast();
  const { data: hash, error, isPending, writeContract } = useWriteContract();
  const { isLoading: isConfirming, isSuccess: isConfirmed } =
    useWaitForTransactionReceipt({ hash });

  // Ref untuk tracking state sebelumnya
  const prevIsConfirming = useRef(false);
  const prevIsConfirmed = useRef(false);
  const prevError = useRef<BaseError | Error | null>(null);

  useEffect(() => {
    if (isConfirming && !prevIsConfirming.current) {
      showToast("Transaction is being confirmed...", "info");
    }
    prevIsConfirming.current = isConfirming;

    if (isConfirmed && !prevIsConfirmed.current) {
      showToast("NFT Minted Successfully!", "success");
    }
    prevIsConfirmed.current = isConfirmed;

    if (error && error !== prevError.current) {
      const errorMessage =
        error instanceof BaseError
          ? error.shortMessage || error.message
          : "Transaction Failed";
      showToast(errorMessage, "error");
      prevError.current = error;
    }
  }, [isConfirming, isConfirmed, error, showToast]);

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
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 opacity-20 -z-10">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-300/20 rounded-full blur-3xl animate-float" />
        <div className="absolute top-1/3 right-1/4 w-96 h-96 bg-blue-300/20 rounded-full blur-3xl animate-float-delayed" />
      </div>

      {/* Grid Pattern */}
      <div className="absolute inset-0 -z-20 opacity-10 [mask-image:linear-gradient(180deg,transparent,rgba(0,0,0,0.6))]">
        <div className="h-full w-full [background-size:24px_24px] [background-image:linear-gradient(to_right,rgba(255,255,255,0.3)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.3)_1px,transparent_1px)]" />
      </div>

      <div className="max-w-xl w-full bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/30 overflow-hidden transition-transform duration-500 hover:scale-[1.02]">
        {/* Header Section */}
        <div className="bg-gradient-to-r from-purple-600 to-blue-600 p-8 text-center">
          <h1 className="text-4xl font-bold text-white mb-2 animate-fade-in-down">
            Ethereal Zephyrus
          </h1>
          <p className="text-purple-100 font-medium">
            Collect unique digital entities powered by blockchain
          </p>
        </div>

        {/* Content */}
        <div className="p-8">
          <div className="relative aspect-square rounded-2xl overflow-hidden border-4 border-white/20 shadow-lg mb-8">
            <Image
              src="/assets/rabbits.png"
              alt="Ethereal Echoes NFT"
              fill
              className="object-cover animate-fade-in"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
          </div>

          {/* Stats Card */}
          <div className="bg-gradient-to-br from-purple-50 to-blue-50 rounded-xl p-6 mb-8 border border-white/30 shadow-sm">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <CurrencyDollarIcon className="w-8 h-8 text-purple-600" />
                <div>
                  <p className="text-sm text-gray-600">Mint Price</p>
                  <p className="text-2xl font-bold text-gray-800">2 TEA</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-600">Remaining</p>
                <p className="text-2xl font-bold text-gray-800">6666</p>
              </div>
            </div>
          </div>

          {/* Mint Button */}
          <button
            onClick={handleMint}
            disabled={isPending}
            className={`w-full flex items-center justify-center gap-3 px-8 py-5
              bg-gradient-to-r from-purple-600 to-blue-600 text-white text-xl font-semibold
              rounded-xl shadow-lg hover:shadow-xl active:scale-[0.98]
              transition-all duration-300 ${
                isPending ? "opacity-80 cursor-not-allowed" : ""
              }`}
          >
            {isPending ? (
              <>
                <div className="w-5 h-5 border-2 border-white/50 border-t-transparent rounded-full animate-spin" />
                Processing...
              </>
            ) : (
              <>
                <SparklesIcon className="w-6 h-6 text-amber-200" />
                Mint Your Zephyrus
              </>
            )}
          </button>

          {/* Transaction Link */}
          {hash && (
            <div className="mt-6 text-center animate-fade-in">
              <a
                href={`https://sepolia.tea.xyz/tx/${hash}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-800 transition-colors"
              >
                <span className="underline">View Transaction</span>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path d="M11 3a1 1 0 100 2h2.586l-6.293 6.293a1 1 0 101.414 1.414L15 6.414V9a1 1 0 102 0V4a1 1 0 00-1-1h-5z" />
                  <path d="M5 5a2 2 0 00-2 2v8a2 2 0 002 2h8a2 2 0 002-2v-3a1 1 0 10-2 0v3H5V7h3a1 1 0 000-2H5z" />
                </svg>
              </a>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ZephyrusPage;
