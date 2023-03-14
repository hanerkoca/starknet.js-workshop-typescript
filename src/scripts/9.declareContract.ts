// Declare a contract contract.
// launch with npx ts-node src/scripts/9.declareContract.ts
// Coded with Starknet.js v5.1.0

import { Provider, Account, Contract, ec, json } from "starknet";
import fs from "fs";
import BN from "bn.js";
import * as dotenv from "dotenv";
dotenv.config();


//          👇👇👇
// 🚨🚨🚨   Launch 'starknet-devnet --seed 0' before using this script.
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
    console.log('OZ_ACCOUNT0_ADDRESS=', process.env.OZ_ACCOUNT0_DEVNET_ADDRESS);
    console.log('OZ_ACCOUNT0_PRIVATE_KEY=', process.env.OZ_ACCOUNT0_DEVNET_PRIVATE_KEY);
    const privateKey0 = process.env.OZ_ACCOUNT0_DEVNET_PRIVATE_KEY ?? "";
    const account0Address: string = process.env.OZ_ACCOUNT0_DEVNET_ADDRESS ?? "";
    const account0 = new Account(provider, account0Address, privateKey0);
    console.log('existing OZ account0 connected.\n');

    // Declare Test contract in devnet
    const compiledTest = json.parse(fs.readFileSync("./compiledContracts/test.json").toString("ascii"));
    const { suggestedMaxFee: fee1 } = await account0.estimateDeclareFee({ contract: compiledTest });
    console.log("suggestedMaxFee =", fee1.toString(),"wei");
    const declareResponse = await account0.declare({ contract: compiledTest}, { maxFee: fee1 * 11n / 10n });

    console.log('✅ Test Contract Class Hash =', declareResponse.class_hash);
    await provider.waitForTransaction(declareResponse.transaction_hash);

}
main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });