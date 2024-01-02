// test in sepolia testnet/rpc0.5.0 a contract that can be rejected.
// launch with npx ts-node src/scripts/Starknet12/Starknet12-sepolia/6.testTxResponse.ts
// Coded with Starknet.js v5.24.3

import { constants, Contract, Account, json, shortString, RpcProvider } from "starknet";
import { account0OZSepoliaAddress, account0OZSepoliaPrivateKey } from "../../../A1priv/A1priv";
import {account1MainnetAddress,account1MainnetPrivateKey} from "../../../A-MainPriv/mainPriv"

import fs from "fs";
import * as dotenv from "dotenv";
import { alchemyKey } from "../../../A-MainPriv/mainPriv";
import axios from "axios";
dotenv.config();

function wait(delay: number) {
    return new Promise((res) => {
        setTimeout(res, delay);
    });
}

async function trackResponse(provider: RpcProvider, txH2: string) {
    let end: number = 0;
    const start = new Date().getTime();
    console.log("txH2 =", txH2);
    for (let i = 0; i < 20; i++) {
        let txR: any;
        try { txR = await provider.getTransactionReceipt(txH2) }
        catch { txR = i.toString() + ": TxH not yet in memPool." };
        if (!!txR.execution_status) {
            if (!end) { end = new Date().getTime() }
            console.log("txR", i.toString() + ": execution =", txR);
        } else {
            console.log("txR", txR);
        }
        await wait(250);
    }
    const txR2 = await provider.waitForTransaction(txH2);
    if (!end) { end = new Date().getTime() };
    // console.log("txR2 =", txR2);
    // const response=transactionResponse(txR2);
    // console.log("response =",response);
    console.log("Duration (s) =", (end - start) / 1000);
}

async function main() {
    //const provider = new RpcProvider({ nodeUrl: "https://starknet-testnet.public.blastapi.io/rpc/v0.5" });
    // const provider = new RpcProvider({ nodeUrl: "http://127.0.0.1:5050/rpc" } ); // only starknet-devnet-rs
    //const provider = new RpcProvider({ nodeUrl: "http://192.168.1.44:9545/rpc/v0.5" }); // Sepolia Testnet
    const provider = new RpcProvider({ nodeUrl: "https://starknet-mainnet.g.alchemy.com/starknet/version/rpc/v0.5/" + alchemyKey });

    console.log("chain Id =", shortString.decodeShortString(await provider.getChainId()), ", rpc", await provider.getSpecVersion());
    
    // Sepolia Testnet :
    // const privateKey0 = account0OZSepoliaPrivateKey;
    // const accountAddress0 = account0OZSepoliaAddress;
    // Mainnet :
    const privateKey0 = account1MainnetPrivateKey;
    const accountAddress0 = account1MainnetAddress;
    const account0 = new Account(provider, accountAddress0, privateKey0);
    console.log("Account 0 connected.\n");


    const compiledSierra = json.parse(fs.readFileSync("./compiledContracts/cairo210/reject.sierra.json").toString("ascii"));
    // Mainnet
    const contractAddress = "0x02bD907B978F58ceDf616cFf5CdA213d63Daa3AD28Dd3C1Ea17cA6CF5E1D395F";

    const myTestContract = new Contract(compiledSierra.abi, contractAddress, provider);
    myTestContract.connect(account0);
    console.log('✅ Test Contract connected =', myTestContract.address);

    // console.log(myTestContract.functions);
    
    const count1 = await myTestContract.get_counter();
    console.log("counter =", count1);
    // use 100 to have a success.
    // use any other u8 to have a reverted tx.
    const { transaction_hash: txH2 } = await myTestContract.invoke("test_fail", [100], { maxFee: 1 * 10 ** 15 }); // maxFee is necessary to avoid error during estimateFeee
    //await trackResponse(provider, txH2);
    const txR=await provider.waitForTransaction(txH2);
    console.log(txR);

    const count2 = await myTestContract.get_counter();
    console.log("counter =", count2);
    // console.log("Duration (s) =", (end - start) / 1000);

    console.log("✅ Test completed.");

}
main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });