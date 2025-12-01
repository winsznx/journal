```
const hre = require("hardhat");

async function main() {
  console.log("================================================");
  console.log("🚀 Deploying Journal contract...");
  console.log("================================================\n");

  const [deployer] = await hre.ethers.getSigners();
  console.log("Deploying from account:", deployer.address);
  
  const balance = await hre.ethers.provider.getBalance(deployer.address);
  console.log("Account balance:", hre.ethers.formatEther(balance), "ETH\n");

  const Journal = await hre.ethers.getContractFactory("Journal");
  console.log("📝 Deploying contract...");
  
  const journal = await Journal.deploy();
  await journal.waitForDeployment();

  const address = await journal.getAddress();
  
  console.log("\n================================================");
  console.log("✅ Deployment Successful!");
  console.log("================================================");
  console.log("Contract Address:", address);
  console.log("Entry Fee:", hre.ethers.formatEther(await journal.entryFee()), "ETH");
  console.log("Max Entry Length:", (await journal.maxEntryLength()).toString(), "characters");
  console.log("Contract Owner:", await journal.owner());
  console.log("\n💡 Update CONTRACT_ADDRESS in app/contracts/Journal.ts");
  console.log("\n🔍 Verify with:");
  console.log(`npx hardhat verify--network base ${ address } `);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
