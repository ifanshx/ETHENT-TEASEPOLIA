"use client";
import Image from "next/image";
import { useEffect, useState } from "react";

interface MintNFTModalProps {
  isOpen: boolean;
  onClose: () => void;
  imageSrc: string[];
  onMint: (name: string, description: string) => Promise<string | null>;
  confirmationTx: boolean;
  pendingTx: boolean;
}

export default function MintNFTModal({
  isOpen,
  onClose,
  imageSrc,
  onMint,
  confirmationTx,
  pendingTx,
}: MintNFTModalProps) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false); // State for loading
  const [isClient, setIsClient] = useState(false); // State to track client-side rendering

  // Set the isClient flag to true only after the component is mounted on the client
  useEffect(() => {
    setIsClient(true);
  }, []);

  const handleMint = async () => {
    if (!name || !description) {
      setError("Both name and description are required.");
      return;
    }
    setError(null); // Reset error
    setLoading(true); // Set loading to true when minting starts

    const response = await onMint(name, description);
    setLoading(false); // Set loading to false after minting process
    if (response) {
      console.log("NFT Minted:", response);
      onClose(); // Close modal after successful minting
    } else {
      setError("Failed to mint NFT.");
    }
  };

  useEffect(() => {
    if (!isOpen) return;
    // Reset form values when modal opens
    setName("");
    setDescription("");
    setError(null);
    setLoading(false);
  }, [isOpen]);

  if (!isOpen || !isClient) return null; // Ensure client-side rendering

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
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

            {/* Error Message */}
            {error && (
              <div className="text-red-500 text-sm transition-all duration-300 opacity-100">
                {error}
              </div>
            )}
            {pendingTx && (
              <div className="mt-2 text-yellow-600 font-semibold">
                Waiting for confirmation...
              </div>
            )}
            {confirmationTx && (
              <div className="mt-2 text-yellow-600 font-semibold">
                Waiting for confirmation...
              </div>
            )}

            <div className="flex gap-4 mt-6">
              <button
                onClick={handleMint}
                disabled={loading} // Disable button while loading
                className={`w-full py-4 text-white rounded-lg shadow-md transition ease-in-out duration-300 transform ${
                  loading
                    ? "bg-blue-300 cursor-not-allowed"
                    : "bg-blue-500 hover:bg-blue-600"
                }`}
              >
                {loading ? "Minting..." : "Mint NFT"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
