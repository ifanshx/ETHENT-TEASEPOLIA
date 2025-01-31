"use client";
import ParticleBackground from "@/components/ParticleBackground";
import { METADATA_TRAITS } from "@/constants/metadata";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { Dices } from "lucide-react";
import Image from "next/image";
import { useEffect, useState } from "react";

type TraitType =
  | "Backdrop"
  | "Body"
  | "Clothing"
  | "Eyes"
  | "Mouth"
  | "Head"
  | "Speciality"
  | "Hand";
type SelectedTraits = {
  [key in TraitType]: string;
};

export default function Home() {
  const traits: TraitType[] = [
    "Backdrop",
    "Body",
    "Clothing",
    "Eyes",
    "Mouth",
    "Head",
    "Speciality",
    "Hand",
  ];
  const [activeTraits, setActiveTraits] = useState<TraitType>("Backdrop");
  const [listTraits, setListTraits] = useState<string[]>([]);
  const [isHoveringPreview, setIsHoveringPreview] = useState(false);
  const [selectedTraits, setSelectedTraits] = useState<SelectedTraits>({
    Backdrop: "Ash Grey.png",
    Body: "",
    Clothing: "",
    Eyes: "",
    Mouth: "",
    Head: "",
    Speciality: "",
    Hand: "",
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
    const randomTraits: Partial<SelectedTraits> = {};
    traits.forEach((trait) => {
      const traitList = METADATA_TRAITS[trait] as string[];
      const randomIndex = Math.floor(Math.random() * traitList.length);
      randomTraits[trait] = traitList[randomIndex];
    });
    setSelectedTraits(randomTraits as SelectedTraits);
  };

  const handleSelectTrait = (item: string): void => {
    setSelectedTraits((prev) => ({
      ...prev,
      [activeTraits]:
        prev[activeTraits] === item
          ? activeTraits === "Backdrop"
            ? item
            : ""
          : item,
    }));
  };

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
              {/* Mobile Trait Selector */}
              <div className="md:hidden block space-y-1.5 mt-4 mb-6">
                <label
                  htmlFor="mobile-trait-select"
                  className="text-xs font-semibold text-gray-600 uppercase tracking-wide"
                >
                  Select Character Trait
                </label>
                <select
                  id="mobile-trait-select"
                  onChange={(e) => setActiveTraits(e.target.value as TraitType)}
                  value={activeTraits}
                  className="
      w-full px-4 py-3.5
      text-base text-gray-900 
      bg-white border-2 border-gray-200 
      rounded-lg shadow-sm
      focus:outline-none focus:ring-2 focus:ring-blue-600 focus:ring-offset-2
      hover:border-blue-200
      transition-all duration-200 ease-out
      cursor-pointer
    "
                >
                  {traits.map((item) => (
                    <option
                      key={item}
                      value={item}
                      className="text-sm font-medium text-gray-700 py-2"
                    >
                      {item}
                    </option>
                  ))}
                </select>
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
                            src={`/assets/${activeTraits.toLowerCase()}/${item.toLowerCase()}`}
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

              <button className="w-full sm:w-auto flex items-center justify-center h-12 px-8 bg-gradient-to-r from-blue-400 to-purple-500 rounded-xl shadow-lg hover:shadow-xl hover:scale-[1.02] transition-all text-white font-semibold relative overflow-hidden">
                <span className="relative z-10">Mint NFT</span>
                <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent opacity-0 hover:opacity-100 transition-opacity duration-300" />
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
                        Start Creating Your Entity
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
    </main>
  );
}
