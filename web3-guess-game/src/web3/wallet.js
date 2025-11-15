// This file contains functions to interact with the user's web3 wallet. 
// It includes methods for connecting to the wallet, checking the user's account, 
// and sending transactions related to the game.

import Web3 from 'web3';

let web3;
let currentAccount = null;

export const connectWallet = async () => {
    if (window.ethereum) {
        try {
            // Request account access if needed
            const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
            currentAccount = accounts[0];
            web3 = new Web3(window.ethereum);
            console.log('Wallet connected:', currentAccount);
            return currentAccount;
        } catch (error) {
            console.error('User denied account access or error occurred:', error);
            return null;
        }
    } else {
        console.error('No Ethereum provider found. Install MetaMask or another wallet.');
        return null;
    }
};

export const getCurrentAccount = () => {
    return currentAccount;
};

export const sendTransaction = async (to, value) => {
    if (!currentAccount) {
        console.error('Wallet not connected. Please connect your wallet first.');
        return;
    }

    const transactionParameters = {
        to: to,
        from: currentAccount,
        value: web3.utils.toHex(web3.utils.toWei(value.toString(), 'ether')),
    };

    try {
        const txHash = await window.ethereum.request({
            method: 'eth_sendTransaction',
            params: [transactionParameters],
        });
        console.log('Transaction sent:', txHash);
        return txHash;
    } catch (error) {
        console.error('Transaction failed:', error);
        return null;
    }
};