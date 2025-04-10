"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Loading from "@/components/LoadingSekleton";

export default function Home() {
  // return (
  //   <div className="min-h-screen bg-gradient-to-br from-pink-400 to-purple-500 flex items-center justify-center">
  //     <div className="text-center space-y-6">
  //       <h1 className="text-4xl md:text-6xl font-bold text-white animate-bounce">
  //         Welcome to CuteNFT! 🦄
  //       </h1>
  //       <p className="text-white/90 text-lg md:text-xl mb-8">
  //         Your magical NFT experience starts here
  //       </p>
  //       <a
  //         href="/home"
  //         className="inline-block bg-white/20 hover:bg-white/30 text-white px-8 py-3 rounded-full
  //         text-lg font-medium transition-all backdrop-blur-sm"
  //       >
  //         Enter Dashboard →
  //       </a>
  //     </div>
  //   </div>
  // );

  const router = useRouter();

  useEffect(() => {
    router.push("/zephyrus");
  }, [router]);

  return <Loading />;
}
