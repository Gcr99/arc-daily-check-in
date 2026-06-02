import { defineChain, type Address } from "viem";

export const arcTestnet = defineChain({
  id: 5042002,
  name: "Arc Testnet",
  nativeCurrency: {
    name: "USDC",
    symbol: "USDC",
    decimals: 6
  },
  rpcUrls: {
    default: {
      http: ["https://rpc.testnet.arc.network"],
      webSocket: ["wss://rpc.testnet.arc.network"]
    },
    public: {
      http: ["https://rpc.testnet.arc.network"],
      webSocket: ["wss://rpc.testnet.arc.network"]
    }
  },
  blockExplorers: {
    default: {
      name: "ArcScan",
      url: "https://testnet.arcscan.app"
    }
  },
  testnet: true
});

export const arcDailyCheckInAbi = [
  {
    type: "function",
    name: "gm",
    stateMutability: "nonpayable",
    inputs: [],
    outputs: []
  },
  {
    type: "function",
    name: "gn",
    stateMutability: "nonpayable",
    inputs: [],
    outputs: []
  },
  {
    type: "function",
    name: "dailyCheckIn",
    stateMutability: "nonpayable",
    inputs: [],
    outputs: []
  },
  {
    type: "function",
    name: "getUserStats",
    stateMutability: "view",
    inputs: [{ name: "user", type: "address" }],
    outputs: [
      { name: "gmCount", type: "uint256" },
      { name: "gnCount", type: "uint256" },
      { name: "dailyCheckInCount", type: "uint256" },
      { name: "lastCheckInTimestamp", type: "uint256" },
      { name: "currentStreak", type: "uint256" }
    ]
  }
] as const;

const rawContractAddress = process.env.NEXT_PUBLIC_ARC_DAILY_CHECK_IN_ADDRESS;

export const arcDailyCheckInAddress: Address | undefined =
  rawContractAddress?.startsWith("0x") && rawContractAddress.length === 42
    ? (rawContractAddress as Address)
    : undefined;
