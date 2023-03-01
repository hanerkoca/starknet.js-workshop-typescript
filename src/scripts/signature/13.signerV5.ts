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
    const starknetPublicKey = ec.getStarkKey(starkKeyPair);
    const fullPublicKey = encode.addHexPrefix(starkKeyPair.getPublic("hex"));
    console.log("     publicKey calculated =", starknetPublicKey, typeof (starknetPublicKey));
    console.log("full publicKey calculated =", fullPublicKey, typeof (fullPublicKey));
    // const compiledAccount = json.parse(fs.readFileSync("./compiledContracts/Account_0_5_1.json").toString("ascii"));
    // const contractAccount = new Contract(compiledAccount.abi, accountAddress, provider);
    // const res2 = await contractAccount.call("getPublicKey");
    // const accountPublicKey: string = "0x" + res2.publicKey.toString(16);
    // console.log("pub2 from account =", accountPublicKey);

    // verify message outside of StarkNet
    console.log("Outside Starknet =");
    const starkKeyPair1 = ec.getKeyPairFromPublicKey(fullPublicKey);
    const msgHash1 = hash.computeHashOnElements(message);
    const result1 = ec.verify(starkKeyPair1, msgHash1, signature);
    console.log("Result (boolean) =", result1);

    // verify message in the network, using the account linked to the privatekey
    console.log("With Starknet =");
    const compiledAccount = json.parse(fs.readFileSync("./compiledContracts/Account_0_5_1.json").toString("ascii"));
    const contractAccount = new Contract(compiledAccount.abi, accountAddress, provider);
    const msgHash2 = hash.computeHashOnElements(message);
    // The call of isValidSignature will generate an error if not valid
    let result2: boolean;
    try {
        await contractAccount.call("isValidSignature", [msgHash2, signature]);
        result2 = true;
    } catch {
        result2 = false;
    }
    console.log("Result (boolean) =", result2);

    // check fullPubKey
    console.log("full pub key check with account =");
    const pubKey3 = await contractAccount.call("getPublicKey");
    const isFullPubKeyRelatedToAccount: boolean =
        BigInt(pubKey3.publicKey.toString()) ==
        BigInt(encode.addHexPrefix(fullPublicKey.slice(4, 68)));
    console.log("Result (boolean)=", isFullPubKeyRelatedToAccount);

}
main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });