import hre from "hardhat";
const { ethers } = hre;

async function main() {
  const TC = await ethers.getContractFactory("TruthCamera");
  const tc = await TC.deploy();
  await tc.waitForDeployment();
  console.log("TruthCamera:", await tc.getAddress());
}
main().catch((e) => { console.error(e); process.exit(1); });
