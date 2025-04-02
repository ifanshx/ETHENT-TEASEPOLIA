"use client";

import ParticleBackground from "@/components/ParticleBackground";
import { METADATA_TRAITS } from "@/constants/metadata";
import { useToast } from "@/context/ToastContext";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { Dices } from "lucide-react";
import { PinataSDK } from "pinata";
import { useEffect, useState, useMemo, useRef } from "react";
import {
  BaseError,
  useAccount,
  useBalance, // <-- Tambahkan import useBalance
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

  // Mengambil saldo wallet menggunakan useBalance
  const { data: balanceData } = useBalance({
    address: address,
  });

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

  const [imageFileId, setImageFileId] = useState<string | null>(null);
  const [metadataFileId, setMetadataFileId] = useState<string | null>(null);

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
      // 🔥 Hapus file dari Pinata jika transaksi gagal
      (async () => {
        if (imageFileId) {
          try {
            await pinata.files.public.delete([imageFileId]);
            console.log(
              `File with ID ${imageFileId} deleted due to transaction failure.`
            );
          } catch (deleteError) {
            console.error(
              `Failed to delete image with ID ${imageFileId}:`,
              deleteError
            );
          }
        }

        if (metadataFileId) {
          try {
            await pinata.files.public.delete([metadataFileId]);
            console.log(
              `File with ID ${metadataFileId} deleted due to transaction failure.`
            );
          } catch (deleteError) {
            console.error(
              `Failed to delete metadata with ID ${metadataFileId}:`,
              deleteError
            );
          }
        }
      })();

      prevTxError.current = txError;
    }
  }, [
    isConfirming,
    isConfirmed,
    txError,
    imageFileId,
    metadataFileId,
    showToast,
  ]);

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
  // const handleMintNFT = async (): Promise<string | null> => {
  //   if (!isConnected) {
  //     showToast("Please connect your wallet first", "error");
  //     return null;
  //   }

  //   let imageCID: string | null = null;
  //   let metadataCID: string | null = null;
  //   let imageFileId: string | null = null;
  //   let metadataFileId: string | null = null;

  //   try {
  //     setIsUploading(true);
  //     showToast("Uploading image...", "info");

  //     // Nama dan deskripsi NFT
  //     const nftName = "Ethereal Entities";
  //     const nftDescription =
  //       "Ethereal Entities is an NFT collection featuring mystical creatures from another world.";

  //     // 🔥 1. Optimalkan ukuran canvas
  //     const canvas = document.createElement("canvas");
  //     const ctx = canvas.getContext("2d");
  //     if (!ctx) throw new Error("Could not get canvas context");

  //     canvas.width = 150; // 🔥 Ukuran lebih kecil agar file tidak besar
  //     canvas.height = 150;

  //     // Fungsi untuk load dan menggambar trait pada canvas
  //     const loadImage = async (trait: TraitType): Promise<void> => {
  //       if (!selectedTraits[trait]) return;
  //       return new Promise<void>((resolve, reject) => {
  //         const img = new Image();
  //         img.onload = () => {
  //           ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
  //           resolve();
  //         };
  //         img.onerror = () =>
  //           reject(new Error(`Failed to load image for trait ${trait}`));

  //         if (selectedTraits[trait].startsWith("custom-")) {
  //           const dataUrl = localStorage.getItem(selectedTraits[trait]);
  //           img.src = dataUrl || "";
  //         } else {
  //           img.src = `/assets/${trait}/${selectedTraits[trait]}`;
  //         }
  //       });
  //     };

  //     await Promise.all(traits.map((trait) => loadImage(trait)));

  //     // 🔥 2. Simpan ke WEBP (lebih kecil)
  //     const blob = await new Promise<Blob>((resolve, reject) =>
  //       canvas.toBlob(
  //         (b) =>
  //           b ? resolve(b) : reject(new Error("Failed to create WEBP blob")),
  //         "image/webp",
  //         0.8
  //       )
  //     );

  //     // Upload ke IPFS (Pinata)
  //     const imageFile = new File([blob], `${nftName}.webp`, {
  //       type: "image/webp",
  //     });
  //     const imageUploadResponse = await pinata.upload.public.file(imageFile);
  //     imageFileId = imageUploadResponse.id; // Simpan ID file gambar
  //     setImageFileId(imageFileId); // Simpan imageFileId di state
  //     imageCID = imageUploadResponse.cid; // Simpan CID gambar
  //     const imageUrl = `https://red-equivalent-hawk-791.mypinata.cloud/ipfs/${imageCID}`;

  //     showToast("Uploading metadata...", "info");

  //     // Metadata NFT
  //     const metadata = {
  //       name: nftName,
  //       description: nftDescription,
  //       image: imageUrl,
  //       attributes: traits.map((trait) => ({
  //         trait_type: trait,
  //         value: selectedTraits[trait] || "None",
  //       })),
  //     };

  //     // Upload Metadata ke IPFS
  //     const metadataFile = new File(
  //       [JSON.stringify(metadata, null, 2)],
  //       `${nftName}.json`,
  //       { type: "application/json" }
  //     );
  //     const metadataUploadResponse = await pinata.upload.public.file(
  //       metadataFile
  //     );
  //     metadataFileId = metadataUploadResponse.id; // Simpan ID file metadata
  //     setMetadataFileId(metadataFileId); // Simpan metadataFileId di state
  //     metadataCID = metadataUploadResponse.cid; // Simpan CID metadata

  //     const metadataUri = `ipfs://${metadataCID}`;

  //   setIsUploading(false);

  //     // Mint NFT dengan metadata URI
  //     writeContract({
  //       address: mintNFTAddress,
  //       abi: mintNFTABI,
  //       functionName: "mint",
  //       args: [BigInt(1), metadataUri],
  //       value: parseEther("2"),
  //     });

  //     return "Minting successful";
  //   } catch (error) {
  //     showToast("Error during NFT minting", "error");
  //     console.error(error);

  //     try {
  //       if (imageFileId) {
  //         showToast("Deleting image from Pinata...", "info");
  //         const deleteImageResponse = await pinata.files.public.delete([
  //           imageFileId,
  //         ]);

  //         if (
  //           deleteImageResponse.length > 0 &&
  //           deleteImageResponse[0].status === "success"
  //         ) {
  //           console.log(`File with ID ${imageFileId} deleted successfully.`);
  //           showToast("Image deleted from Pinata", "success");
  //         } else {
  //           console.error(
  //             `Failed to delete image with ID ${imageFileId}:`,
  //             deleteImageResponse
  //           );
  //           showToast("Failed to delete image from Pinata", "error");
  //         }
  //       }

  //       if (metadataFileId) {
  //         showToast("Deleting metadata from Pinata...", "info");
  //         const deleteMetadataResponse = await pinata.files.public.delete([
  //           metadataFileId,
  //         ]);

  //         if (
  //           deleteMetadataResponse.length > 0 &&
  //           deleteMetadataResponse[0].status === "success"
  //         ) {
  //           console.log(`File with ID ${metadataFileId} deleted successfully.`);
  //           showToast("Metadata deleted from Pinata", "success");
  //         } else {
  //           console.error(
  //             `Failed to delete metadata with ID ${metadataFileId}:`,
  //             deleteMetadataResponse
  //           );
  //           showToast("Failed to delete metadata from Pinata", "error");
  //         }
  //       }
  //     } catch (deleteError) {
  //       console.error("Error deleting file from Pinata:", deleteError);
  //       showToast("Error deleting file from Pinata", "error");
  //     }

  //     setIsUploading(false);
  //     return null;
  //   }
  // };

  const handleMintNFT = async (): Promise<string | null> => {
    if (!isConnected) {
      showToast("Please connect your wallet first", "error");
      return null;
    }

    try {
      setIsUploading(true);
      showToast("Preparing NFT mint with fallback URIs...", "info");

      const metadataUri =
        "https://red-equivalent-hawk-791.mypinata.cloud/ipfs/bafkreib6i5tbbaszc6d4ty7pizi3uhlkxkhuggzyiek3y3p4nhmqjgeli4";

      // Jika diperlukan, kamu masih bisa melakukan pembuatan canvas untuk preview
      // Namun, karena upload ke IPFS tidak diperlukan, kita lewati langkah tersebut

      setIsUploading(false);

      // Mint NFT menggunakan metadata URI fallback
      writeContract({
        address: mintNFTAddress,
        abi: mintNFTABI,
        functionName: "mint",
        args: [BigInt(1), metadataUri],
        value: parseEther("2"),
      });

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
    <main
      className="min-h-screen bg-cover bg-center bg-no-repeat bg-fixed transition-colors duration-300"
      style={{ backgroundImage: "url('/assets/background.jpg')" }}
    >
      {" "}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header Section */}
        <div className="text-center mb-5 space-y-1">
          <h1 className="text-6xl font-extrabold tracking-tight bg-gradient-to-r from-[#98ff99] via-[#3ccf3e] to-[#c6e9c6] bg-clip-text text-transparent animate-gradient mb-4">
            ETHEREAL ENTITIES
          </h1>
          {/* Total Supply Section */}
          <div className="space-y-2">
            {/* Progress Bar Container */}
            <div className="relative">
              {/* Animated Background Glow */}
              <div className="absolute inset-0 bg-gradient-to-r from-[#98ff99] via-[#3ccf3e] to-[#c6e9c6] blur-xl opacity-20 animate-pulse" />

              {/* Progress Bar */}
              <div className="relative h-4 w-full bg-gray-200 dark:bg-gray-800 rounded-full overflow-hidden shadow-md">
                {/* Outer Border Glow */}
                <div className="absolute inset-0 rounded-full border border-white/10 blur-sm" />

                {/* Progress Bar Inner */}
                <div
                  className="h-full rounded-full bg-gradient-to-r from-[#94ec95] via-[#57ec59] to-[#03ec07] shadow-lg transition-all duration-1000 ease-out relative"
                  style={{
                    width: `${Math.min(
                      (Number(totalSupply || 0) / Number(maxSupply || 1)) * 100,
                      100
                    )}%`,
                  }}
                >
                  {/* Animated Stripe Effect */}
                  <div
                    className="absolute inset-0 bg-[length:40px_40px] opacity-30 animate-progress-stripe"
                    style={{
                      backgroundImage:
                        "linear-gradient(45deg, rgba(255,255,255,0.15) 25%, transparent 25%, transparent 50%, rgba(255,255,255,0.15) 50%, rgba(255,255,255,0.15) 75%, transparent 75%, transparent)",
                    }}
                  />
                </div>
              </div>
            </div>

            {/* Counter Text */}
            <div className="mt-1 text-xl font-extrabold text-transparent bg-gradient-to-r from-[#98ff99] via-[#3ccf3e] to-[#c6e9c6] bg-clip-text text-center">
              {totalSupply || 0}
              <span className="text-gray-400 mx-1">/</span>
              {maxSupply}
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
                          ? "bg-gradient-to-r from-[#98ff99] via-[#6ee7b7] to-[#3ccf3e] text-white shadow-lg"
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
                  (mintedCount !== undefined && Number(mintedCount) >= 20) ||
                  isPending ||
                  isUploading ||
                  (balanceData && balanceData.value < parseEther("2"))
                }
                className={`px-6 py-3 rounded-xl font-semibold text-white transition-all ${
                  !isConnected ||
                  !previewImage.length ||
                  (mintedCount && Number(mintedCount) >= 20) ||
                  isPending ||
                  isUploading ||
                  (balanceData && balanceData.value < parseEther("2"))
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
                  `Mint NFT (${mintedCount || 0}/20)`
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
                  className={`absolute inset-0 bg-gradient-to-r from-[#98ff99] via-[#3ccf3e] to-[#c6e9c6] opacity-40 ${
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
                      <div className="w-24 h-24 mx-auto bg-gradient-to-r from-[#8ce48e] to-[#3ccf3e] rounded-full blur-xl opacity-40" />
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
