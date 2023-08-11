// connect a contract that is already deployed on devnet.
// launch with npx ts-node src/scripts/cairo11-testnet/5.CallERC20.ts
// Coded with Starknet.js v5.17.0

import { constants, Provider, Contract, Account, json, shortString, RpcProvider } from "starknet";
import fs from "fs";
import { accountTestnet4Address, accountTestnet4privateKey } from "../../A1priv/A1priv";
import { infuraKey } from "../../A-MainPriv/mainPriv";


async function main() {
    //initialize Provider 
    const provider = new RpcProvider({ nodeUrl: 'https://starknet-goerli.infura.io/v3/' + infuraKey });

    // initialize existing Argent X account
    const account0Address = accountTestnet4Address;
    console.log('Braavos1_ACCOUNT_ADDRESS=', account0Address);
    const account0 = new Account(provider, account0Address, accountTestnet4privateKey);
    console.log('existing account connected.\n');

    const myContractAddress = "0x03e3Bf30531414D3e9184fEB78fa003f2bA9594702ECE22475908fDBE22e68ae";
    const { abi: contractAbi } = await provider.getClassAt(myContractAddress);
    const myContract = new Contract(contractAbi, myContractAddress, provider);
    const len = await myContract.getUserTradeListLength();
    console.log("len", len);


    console.log('✅ Test completed.');

}
main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });