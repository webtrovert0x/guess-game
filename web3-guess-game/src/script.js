// This file contains the JavaScript logic for the web3 guessing game. 
// It handles user interactions, game logic, and integrates with the web3 wallet functionality.

let web3;
let contract;
let userAccount;
const contractAddress = "YOUR_CONTRACT_ADDRESS"; // Replace with your deployed contract address
const contractABI = []; // Replace with your contract's ABI

async function initWeb3() {
    if (window.ethereum) {
        web3 = new Web3(window.ethereum);
        try {
            await window.ethereum.request({ method: 'eth_requestAccounts' });
            userAccount = await web3.eth.getAccounts();
            document.getElementById('message').innerText = "Wallet connected: " + userAccount[0];
            initContract();
        } catch (error) {
            console.error("User denied account access");
        }
    } else {
        alert("Please install MetaMask or another web3 wallet.");
    }
}

function initContract() {
    contract = new web3.eth.Contract(contractABI, contractAddress);
}

async function setDifficulty(difficulty) {
   
    const rangeText = document.getElementById('range-text');
    rangeText.innerText = `Difficulty set to ${difficulty}. Make your guess!`;
    document.getElementById('guessInput').disabled = false;
    document.getElementById('guessButton').disabled = false;
}

async function checkGuess() {
    const guess = document.getElementById('guessInput').value;
    if (guess) {
        try {
            const result = await contract.methods.checkGuess(guess).send({ from: userAccount[0] });
            document.getElementById('message').innerText = "Transaction successful: " + result.transactionHash;
        } catch (error) {
            document.getElementById('message').innerText = "Error: " + error.message;
        }
    } else {
        document.getElementById('message').innerText = "Please enter a valid guess.";
    }
}

async function provideHint() {
    // Logic to provide hints based on the game state
}

async function restartGame() {
    // Logic to restart the game
}

async function resetGame() {
    // Logic to reset the game and change difficulty
}

document.getElementById('audioToggle').addEventListener('click', function() {
    const audio = document.getElementById('bgAudio');
    if (audio.paused) {
        audio.play();
        this.setAttribute('aria-pressed', 'true');
    } else {
        audio.pause();
        this.setAttribute('aria-pressed', 'false');
    }
});

window.addEventListener('load', initWeb3);