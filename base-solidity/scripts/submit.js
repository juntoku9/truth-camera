import { ethers } from "hardhat";
import { readFileSync } from "fs";

async function main() {
  const addr = process.env.TRUTH_CAMERA!;
  const tc = await ethers.getContractAt("TruthCamera", addr);

  const bytes = readFileSync(process.argv[2]);     // e.g. ./public/test.jpg
  const hash = ethers.keccak256(bytes);

  const tx = await tc.submit(hash);
  await tx.wait();
  console.log("Submitted:", hash);
}
main().catch(console.error);
