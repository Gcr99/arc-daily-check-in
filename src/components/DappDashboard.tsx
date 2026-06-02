"use client";

import { ConnectButton } from "@rainbow-me/rainbowkit";
import {
  CalendarCheck,
  CheckCircle2,
  ExternalLink,
  Moon,
  Network,
  RefreshCw,
  Sparkles,
  Sun,
  Wallet
} from "lucide-react";
import { useMemo, useState } from "react";
import { zeroAddress, type Address, type Hash } from "viem";
import {
  useAccount,
  useChainId,
  usePublicClient,
  useReadContract,
  useSwitchChain,
  useWriteContract
} from "wagmi";
import {
  arcDailyCheckInAbi,
  arcDailyCheckInAddress,
  arcTestnet
} from "@/lib/arc";

type ActionName = "gm" | "gn" | "dailyCheckIn";

const actionCopy: Record<
  ActionName,
  {
    title: string;
    description: string;
    icon: typeof Sun;
    accent: string;
  }
> = {
  gm: {
    title: "Say GM",
    description: "Start the day with one GM transaction.",
    icon: Sun,
    accent: "from-amber-300 to-orange-400"
  },
  gn: {
    title: "Say GN",
    description: "Close the loop with one GN transaction.",
    icon: Moon,
    accent: "from-cyan-300 to-sky-500"
  },
  dailyCheckIn: {
    title: "Daily Check-in",
    description: "Keep the streak alive once per day.",
    icon: CalendarCheck,
    accent: "from-emerald-300 to-teal-500"
  }
};

function shortAddress(address?: Address) {
  if (!address) return "Not connected";
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

function formatDate(timestamp?: bigint) {
  if (!timestamp || timestamp === 0n) return "No check-in yet";
  return new Intl.DateTimeFormat("en", {
    dateStyle: "medium",
    timeStyle: "short"
  }).format(new Date(Number(timestamp) * 1000));
}

function formatHash(hash?: Hash) {
  if (!hash) return "";
  return `${hash.slice(0, 10)}...${hash.slice(-8)}`;
}

export function DappDashboard() {
  const { address, isConnected } = useAccount();
  const chainId = useChainId();
  const { switchChainAsync } = useSwitchChain();
  const publicClient = usePublicClient({ chainId: arcTestnet.id });
  const { writeContractAsync } = useWriteContract();
  const [pendingAction, setPendingAction] = useState<ActionName | null>(null);
  const [lastHash, setLastHash] = useState<Hash | undefined>();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const contractReady = Boolean(arcDailyCheckInAddress);
  const isWrongChain = isConnected && chainId !== arcTestnet.id;

  const {
    data: stats,
    isLoading: isStatsLoading,
    refetch
  } = useReadContract({
    address: arcDailyCheckInAddress,
    abi: arcDailyCheckInAbi,
    functionName: "getUserStats",
    args: [address ?? zeroAddress],
    chainId: arcTestnet.id,
    query: {
      enabled: Boolean(address && arcDailyCheckInAddress)
    }
  });

  const statCards = useMemo(
    () => [
      {
        label: "GM count",
        value: stats?.[0]?.toString() ?? "0"
      },
      {
        label: "GN count",
        value: stats?.[1]?.toString() ?? "0"
      },
      {
        label: "Check-ins",
        value: stats?.[2]?.toString() ?? "0"
      },
      {
        label: "Current streak",
        value: `${stats?.[4]?.toString() ?? "0"} ${
          stats?.[4] === 1n ? "day" : "days"
        }`
      }
    ],
    [stats]
  );

  async function runAction(action: ActionName) {
    if (!arcDailyCheckInAddress || !address) return;

    setPendingAction(action);
    setErrorMessage(null);

    try {
      if (chainId !== arcTestnet.id) {
        await switchChainAsync({ chainId: arcTestnet.id });
      }

      const hash = await writeContractAsync({
        address: arcDailyCheckInAddress,
        abi: arcDailyCheckInAbi,
        functionName: action,
        chainId: arcTestnet.id
      });

      setLastHash(hash);

      if (publicClient) {
        await publicClient.waitForTransactionReceipt({ hash });
      }

      await refetch();
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Something went wrong while sending the transaction.";
      setErrorMessage(message);
    } finally {
      setPendingAction(null);
    }
  }

  return (
    <main className="min-h-screen bg-[#071014] text-white">
      <div className="mx-auto flex min-h-screen w-full max-w-7xl flex-col px-5 py-5 sm:px-8 lg:px-10">
        <header className="flex flex-col gap-4 border-b border-white/10 pb-5 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <div className="grid h-10 w-10 place-items-center rounded-lg bg-cyan-300 text-[#071014]">
              <Sparkles className="h-5 w-5" aria-hidden="true" />
            </div>
            <div>
              <h1 className="text-xl font-semibold tracking-normal">
                Arc Daily Check-in
              </h1>
              <p className="text-sm text-slate-300">
                GM, GN, and streaks on Arc Testnet.
              </p>
            </div>
          </div>
          <ConnectButton />
        </header>

        <section className="grid flex-1 gap-5 py-6 lg:grid-cols-[0.9fr_1.3fr_0.9fr]">
          <aside className="rounded-lg border border-white/10 bg-white/[0.04] p-5">
            <div className="flex items-center gap-2 text-sm font-medium text-cyan-200">
              <Wallet className="h-4 w-4" aria-hidden="true" />
              Wallet
            </div>
            <div className="mt-4 space-y-4">
              <div>
                <p className="text-xs uppercase tracking-[0.18em] text-slate-500">
                  Address
                </p>
                <p className="mt-2 break-all font-mono text-sm text-slate-100">
                  {address ?? "Connect your wallet to begin"}
                </p>
              </div>
              <div className="rounded-md border border-white/10 bg-black/20 p-3">
                <p className="text-xs uppercase tracking-[0.18em] text-slate-500">
                  Short address
                </p>
                <p className="mt-2 font-mono text-lg text-white">
                  {shortAddress(address)}
                </p>
              </div>
            </div>
          </aside>

          <section className="rounded-lg border border-white/10 bg-white/[0.06] p-5 shadow-2xl shadow-cyan-950/20">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="text-2xl font-semibold tracking-normal">
                  Daily actions
                </h2>
                <p className="mt-1 text-sm text-slate-300">
                  Each button sends a real transaction to the deployed contract.
                </p>
              </div>
              <div className="flex items-center gap-2 rounded-md border border-emerald-300/20 bg-emerald-300/10 px-3 py-2 text-sm text-emerald-100">
                <CheckCircle2 className="h-4 w-4" aria-hidden="true" />
                Hackathon ready
              </div>
            </div>

            <div className="mt-6 grid gap-4">
              {(Object.keys(actionCopy) as ActionName[]).map((action) => {
                const item = actionCopy[action];
                const Icon = item.icon;
                const isPending = pendingAction === action;
                const disabled =
                  !isConnected || !contractReady || Boolean(pendingAction);

                return (
                  <button
                    key={action}
                    type="button"
                    onClick={() => runAction(action)}
                    disabled={disabled}
                    className="group flex min-h-28 w-full items-center gap-4 rounded-lg border border-white/10 bg-[#0d1a1f] p-4 text-left transition hover:-translate-y-0.5 hover:border-cyan-200/50 hover:bg-[#10262c] disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:translate-y-0"
                  >
                    <span
                      className={`grid h-14 w-14 shrink-0 place-items-center rounded-lg bg-gradient-to-br ${item.accent} text-[#071014]`}
                    >
                      {isPending ? (
                        <RefreshCw
                          className="h-6 w-6 animate-spin"
                          aria-hidden="true"
                        />
                      ) : (
                        <Icon className="h-6 w-6" aria-hidden="true" />
                      )}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block text-lg font-semibold text-white">
                        {isPending ? "Sending..." : item.title}
                      </span>
                      <span className="mt-1 block text-sm leading-6 text-slate-300">
                        {item.description}
                      </span>
                    </span>
                  </button>
                );
              })}
            </div>

            {!contractReady && (
              <p className="mt-5 rounded-md border border-amber-300/30 bg-amber-300/10 p-3 text-sm text-amber-100">
                Deploy the contract, then add
                <span className="mx-1 font-mono">
                  NEXT_PUBLIC_ARC_DAILY_CHECK_IN_ADDRESS
                </span>
                to your local environment.
              </p>
            )}

            {isWrongChain && (
              <p className="mt-5 rounded-md border border-cyan-300/30 bg-cyan-300/10 p-3 text-sm text-cyan-100">
                You are connected to another chain. The app will ask your wallet
                to switch to Arc Testnet before sending a transaction.
              </p>
            )}

            {errorMessage && (
              <p className="mt-5 max-h-28 overflow-auto rounded-md border border-red-300/30 bg-red-400/10 p-3 text-sm text-red-100">
                {errorMessage}
              </p>
            )}
          </section>

          <aside className="rounded-lg border border-white/10 bg-white/[0.04] p-5">
            <div className="flex items-center gap-2 text-sm font-medium text-cyan-200">
              <Network className="h-4 w-4" aria-hidden="true" />
              Network
            </div>
            <div className="mt-4 rounded-md border border-white/10 bg-black/20 p-3">
              <p className="text-xs uppercase tracking-[0.18em] text-slate-500">
                Current chain
              </p>
              <p className="mt-2 text-lg font-semibold">
                {chainId === arcTestnet.id
                  ? "Arc Testnet"
                  : chainId
                    ? `Chain ${chainId}`
                    : "Not connected"}
              </p>
            </div>

            <div className="mt-5 grid grid-cols-2 gap-3">
              {statCards.map((stat) => (
                <div
                  key={stat.label}
                  className="min-h-24 rounded-md border border-white/10 bg-[#0d1a1f] p-3"
                >
                  <p className="text-xs text-slate-400">{stat.label}</p>
                  <p className="mt-3 font-mono text-2xl font-semibold text-white">
                    {isStatsLoading ? "..." : stat.value}
                  </p>
                </div>
              ))}
            </div>

            <div className="mt-5 rounded-md border border-white/10 bg-black/20 p-3">
              <p className="text-xs uppercase tracking-[0.18em] text-slate-500">
                Last check-in
              </p>
              <p className="mt-2 text-sm text-slate-100">
                {formatDate(stats?.[3])}
              </p>
            </div>
          </aside>
        </section>

        <footer className="grid gap-4 border-t border-white/10 py-5 text-sm text-slate-300 md:grid-cols-[1fr_1.2fr]">
          <div>
            <p className="font-medium text-white">Contract</p>
            <p className="mt-1 break-all font-mono text-xs">
              {arcDailyCheckInAddress ?? "Waiting for deployment address"}
            </p>
          </div>
          <div>
            <p className="font-medium text-white">Last transaction</p>
            {lastHash ? (
              <a
                className="mt-1 inline-flex items-center gap-2 font-mono text-xs text-cyan-200 hover:text-cyan-100"
                href={`${arcTestnet.blockExplorers.default.url}/tx/${lastHash}`}
                target="_blank"
                rel="noreferrer"
              >
                {formatHash(lastHash)}
                <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
              </a>
            ) : (
              <p className="mt-1 text-xs">No transaction sent yet</p>
            )}
          </div>
        </footer>
      </div>
    </main>
  );
}
