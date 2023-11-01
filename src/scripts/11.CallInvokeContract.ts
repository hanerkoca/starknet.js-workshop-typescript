// interact with a contract that is already deployed on devnet.
// launch with npx ts-node src/scripts/11.CallInvokeContract.ts
// Coded with Starknet.js v5.16.0, Starknet-devnet-rs v0.1.0

import { Contract, Account, json, RpcProvider } from "starknet";
import fs from "fs";
import * as dotenv from "dotenv";
dotenv.config();


//          👇👇👇
// 🚨🚨🚨 launch 'cargo run --release -- --seed 0' in devnet-rs directory before using this script
//          Launch also the script for deployement of Test (script5).
//          👆👆👆
async function main() {
    const provider = new RpcProvider({ nodeUrl: "http://127.0.0.1:5050/rpc" }); // only for starknet-devnet-rs
    console.log("Provider connected to Starknet-devnet-rs");

    // initialize existing predeployed account 0 of Devnet
    console.log('OZ_ACCOUNT_ADDRESS=', process.env.OZ_ACCOUNT0_DEVNET_ADDRESS);
    console.log('OZ_ACCOUNT_PRIVATE_KEY=', process.env.OZ_ACCOUNT0_DEVNET_PRIVATE_KEY);
    const privateKey0 = process.env.OZ_ACCOUNT0_DEVNET_PRIVATE_KEY ?? "";
    const accountAddress0: string = process.env.OZ_ACCOUNT0_DEVNET_ADDRESS ?? "";
    const account0 = new Account(provider, accountAddress0, privateKey0);
    console.log("Account 0 connected.\n");

    // Connect the deployed Test instance in devnet
    const testAddress = "0x1e90aef7a2d5489f2f3707aae854c77e27f16dee6d34339eb93d18451c317c6"; // modify in accordance with result of script 5
    const compiledTest = json.parse(fs.readFileSync("./compiledContracts/cairo060/test.json").toString("ascii"));
    const myTestContract = new Contract(compiledTest.abi, testAddress, provider);
    console.log('Test Contract connected at =', myTestContract.address);

    // Interactions with the contract with call & invoke
    myTestContract.connect(account0);
    const { res } = await myTestContract.get_balance();
    const bal1b = await myTestContract.call("get_balance");
    console.log("Initial balance =", res);
    console.log("Initial balance =", res.toString());
    // console.log("Initial balance =", bal1b.res.toString());
    // estimate fee
    const { suggestedMaxFee: estimatedFee1 } = await account0.estimateInvokeFee({ contractAddress: testAddress, entrypoint: "increase_balance", calldata: ["10", "30"] });

    const resu = await myTestContract.invoke("increase_balance", [10, 30]);
    await provider.waitForTransaction(resu.transaction_hash);
    const bal2 = await myTestContract.get_balance();
    console.log("Final balance =", bal2.res.toString());
    console.log('✅ Test completed.');
}
main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });