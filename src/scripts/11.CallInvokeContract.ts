// connect a contract that is already deployed on devnet.
// launch with npx ts-node src/scripts/11.CallInvokeContract.ts

import { Provider, Contract, Account, json, ec } from "starknet";
import fs from "fs";
import * as dotenv from "dotenv";
dotenv.config();


//          👇👇👇
// 🚨🚨🚨   Launch 'starknet-devnet --seed 0' before using this script.
//          Launch also the script for deployement of Test (script5).
//          👆👆👆
async function main() {
    //initialize Provider with DEVNET, reading .env file
    if (process.env.STARKNET_PROVIDER_BASE_URL != "http://127.0.0.1:5050") {
        console.log("This script work only on local devnet.");
        process.exit(1);
    }
    const provider = new Provider({ sequencer: { baseUrl: process.env.STARKNET_PROVIDER_BASE_URL } });
    console.log('STARKNET_PROVIDER_BASE_URL=', process.env.STARKNET_PROVIDER_BASE_URL);

    // connect existing predeployed account 0 of Devnet
    console.log('OZ_ACCOUNT0_ADDRESS=', process.env.OZ_ACCOUNT_ADDRESS);
    console.log('OZ_ACCOUNT0_PRIVATE_KEY=', process.env.OZ_ACCOUNT_PRIVATE_KEY);
    const privateKey0 = process.env.OZ_ACCOUNT_PRIVATE_KEY ?? "";
    const starkKeyPair0 = ec.getKeyPair(privateKey0);
    const account0Address: string = process.env.OZ_ACCOUNT_ADDRESS ?? "";
    const account0 = new Account(provider, account0Address, starkKeyPair0);
    console.log('existing OZ account0 connected.\n');


    // Connect the deployed Test instance in devnet
    const testAddress = "0x1e90aef7a2d5489f2f3707aae854c77e27f16dee6d34339eb93d18451c317c6"; // modify in accordance with result of script 5
    const compiledTest = json.parse(fs.readFileSync("./compiledContracts/test.json").toString("ascii"));
    const myTestContract = new Contract(compiledTest.abi, testAddress, provider);
    console.log('Test Contract connected at =', myTestContract.address);

    // Inetractions with the contract with call & invoke
    myTestContract.connect(account0);
    const bal1 = await myTestContract.call("get_balance");
    console.log("Initial balance =", bal1.res.toString());
    // estimate fee
    const { suggestedMaxFee: estimatedFee1 } = await account0.estimateInvokeFee({ contractAddress: testAddress, entrypoint: "increase_balance", calldata: ["10", "30"] });

    const resu = await myTestContract.invoke("increase_balance", [10, 30]);
    await provider.waitForTransaction(resu.transaction_hash);
    const bal2 = await myTestContract.call("get_balance");
    console.log("Initial balance =", bal2.res.toString());
    console.log('✅ Test completed.');

}
main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });