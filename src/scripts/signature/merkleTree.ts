// Test a Merkle tree
// launch with npx ts-node src/scripts/merkleTree.ts

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
    const airdrops: Airdrop[] = [
        { address: "0x3456347545764578", amount: "256" },
        { address: "0x345634772676164578", amount: "25" },
        { address: "0x345634751544355764578", amount: "56" },
        { address: "0x7e00d496e324876bbc8531f2d9a82bf154d1a04a50218ee74cdd372f75a551a", amount: "26" },
        { address: "0x34532461681464578", amount: "56" },
    ]
    const leafs: string[] = airdrops.map((airdop: Airdrop) => { return merkle.MerkleTree.hash(airdop.address, airdop.amount) });
    console.log("leafs =", leafs);
    const merkleT: merkle.MerkleTree = new merkle.MerkleTree(leafs);
    console.log("tree =", merkleT);
    const addressToCheck: string = "0x7e00d496e324876bbc8531f2d9a82bf154d1a04a50218ee74cdd372f75a551a";
    const posToCheck: number = airdrops.findIndex((airdrop, index) => { if (airdrop.address == addressToCheck) { return index } });
    console.log("pos =", posToCheck);
    const proof: string[] = merkleT.getProof(leafs[posToCheck]);
    console.log("proof =", proof);
    const verified: boolean = merkle.proofMerklePath(merkleT.root, leafs[posToCheck], proof);
    console.log("verified =", verified);
}
main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });