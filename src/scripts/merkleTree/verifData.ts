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

export function isStringBigInt(bigInt: string): boolean {
    return /^[0-9]*n*$/i.test(bigInt);
}
// export function decimalStringToHex(decString: string): string {
//     if (number.isStringWholeNumber(decString)) {
//         return encode.addHexPrefix(BigInt(decString).toString(16));
//     }
//     throw new Error("Input must have a format '12345' .")
// }
export function bigIntStringToHex(bigIntString: string): string {
    if (isStringBigInt(bigIntString)) {
        return encode.addHexPrefix(BigInt(bigIntString.slice(0, -1)).toString(16));
    }
    throw new Error("Input must have a format '12345n' .")
}

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

    const d1 = "0x21fa";
    const d2 = "21";
    const d3 = "255n";
    const d4 = "EZYTZTER";
    const r1 = number.isHex(d1);
    const r2 = number.isStringWholeNumber(d2);
    const r2b = number.getHexString(d2);
    const r3 = isStringBigInt(d3);
    const r4b = bigIntStringToHex(d3);
    console.log("a");

}
main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });

function getHexString(d2: string) {
    throw new Error("Function not implemented.");
}
