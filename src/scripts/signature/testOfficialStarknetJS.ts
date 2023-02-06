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
    // if (process.env.STARKNET_PROVIDER_BASE_URL != "http://127.0.0.1:5050") {
    //     console.log("This script work only on local devnet.");
    //     process.exit(1);
    // }
    // const provider = new Provider({ sequencer: { baseUrl: process.env.STARKNET_PROVIDER_BASE_URL } });
    // console.log('STARKNET_PROVIDER_BASE_URL=', process.env.STARKNET_PROVIDER_BASE_URL);

    // // initialize existing predeployed account 0 of Devnet
    // console.log('OZ_ACCOUNT_ADDRESS=', process.env.OZ_ACCOUNT0_DEVNET_ADDRESS);
    // console.log('OZ_ACCOUNT_PRIVATE_KEY=', process.env.OZ_ACCOUNT0_DEVNET_PRIVATE_KEY);
    // const privateKey0 = process.env.OZ_ACCOUNT0_DEVNET_PRIVATE_KEY ?? "";
    // const starkKeyPair0 = ec.getKeyPair(privateKey0);
    // const accountAddress: string = process.env.OZ_ACCOUNT0_DEVNET_ADDRESS ?? "";
    // const account = new Account(provider, accountAddress, starkKeyPair0);
    // console.log('✅ OZ predeployed account 0 connected.');

    // // creation of message signature
    // //const privateKey = stark.randomAddress();
    // const privateKey = privateKey0;
    // const starkKeyPair = ec.getKeyPair(privateKey);
    // const message: BigNumberish[] = [1, 128, 18, 14];
    // const msgHash = hash.computeHashOnElements(message);
    // const signature = ec.sign(starkKeyPair, msgHash);
    // const publicKey = ec.getStarkKey(starkKeyPair);
    // console.log("publicKey calculated =", publicKey, typeof (publicKey));
    // // const compiledAccount = json.parse(fs.readFileSync("./compiledContracts/Account_0_5_1.json").toString("ascii"));
    // // const contractAccount = new Contract(compiledAccount.abi, accountAddress, provider);
    // // const res2 = await contractAccount.call("getPublicKey");
    // // const accountPublicKey: string = "0x" + res2.publicKey.toString(16);
    // // console.log("pub2 from account =", accountPublicKey);

    // // reception of data
    // const pub2 = new BN(publicKey, 'hex');
    // console.log("publicKey 2 =", pub2, typeof (pub2));
    // const starkKeyPair1 = ec.getKeyPairFromPublicKey(pub2);
    // const msgHash1 = hash.computeHashOnElements(message);
    // const result = ec.verify(starkKeyPair1, msgHash1, signature);
    // console.log("Result =", result);

    const pk = '0x019800ea6a9a73f94aee6a3d2edf018fc770443e90c7ba121e8303ec6b349279';
    const account = '0x33f45f07e1bd1a51b45fc24ec8c8c9908db9e42191be9e169bfcac0c0d99745';
    const price = '1';
    const hashMsg = hash.pedersen([account, price]);
    const keyPair = ec.getKeyPair(pk);
    const signature = ec.sign(keyPair, encode.removeHexPrefix(hashMsg));
    const pubKey = keyPair.getPublic('hex');
    console.log('pubKey =', pubKey);
    const pubKey2 = ec.getStarkKey(keyPair);
    console.log('pubKey2 =', pubKey2);
    const pubKeyF = pubKey;
    //const pubKeyPair1 = ec.keyFromPublic(pubKey, 'hex');
    const pubKeyPair = ec.getKeyPairFromPublicKey("0x" + pubKeyF);
    const result = ec.verify(pubKeyPair, encode.removeHexPrefix(hashMsg), signature);
    console.log(result);


}
main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });