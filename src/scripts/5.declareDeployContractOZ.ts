// declare & deploy a contract.
// use of OZ deployer

import { Provider, Account, Contract, defaultProvider, ec, json, stark, number, hash } from "starknet";
import { ec as EC } from "elliptic";
import fs from "fs";
import readline from "readline";
import axios from "axios";
import * as dotenv from "dotenv";
import { starknetKeccak } from "starknet/dist/utils/hash";
dotenv.config();


//          👇👇👇
// 🚨🚨🚨   Launch 'starknet-devnet --seed 0' before using this script.
//          Launch also the script for deployement of myUniversalDeployer.
//          Launch also the script for deployement of Test.
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
    console.log('existing OZ account0 connected.');

    // Deploy Test instance in devnet
    const testClassHash = "0xff0378becffa6ad51c67ac968948dbbd110b8a8550397cf17866afebc6c17d";
    const compiledTest = json.parse(fs.readFileSync("./compiledContracts/test.json").toString("ascii"));
    const deployResponse = await account0.declareDeploy({ contract: compiledTest, classHash: testClassHash });
    // In case of constructor, add : ,constructorCalldata: [encodeShortString('Token'),encodeShortString('ERC20'),account.address,],

    // Connect the new contract :
    const myTestContract = new Contract(compiledTest.abi, deployResponse.deploy.contract_address, provider);
    console.log('✅ Test Contract connected at =', myTestContract.deploy.address);

}
main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });