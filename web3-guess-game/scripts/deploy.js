const hre = require("hardhat");

async function main() {
    // Get the contract factory
    const GuessGame = await hre.ethers.getContractFactory("GuessGame");
    
    // Deploy the contract
    const guessGame = await GuessGame.deploy();
    
    // Wait for the deployment to be confirmed
    await guessGame.deployed();
    
    console.log("GuessGame deployed to:", guessGame.address);
}

// Execute the deployment script
main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });