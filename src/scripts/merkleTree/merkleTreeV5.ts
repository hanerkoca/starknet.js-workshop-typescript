// Test a Merkle tree
// launch with npx ts-node src/scripts/merkleTree/merkleTreeV5.ts

import { Account, ec, hash, Provider, number, json, Contract, encode, Signature, typedData, merkle, uint256 } from "starknet";
import * as dotenv from "dotenv";
import fs from "fs";
import { BigNumberish } from "starknet/src/utils/number";
import BN from "bn.js";
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
    const privateKey0 = process.env.OZ_ACCOUNT0_DEVNET_PRIVATE_KEY ?? "";
    const starkKeyPair0 = ec.getKeyPair(privateKey0);
    const accountAddress: string = process.env.OZ_ACCOUNT0_DEVNET_ADDRESS ?? "";
    const account = new Account(provider, accountAddress, starkKeyPair0);
    console.log('✅ OZ predeployed account 0 connected.');

    // MERKLE TREE
    interface Airdrop {
        address: string;
        amount: string;
    }
    // Connect the deployed contract in devnet
    //    👇👇👇
    const testAddress = "0x6dce091932236915ef5699295cedbded9aa5c6dd2558ade397938ddcc53ad96"; // modify
    //    👆👆👆
    const compiledTest = json.parse(fs.readFileSync("./compiledContracts/merkle-verify.json").toString("ascii"));
    const myContract = new Contract(compiledTest.abi, testAddress, provider);
    console.log('Contract connected at =', myContract.address);

    // Inetractions with the contract with call & invoke
    myContract.connect(account);
    const proof = ['0x2fe51a397bc6729bb99d27ffadf5d3826a013ed49ae0f00326ee043fd2b668c',
        '0x77202149831fe68628fc19be9879f77727f52c4d455ab4b2531a3bc5e59441f',
        '0x7048f1ce20e899d5a5db552ecae56179510b7035b62066b0a12545a4d5c17e9'
    ]
    const result1 = await myContract.call("verify_proof", ["0x1ec6375477dd0822dc2c77c5c0a6efc97915a93df1ccc5c6b89b684c0ae2cef", proof]);
    console.log("Result =", "0x" + result1.res.toString(16));
    let airdropPerformed: boolean;
    try {
        await myContract.invoke("request_airdrop", ['0x7e00d496e324876bbc8531f2d9a82bf154d1a04a50218ee74cdd372f75a551a', 26, proof]);
        airdropPerformed = true
    }
    catch {
        airdropPerformed = false
    }
    console.log("Result =", airdropPerformed);
}
main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });