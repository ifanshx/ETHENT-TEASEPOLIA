"use client";

import {
  CubeTransparentIcon,
  PhotoIcon,
  SparklesIcon,
  CurrencyDollarIcon,
} from "@heroicons/react/24/outline";
import { METADATA_TRAITS } from "@/constants/metadata";
import { useToast } from "@/context/ToastContext";
import { PinataSDK } from "pinata";
import { useEffect, useState, useMemo, useCallback } from "react"; // Hapus useRef yang tidak digunakan
import {
  useAccount,
  useBalance,
  useReadContract,
  useWaitForTransactionReceipt,
  useWriteContract,
} from "wagmi";
import { parseEther } from "viem";
import { mintNFTABI, mintNFTAddress } from "@/constants/ContractAbi";

// Inisialisasi Pinata SDK dengan environment variables
const pinata = new PinataSDK({
  pinataJwt: process.env.NEXT_PUBLIC_PINATA_JWT,
  pinataGateway: process.env.NEXT_PUBLIC_PINATA_GATEWAY,
});

// Tipe yang lebih dinamis
type TraitType = keyof typeof METADATA_TRAITS;
type SelectedTraits = Record<TraitType, string>;

const LAYER_ORDER: TraitType[] = [
  "Background",
  "Speciality",
  "Skin",
  "Clothes",
  "Beard",
  "Head",
  "Eyes",
  "Mustache",
  "Nose",
  "Coin",
  "Hands",
];

const getOrderedTraits = () => {
  const ordered = LAYER_ORDER.filter((trait) => trait in METADATA_TRAITS);
  const remaining = Object.keys(METADATA_TRAITS).filter(
    (trait) => !LAYER_ORDER.includes(trait as TraitType)
  );
  return [...ordered, ...remaining] as TraitType[];
};

const GenerateImagePage = () => {
  const traits = getOrderedTraits(); // Gunakan fungsi ordering

  const { showToast } = useToast();
  const { isConnected, address } = useAccount();

  const LAYER_ORDER: TraitType[] = [
    "Background",
    "Speciality",
    "Skin",
    "Clothes",
    "Beard",
    "Head",
    "Eyes",
    "Mustache",
    "Nose",
    "Coin",
    "Hands",
  ];

  // Tambahkan type guard
  type TraitType =
    | (keyof typeof METADATA_TRAITS & "Background")
    | "Speciality"
    | "Skin"
    | "Clothes"
    | "Beard"
    | "Head"
    | "Eyes"
    | "Mustache"
    | "Nose"
    | "Coin"
    | "Hands";

  // State management
  const [activeTrait, setActiveTrait] = useState<TraitType>("Background");
  const [selectedTraits, setSelectedTraits] = useState<SelectedTraits>(
    traits.reduce(
      (acc, trait) => ({ ...acc, [trait]: "" }),
      {} as SelectedTraits
    )
  );
  const [isUploading, setIsUploading] = useState(false);
  const [pendingFiles, setPendingFiles] = useState<string[]>([]);

  // Wallet and contract states
  const { data: balance } = useBalance({ address });
  const {
    data: txHash,
    error: txError,
    isPending: isMintPending,
    writeContract,
  } = useWriteContract();
  const { isLoading: isConfirming, isSuccess: isConfirmed } =
    useWaitForTransactionReceipt({
      hash: txHash,
    });

  // Contract data
  const { data: maxSupply } = useReadContract({
    address: mintNFTAddress,
    abi: mintNFTABI,
    functionName: "MAX_SUPPLY",
  });

  const { data: totalSupply } = useReadContract({
    address: mintNFTAddress,
    abi: mintNFTABI,
    functionName: "totalSupply",
  });

  const { data: mintedCount } = useReadContract({
    address: mintNFTAddress,
    abi: mintNFTABI,
    functionName: "totalMinted",
  });

  // Cleanup effect
  useEffect(() => {
    const cleanup = async () => {
      if (pendingFiles.length > 0) {
        await pinata.files.public.delete(pendingFiles);
        setPendingFiles([]);
      }
    };

    return () => {
      cleanup();
    };
  }, [pendingFiles]);

  // Trait selection handlers
  const handleRandomize = useCallback(() => {
    const randomTraits = traits.reduce((acc, trait) => {
      const options = METADATA_TRAITS[trait];
      return {
        ...acc,
        [trait]: options[Math.floor(Math.random() * options.length)] || "",
      };
    }, {} as SelectedTraits);
    setSelectedTraits(randomTraits);
  }, [traits]);

  const handleSelectTrait = useCallback(
    (trait: string) => {
      setSelectedTraits((prev) => ({
        ...prev,
        [activeTrait]: prev[activeTrait] === trait ? "" : trait,
      }));
    },
    [activeTrait]
  );

  // Image composition logic
  const composeImage = useCallback(async (selectedTraits: SelectedTraits) => {
    const canvas = document.createElement("canvas");
    canvas.width = 512;
    canvas.height = 512;
    const ctx = canvas.getContext("2d");

    if (!ctx) throw new Error("Failed to get canvas context");

    // Urutkan berdasarkan LAYER_ORDER terlepas dari struktur folder
    for (const trait of LAYER_ORDER) {
      const asset = selectedTraits[trait];
      if (!asset) continue;

      await new Promise<void>((resolve, reject) => {
        const img = new Image();
        img.onload = () => {
          // Handle berbagai ukuran gambar
          const x = (canvas.width - img.width) / 2;
          const y = (canvas.height - img.height) / 2;
          ctx.drawImage(img, x, y, img.width, img.height);
          resolve();
        };
        img.onerror = reject;
        img.src = `/assets/${trait}/${asset}`; // Path tetap sesuai nama trait
      });
    }

    return canvas.toDataURL("image/webp", 0.9);
  }, []);

  // Minting logic
  const handleMint = useCallback(async () => {
    if (!isConnected || !address) {
      showToast("Please connect wallet first", "error");
      return;
    }

    // Validasi 2: Balance cukup
    if ((balance?.value ?? BigInt(0)) < parseEther("2")) {
      showToast("Insufficient balance", "error");
      return;
    }

    try {
      setIsUploading(true);

      const dataUrl = await composeImage(selectedTraits);
      const blob = await fetch(dataUrl).then((r) => r.blob());

      const imageFile = new File([blob], "nft-image.webp");
      const imageRes = await pinata.upload.public.file(imageFile);
      setPendingFiles((prev) => [...prev, imageRes.id]);

      // Gunakan traits langsung dari METADATA_TRAITS
      const metadata = {
        name: "Ethereal Entity",
        description: "Unique digital collectible",
        image: `ipfs://${imageRes.cid}`,
        attributes: LAYER_ORDER.map((trait) => ({
          trait_type: trait,
          value: selectedTraits[trait] || "None",
        })),
      };

      const metadataFile = new File(
        [JSON.stringify(metadata)],
        "metadata.json",
        { type: "application/json" }
      );
      const metadataRes = await pinata.upload.public.file(metadataFile);

      setPendingFiles((prev) => [...prev, metadataRes.id]);

      writeContract({
        address: mintNFTAddress,
        abi: mintNFTABI,
        functionName: "mint",
        args: [`ipfs://${metadataRes.cid}`], // Hanya 1 parameter
        value: parseEther("2"), // Sesuaikan dengan mintPrice di contract
      });
    } catch (error) {
      showToast("Minting failed", "error");
      console.error(error);
    } finally {
      setIsUploading(false);
    }
  }, [
    address,
    balance?.value,
    composeImage,
    isConnected,
    selectedTraits,
    showToast,
    writeContract,
  ]);

  const isLoading = isUploading || isMintPending || isConfirming;

  // Transaction status handling
  useEffect(() => {
    if (isConfirmed) {
      showToast("NFT minted successfully!", "success");
      setPendingFiles([]);
    }

    if (txError) {
      showToast(txError.message || "Transaction failed", "error");
    }
  }, [isConfirmed, txError, showToast]);

  // Preview image
  const previewImage = useMemo(
    () =>
      LAYER_ORDER.map((trait) => ({
        trait,
        asset: selectedTraits[trait],
      }))
        .filter(({ asset }) => asset)
        .map(
          ({ trait, asset }) => `/assets/${trait}/${asset}` // Path tetap berdasarkan nama trait
        ),
    [selectedTraits]
  );

  return (
    <main className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50">
      <div className="container mx-auto px-4 py-12 max-w-7xl">
        {/* Header Section */}
        <header className="text-center mb-16 space-y-6">
          <div className="relative inline-block">
            <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-pink-500 rounded-xl blur-2xl opacity-30 animate-pulse" />
            <h1 className="relative text-5xl md:text-6xl font-bold bg-gradient-to-r from-purple-600 to-pink-500 bg-clip-text text-transparent">
              Ethereal Entities
            </h1>
          </div>
          <p className="text-lg text-gray-600 font-medium animate-fade-in">
            Craft your unique digital masterpiece
          </p>
        </header>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12 animate-slide-up">
          <div className="bg-white/80 backdrop-blur-lg rounded-2xl p-6 border border-white/20 shadow-xl hover:shadow-2xl transition-shadow duration-300">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 mb-2">Total Minted</p>
                <p className="text-3xl font-bold text-gray-800">
                  {totalSupply || 0}
                  <span className="text-lg text-gray-500">/{maxSupply}</span>
                </p>
              </div>
              <div className="p-3 bg-purple-100 rounded-lg">
                <PhotoIcon className="w-6 h-6 text-purple-600" />
              </div>
            </div>
          </div>

          <div className="bg-white/80 backdrop-blur-lg rounded-2xl p-6 border border-white/20 shadow-xl hover:shadow-2xl transition-shadow duration-300">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 mb-2">Your Balance</p>
                <p className="text-3xl font-bold text-gray-800">
                  {balance?.formatted.slice(0, 7) || "0.00"} TEA
                </p>
              </div>
              <div className="p-3 bg-green-100 rounded-lg">
                <CurrencyDollarIcon className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="grid lg:grid-cols-2 gap-8 mb-24">
          {/* Trait Selector */}
          <div className="bg-white/80 backdrop-blur-lg rounded-2xl p-6 border border-white/20 shadow-xl animate-slide-up">
            <div className="p-4 space-y-4">
              <div className="hidden md:flex flex-wrap justify-center  gap-2 mb-6">
                {traits.map((trait) => (
                  <button
                    key={trait}
                    onClick={() => setActiveTrait(trait)}
                    className={`px-4 py-2 rounded-xl text-sm font-medium transition-all duration-300 ${
                      activeTrait === trait
                        ? "bg-gradient-to-r from-purple-600 to-pink-500 text-white shadow-lg"
                        : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                    }`}
                  >
                    {trait}
                  </button>
                ))}
              </div>

              {/* Mobile Select */}
              <div className="md:hidden mb-6">
                <select
                  value={activeTrait}
                  onChange={(e) => setActiveTrait(e.target.value as TraitType)}
                  className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl text-gray-700 focus:ring-2 focus:ring-purple-200"
                >
                  {traits.map((item) => (
                    <option key={item} value={item}>
                      {item}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3">
              {METADATA_TRAITS[activeTrait].map((asset) => (
                <button
                  key={asset}
                  onClick={() => handleSelectTrait(asset)}
                  className={`group relative aspect-square overflow-hidden rounded-xl border-2 transition-all duration-300 ${
                    selectedTraits[activeTrait] === asset
                      ? "border-purple-500 scale-105 shadow-lg"
                      : "border-gray-200 hover:border-purple-300"
                  }`}
                >
                  <img
                    src={`/assets/${activeTrait}/${asset}`}
                    alt=""
                    className="w-full h-full object-cover transform transition-transform duration-300 group-hover:scale-110"
                  />

                  {selectedTraits[activeTrait] === asset && (
                    <div className="absolute inset-0 bg-purple-500/20 flex items-center justify-center">
                      <div className="w-6 h-6 bg-white rounded-full flex items-center justify-center animate-pop-in">
                        <svg
                          className="w-4 h-4 text-purple-600"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M5 13l4 4L19 7"
                          />
                        </svg>
                      </div>
                    </div>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Preview Panel */}
          <div className="sticky top-6 bg-white/80 backdrop-blur-lg rounded-2xl p-6 border border-white/20 shadow-xl animate-slide-up">
            <div className="aspect-square bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl border-2 border-dashed border-gray-200 flex items-center justify-center overflow-hidden">
              {previewImage.length > 0 ? (
                previewImage.map((src, i) => (
                  <img
                    key={i}
                    src={src}
                    alt="NFT Preview"
                    className="absolute inset-0 w-full h-full object-contain p-4 animate-fade-in"
                    style={{
                      zIndex: i,
                      animationDelay: `${i * 0.1}s`,
                    }}
                  />
                ))
              ) : (
                <div className="text-center space-y-4 animate-fade-in">
                  <div className="inline-block p-4 bg-gradient-to-r from-purple-600 to-pink-500 rounded-2xl shadow-lg animate-float">
                    <SparklesIcon className="w-12 h-12 text-white" />
                  </div>
                  <p className="text-gray-500 font-medium">
                    Combine traits to begin creation
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Mint Controls */}
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 w-full max-w-2xl px-4">
          <div className="bg-white/90 backdrop-blur-xl rounded-xl p-4 border border-white/20 shadow-2xl flex gap-4 animate-slide-up">
            <button
              onClick={handleRandomize}
              className="flex items-center gap-2 px-6 py-3 bg-white hover:bg-gray-50 text-gray-600 rounded-lg transition-all duration-300 shadow-sm hover:shadow-md"
            >
              <CubeTransparentIcon className="w-5 h-5 text-purple-600" />
              <span className="font-medium">Randomize</span>
            </button>

            <button
              onClick={handleMint}
              disabled={!isConnected || isLoading || !previewImage.length}
              className={`flex-1 flex items-center justify-center gap-3 px-6 py-3 rounded-lg transition-all duration-300 ${
                isLoading
                  ? "bg-purple-400 cursor-not-allowed"
                  : "bg-gradient-to-r from-purple-600 to-pink-500 hover:shadow-lg"
              } text-white font-medium relative overflow-hidden`}
            >
              {isLoading && (
                <div className="absolute inset-0 bg-gradient-to-r from-purple-600/20 to-pink-500/20 animate-shimmer" />
              )}

              <div className="relative flex items-center gap-2">
                {isLoading ? (
                  <>
                    <div className="animate-spin w-5 h-5 border-2 border-current rounded-full border-t-transparent" />
                    {isConfirming ? "Confirming..." : "Minting..."}
                  </>
                ) : (
                  <>
                    <SparklesIcon className="w-5 h-5 text-amber-200" />
                    Mint NFT
                    <span className="text-xs bg-white/20 px-2 py-1 rounded-full">
                      {mintedCount?.toString() || 0}/20
                    </span>
                  </>
                )}
              </div>
            </button>
          </div>
        </div>
      </div>
    </main>
  );
};

export default GenerateImagePage;
