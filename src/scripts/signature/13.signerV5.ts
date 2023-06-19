// Verify message in an account. 
// Coded with Starknet.js v5.11.1
// launch with npx ts-node src/scripts/13.signer.ts

import { Account, ec, hash, Provider,  json, Contract, encode, num } from "starknet";
import * as dotenv from "dotenv";
import fs from "fs";
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
    const accountAddress: string = process.env.OZ_ACCOUNT0_DEVNET_ADDRESS ?? "";
    const account = new Account(provider, accountAddress, privateKey0);
    console.log('✅ OZ predeployed account 0 connected.');

    // creation of message signature
    const privateKey = privateKey0;
    const message: num.BigNumberish[] = [1, 128, 18, 14];
    const msgHash = hash.computeHashOnElements(message);
    const signature = ec.starkCurve.sign(msgHash,privateKey );
    const starknetPublicKey = ec.starkCurve.getStarkKey(privateKey);
    const fullPublicKey = encode.addHexPrefix(encode.buf2hex(ec.starkCurve.getPublicKey(privateKey, false)));
    console.log("        publicKey calculated =", starknetPublicKey, typeof (starknetPublicKey));
    console.log("full publicKey calculated =", fullPublicKey, typeof (fullPublicKey));
 
    // verify message outside of StarkNet
    console.log("Outside Starknet :");
    const msgHash1 = hash.computeHashOnElements(message);
    const result1 = ec.starkCurve.verify(signature, msgHash1, fullPublicKey);
    console.log("Result (boolean) =", result1);

    // verify message in the network, using the account linked to the privatekey
    console.log("With Starknet :");
    const compiledAccount = json.parse(fs.readFileSync("./compiledContracts/Account_0_5_1.json").toString("ascii"));
    const contractAccount = new Contract(compiledAccount.abi, accountAddress, provider);
    const msgHash2 = hash.computeHashOnElements(message);
    // The call of isValidSignature will generate an error if not valid
    let result2: boolean;
    try {
        await contractAccount.isValidSignature(msgHash2, [signature.r,signature.s]);
        result2 = true;
    } catch {
        result2 = false;
    }
    console.log("Result (boolean) =", result2);

    // check that fullPubKey is linked to this account address
    // verify that starknet public key stored in account contract is the X part of the full public key.
    console.log("full pub key check with account :");
    const publicKey = await contractAccount.getPublicKey() ;
    const isFullPubKeyRelatedToAccount: boolean =
    publicKey.publicKey ==
        BigInt(encode.addHexPrefix(fullPublicKey.slice(4, 68)));
    console.log("Result (boolean) =", isFullPubKeyRelatedToAccount);

}
main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });