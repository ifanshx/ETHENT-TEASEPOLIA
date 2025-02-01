"use client";
import Image from "next/image";
import { useState } from "react";

interface MintNFTModalProps {
  isOpen: boolean;
  onClose: () => void;
  imageSrc: string[];
  onDownloadImage: (name: string) => void;
  onDownloadMetadata: (name: string, description: string) => void;
}

export default function MintNFTModal({
  isOpen,
  onClose,
  imageSrc,
  onDownloadImage,
  onDownloadMetadata,
}: MintNFTModalProps) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleDownload = () => {
    if (!name || !description) {
      setError("Please fill in both the NFT Name and Description.");
      setTimeout(() => setError(null), 3000); // Peringatan hilang setelah 3 detik
      return;
    }
    setError(null);
    onDownloadImage(name);
    onDownloadMetadata(name, description);
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 w-full max-w-2xl overflow-hidden relative">
        <h2 className="text-2xl font-semibold text-gray-800 dark:text-white mb-6">
          Create Your NFT
        </h2>

        {/* Tombol Close */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-3xl text-gray-800 dark:text-white hover:text-gray-500 dark:hover:text-gray-300 transition duration-300 ease-in-out transform hover:scale-110"
        >
          ✕
        </button>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Gambar NFT */}
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

          {/* Form Metadata */}
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

            {/* Peringatan */}
            {error && (
              <div className="text-red-500 text-sm transition-all duration-300 opacity-100">
                {error}
              </div>
            )}

            {/* Tombol Download */}
            <div className="flex gap-4">
              <button
                onClick={handleDownload}
                className="w-full py-3 bg-blue-500 text-white rounded-lg shadow-md hover:bg-blue-600 transition ease-in-out duration-300"
              >
                MINT
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
