"use client";
import { useToast } from "@/context/ToastContext";
import Image from "next/image";
import { useState, useEffect, useRef } from "react";

interface MintNFTModalProps {
  isOpen: boolean;
  onClose: () => void;
  imageSrc: string[];
  onMint: (name: string, description: string) => Promise<string | null>;
  onisPending: boolean;
  onisConfirming: boolean;
  onisConfirmed: boolean;
  ontxError: string | null;
}

export default function MintNFTModal({
  isOpen,
  onClose,
  imageSrc,
  onMint,
  onisPending,
  onisConfirming,
  onisConfirmed,
  ontxError,
}: MintNFTModalProps) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const { showToast } = useToast();
  const [isMinting, setIsMinting] = useState(false);
  const hasShownToast = useRef({
    error: false,
    confirming: false,
    confirmed: false,
  });

  // Reset toast refs when the modal closes
  useEffect(() => {
    if (!isOpen) {
      hasShownToast.current.error = false;
      hasShownToast.current.confirming = false;
      hasShownToast.current.confirmed = false;
    }
  }, [isOpen]);

  useEffect(() => {
    if (ontxError && !hasShownToast.current.error) {
      showToast("Transaction failed!", "error");
      hasShownToast.current.error = true;
    }
  }, [ontxError, showToast]);

  useEffect(() => {
    if (onisConfirming && !hasShownToast.current.confirming) {
      showToast("Transaction confirming...", "info");
      hasShownToast.current.confirming = true;
    }
  }, [onisConfirming, showToast]);

  useEffect(() => {
    if (onisConfirmed && !hasShownToast.current.confirmed) {
      showToast("NFT successfully minted!", "success");
      hasShownToast.current.confirmed = true;
      setIsMinting(false);
      onClose(); // Ensure onClose is memoized to prevent infinite loops
    }
  }, [onisConfirmed, showToast, onClose]); // onClose must be stable

  const handleMint = async () => {
    if (!name || !description) {
      showToast("Both name and description are required.", "warning");
      return;
    }
    setIsMinting(true);
    const result = await onMint(name, description);
    if (!result) {
      showToast("Minting failed.", "error");
      setIsMinting(false);
    }
  };

  return (
    <div
      className={`fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50 ${
        isOpen ? "block" : "hidden"
      }`}
    >
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 w-full max-w-2xl overflow-hidden relative">
        <h2 className="text-2xl font-semibold text-gray-800 dark:text-white mb-6">
          Create Your NFT
        </h2>

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-3xl text-gray-800 dark:text-white hover:text-gray-500 dark:hover:text-gray-300 transition duration-300 ease-in-out transform hover:scale-110"
        >
          ✕
        </button>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* NFT Preview */}
          <div className="flex justify-center items-center relative border rounded-xl overflow-hidden bg-gray-100 dark:bg-gray-700 transition-transform transform hover:scale-105 hover:shadow-xl">
            {imageSrc.length > 0 ? (
              imageSrc.map((src, index) => (
                <Image
                  key={index}
                  src={src}
                  alt={`NFT Preview ${index + 1}`}
                  className="absolute inset-0 w-full h-full object-cover transition-all duration-300 transform hover:scale-110"
                  layout="fill"
                />
              ))
            ) : (
              <p className="text-center text-gray-500 dark:text-gray-300">
                No image available for preview.
              </p>
            )}
          </div>

          {/* Metadata Form */}
          <div className="space-y-4 w-full">
            <label className="block">
              <span className="text-gray-700 dark:text-gray-300 font-medium">
                NFT Name
              </span>
              <input
                type="text"
                className="mt-1 block w-full p-3 border rounded-lg dark:bg-gray-700 dark:border-gray-600"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter NFT name"
              />
            </label>

            <label className="block">
              <span className="text-gray-700 dark:text-gray-300 font-medium">
                Description
              </span>
              <textarea
                className="mt-1 block w-full p-3 border rounded-lg dark:bg-gray-700 dark:border-gray-600"
                rows={4}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Enter a brief description"
              />
            </label>

            <div className="flex gap-4 mt-6">
              <button
                onClick={handleMint}
                className={`w-full py-4 text-white rounded-lg shadow-md transition ease-in-out duration-300 transform ${
                  onisPending || isMinting
                    ? "bg-blue-300 cursor-not-allowed"
                    : "bg-blue-500 hover:bg-blue-600"
                }`}
                disabled={onisPending || isMinting}
              >
                {onisPending || isMinting ? "Minting..." : "Mint NFT"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
