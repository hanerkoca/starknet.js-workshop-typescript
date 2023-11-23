// test in testnet/rpc0.5.0 a contract that can be rejected.
// launch with npx ts-node src/scripts/cairo12/cairo12-testnet/6.testTxResponse.ts
// Coded with Starknet.js v5.24.3+modif

import { constants, Contract, Account, json, shortString, RpcProvider, transactionResponse } from "starknet";
import { account2TestnetAddress, account2TestnetPrivateKey } from "../../../A1priv/A1priv";

import fs from "fs";
import * as dotenv from "dotenv";
dotenv.config();

function wait(delay: number) {
    return new Promise((res) => {
        setTimeout(res, delay);
    });
}

async function trackResponse (provider:RpcProvider,txH2:string){
    let end: number = 0;
    const start = new Date().getTime();
    console.log("txH2 =", txH2);
    for (let i = 0; i < 20; i++) {
        let txR: any;
        try { txR = await provider.getTransactionReceipt(txH2) }
        catch { txR = i.toString() + ": TxH not yet in memPool." };
        if (!!txR.execution_status) {
            if (!end) { end = new Date().getTime() }
            console.log("txR",i.toString() + ": execution =", txR.execution_status, ",", txR.finality_status);
        } else {
            console.log("txR", txR);
        }
        await wait(250);
    }
    const txR2 = await provider.waitForTransaction(txH2);
    if (!end) { end = new Date().getTime() };
    // console.log("txR2 =", txR2);
    const response=transactionResponse(txR2);
    console.log("response =",response);
    console.log("Duration (s) =", (end - start) / 1000);
}

async function main() {
    const provider = new RpcProvider({ nodeUrl: "https://starknet-testnet.public.blastapi.io/rpc/v0.5" });
    // const provider = new RpcProvider({ nodeUrl: "http://127.0.0.1:5050/rpc" } ); // only starknet-devnet-rs
    
// initialize existing predeployed account 0 of Devnet

const privateKey0 = account2TestnetPrivateKey;
const accountAddress0: string = account2TestnetAddress;
const account0 = new Account(provider, accountAddress0, privateKey0);
console.log("Account 0 connected.\n");


    const compiledSierra = json.parse(fs.readFileSync("./compiledContracts/cairo210/reject.sierra.json").toString("ascii"));
    // Testnet
    const contractAddress = "0x1073c451258ff87d4e280fb00bc556767cdd464d14823f84fcbb8ba44895a34"; 

    const myTestContract = new Contract(compiledSierra.abi, contractAddress, provider);
    myTestContract.connect(account0);
    console.log('✅ Test Contract connected =', myTestContract.address);

    // console.log(myTestContract.functions);
    const blockNum = await provider.getChainId();
    const count1 = await myTestContract.get_counter();
    console.log("counter =", count1);
    // use 100 to have a success.
    // use any other u8 to have a reverted tx.
    const { transaction_hash: txH2 } = await myTestContract.invoke("test_fail", [100], { maxFee: 1*10**15 }); // maxFee is necessary to avoid error during estimateFeee
    await trackResponse(provider,txH2);

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