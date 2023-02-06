// Connect a predeployed OZ account in devnet. 
// address and PrivKey are displayed when lanching starknet-devnet, and have been  stored in .env file.
// launch with npx ts-node src/scripts/13.signer.ts

import { Account, ec, hash, Provider, number, json, Contract, encode } from "starknet";
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

    // creation of message signature
    //const privateKey = stark.randomAddress();
    const privateKey = privateKey0;
    const starkKeyPair = ec.getKeyPair(privateKey);
    const message: BigNumberish[] = [1, 128, 18, 14];
    const msgHash = hash.computeHashOnElements(message);
    const signature = ec.sign(starkKeyPair, msgHash);
    const publicKey = ec.getStarkKey(starkKeyPair);
    console.log("publicKey calculated =", publicKey, typeof (publicKey));
    const publicKey2 = starkKeyPair.getPublic("hex");
    console.log("publicKey calculated =", publicKey2, typeof (publicKey2));
    // const compiledAccount = json.parse(fs.readFileSync("./compiledContracts/Account_0_5_1.json").toString("ascii"));
    // const contractAccount = new Contract(compiledAccount.abi, accountAddress, provider);
    // const res2 = await contractAccount.call("getPublicKey");
    // const accountPublicKey: string = "0x" + res2.publicKey.toString(16);
    // console.log("pub2 from account =", accountPublicKey);

    // reception of data

    const pub2 = "0x" + publicKey2;
    console.log("publicKey 2 =", pub2, typeof (pub2));
    const starkKeyPair1 = ec.getKeyPairFromPublicKey(pub2);
    const msgHash1 = hash.computeHashOnElements(message);
    const result = ec.verify(starkKeyPair1, msgHash1, signature);
    console.log("Result =", result);


}
main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });