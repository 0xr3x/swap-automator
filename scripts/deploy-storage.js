import { ethers } from "hardhat";

async function main() {
  // Get the contract factory
  const RequestStorage = await ethers.getContractFactory("RequestStorage");
  
  // Deploy the contract
  console.log("Deploying RequestStorage...");
  const requestStorage = await RequestStorage.deploy();
  
  // Wait for deployment to finish
  await requestStorage.deployed();
  
  console.log("RequestStorage deployed to:", requestStorage.address);
}

// Execute deployment
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
