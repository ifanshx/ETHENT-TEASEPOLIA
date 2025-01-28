"use client";

import "@rainbow-me/rainbowkit/styles.css";
import { getDefaultConfig, RainbowKitProvider } from "@rainbow-me/rainbowkit";
import { WagmiProvider } from "wagmi";
import { QueryClientProvider, QueryClient } from "@tanstack/react-query";

import { defineChain } from "viem";

export const TeaChain = defineChain({
  id: 93384,
  name: "tea-assam",
  nativeCurrency: { name: "tea-assam", symbol: "$TEA", decimals: 18 },
  rpcUrls: {
    default: { http: ["https://assam-rpc.tea.xyz"] },
  },
  blockExplorers: {
    default: { name: "Tea Assam", url: "https://assam.tea.xyz" },
  },
  contracts: {},
});
const config = getDefaultConfig({
  appName: "My RainbowKit App",
  projectId: "438077850ac125b34cddf29c451af227",
  chains: [TeaChain],
  ssr: true, // If your dApp uses server side rendering (SSR)
});

const queryClient = new QueryClient();

function ContextProvider({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <WagmiProvider config={config}>
          <QueryClientProvider client={queryClient}>
            <RainbowKitProvider>{children} </RainbowKitProvider>
          </QueryClientProvider>
        </WagmiProvider>
      </body>
    </html>
  );
}
export default ContextProvider;
