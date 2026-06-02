import hre from "hardhat";

async function main() {
  const ArcDailyCheckIn = await hre.ethers.getContractFactory("ArcDailyCheckIn");
  const arcDailyCheckIn = await ArcDailyCheckIn.deploy();

  await arcDailyCheckIn.waitForDeployment();

  const address = arcDailyCheckIn.target;

  console.log("ArcDailyCheckIn deployed to:", address);
  console.log("Add this to .env.local:");
  console.log(`NEXT_PUBLIC_ARC_DAILY_CHECK_IN_ADDRESS=${address}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
