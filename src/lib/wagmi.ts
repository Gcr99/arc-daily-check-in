"use client";

import { createConfig, http } from "wagmi";
import { injected } from "wagmi/connectors";
import { arcTestnet } from "@/lib/arc";

export const wagmiConfig = createConfig({
  chains: [arcTestnet],
  connectors: [
    injected({
      shimDisconnect: true
    })
  ],
  transports: {
    [arcTestnet.id]: http(arcTestnet.rpcUrls.default.http[0])
  },
  ssr: true
});
