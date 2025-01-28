"use client";
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
    <main className="max-w-screen-xl px-6 py-10 md:px-16 mx-auto">
      <h1 className="font-justme text-4xl md:text-6xl text-center mb-8 font-extrabold text-gray-900">
        ETHEREAL ENTITIES
      </h1>
      <div className="flex flex-col-reverse md:flex-row gap-10">
        {/* Left Panel */}
        <div className="flex-1">
          <div className="w-full rounded-xl border border-gray-300 bg-white shadow-lg">
            <div className="p-6">
              {/* Selector for Traits */}
              <div className="hidden md:flex items-center justify-center gap-2 mt-4">
                {traits.map((item) => (
                  <div
                    key={item}
                    onClick={() => setActiveTraits(item)}
                    className={`
                      cursor-pointer text-sm font-semibold transition-all duration-300
                      py-2 px-2 rounded-lg
                      ${
                        activeTraits === item
                          ? "bg-[#357ab7] text-white scale-105 shadow-lg"
                          : "text-gray-700 hover:bg-[#94ccff] hover:text-[#357ab7] hover:scale-105"
                      }
                    `}
                  >
                    {item}
                  </div>
                ))}
              </div>

              {/* Mobile View Selector */}
              <div className="block md:hidden text-sm font-medium text-gray-700 text-center mt-4">
                <select
                  onChange={(e) => setActiveTraits(e.target.value as TraitType)}
                  value={activeTraits}
                  className="
      w-full px-4 py-3 
      text-gray-700 bg-white border border-gray-300 
      rounded-md shadow-sm 
      focus:outline-none focus:ring-2 focus:ring-blue-[#357ab7] focus:border-blue-[#357ab7] 
      hover:bg-blue-50 
      transition-all duration-300 ease-in-out
    "
                >
                  {traits.map((item) => (
                    <option
                      key={item}
                      value={item}
                      className="py-2 px-4 text-sm text-gray-700 hover:bg-blue-100 transition-all duration-200"
                    >
                      {item}
                    </option>
                  ))}
                </select>
              </div>

              {/* Traits List */}
              <div className="h-[365px] w-full rounded-md border border-gray-300 p-4 mt-6 bg-gray-50 overflow-y-auto">
                <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-5 gap-4">
                  {listTraits.map((item, index) => (
                    <div
                      key={`${activeTraits}-${item}-${index}`}
                      onClick={() => handleSelectTrait(item)}
                      className={`relative aspect-square rounded-lg overflow-hidden border shadow-sm transition-transform duration-200 cursor-pointer ${
                        selectedTraits[activeTraits] === item
                          ? "border-[#357ab7] scale-105"
                          : "hover:border-[#94ccff] hover:scale-105"
                      }`}
                    >
                      {item.startsWith("custom-") ? (
                        <img
                          src={localStorage.getItem(item) || ""}
                          alt={`Custom ${activeTraits}`}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <Image
                          src={`/assets/${activeTraits}/${item}`}
                          alt={`Trait ${item}`}
                          fill
                          className="object-cover"
                          sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, (max-width: 1024px) 25vw, 20vw"
                        />
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-center gap-2 mt-6">
            <ConnectButton />
            <button
              onClick={handleRandomTraits}
              className="
                flex items-center justify-center gap-2
                h-10 px-5 py-2 border border-gray-300 bg-white shadow-md
                hover:bg-gray-100 hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-[#357ab7]
                rounded-lg transition-all duration-300
              "
            >
              <Dices className="w-5 h-5" />
              RANDOM
            </button>
            <button
              className="
                flex items-center justify-center gap-2
                h-10 px-12 py-2 text-white bg-black shadow-md
                hover:bg-gray-800 focus:outline-none focus:ring-2
                focus:ring-gray-500 rounded-lg transition-all duration-300
                text-lg font-semibold
              "
            >
              MINT
            </button>
          </div>
        </div>

        {/* Right Panel */}
        <div className="flex-1">
          <div className="relative aspect-square rounded-xl overflow-hidden shadow-md">
            {/* Loop through traits and display selected trait images */}
            {traits.map((trait) => {
              if (!selectedTraits[trait]) return null;
              const src = selectedTraits[trait].startsWith("custom-")
                ? localStorage.getItem(selectedTraits[trait]) || ""
                : `/assets/${trait}/${selectedTraits[trait]}`;
              return (
                <Image
                  key={trait}
                  src={src}
                  alt={trait}
                  layout="fill" // Ensures the image takes full space of the container
                  className="absolute top-0 left-0 object-contain rounded-xl"
                  style={{ zIndex: traits.indexOf(trait) }}
                />
              );
            })}
          </div>
        </div>
      </div>
    </main>
  );
}
