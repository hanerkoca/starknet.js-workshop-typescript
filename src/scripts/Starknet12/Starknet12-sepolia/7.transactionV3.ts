// Test transactions V 3 in Sepolia.
// launch with npx ts-node src/scripts/Starknet12/Starknet12-sepolia/7.transactionV3.ts
// Coded with Starknet.js v6.0.0 B7

import { constants, Contract, Account, json, shortString, RpcProvider } from "starknet";
import fs from "fs";
import { account5TestnetAddress, account5TestnetPrivateKey } from "../../../A1priv/A1priv";
import { infuraKey, account4MainnetAddress, account4MainnetPrivateKey } from "../../../A-MainPriv/mainPriv";
import { account0OZSepoliaAddress, account0OZSepoliaPrivateKey } from "../../../A1priv/A1priv";



async function main() {
    // initialize Provider 
    //const provider = new RpcProvider({ nodeUrl: "http://127.0.0.1:5050/rpc" } ); // only starknet-devnet-rs
    // const provider = new RpcProvider({ nodeUrl: "https://json-rpc.starknet-testnet.public.lavanet.xyz" }); // testnet
    //const provider = new RpcProvider({ nodeUrl: "http://192.168.1.44:9545/rpc/v0_5" }); // local Sepolia Testnet node
    const provider = new RpcProvider({ nodeUrl: "https://free-rpc.nethermind.io/sepolia-juno" }); //v0.6.0

    // Check that communication with provider is OK
    const ch = await provider.getChainId();
    console.log("chain Id =", shortString.decodeShortString(ch), ", rpc", await provider.getSpecVersion());

    // *** Devnet-rs 
    //const privateKey = "0x71d7bb07b9a64f6f78ac4c816aff4da9";
    // const accountAddress: string = "0x64b48806902a367c8598f4f95c305e8c1a1acba5f082d294a43793113115691";
    // *** initialize existing Argent X testnet  account
    // const privateKey = account5TestnetPrivateKey;
    // const accountAddress = account5TestnetAddress
    // *** initialize existing Argent X mainnet  account
    // const privateKey = account4MainnetPrivateKey;
    // const accountAddress = account4MainnetAddress
    // *** initialize existing Sepolia Testnet account
    const privateKey0 = account0OZSepoliaPrivateKey;
    const accountAddress0 = account0OZSepoliaAddress;
    const account0 = new Account(provider, accountAddress0, privateKey0, undefined, constants.TRANSACTION_VERSION.V3);
    console.log('existing_ACCOUNT_ADDRESS=', accountAddress0);
    console.log('existing account connected.\n');

    const compiledSierra = json.parse(fs.readFileSync("./compiledContracts/cairo210/reject.sierra.json").toString("ascii"));
    // const compiledCasm = json.parse(fs.readFileSync("./compiledContracts/cairo210/reject.casm.json").toString("ascii"));
    const contractAddress = "0x37bfdeb9c262566183211b89e85b871518eb0c32cbcb026dce9a486560a03e0";
    const myTestContract = new Contract(compiledSierra.abi, contractAddress, provider);
    myTestContract.connect(account0);
    const { transaction_hash: txH } = await myTestContract.invoke("test_fail", [100], { maxFee: 1 * 10 ** 15 }); // maxFee is necessary to avoid error during estimateFeee
    const txR = await provider.waitForTransaction(txH);


    console.log("✅ Test completed.");

}
main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });