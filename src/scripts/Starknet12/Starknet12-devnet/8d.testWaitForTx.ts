// test in devnet-rs/rpc0.5.0 a contract that can be rejected.
// launch with npx ts-node src/scripts/cairo12/cairo12-devnet/8c.testTxResponse.ts
// Coded with Starknet.js v5.24.3

import { constants, Contract, Account, json, shortString, RpcProvider, TransactionFinalityStatus, TransactionExecutionStatus, } from "starknet";
import fs from "fs";
import * as dotenv from "dotenv";
import { account2TestnetAddress, account2TestnetPrivateKey } from "../../../A1priv/A1priv";
dotenv.config();

//          👇👇👇
// 🚨🚨🚨 launch 'cargo run --release -- --seed 0' in devnet-rs directory before using this script
// And launch first script 8.
//          👆👆👆

function wait(delay: number) {
    return new Promise((res) => {
        setTimeout(res, delay);
    });
}

async function trackResponse(provider: RpcProvider, txH: string) {
    let end: number = 0;
    const start = new Date().getTime();
    console.log("txH =", txH);
    for (let i = 0; i < 20; i++) {
        let txR: any;
        try { txR = await provider.getTransactionReceipt(txH) }
        catch { txR = i.toString() + ": TxH not yet in memPool." };
        if (!!txR.execution_status) {
            if (!end) { end = new Date().getTime() }
            console.log("txR", i.toString() + ": execution =", txR.execution_status, ",", txR.finality_status);
        } else {
            console.log("txR", txR);
        }
        await wait(250);
    }
    const txR2 = await provider.waitForTransaction(txH);
    if (!end) { end = new Date().getTime() };
    // console.log("txR2 =", txR2);
    // const response=transactionResponse(txR2);
    //console.log("response =",response);
    console.log("Duration (s) =", (end - start) / 1000);
}

async function main() {

     const provider = new RpcProvider({ nodeUrl: "http://127.0.0.1:5050/rpc" }); // only starknet-devnet-rs
    //const provider = new RpcProvider({ nodeUrl: "https://starknet-testnet.public.blastapi.io/rpc/v0.5" });

    // initialize existing predeployed account 0 of Devnet
    console.log('OZ_ACCOUNT_ADDRESS=', process.env.OZ_ACCOUNT0_DEVNET_ADDRESS);
    console.log('OZ_ACCOUNT_PRIVATE_KEY=', process.env.OZ_ACCOUNT0_DEVNET_PRIVATE_KEY);
    const privateKey0 = process.env.OZ_ACCOUNT0_DEVNET_PRIVATE_KEY ?? "";
     const accountAddress0: string = process.env.OZ_ACCOUNT0_DEVNET_ADDRESS ?? "";
    //const privateKey0 = account2TestnetPrivateKey;
//const accountAddress0: string = account2TestnetAddress;
    const account0 = new Account(provider, accountAddress0, privateKey0);
    console.log("Account 0 connected.\n");


    const compiledSierra = json.parse(fs.readFileSync("./compiledContracts/cairo210/reject.sierra.json").toString("ascii"));

    //          👇👇👇 Put here the result of script 8
    const contractAddress = "0x127c767955c6991cabc39c96631070c16aea740e7f4b1626e1ad811f90f52e1";
    //const contractAddress = "0x1073c451258ff87d4e280fb00bc556767cdd464d14823f84fcbb8ba44895a34"; 

    const myTestContract = new Contract(compiledSierra.abi, contractAddress, provider);
    myTestContract.connect(account0);
    console.log('✅ Test Contract connected =', myTestContract.address);

    // console.log(myTestContract.functions);
    const rpcV = await provider.getSpecVersion();
    console.log("rpc version =",rpcV);
    const count1 = await myTestContract.get_counter();
    console.log("counter =", count1);
    // use 100 to have a success.
    // use any other u8 to have a reverted tx.
    console.log("***invoke succeeded :");
    const { transaction_hash: txH2 } = await myTestContract.invoke("test_fail", [100], { maxFee: 1 * 10 ** 15 }); // maxFee is necessary 
    const receipt1 = await provider.waitForTransaction(txH2,
        {
            successStates: [TransactionFinalityStatus.ACCEPTED_ON_L2],
            errorStates: [TransactionExecutionStatus.REVERTED],
        },);
        console.log("receipt1 =",receipt1);

    console.log("***invoke reverted :");
    const { transaction_hash: txH3 } = await myTestContract.invoke("test_fail", [10], { maxFee: 1 * 10 ** 15 }); // maxFee is necessary 
    const receipt2 = await provider.waitForTransaction(txH3,
        {
            successStates: [TransactionFinalityStatus.ACCEPTED_ON_L2],
            errorStates: [TransactionExecutionStatus.REVERTED],
        },);
        console.log("receipt2 =",receipt2);
    process.exit(1);
    console.log("***declare succeeded:");
    const compiledTestSierra = json.parse(fs.readFileSync("./compiledContracts/cairo200/PhilTest2.sierra.json").toString("ascii"));
    const compiledTestCasm = json.parse(fs.readFileSync("./compiledContracts/cairo200/PhilTest2.casm.json").toString("ascii"));

    const declareResponse = await account0.declare({ contract: compiledTestSierra, casm: compiledTestCasm });
    const contractClassHash = declareResponse.class_hash;
    const txH4 = declareResponse.transaction_hash;
    console.log('✅ Test Contract declared with classHash =', contractClassHash);
    await trackResponse(provider, txH4);
    // class hash = 0x19422a432e2ef921dd5bbf8b065fa8efd08607f89cf9359dd4730bb7285a29f

    console.log("***deploy succeeded :");
    const { transaction_hash: txH5, address } = await account0.deployContract({ classHash: contractClassHash });
    console.log("contract_address =", address);
    await trackResponse(provider, txH5);


    const count2 = await myTestContract.get_counter();
    console.log("counter =", count2);

    console.log("✅ Test completed.");

}
main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });