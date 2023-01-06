// Connect a predeployed OZ account in devnet. 
// address and PrivKey are displayed when lanching starknet-devnet, and have been  stored in .env file.
// launch with npx ts-node src/scripts/13.signer.ts

import { Account, ec, hash, Provider, number, json, Contract } from "starknet";
import * as dotenv from "dotenv";
import fs from "fs";
import { BigNumberish } from "starknet/src/utils/number";
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
    console.log('OZ_ACCOUNT_ADDRESS=', process.env.OZ_ACCOUNT_ADDRESS);
    console.log('OZ_ACCOUNT_PRIVATE_KEY=', process.env.OZ_ACCOUNT_PRIVATE_KEY);
    const privateKey0 = process.env.OZ_ACCOUNT_PRIVATE_KEY ?? "";
    const starkKeyPair0 = ec.getKeyPair(privateKey0);
    const accountAddress: string = process.env.OZ_ACCOUNT_ADDRESS ?? "";
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
    const compiledAccount = json.parse(fs.readFileSync("./compiledContracts/Account_0_5_1.json").toString("ascii"));
    const contractAccount = new Contract(compiledAccount.abi, accountAddress, provider);
    const pub2 = await contractAccount.call("getPublicKey");
    console.log("pub2 from account =", pub2.publicKey, typeof (pub2.publicKey));
    const pub3 = number.toBN(pub2.publicKey);
    console.log("pub3 from account =", pub3, typeof (pub3));
    const pub4 = number.toHex(pub3);
    console.log("pub4 from account =", pub4, typeof (pub4));
    // delivery of message, signature, publiKey by any means.

    // reception of data
    const starkKeyPair1 = ec.getKeyPairFromPublicKey(publicKey);
    const msgHash1 = hash.computeHashOnElements(message);
    const result = ec.verify(starkKeyPair, msgHash1, signature);
    console.log("Result =", result);


}
main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });