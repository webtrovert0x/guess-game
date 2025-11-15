// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract GuessGame {
    address public owner;
    uint256 private secretNumber;
    uint256 public prizePool;
    mapping(address => uint256) public playerGuesses;
    mapping(address => bool) public hasGuessed;

    event NewGuess(address indexed player, uint256 guess);
    event GameWon(address indexed winner, uint256 prize);

    constructor() {
        owner = msg.sender;
        prizePool = 0;
    }

    modifier onlyOwner() {
        require(msg.sender == owner, "Only the owner can call this function");
        _;
    }

    function startGame(uint256 _secretNumber) external onlyOwner {
        secretNumber = _secretNumber;
        prizePool = address(this).balance;
    }

    function guess(uint256 _guess) external payable {
        require(!hasGuessed[msg.sender], "You have already guessed");
        require(msg.value > 0, "Must send ETH to participate");

        playerGuesses[msg.sender] = _guess;
        hasGuessed[msg.sender] = true;
        prizePool += msg.value;

        emit NewGuess(msg.sender, _guess);
    }

    function checkGuess() external {
        require(hasGuessed[msg.sender], "You have not guessed yet");
        require(secretNumber != 0, "Game has not started");

        if (playerGuesses[msg.sender] == secretNumber) {
            uint256 prize = prizePool;
            prizePool = 0;
            payable(msg.sender).transfer(prize);
            emit GameWon(msg.sender, prize);
        }
    }

    function resetGame() external onlyOwner {
        secretNumber = 0;
        prizePool = 0;
    }

    function withdraw() external onlyOwner {
        payable(owner).transfer(address(this).balance);
    }
}