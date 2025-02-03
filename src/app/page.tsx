"use client";
import MintNFTModal from "@/components/MintNFTModal";
import ParticleBackground from "@/components/ParticleBackground";
import { METADATA_TRAITS } from "@/constants/metadata";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { Dices } from "lucide-react";
import { PinataSDK } from "pinata-web3";
import { useEffect, useState } from "react";

const pinata = new PinataSDK({
  pinataJwt:
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySW5mb3JtYXRpb24iOnsiaWQiOiJhZGM4OGQ0OC0wMDg4LTRjMmMtOGIxMS01NjRkODQxZTMwYzAiLCJlbWFpbCI6ImlyZmFhbnNob29kaXExOTU0QGdtYWlsLmNvbSIsImVtYWlsX3ZlcmlmaWVkIjp0cnVlLCJwaW5fcG9saWN5Ijp7InJlZ2lvbnMiOlt7ImRlc2lyZWRSZXBsaWNhdGlvbkNvdW50IjoxLCJpZCI6IkZSQTEifV0sInZlcnNpb24iOjF9LCJtZmFfZW5hYmxlZCI6ZmFsc2UsInN0YXR1cyI6IkFDVElWRSJ9LCJhdXRoZW50aWNhdGlvblR5cGUiOiJzY29wZWRLZXkiLCJzY29wZWRLZXlLZXkiOiJmNjE4OTRkYzRiNTM3Y2VlZjg4YyIsInNjb3BlZEtleVNlY3JldCI6IjRjNjg1YTIxOWQwM2FiOTAwZWYyMGU1Y2I2MGZhMDRjMzdiODA0ZWE0NWViNDFhZDk1MjM0ZmRiNDkwMThiNjkiLCJleHAiOjE3Njk5NDEwOTZ9.kElikjPEK_-KCZom76QxOroAHEc-2jAmiqBRjrieZJk",
  pinataGateway: "https://red-equivalent-hawk-791.mypinata.cloud/",
});

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

  const [activeTraits, setActiveTraits] = useState<TraitType>("Background");
  const [listTraits, setListTraits] = useState<string[]>([]);
  const [isHoveringPreview, setIsHoveringPreview] = useState(false);
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

  useEffect(() => {
    localStorage.clear();
  }, []);

  useEffect(() => {
    if (activeTraits) {
      const defaultTraits = METADATA_TRAITS[activeTraits] || [];
      setListTraits([...defaultTraits]);
    }
  }, [activeTraits]);

  const handleRandomTraits = (): void => {
    // Create an object to store the selected random traits
    const randomTraits: Partial<SelectedTraits> = {};

    // Iterate over each trait from the available list
    traits.forEach((trait) => {
      // Check if METADATA_TRAITS contains the trait
      const traitList = METADATA_TRAITS[trait] as string[] | undefined;

      if (traitList && traitList.length > 0) {
        // Select a random index within the trait list
        const randomIndex = Math.floor(Math.random() * traitList.length);
        randomTraits[trait] = traitList[randomIndex];
      } else {
        // Handle case if no traits found for a given trait
        console.warn(`No available options for trait: ${trait}`);
        randomTraits[trait] = ""; // or you can choose a default value
      }
    });

    // Update the state with the selected random traits
    setSelectedTraits(randomTraits as SelectedTraits);
  };

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

  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleOpenModal = (): void => {
    setIsModalOpen(true);
  };

  const handleMintNFT = async (
    name: string,
    description: string
  ): Promise<string | null> => {
    try {
      const imageName = `${name.replace(/\s+/g, "_")}.png`;
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");

      if (!ctx) throw new Error("Could not get canvas context");

      canvas.width = 1000;
      canvas.height = 1000;

      const loadImage = async (trait: TraitType) => {
        if (!selectedTraits[trait]) return;
        return new Promise<void>((resolve, reject) => {
          const img = new Image();
          img.onload = () => {
            ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
            resolve();
          };
          img.onerror = () =>
            reject(new Error(`Failed to load image for trait ${trait}`));

          if (selectedTraits[trait].startsWith("custom-")) {
            const dataUrl = localStorage.getItem(selectedTraits[trait]);
            img.src = dataUrl || "";
          } else {
            img.src = `/assets/${trait}/${selectedTraits[trait]}`;
          }
        });
      };

      await Promise.all(traits.map(loadImage));

      const blob = await new Promise<Blob | null>((resolve) => {
        canvas.toBlob((b) => resolve(b), "image/png");
      });

      if (!blob) throw new Error("Could not create blob from canvas");

      const file = new File([blob], imageName, { type: "image/png" });
      const imageUpload = await pinata.upload.file(file);
      const imageCID = imageUpload.IpfsHash;
      const imageUrl = `https://red-equivalent-hawk-791.mypinata.cloud/ipfs/${imageCID}`;

      // Rapi metadata JSON format
      const metadata = {
        name: name,
        description: description,
        image: imageUrl,
        attributes: traits.map((trait) => ({
          trait_type: trait,
          value: selectedTraits[trait] || "None",
        })),
      };

      // Membuat file metadata dan upload ke IPFS
      const metadataFile = new File(
        [JSON.stringify(metadata, null, 2)], // Format JSON dengan indentation 2 spasi
        `${name.replace(/\s+/g, "_")}.json`,
        { type: "application/json" }
      );

      const metadataUpload = await pinata.upload.file(metadataFile);
      const metadataCID = metadataUpload.IpfsHash;
      console.log("Metadata", metadataCID);
      return metadataUpload.IpfsHash;
    } catch (error) {
      console.error("Error during NFT minting:", error);
      return null;
    }
  };

  const [previewImage, setPreviewImage] = useState<string[]>([]);
  useEffect(() => {
    const previewImages = traits
      .map((trait) => {
        if (!selectedTraits[trait]) return null;
        return selectedTraits[trait].startsWith("custom-")
          ? localStorage.getItem(selectedTraits[trait]) || ""
          : `/assets/${trait}/${selectedTraits[trait]}`;
      })
      .filter((src) => src !== null) as string[];

    // Menyimpan semua gambar dalam state previewImage
    setPreviewImage(previewImages);
  }, [selectedTraits]); // Update ketika selectedTraits berubah

  return (
    <main className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 dark:bg-gradient-to-br dark:from-gray-900 dark:to-blue-900 transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header Section */}
        <div className="text-center mb-16 space-y-6">
          <h1 className="text-6xl font-bold tracking-tighter bg-gradient-to-r from-blue-400 via-purple-500 to-pink-400 bg-clip-text text-transparent animate-gradient">
            ETHEREAL ENTITIES
          </h1>
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
                      px-4 py-2 text-sm font-medium rounded-xl transition-all
                      transform hover:-translate-y-0.5
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
              {/* Mobile Trait Selector - Modern Elegant */}
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
        w-full pl-5 pr-12 py-3.5
        text-[15px] font-medium text-gray-800
        bg-white border border-gray-300/80
        rounded-xl
        shadow-sm
        focus:outline-none focus:ring-2 focus:ring-indigo-500/80 focus:ring-offset-1
        hover:border-indigo-400/90
        transition-all duration-300 ease-[cubic-bezier(0.4,0,0.2,1)]
        cursor-pointer
        appearance-none
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
                        group relative aspect-square rounded-xl overflow-hidden cursor-pointer 
                        transition-all duration-300 hover:scale-105 hover:z-10
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
                      {/* Selected Check */}
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

                      {/* Image Content */}
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
              {/* <ButtonWallet /> */}

              <button
                onClick={handleRandomTraits}
                className="w-full sm:w-auto flex items-center justify-center gap-2 h-12 px-6 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all text-gray-700 dark:text-gray-200 font-medium group"
              >
                <Dices className="w-5 h-5 text-blue-400 group-hover:rotate-180 transition-transform" />
                Randomize
              </button>

              <button
                onClick={handleOpenModal}
                disabled={!previewImage.length}
                className={` w-full sm:w-auto flex items-center justify-center h-12 px-8 rounded-xl shadow-lg transition-all font-semibold relative overflow-hidden
                  ${
                    previewImage.length
                      ? "bg-gradient-to-r from-blue-400 to-purple-500 hover:shadow-xl hover:scale-[1.02] text-white"
                      : "bg-gray-300 dark:bg-gray-700 text-gray-500 cursor-not-allowed"
                  }
                `}
              >
                <span className="relative z-10">Mint NFT</span>
              </button>
            </div>
          </div>

          {/* Right Preview Panel */}
          <div className="flex-1 lg:max-w-xl">
            <div
              className="relative aspect-square bg-gradient-to-br from-gray-50 dark:from-gray-800 to-white dark:to-gray-900 rounded-3xl shadow-2xl border-8 border-white dark:border-gray-800 overflow-hidden transform transition-transform duration-300 hover:scale-[1.01]"
              onMouseEnter={() => setIsHoveringPreview(true)}
              onMouseLeave={() => setIsHoveringPreview(false)}
            >
              {/* Animated Border */}
              <div className="absolute inset-0 rounded-2xl overflow-hidden">
                <div
                  className={`absolute inset-0 bg-gradient-to-r from-blue-400 via-purple-500 to-pink-400 opacity-20 ${
                    isHoveringPreview ? "animate-rotate" : ""
                  }`}
                />
              </div>

              {/* Preview Content */}
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

                {/* Empty State */}
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

      {/* Floating Particles Background */}
      <ParticleBackground />

      <MintNFTModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        imageSrc={previewImage} // Mengirimkan array gambar
        onMint={handleMintNFT}
      />
    </main>
  );
}
