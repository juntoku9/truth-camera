import hre from "hardhat";
import dotenv from "dotenv";
dotenv.config();

const { ethers, network } = hre;

async function main() {
  console.log("Deploying TruthCamera contract...");

  // Log the network name and chainId
  console.log("Network:", network.name, "| Chain ID:", network.config.chainId);

  // Load deployer private key from .env
  const privateKey = process.env.PRIVATE_KEY;
  if (!privateKey) {
    throw new Error("PRIVATE_KEY not set in .env");
  }

  // Create a wallet and connect to the provider
  const provider = ethers.provider;
  const deployer = new ethers.Wallet(privateKey, provider);

  console.log("Deployer address:", deployer.address);

  // Log deployer wallet balance
  const balance = await provider.getBalance(deployer.address);
  console.log(
    "Deployer balance:",
    ethers.formatEther(balance),
    "ETH"
  );

  // Get the contract factory and connect with deployer
  const TruthCamera = await ethers.getContractFactory("TruthCamera", deployer);

  // Deploy the contract
  const truthCamera = await TruthCamera.deploy();

  // Wait for deployment to complete
  await truthCamera.waitForDeployment();

  const address = await truthCamera.getAddress();

  console.log("TruthCamera deployed to:", address);
  console.log("\nAdd this to your .env.local file:");
  console.log(`NEXT_PUBLIC_TRUTH_CAMERA_CONTRACT_ADDRESS=${address}`);

  // Verify the deployment by calling a view function
  console.log("\nTesting contract...");
  const testHash = ethers.keccak256(ethers.toUtf8Bytes("test"));
  const [exists] = await truthCamera.verify(testHash);
  console.log("Test verification (should be false):", exists);

  console.log("\nDeployment completed successfully!");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
