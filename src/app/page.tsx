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
    router.push("/home");
  }, [router]);

  return <Loading />;
}

// "use client";

// import { useEffect, useState } from "react";

// export default function Home() {
//   const [isScrolled, setIsScrolled] = useState(false);

//   useEffect(() => {
//     const handleScroll = () => {
//       setIsScrolled(window.scrollY > 0);
//     };

//     window.addEventListener("scroll", handleScroll);
//     return () => window.removeEventListener("scroll", handleScroll);
//   }, []);

//   const collections = [
//     {
//       title: "Steamland",
//       desc: "We are more than just a brand - It's flying.. more.",
//       image: "/assets/rabbits.png",
//       minted: 998,
//       supply: 1000,
//     },
//     {
//       title: "Bear With Me",
//       desc: "Let's ride out this 'Bear' thing together... more.",
//       image: "/assets/rabbits.png",
//       minted: 555,
//       supply: 555,
//     },
//     {
//       title: "Pink is Punk",
//       desc: "A bold assembly of 1,555 rebellious... more.",
//       image: "/assets/rabbits.png",
//       minted: 555,
//       supply: 555,
//     },
//   ];

//   return (
//     <main className="relative min-h-screen bg-gradient-to-b from-sky-300 to-sky-500 overflow-hidden pb-40">
//       {/* Background elements */}

//       {/* Header */}
//       <header
//         className={`sticky top-0 z-50 flex justify-between items-center px-6 py-4 transition-all duration-300 ${
//           isScrolled
//             ? "bg-white/80 shadow-md backdrop-blur-lg"
//             : "bg-white/30 backdrop-blur-md"
//         }`}
//       >
//         <div className="text-black font-bold text-xl">Cryptea 🌱</div>
//         <div className="flex items-center gap-6 text-sm text-black">
//           <a
//             href="#"
//             className="hover:underline flex items-center gap-1 hover:text-blue-600 transition-colors"
//           >
//             Learn💡
//           </a>
//           <a
//             href="#"
//             className="hover:underline font-semibold bg-black/10 px-4 py-2 rounded-full hover:bg-black/20 transition-colors"
//           >
//             Go to app<span className="ml-2">➔</span>
//           </a>
//           <div className="h-6 w-px bg-gray-300" />
//           <button className="bg-black text-white px-4 py-2 rounded-full hover:bg-gray-800 transition-colors">
//             Connect Wallet
//           </button>
//         </div>
//       </header>

//       {/* Avatars */}
//       <div className="relative z-10 flex flex-wrap justify-center items-center gap-4 mt-20 px-6">
//         {[
//           "/assets/rabbits.png",
//           "/assets/rabbits.png",
//           "/assets/rabbits.png",
//           "/assets/rabbits.png",
//           "/assets/rabbits.png",
//           "/assets/rabbits.png",
//           "/assets/rabbits.png",
//           "/assets/rabbits.png",
//         ].map((src, index) => (
//           <img
//             key={index}
//             src={src}
//             alt={`avatar-${index}`}
//             className={`rounded-full border-2 border-white ${
//               index === 5 ? "w-16 h-16" : "w-16 h-16"
//             }`}
//           />
//         ))}
//       </div>

//       {/* Main Text */}
//       <div className="relative z-10 text-center mt-10 px-4">
//         <h1 className="text-white text-4xl font-bold">While you grinding</h1>
//         <p className="text-white text-3xl font-bold mt-2">
//           don’t forget to have a tea.
//         </p>
//       </div>

//       {/* Collections */}
//       <section className="relative z-10 mt-24 grid grid-cols-1 md:grid-cols-3 gap-8 px-6 max-w-7xl mx-auto">
//         {collections.map((item, i) => (
//           <div
//             key={i}
//             className="bg-white/20 backdrop-blur-lg border border-white/30 p-6 rounded-3xl shadow-xl hover:shadow-2xl transition-all"
//           >
//             {/* Image Container */}
//             <div className="relative overflow-hidden rounded-2xl border-2 border-white/50">
//               <img
//                 src={item.image}
//                 alt={item.title}
//                 className="w-full h-64 object-cover object-center"
//               />
//             </div>

//             {/* Content */}
//             <div className="mt-6 space-y-4">
//               {/* Title & Description */}
//               <div>
//                 <h3 className="text-xl font-bold text-white">{item.title}</h3>
//                 <p className="text-sm text-white/80 mt-2 line-clamp-2">
//                   {item.desc}
//                 </p>
//               </div>

//               {/* Mint Info */}
//               <div className="space-y-4">
//                 <div className="flex items-center justify-between gap-4">
//                   <button className="bg-white/90 hover:bg-white text-black/90 font-semibold py-2 px-6 rounded-full transition-all shadow-md hover:shadow-lg">
//                     Mint
//                   </button>

//                   <div className="text-right">
//                     {item.timer ? (
//                       <div className="text-sm font-medium text-white/90">
//                         ⏳ {item.timer}
//                       </div>
//                     ) : (
//                       <div className="text-sm text-white/80">
//                         {item.minted}/{item.supply}
//                       </div>
//                     )}
//                   </div>
//                 </div>

//                 {/* Progress Bar */}
//                 {!item.timer && (
//                   <div className="w-full bg-white/20 rounded-full h-2">
//                     <div
//                       className="bg-blue-400 h-2 rounded-full transition-all duration-500"
//                       style={{
//                         width: `${(4444 / 6666) * 100}%`,
//                       }}
//                     />
//                   </div>
//                 )}
//               </div>
//             </div>
//           </div>
//         ))}
//       </section>
//     </main>
//   );
// }
