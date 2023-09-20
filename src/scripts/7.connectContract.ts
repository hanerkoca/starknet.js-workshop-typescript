// connect a contract that is already deployed on devnet.
// launch with npx ts-node src/scripts/7.connectContract.ts
// Coded with Starknet.js v5.16.0

import { Provider, Contract, json } from "starknet";
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

    // Connect the deployed Test instance in devnet
    const testAddress = "0x7667469b8e93faa642573078b6bf8c790d3a6184b2a1bb39c5c923a732862e1";
    const compiledTest = json.parse(fs.readFileSync("./compiledContracts/cairo060/test.json").toString("ascii"));
    const myTestContract = new Contract(compiledTest.abi, testAddress, provider);
    console.log('✅ Test Contract connected at =', myTestContract.address);

}
main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });