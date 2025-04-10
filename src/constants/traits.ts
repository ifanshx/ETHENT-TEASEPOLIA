// src/constants/traits.ts

export const TRAITS = [
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
] as const;

export type TraitType = (typeof TRAITS)[number];



