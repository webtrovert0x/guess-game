import { expect } from "chai";
import { ethers } from "hardhat";

describe("GuessGame Contract", function () {
    let GuessGame;
    let guessGame;
    let owner;
    let player1;
    let player2;

    beforeEach(async function () {
        GuessGame = await ethers.getContractFactory("GuessGame");
        [owner, player1, player2] = await ethers.getSigners();
        guessGame = await GuessGame.deploy();
        await guessGame.deployed();
    });

    describe("Deployment", function () {
        it("Should set the right owner", async function () {
            expect(await guessGame.owner()).to.equal(owner.address);
        });

        it("Should initialize with no players", async function () {
            expect(await guessGame.getPlayersCount()).to.equal(0);
        });
    });

    describe("Game Functionality", function () {
        it("Should allow players to join the game", async function () {
            await guessGame.connect(player1).joinGame();
            expect(await guessGame.getPlayersCount()).to.equal(1);
        });

        it("Should allow players to make a guess", async function () {
            await guessGame.connect(player1).joinGame();
            await guessGame.connect(player1).makeGuess(50);
            expect(await guessGame.getPlayerGuess(player1.address)).to.equal(50);
        });

        it("Should determine the winner correctly", async function () {
            await guessGame.connect(player1).joinGame();
            await guessGame.connect(player2).joinGame();
            await guessGame.setWinningNumber(42); // Assuming this function exists
            await guessGame.connect(player1).makeGuess(42);
            await guessGame.connect(player2).makeGuess(30);
            await guessGame.checkWinner(); // Assuming this function exists
            expect(await guessGame.getWinner()).to.equal(player1.address);
        });

        it("Should distribute rewards to the winner", async function () {
            await guessGame.connect(player1).joinGame();
            await guessGame.connect(player2).joinGame();
            await guessGame.setWinningNumber(42);
            await guessGame.connect(player1).makeGuess(42);
            await guessGame.connect(player2).makeGuess(30);
            await guessGame.checkWinner();
            const winnerBalanceBefore = await ethers.provider.getBalance(player1.address);
            await guessGame.distributeRewards(); // Assuming this function exists
            const winnerBalanceAfter = await ethers.provider.getBalance(player1.address);
            expect(winnerBalanceAfter).to.be.gt(winnerBalanceBefore);
        });
    });
});