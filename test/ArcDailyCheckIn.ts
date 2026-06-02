import { expect } from "chai";
import hre from "hardhat";

const { ethers } = hre;

async function moveToNextDay(days = 1) {
  await ethers.provider.send("evm_increaseTime", [days * 24 * 60 * 60]);
  await ethers.provider.send("evm_mine", []);
}

describe("ArcDailyCheckIn", function () {
  async function deployFixture() {
    const [user] = await ethers.getSigners();
    const Contract = await ethers.getContractFactory("ArcDailyCheckIn");
    const contract = await Contract.deploy();

    return { contract, user };
  }

  it("lets a wallet say GM and GN once per day", async function () {
    const { contract, user } = await deployFixture();

    await expect(contract.gm()).to.emit(contract, "GM");

    await expect(contract.gn()).to.emit(contract, "GN");

    await expect(contract.gm()).to.be.revertedWithCustomError(
      contract,
      "AlreadySaidGmToday"
    );
    await expect(contract.gn()).to.be.revertedWithCustomError(
      contract,
      "AlreadySaidGnToday"
    );

    await moveToNextDay();

    await contract.gm();
    await contract.gn();

    const stats = await contract.getUserStats(user.address);
    expect(stats.gmCount).to.equal(2);
    expect(stats.gnCount).to.equal(2);
  });

  it("tracks daily check-in counts and streaks", async function () {
    const { contract, user } = await deployFixture();

    await expect(contract.dailyCheckIn()).to.emit(contract, "DailyCheckIn");

    await expect(contract.dailyCheckIn()).to.be.revertedWithCustomError(
      contract,
      "AlreadyCheckedInToday"
    );

    await moveToNextDay();
    await contract.dailyCheckIn();

    let stats = await contract.getUserStats(user.address);
    expect(stats.dailyCheckInCount).to.equal(2);
    expect(stats.currentStreak).to.equal(2);

    await moveToNextDay(2);
    await contract.dailyCheckIn();

    stats = await contract.getUserStats(user.address);
    expect(stats.dailyCheckInCount).to.equal(3);
    expect(stats.currentStreak).to.equal(1);
  });
});
