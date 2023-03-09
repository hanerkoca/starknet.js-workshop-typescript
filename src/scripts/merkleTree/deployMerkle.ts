// code for Starknet.js v5.1.0
import { Account, json, Provider } from 'starknet';
import fs from "fs";

import * as dotenv from "dotenv";
dotenv.config();

//    👇👇👇
// 🚨 launch 'starknet-devnet --seed 0' before using this script
//    👆👆👆

async function main() {
    //initialize Provider with DEVNET, reading .env file
    if (process.env.STARKNET_PROVIDER_BASE_URL != "http://127.0.0.1:5050") {
        console.log("This script work only on local devnet.");
        process.exit(1);
    }
    const provider = new Provider({ sequencer: { baseUrl: process.env.STARKNET_PROVIDER_BASE_URL } });


    console.log('STARKNET_PROVIDER_BASE_URL=', process.env.STARKNET_PROVIDER_BASE_URL);

    // initialize existing predeployed account 0 of Devnet
    console.log('OZ_ACCOUNT_ADDRESS=', process.env.OZ_ACCOUNT0_DEVNET_ADDRESS);
    console.log('OZ_ACCOUNT_PRIVATE_KEY=', process.env.OZ_ACCOUNT0_DEVNET_PRIVATE_KEY);
    const privateKey = process.env.OZ_ACCOUNT0_DEVNET_PRIVATE_KEY ?? "";
    const accountAddress: string = process.env.OZ_ACCOUNT0_DEVNET_ADDRESS ?? "";
    const account = new Account(provider, accountAddress, privateKey);
    console.log('✅ OZ predeployed account 0 connected.');

    const compiledDeployment = json.parse(fs.readFileSync("compiledContracts/merkle-verify.json").toString("ascii"));
    const root ="0x1497b72c82b80429799fe65afa3edc5492ee848deba69418c474504792756a0"
    const deployResponse = await account.declareAndDeploy({ contract: compiledDeployment,
        constructorCalldata: [root]});
    const airdropAddress=deployResponse.deploy.contract_address;
    const airdropClassHash=deployResponse.declare.class_hash;
    console.log("address =",airdropAddress);
    console.log("class_hash =",airdropClassHash);
    console.log("deployResponse =",deployResponse);


}
main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });