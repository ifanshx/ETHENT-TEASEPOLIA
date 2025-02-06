"use client";

import ParticleBackground from "@/components/ParticleBackground";
import { METADATA_TRAITS } from "@/constants/metadata";
import { useToast } from "@/context/ToastContext";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { Dices } from "lucide-react";
import { PinataSDK } from "pinata-web3";
import { useEffect, useState, useMemo, useRef } from "react";
import {
  BaseError,
  useAccount,
  useReadContract,
  useWaitForTransactionReceipt,
  useWriteContract,
} from "wagmi";
import { parseEther } from "viem";
import { mintNFTABI, mintNFTAddress } from "@/constants/ContractAbi";

// Inisialisasi Pinata SDK
const pinata = new PinataSDK({
  pinataJwt:
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySW5mb3JtYXRpb24iOnsiaWQiOiJhZGM4OGQ0OC0wMDg4LTRjMmMtOGIxMS01NjRkODQxZTMwYzAiLCJlbWFpbCI6ImlyZmFhbnNob29kaXExOTU0QGdtYWlsLmNvbSIsImVtYWlsX3ZlcmlmaWVkIjp0cnVlLCJwaW5fcG9saWN5Ijp7InJlZ2lvbnMiOlt7ImRlc2lyZWRSZXBsaWNhdGlvbkNvdW50IjoxLCJpZCI6IkZSQTEifV0sInZlcnNpb24iOjF9LCJtZmFfZW5hYmxlZCI6ZmFsc2UsInN0YXR1cyI6IkFDVElWRSJ9LCJhdXRoZW50aWNhdGlvblR5cGUiOiJzY29wZWRLZXkiLCJzY29wZWRLZXlLZXkiOiJmNjE4OTRkYzRiNTM3Y2VlZjg4YyIsInNjb3BlZEtleVNlY3JldCI6IjRjNjg1YTIxOWQwM2FiOTAwZWYyMGU1Y2I2MGZhMDRjMzdiODA0ZWE0NWViNDFhZDk1MjM0ZmRiNDkwMThiNjkiLCJleHAiOjE3Njk5NDEwOTZ9.kElikjPEK_-KCZom76QxOroAHEc-2jAmiqBRjrieZJk",
  pinataGateway: "https://red-equivalent-hawk-791.mypinata.cloud/",
});

// Definisi tipe untuk trait
type TraitType =
  | "Background"
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

type SelectedTraits = {
  [key in TraitType]: string;
};

export default function Home() {
  const traits: TraitType[] = [
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

  const { showToast } = useToast();
  const { isConnected, address } = useAccount();

  // State untuk trait aktif, list trait, supply, dan status upload
  const [activeTraits, setActiveTraits] = useState<TraitType>("Background");
  const [listTraits, setListTraits] = useState<string[]>([]);
  const [isHoveringPreview, setIsHoveringPreview] = useState(false);
  const [maxSupply, setMaxSupply] = useState<number | null>(null);
  const [totalSupply, setTotalSupply] = useState<number | null>(null);
  const [selectedTraits, setSelectedTraits] = useState<SelectedTraits>({
    Background: "",
    Speciality: "",
    Skin: "",
    Clothes: "",
    Beard: "",
    Head: "",
    Eyes: "",
    Mustache: "",
    Nose: "",
    Coin: "",
    Hands: "",
  });
  const [isUploading, setIsUploading] = useState<boolean>(false);

  // Membersihkan localStorage saat mount (jika diperlukan)
  useEffect(() => {
    localStorage.clear();
  }, []);

  // Update listTraits berdasarkan trait aktif
  useEffect(() => {
    const defaultTraits = METADATA_TRAITS[activeTraits] || [];
    setListTraits([...defaultTraits]);
  }, [activeTraits]);

  // Fungsi untuk memilih trait secara acak untuk setiap kategori
  const handleRandomTraits = (): void => {
    const randomSelection: Partial<SelectedTraits> = {};
    traits.forEach((trait) => {
      const options = METADATA_TRAITS[trait] as string[] | undefined;
      if (options && options.length > 0) {
        const randomIndex = Math.floor(Math.random() * options.length);
        randomSelection[trait] = options[randomIndex];
      } else {
        console.warn(`No available options for trait: ${trait}`);
        randomSelection[trait] = "";
      }
    });
    setSelectedTraits(randomSelection as SelectedTraits);
  };

  // Fungsi untuk memilih atau membatalkan pilihan trait pada kategori aktif
  const handleSelectTrait = (item: string): void => {
    setSelectedTraits((prev) => ({
      ...prev,
      [activeTraits]:
        prev[activeTraits] === item
          ? activeTraits === "Background"
            ? item
            : ""
          : item,
    }));
  };

  // Wagmi hooks for contract interactions
  const {
    data: txHash,
    error: txError,
    isPending,
    writeContract,
  } = useWriteContract();
  const { isLoading: isConfirming, isSuccess: isConfirmed } =
    useWaitForTransactionReceipt({ hash: txHash });

  // Use refs to track previous transaction states to avoid duplicate toast notifications
  const prevIsConfirming = useRef<boolean>(false);
  const prevIsConfirmed = useRef<boolean>(false);
  const prevTxError = useRef<BaseError | Error | null>(null);

  useEffect(() => {
    if (isConfirming && !prevIsConfirming.current) {
      showToast("Transaction is being confirmed...", "info");
    }
    prevIsConfirming.current = isConfirming;

    if (isConfirmed && !prevIsConfirmed.current) {
      showToast("NFT Minted Successfully!", "success");
    }
    prevIsConfirmed.current = isConfirmed;

    if (txError && txError !== prevTxError.current) {
      const errorMessage =
        txError instanceof BaseError
          ? txError.shortMessage || txError.message
          : "Transaction Failed";
      showToast(errorMessage, "error");
      prevTxError.current = txError;
    }
  }, [isConfirming, isConfirmed, txError, showToast]);

  // Read contract values for maxSupply and totalSupply
  const { data: maxSupplyData } = useReadContract({
    address: mintNFTAddress,
    abi: mintNFTABI,
    functionName: "MAX_SUPPLY",
  });

  const { data: totalSupplyData } = useReadContract({
    address: mintNFTAddress,
    abi: mintNFTABI,
    functionName: "totalSupply",
  });

  useEffect(() => {
    if (maxSupplyData) setMaxSupply(Number(maxSupplyData));
    if (totalSupplyData) setTotalSupply(Number(totalSupplyData));
  }, [maxSupplyData, totalSupplyData]);

  // Read the minted NFT count for the connected user
  const { data: mintedCount } = useReadContract({
    address: mintNFTAddress,
    abi: mintNFTABI,
    functionName: "userBalance",
    args: [address || "0x0000000000000000000000000000000000000000"],
  });

  // Function to mint the NFT
  const handleMintNFT = async (): Promise<string | null> => {
    if (!isConnected) {
      showToast("Please connect your wallet first", "error");
      return null;
    }

    try {
      // Define NFT metadata
      const nftName = "Ethereal Entities";
      const nftDescription =
        "Ethereal Entities is an NFT collection featuring mystical creatures from another world, combining digital art with spiritual essence. Each entity comes with a unique aura, carrying a mysterious story waiting to be revealed.";

      // Begin the upload process
      setIsUploading(true);
      showToast("Uploading image...", "info");

      // Create an image from a canvas by drawing selected trait images
      const imageName = `${nftName.replace(/\s+/g, "_")}.png`;
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");
      if (!ctx) throw new Error("Could not get canvas context");

      canvas.width = 1000;
      canvas.height = 1000;

      // Helper function to load and draw an image for a trait onto the canvas
      const loadImage = async (trait: TraitType): Promise<void> => {
        if (!selectedTraits[trait]) return;
        return new Promise<void>((resolve, reject) => {
          const img = new Image();
          img.onload = () => {
            ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
            resolve();
          };
          img.onerror = () =>
            reject(new Error(`Failed to load image for trait ${trait}`));

          // Use custom image from localStorage if the trait starts with "custom-"
          if (selectedTraits[trait].startsWith("custom-")) {
            const dataUrl = localStorage.getItem(selectedTraits[trait]);
            img.src = dataUrl || "";
          } else {
            img.src = `/assets/${trait}/${selectedTraits[trait]}`;
          }
        });
      };

      // Draw all selected trait images onto the canvas
      await Promise.all(traits.map((trait) => loadImage(trait)));

      // Convert canvas to a Blob (PNG format)
      const blob = await new Promise<Blob | null>((resolve) =>
        canvas.toBlob((b) => resolve(b), "image/png")
      );
      if (!blob) throw new Error("Could not create blob from canvas");

      // Upload the image to Pinata and get the IPFS URL
      const imageFile = new File([blob], imageName, { type: "image/png" });
      const imageUploadResponse = await pinata.upload.file(imageFile);
      const imageCID = imageUploadResponse.IpfsHash;
      const imageUrl = `https://red-equivalent-hawk-791.mypinata.cloud/ipfs/${imageCID}`;

      // Notify the user and then upload the metadata
      showToast("Uploading metadata...", "info");
      const metadata = {
        name: nftName,
        description: nftDescription,
        image: imageUrl,
        attributes: traits.map((trait) => ({
          trait_type: trait,
          value: selectedTraits[trait] || "None",
        })),
      };

      // Create metadata file and upload to Pinata
      const metadataFile = new File(
        [JSON.stringify(metadata, null, 2)],
        `${nftName.replace(/\s+/g, "_")}.json`,
        { type: "application/json" }
      );
      const metadataUploadResponse = await pinata.upload.file(metadataFile);
      const metadataCID = metadataUploadResponse.IpfsHash;
      const metadataUri = `ipfs://${metadataCID}`;
      console.log("Metadata CID:", metadataCID);

      // Finish the upload process
      setIsUploading(false);

      // Execute the mint transaction with the uploaded metadata URI
      const transaction = await writeContract({
        address: mintNFTAddress,
        abi: mintNFTABI,
        functionName: "mint",
        args: [BigInt(1), metadataUri],
        value: parseEther("5"),
      });
      console.log("Transaction:", transaction);
      return "Minting successful";
    } catch (error) {
      showToast("Error during NFT minting", "error");
      console.error(error);
      setIsUploading(false);
      return null;
    }
  };

  // Membuat preview image berdasarkan trait yang telah dipilih
  const previewImage = useMemo(() => {
    return traits
      .map((trait) => {
        if (!selectedTraits[trait]) return null;
        return selectedTraits[trait].startsWith("custom-")
          ? localStorage.getItem(selectedTraits[trait]) || ""
          : `/assets/${trait}/${selectedTraits[trait]}`;
      })
      .filter((src) => src !== null) as string[];
  }, [selectedTraits, traits]);

  return (
    <main className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 dark:bg-gradient-to-br dark:from-gray-900 dark:to-blue-900 transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header Section */}
        <div className="text-center mb-16 space-y-1">
          <h1 className="text-6xl font-extrabold tracking-tight bg-gradient-to-r from-blue-400 via-purple-500 to-pink-400 bg-clip-text text-transparent animate-gradient mb-4">
            ETHEREAL ENTITIES
          </h1>
          {/* Total Supply Section */}
          <div className="space-y-2">
            <p className="text-3xl font-extrabold text-gray-600 dark:text-gray-300 uppercase tracking-wider">
              Total Supply
            </p>
            <div className="text-2xl font-extrabold text-transparent bg-gradient-to-r from-blue-400 via-purple-500 to-pink-400 bg-clip-text">
              {totalSupply || 0}/{maxSupply}
            </div>
          </div>
        </div>

        <div className="flex flex-col-reverse lg:flex-row gap-8">
          {/* Left Panel */}
          <div className="flex-1 max-w-2xl">
            <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-2xl p-6 border border-gray-100 dark:border-gray-700 transition-all duration-300">
              {/* Trait Selector */}
              <div className="hidden md:flex gap-2 mb-6 flex-wrap">
                {traits.map((item) => (
                  <button
                    key={item}
                    onClick={() => setActiveTraits(item)}
                    className={`
                      px-4 py-2 text-sm font-medium rounded-xl transition-all transform hover:-translate-y-0.5
                      ${
                        activeTraits === item
                          ? "bg-gradient-to-r from-blue-400 to-purple-500 text-white shadow-lg"
                          : "text-gray-600 dark:text-gray-300 bg-gray-50 dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600"
                      }
                    `}
                  >
                    {item}
                  </button>
                ))}
              </div>

              {/* Mobile Trait Selector */}
              <div className="md:hidden block mt-5 mb-6 space-y-2.5">
                <label
                  htmlFor="mobile-trait-select"
                  className="text-[13px] font-semibold text-gray-700/90 uppercase tracking-wider flex items-center"
                >
                  <span className="bg-gradient-to-r from-indigo-600/20 to-blue-400/20 px-2 py-1.5 rounded-l-md border-l-4 border-indigo-500/80 mr-2">
                    CHARACTER TRAIT
                  </span>
                </label>
                <div className="relative group">
                  <select
                    id="mobile-trait-select"
                    onChange={(e) =>
                      setActiveTraits(e.target.value as TraitType)
                    }
                    value={activeTraits}
                    className="
                      w-full pl-5 pr-12 py-3.5 text-[15px] font-medium text-gray-800
                      bg-white border border-gray-300/80 rounded-xl shadow-sm
                      focus:outline-none focus:ring-2 focus:ring-indigo-500/80 focus:ring-offset-1
                      hover:border-indigo-400/90 transition-all duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] cursor-pointer appearance-none
                    "
                  >
                    {traits.map((item) => (
                      <option
                        key={item}
                        value={item}
                        className="text-sm font-medium text-gray-700 py-2.5 checked:bg-indigo-50"
                      >
                        {item}
                      </option>
                    ))}
                  </select>
                  {/* Custom Chevron */}
                  <div className="absolute right-4 top-1/2 -translate-y-1/5 pointer-events-none">
                    <svg
                      className="w-5 h-5 text-gray-500/90 group-hover:text-indigo-600 transition-colors"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2.2}
                        d="M19 9l-7 7-7-7"
                      />
                    </svg>
                  </div>
                </div>
              </div>

              {/* Traits Grid */}
              <div className="h-[480px] bg-gray-50/50 dark:bg-gray-900/50 rounded-xl border border-gray-200 dark:border-gray-700 p-4 overflow-y-auto custom-scrollbar">
                <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-5 gap-3">
                  {listTraits.map((item, index) => (
                    <div
                      key={`${activeTraits}-${item}-${index}`}
                      onClick={() => handleSelectTrait(item)}
                      className={`
                        group relative aspect-square rounded-xl overflow-hidden cursor-pointer transition-all duration-300 hover:scale-105 hover:z-10
                        ${
                          selectedTraits[activeTraits] === item
                            ? "ring-4 ring-blue-400 ring-offset-2 scale-105 shadow-xl"
                            : "hover:ring-2 hover:ring-blue-200 dark:hover:ring-blue-800"
                        }
                        ${
                          !selectedTraits[activeTraits] ? "animate-fade-in" : ""
                        }
                      `}
                    >
                      {selectedTraits[activeTraits] === item && (
                        <div className="absolute top-2 right-2 bg-blue-400 text-white p-1.5 rounded-full z-10 animate-pop-in">
                          <svg
                            className="w-4 h-4"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth="2.5"
                              d="M5 13l4 4L19 7"
                            />
                          </svg>
                        </div>
                      )}
                      <div className="relative w-full h-full transform transition-transform duration-300 group-hover:scale-110">
                        {item.startsWith("custom-") ? (
                          <img
                            src={localStorage.getItem(item) || ""}
                            alt={`Custom ${activeTraits}`}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <img
                            src={`/assets/${activeTraits}/${item}`}
                            alt={`Trait ${item}`}
                            className="object-cover"
                            sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, (max-width: 1024px) 25vw, 20vw"
                          />
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mt-8 space-y-3 sm:space-y-0">
              <ConnectButton />
              <button
                onClick={handleRandomTraits}
                className="w-full sm:w-auto flex items-center justify-center gap-2 h-12 px-6 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all text-gray-700 dark:text-gray-200 font-medium group"
              >
                <Dices className="w-5 h-5 text-blue-400 group-hover:rotate-180 transition-transform" />
                Randomize
              </button>
              <button
                onClick={handleMintNFT}
                disabled={
                  !isConnected ||
                  !previewImage.length ||
                  (mintedCount !== undefined && Number(mintedCount) >= 5) ||
                  isPending ||
                  isUploading
                }
                className={`px-6 py-3 rounded-xl font-semibold text-white transition-all ${
                  !isConnected ||
                  !previewImage.length ||
                  (mintedCount && Number(mintedCount) >= 5) ||
                  isPending ||
                  isUploading
                    ? "bg-gray-400 cursor-not-allowed"
                    : "bg-blue-600 hover:bg-blue-700"
                }`}
              >
                {isUploading ? (
                  <>
                    <div className="w-4 h-4 animate-spin" />
                    Uploading Assets...
                  </>
                ) : isPending ? (
                  <>
                    <div className="w-4 h-4 animate-spin" />
                    Confirming...
                  </>
                ) : (
                  `Mint NFT (${mintedCount || 0}/5)`
                )}
              </button>
            </div>
          </div>

          {/* Right Preview Panel */}
          <div className="flex-1 lg:max-w-xl">
            <div
              className="relative aspect-square bg-gradient-to-br from-gray-50 dark:from-gray-800 to-white dark:to-gray-900 rounded-3xl shadow-2xl border-8 border-white dark:border-gray-800 overflow-hidden transition-all duration-300 transform hover:scale-105 hover:shadow-blue-500/50"
              onMouseEnter={() => setIsHoveringPreview(true)}
              onMouseLeave={() => setIsHoveringPreview(false)}
            >
              <div className="absolute inset-0 rounded-2xl overflow-hidden">
                <div
                  className={`absolute inset-0 bg-gradient-to-r from-blue-400 via-purple-500 to-pink-400 opacity-20 ${
                    isHoveringPreview ? "animate-rotate" : ""
                  }`}
                />
              </div>
              <div className="absolute inset-2 bg-gray-100 dark:bg-gray-900 rounded-2xl overflow-hidden">
                {traits.map((trait) => {
                  if (!selectedTraits[trait]) return null;
                  const src = selectedTraits[trait].startsWith("custom-")
                    ? localStorage.getItem(selectedTraits[trait]) || ""
                    : `/assets/${trait}/${selectedTraits[trait]}`;
                  return (
                    <img
                      key={trait}
                      src={src}
                      alt={trait}
                      className="absolute inset-0 object-contain p-4"
                    />
                  );
                })}
                {!traits.some((trait) => selectedTraits[trait]) && (
                  <div className="absolute inset-0 flex items-center justify-center text-gray-400 dark:text-gray-600">
                    <div className="text-center space-y-4 animate-pulse">
                      <div className="w-24 h-24 mx-auto bg-gradient-to-r from-blue-400 to-purple-500 rounded-full blur-xl opacity-30" />
                      <p className="font-medium text-lg">
                        Start Creating Your NFT
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
      <ParticleBackground />
    </main>
  );
}
