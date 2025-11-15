# Web3 Guessing Game

Welcome to the Web3 Guessing Game! This project is a decentralized guessing game built on the Ethereum blockchain, allowing players to guess a number and win rewards. The game utilizes smart contracts for secure and transparent gameplay.

## Table of Contents

- [Features](#features)
- [Technologies Used](#technologies-used)
- [Installation](#installation)
- [Usage](#usage)
- [Smart Contract](#smart-contract)
- [Testing](#testing)
- [Deployment](#deployment)
- [Contributing](#contributing)
- [License](#license)

## Features

- Play a guessing game on the Ethereum blockchain.
- Connect your Web3 wallet to participate.
- Secure and transparent gameplay through smart contracts.
- Sleek animations and a modern user interface.

## Technologies Used

- HTML, CSS, JavaScript
- Ethereum Smart Contracts (Solidity)
- Hardhat for development and deployment
- Web3.js for blockchain interactions

## Installation

1. Clone the repository:
   ```
   git clone https://github.com/yourusername/web3-guess-game.git
   ```
2. Navigate to the project directory:
   ```
   cd web3-guess-game
   ```
3. Install the dependencies:
   ```
   npm install
   ```

## Usage

1. Start the local blockchain using Hardhat:
   ```
   npx hardhat node
   ```
2. Deploy the smart contract:
   ```
   npx hardhat run scripts/deploy.js --network localhost
   ```
3. Open the `public/index.html` file in your browser to play the game.

## Smart Contract

The smart contract for the guessing game is located in the `contracts/GuessGame.sol` file. It contains the logic for making guesses, determining winners, and distributing rewards.

## Testing

To run the tests for the smart contract, use the following command:
```
npx hardhat test
```

## Deployment

The deployment script is located in `scripts/deploy.js`. It uses Hardhat to deploy the GuessGame contract to the specified network.

## Contributing

Contributions are welcome! Please fork the repository and submit a pull request for any improvements or features.

## License

This project is licensed under the MIT License. See the LICENSE file for more details.