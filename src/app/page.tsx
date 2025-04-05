"use client";

import ParticleBackground from "@/components/ParticleBackground";
import { METADATA_TRAITS } from "@/constants/metadata";
import { useToast } from "@/context/ToastContext";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { Dices } from "lucide-react";
// import { PinataSDK } from "pinata";
import { useEffect, useState, useMemo, useRef } from "react";
import {
  BaseError,
  useAccount,
  useBalance,
  useReadContract,
  useWaitForTransactionReceipt,
  useWriteContract,
} from "wagmi";
import { parseEther } from "viem";
import { mintNFTABI, mintNFTAddress } from "@/constants/ContractAbi";

// Inisialisasi Pinata SDK
// const pinata = new PinataSDK({
//   pinataJwt:
//     "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySW5mb3JtYXRpb24iOnsiaWQiOiJhZGM4OGQ0OC0wMDg4LTRjMmMtOGIxMS01NjRkODQxZTMwYzAiLCJlbWFpbCI6ImlyZmFhbnNob29kaXExOTU0QGdtYWlsLmNvbSIsImVtYWlsX3ZlcmlmaWVkIjp0cnVlLCJwaW5fcG9saWN5Ijp7InJlZ2lvbnMiOlt7ImRlc2lyZWRSZXBsaWNhdGlvbkNvdW50IjoxLCJpZCI6IkZSQTEifV0sInZlcnNpb24iOjF9LCJtZmFfZW5hYmxlZCI6ZmFsc2UsInN0YXR1cyI6IkFDVElWRSJ9LCJhdXRoZW50aWNhdGlvblR5cGUiOiJzY29wZWRLZXkiLCJzY29wZWRLZXlLZXkiOiJmNjE4OTRkYzRiNTM3Y2VlZjg4YyIsInNjb3BlZEtleVNlY3JldCI6IjRjNjg1YTIxOWQwM2FiOTAwZWYyMGU1Y2I2MGZhMDRjMzdiODA0ZWE0NWViNDFhZDk1MjM0ZmRiNDkwMThiNjkiLCJleHAiOjE3Njk5NDEwOTZ9.kElikjPEK_-KCZom76QxOroAHEc-2jAmiqBRjrieZJk",
//   pinataGateway: "https://red-equivalent-hawk-791.mypinata.cloud/",
// });

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

  // const [imageFileId, setImageFileId] = useState<string | null>(null);
  // const [metadataFileId, setMetadataFileId] = useState<string | null>(null);

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
      // (async () => {
      //   if (imageFileId) {
      //     try {
      //       await pinata.files.public.delete([imageFileId]);
      //       console.log(
      //         `File with ID ${imageFileId} deleted due to transaction failure.`
      //       );
      //     } catch (deleteError) {
      //       console.error(
      //         `Failed to delete image with ID ${imageFileId}:`,
      //         deleteError
      //       );
      //     }
      //   }

      //   if (metadataFileId) {
      //     try {
      //       await pinata.files.public.delete([metadataFileId]);
      //       console.log(
      //         `File with ID ${metadataFileId} deleted due to transaction failure.`
      //       );
      //     } catch (deleteError) {
      //       console.error(
      //         `Failed to delete metadata with ID ${metadataFileId}:`,
      //         deleteError
      //       );
      //     }
      //   }
      // })
      // ();

      prevTxError.current = txError;
    }
  }, [
    isConfirming,
    isConfirmed,
    txError,
    // imageFileId,
    // metadataFileId,
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
    <main className="min-h-screen bg-gradient-to-br from-gray-900 via-emerald-900 to-teal-900 relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 relative z-10">
        {/* Header Section dengan Animasi Text Glow */}
        <div className="text-center mb-10 space-y-6">
          <h1 className="text-6xl font-bold tracking-tighter bg-gradient-to-r from-emerald-400 via-teal-400 to-green-400 bg-clip-text text-transparent animate-text-glow">
            ETHEREAL ENTITIES
          </h1>

          {/* Supply Counter */}
          <div className="inline-block bg-gradient-to-br from-emerald-900/30 to-teal-900/30 backdrop-blur-xl p-4 rounded-2xl border-2 border-emerald-400/40 shadow-2xl neon-glow transform-gpu transition-all duration-300 hover:scale-[1.02] hover:rotate-[0.5deg] group relative overflow-hidden">
            {/* Gradient shine effect */}
            <div className="absolute inset-0 bg-[conic-gradient(at_top_right,_var(--tw-gradient-stops))] from-emerald-400/10 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

            {/* Floating numbers */}
            <div className="flex items-center justify-center gap-3 relative">
              <span className="text-2xl font-mono font-bold bg-gradient-to-r from-emerald-300 to-teal-400 bg-clip-text text-transparent animate-float">
                {totalSupply || 0}
              </span>

              {/* Animated separator */}
              <div className="h-6 w-[2px] bg-gradient-to-b from-emerald-400/80 to-teal-400/80 animate-pulse" />

              <span className="text-2xl font-mono font-bold bg-gradient-to-r from-teal-400 to-emerald-300 bg-clip-text text-transparent animate-float-delay">
                {maxSupply}
              </span>
            </div>

            {/* Label with subtle animation */}
            <div className="mt-1 text-sm font-medium bg-gradient-to-r from-emerald-300/80 to-teal-300/80 bg-clip-text text-transparent tracking-wider animate-text-shimmer">
              <span className="mr-1">🌟</span>MINTED / TOTAL
              <span className="ml-1">🌟</span>
            </div>

            {/* Particle effect */}
            <div className="absolute inset-0 pointer-events-none">
              {[...Array(6)].map((_, i) => (
                <div
                  key={i}
                  className="absolute w-1 h-1 bg-emerald-400/30 rounded-full animate-particle"
                  style={{
                    top: `${Math.random() * 100}%`,
                    left: `${Math.random() * 100}%`,
                    animationDelay: `${i * 0.2}s`,
                  }}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid lg:grid-cols-2 gap-6">
          {/* Left Panel - Configuration */}
          <div className="bg-gray-800/30 backdrop-blur-lg rounded-xl border-2 border-emerald-400/20 shadow-xl p-5">
            {/* Trait Selection */}
            <div className="mb-6 space-y-5">
              {/* Desktop Tabs */}
              <div className="hidden md:flex flex-wrap gap-2 justify-center">
                {traits.map((item) => (
                  <button
                    key={item}
                    onClick={() => setActiveTraits(item)}
                    className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors
                ${
                  activeTraits === item
                    ? "bg-emerald-600 text-white shadow-md"
                    : "bg-gray-700/40 text-emerald-200 hover:bg-emerald-700/30"
                }`}
                  >
                    {item}
                  </button>
                ))}
              </div>

              {/* Mobile Dropdown */}
              <div className="md:hidden">
                <select
                  value={activeTraits}
                  onChange={(e) => setActiveTraits(e.target.value as TraitType)}
                  className="w-full bg-emerald-900/30 border-2 border-emerald-400/20 rounded-lg p-3 text-emerald-200 text-sm"
                >
                  {traits.map((item) => (
                    <option key={item} value={item} className="bg-gray-900">
                      {item}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Traits Grid */}
            <div className="bg-white/5 rounded-xl border-2 border-purple-400/20 overflow-hidden group">
              <div className="h-[500px] overflow-y-auto custom-scrollbar p-3">
                <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3">
                  {listTraits.map((item, index) => (
                    <div
                      key={`${activeTraits}-${item}-${index}`}
                      onClick={() => handleSelectTrait(item)}
                      className={`relative aspect-square rounded-lg overflow-hidden cursor-pointer
                  transition-all border-2 ${
                    selectedTraits[activeTraits] === item
                      ? "border-emerald-500 shadow-lg"
                      : "border-transparent hover:border-emerald-400/30"
                  }`}
                    >
                      {selectedTraits[activeTraits] === item && (
                        <div className="absolute top-2 right-2 bg-emerald-500 p-1 rounded-full">
                          <div className="w-2 h-2 bg-white rounded-full" />
                        </div>
                      )}
                      <img
                        src={
                          item.startsWith("custom-")
                            ? localStorage.getItem(item) || ""
                            : `/assets/${activeTraits}/${item}`
                        }
                        alt={item}
                        className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-300"
                      />
                      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-purple-400/10" />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Right Panel - Preview */}
          <div className="sticky top-6 h-fit bg-gray-800/30 backdrop-blur-lg rounded-xl border-2 border-emerald-400/20 shadow-xl p-5">
            <div className="aspect-square bg-gray-900/50 rounded-lg border-2 border-emerald-400/20 overflow-hidden relative">
              {/* Preview Images dengan Animasi */}
              {traits.map(
                (trait) =>
                  selectedTraits[trait] && (
                    <img
                      key={trait}
                      src={
                        selectedTraits[trait].startsWith("custom-")
                          ? localStorage.getItem(selectedTraits[trait]) || ""
                          : `/assets/${trait}/${selectedTraits[trait]}`
                      }
                      alt={trait}
                      className="absolute inset-0 object-contain
                      transition-transform duration-500 ease-in-out
                      transform hover:scale-105
                      w-full h-full p-4 animate-float "
                    />
                  )
              )}

              {/* Empty State dengan Animasi */}
              {!traits.some((trait) => selectedTraits[trait]) && (
                <div className="w-full h-full flex flex-col items-center justify-center p-6">
                  <div className="mb-4 w-16 h-16 bg-emerald-400/20 rounded-full flex items-center justify-center animate-spin-slow">
                    <Dices className="w-8 h-8 text-emerald-400 animate-dance" />
                  </div>
                  <p className="text-emerald-200 text-sm font-medium text-center">
                    Select traits to preview your NFT
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-emerald-900/90 backdrop-blur-xl rounded-xl p-4 shadow-2xl border-2 border-emerald-400/20 min-w-[480px] max-w-[95vw] neon-glow">
          <div className="flex items-center gap-4">
            {/* ... (tombol-tombol) ... */}
            <ConnectButton />

            <button
              onClick={handleRandomTraits}
              className="flex items-center gap-2 px-4 py-2 bg-emerald-600/50 hover:bg-emerald-600/70 rounded-lg text-emerald-200 transition-colors"
            >
              <Dices className="w-5 h-5 text-emerald-400 animate-dance" />
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
              className={`px-6 py-2.5 rounded-lg font-medium transition-colors ${
                !isConnected ||
                !previewImage.length ||
                (mintedCount && Number(mintedCount) >= 20) ||
                isPending ||
                isUploading ||
                (balanceData && balanceData.value < parseEther("2"))
                  ? "bg-gray-600/50 text-gray-400 cursor-not-allowed"
                  : "bg-emerald-600 hover:bg-emerald-700 text-white"
              }`}
            >
              {isUploading || isPending ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white/50 border-t-transparent rounded-full animate-spin" />
                  {isUploading ? "Uploading..." : "Confirming..."}
                </div>
              ) : (
                `Mint NFT (${mintedCount || 0}/20)`
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Background Elements */}
      <div className="fixed inset-0 bg-gradient-to-b from-emerald-500/10 to-teal-500/10 opacity-20" />
      <ParticleBackground />
    </main>
  );
}
