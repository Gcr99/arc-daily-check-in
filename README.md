# Arc Daily Check-in

A beginner-friendly Web3 dApp for Arc Testnet where users can connect a wallet and send three simple transactions:

- `gm()` once per day
- `gn()` once per day
- `dailyCheckIn()` once per day, with streak tracking

The app uses Next.js, TypeScript, Tailwind CSS, wagmi, viem, RainbowKit, Solidity, and Hardhat.

## Arc Testnet

Arc Testnet is an EVM-compatible testnet. Current network values used by this project:

| Field | Value |
| --- | --- |
| Chain ID | `5042002` |
| RPC | `https://rpc.testnet.arc.network` |
| Explorer | `https://testnet.arcscan.app` |
| Native gas token | `USDC` |

Official docs:

- [Arc RPC endpoints](https://docs.arc.network/arc/references/rpc-endpoints)
- [Add Arc to a wallet](https://docs.arc.io/integrate/wallets)

## Deployed Contract

ArcDailyCheckIn is deployed on Arc Testnet:

- Contract address: `0xeFD91aB4ec40E02946E6cD66A58a68Ce701bc000`
- Explorer: [View on ArcScan](https://testnet.arcscan.app/address/0xeFD91aB4ec40E02946E6cD66A58a68Ce701bc000)

## Getting Started

Install dependencies with pnpm:

```bash
pnpm install
```

If you prefer npm, `npm install` also works.

Copy the environment file:

```bash
cp .env.example .env.local
```

For local frontend development:

```bash
pnpm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Environment Variables

```bash
NEXT_PUBLIC_ARC_DAILY_CHECK_IN_ADDRESS=0xeFD91aB4ec40E02946E6cD66A58a68Ce701bc000
PRIVATE_KEY=
ARC_TESTNET_RPC_URL=https://rpc.testnet.arc.network
```

Notes:

- The included RainbowKit setup uses injected browser wallets, so no paid wallet API or WalletConnect project ID is required.
- `PRIVATE_KEY` should be a test wallet only. Never commit a real private key.
- `NEXT_PUBLIC_ARC_DAILY_CHECK_IN_ADDRESS` is public and points the frontend at the deployed contract.

## Compile and Test the Contract

```bash
pnpm run compile
pnpm run test
```

## Deploy to Arc Testnet

1. Create a test wallet.
2. Fund it from the Arc faucet: [https://faucet.circle.com](https://faucet.circle.com).
3. Add the wallet private key to `.env.local`.
4. Deploy:

```bash
pnpm run deploy:arc
```

The script prints the deployed contract address. Add it to `.env.local`:

```bash
NEXT_PUBLIC_ARC_DAILY_CHECK_IN_ADDRESS=0xeFD91aB4ec40E02946E6cD66A58a68Ce701bc000
```

Restart the dev server so Next.js can read the new public env variable.

## Vercel Deployment

1. Push this repository to GitHub.
2. Import it into Vercel as a Next.js project.
3. Add these Vercel environment variables:
   - `NEXT_PUBLIC_ARC_DAILY_CHECK_IN_ADDRESS`
4. Deploy.

You do not need `PRIVATE_KEY` on Vercel unless you plan to deploy contracts from Vercel, which is not recommended for this demo.

## Project Structure

```text
contracts/ArcDailyCheckIn.sol      Solidity contract
scripts/deploy.ts                  Hardhat deploy script
test/ArcDailyCheckIn.ts            Contract tests
src/lib/arc.ts                     Arc Testnet chain config and ABI
src/lib/wagmi.ts                   RainbowKit/wagmi config
src/components/DappDashboard.tsx   Main dApp UI
src/components/Providers.tsx       wagmi, React Query, RainbowKit providers
```

## Beginner Notes

- `gm()` and `gn()` are each limited to once per wallet per UTC day.
- `dailyCheckIn()` is limited to once per wallet per UTC day.
- A streak increases when the wallet checks in on consecutive UTC days.
- Missing a day resets the streak to `1` on the next check-in.
- The frontend reads stats directly from the deployed contract using wagmi.
