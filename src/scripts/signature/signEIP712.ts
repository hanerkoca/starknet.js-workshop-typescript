// Connect a predeployed OZ account in devnet. 
// address and PrivKey are displayed when lanching starknet-devnet, and have been  stored in .env file.
// launch with npx ts-node src/scripts/13.signer.ts

import { Account, ec, hash, Provider, number, json, Contract, encode, Signature, shortString, } from "starknet";
import * as typedData from "./typedData";
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

    // EIP712
    const typedDataValidate: typedData.TypedData = {
        types: {
            StarkNetDomain: [
                { name: "name", type: "string" },
                { name: "version", type: "felt" },
                { name: "chainId", type: "felt" },
            ],
            Airdrop: [
                { name: "address", type: "felt" },
                { name: "amount", type: "felt" }
            ],
            Validate: [
                { name: "id", type: "felt" },
                { name: "from", type: "felt" },
                { name: "amount", type: "felt" },
                { name: "nameGamer", type: "string" },
                { name: "endDate", type: "felt" },
                { name: "itemsAuthorized", type: "felt*" }, // array of felt
                { name: "chkFunction", type: "selector" }, // name of function
                { name: "rootList", type: "merkletree", contains: "Airdrop" } // root of a merkle tree
            ]
        },
        primaryType: "Validate",
        domain: {
            name: "myDapp", // put the name of your dapp to ensure that the signatures will not be used by other DAPP
            version: "1",
            chainId: shortString.encodeShortString("SN_GOERLI"), // shortString of 'SN_GOERLI' (or 'SN_MAIN' or 'SN_GOERLI2'), to be sure that signature can't be used by other network.
        },
        message: {
            id: "0x0000004f000f",
            from: "0x2c94f628d125cd0e86eaefea735ba24c262b9a441728f63e5776661829a4066",
            amount: "400",
            nameGamer: "Hector26",
            endDate: "0x27d32a3033df4277caa9e9396100b7ca8c66a4ef8ea5f6765b91a7c17f0109c",
            itemsAuthorized: ["0x01", "0x03", "0x0a", "0x0e"],
            chkFunction: "check_authorization",
            rootList: [
                {
                    address: "0x69b49c2cc8b16e80e86bfc5b0614a59aa8c9b601569c7b80dde04d3f3151b79",
                    amount: "1554785",
                }, {
                    address: "0x7447084f620ba316a42c72ca5b8eefb3fe9a05ca5fe6430c65a69ecc4349b3b",
                    amount: "2578248",
                }, {
                    address: "0x3cad9a072d3cf29729ab2fad2e08972b8cfde01d4979083fb6d15e8e66f8ab1",
                    amount: "4732581",
                }, {
                    address: "0x7f14339f5d364946ae5e27eccbf60757a5c496bf45baf35ddf2ad30b583541a",
                    amount: "913548",
                },
            ]
        },
    };
    const signature4 = await account.signMessage(typedDataValidate);

    // on receiver side, with account (that needs privKey)
    const result4 = await account.verifyMessage(typedDataValidate, signature4);
    console.log("Result4 off-chain (boolean)=", result4);

    // on receiver side, without account  (so, without privKey)
    const compiledAccount = json.parse(fs.readFileSync("./compiledContracts/Account_0_5_1.json").toString("ascii"));
    const contractAccount = new Contract(compiledAccount.abi, accountAddress, provider);

    const msgHash5 = typedData.getMessageHash(typedDataValidate, account.address);
    // The call of isValidSignature will generate an error if not valid
    let result5: boolean;
    try {
        await contractAccount.call("isValidSignature", [msgHash5, signature4]);
        result5 = true;
    } catch {
        result5 = false;
    }
    console.log("Result5 in-chain (boolean) =", result5);


    // // verify message outside of StarkNet
    // console.log("Outside Starknet =");
    // const starkKeyPair1 = ec.getKeyPairFromPublicKey(fullPublicKey);
    // const msgHash1 = hash.computeHashOnElements(message);
    // const result1 = ec.verify(starkKeyPair1, msgHash1, signature);
    // console.log("Result (boolean) =", result1);

    // // verify message in the network, using the account linked to the privatekey
    // console.log("With Starknet =");
    // const compiledAccount = json.parse(fs.readFileSync("./compiledContracts/Account_0_5_1.json").toString("ascii"));
    // const contractAccount = new Contract(compiledAccount.abi, accountAddress, provider);
    // const msgHash2 = hash.computeHashOnElements(message);
    // // The call of isValidSignature will generate an error if not valid
    // let result2: boolean;
    // try {
    //     await contractAccount.call("isValidSignature", [msgHash2, signature]);
    //     result2 = true;
    // } catch {
    //     result2 = false;
    // }
    // console.log("Result (boolean) =", result2);

    // check fullPubKey
    // console.log("full pub key check with account =");
    // const pubKey3 = await contractAccount.call("getPublicKey");
    // const isFullPubKeyRelatedToAccount: boolean =
    //     BigInt(pubKey3.publicKey.toString()) ==
    //     BigInt(encode.addHexPrefix(fullPublicKey.slice(4, 68)));
    // console.log("Result (boolean)=", isFullPubKeyRelatedToAccount);

}
main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });