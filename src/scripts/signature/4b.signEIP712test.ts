// Test an EIP712 message. 
// coded with Starknet.js v5.19.2
// launch with npx ts-node src/scripts/signature/4b.signEIP712test.ts

import { Account, ec, hash, Provider, json, Contract, encode, shortString, typedData, WeierstrassSignatureType, constants } from "starknet";

import * as dotenv from "dotenv";
import fs from "fs";
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
    // const starkKeyPair0 = ec.getKeyPair(privateKey0);
    const accountAddress: string = process.env.OZ_ACCOUNT0_DEVNET_ADDRESS ?? "";
    const account0 = new Account(provider, accountAddress, privateKey0);
    console.log('✅ OZ predeployed account 0 connected.');

    // creation of message signature
    // const privateKey = stark.randomAddress();
    const privateKey = privateKey0;
    const starknetPublicKey = ec.starkCurve.getStarkKey(privateKey);
    const fullPubKey = encode.buf2hex(ec.starkCurve.getPublicKey(privateKey, false)); // complete public key
    console.log("publicKey calculated =", starknetPublicKey, typeof (starknetPublicKey));
    console.log('fullpubKey =', fullPubKey);

    // const message = [1, 128, 18, 14];
    // const msgHash = hash.computeHashOnElements(message);
    // const signature1: WeierstrassSignatureType = ec.starkCurve.sign(msgHash, privateKey);


    // EIP712
    // const typedDataValidate: typedData.TypedData = {
    //     types: {
    //         StarkNetDomain: [
    //             { name: "name", type: "string" },
    //             { name: "version", type: "felt" },
    //             { name: "chainId", type: "felt" },
    //         ],
    //         Airdrop: [
    //             { name: "address", type: "felt" },
    //             { name: "amount", type: "felt" }
    //         ],
    //         Validate: [
    //             { name: "id", type: "felt" },
    //             { name: "from", type: "felt" },
    //             { name: "amount", type: "felt" },
    //             { name: "nameGamer", type: "string" },
    //             { name: "endDate", type: "felt" },
    //             { name: "itemsAuthorized", type: "felt*" }, // array of felt
    //             { name: "chkFunction", type: "selector" }, // name of function
    //             { name: "rootList", type: "merkletree", contains: "Airdrop" } // root of a merkle tree
    //         ]
    //     },
    //     primaryType: "Validate",
    //     domain: {
    //         name: "myDapp", // put the name of your dapp to ensure that the signatures will not be used by other DAPP
    //         version: "1",
    //         chainId: shortString.encodeShortString("SN_GOERLI"), // shortString of 'SN_GOERLI' (or 'SN_MAIN' or 'SN_GOERLI2'), to be sure that signature can't be used by other network.
    //     },
    //     message: {
    //         id: "0x0000004f000f",
    //         from: "0x2c94f628d125cd0e86eaefea735ba24c262b9a441728f63e5776661829a4066",
    //         amount: "400",
    //         nameGamer: "Hector26",
    //         endDate: "0x27d32a3033df4277caa9e9396100b7ca8c66a4ef8ea5f6765b91a7c17f0109c",
    //         itemsAuthorized: ["0x01", "0x03", "0x0a", "0x0e"],
    //         chkFunction: "check_authorization",
    //         rootList: [
    //             {
    //                 address: "0x69b49c2cc8b16e80e86bfc5b0614a59aa8c9b601569c7b80dde04d3f3151b79",
    //                 amount: "1554785",
    //             }, {
    //                 address: "0x7447084f620ba316a42c72ca5b8eefb3fe9a05ca5fe6430c65a69ecc4349b3b",
    //                 amount: "2578248",
    //             }, {
    //                 address: "0x3cad9a072d3cf29729ab2fad2e08972b8cfde01d4979083fb6d15e8e66f8ab1",
    //                 amount: "4732581",
    //             }, {
    //                 address: "0x7f14339f5d364946ae5e27eccbf60757a5c496bf45baf35ddf2ad30b583541a",
    //                 amount: "913548",
    //             },
    //         ]
    //     },
    // };

    const typedDataValidate: typedData.TypedData = {
        domain: {
            chainId: "Starknet Mainnet",
            name: "Dappland",
            version: "1.0",
        },
        message: {
            MessageId: 345,
            From_Name: "Edmund",
            From_address: "0x7e00d496e324876bbc8531f2d9a82bf154d1a04a50218ee74cdd372f75a551a",
            To_Name: "Alice",
            To_address: "0x69b49c2cc8b16e80e86bfc5b0614a59aa8c9b601569c7b80dde04d3f3151b79",
            Message_content1: "Hello beautiful Alice,",
            Message_content2: "Could you please verify the",
            Message_content3: "validity of this message?",
            Message_content4: "",

        },
        primaryType: "Message1",
        types: {
            Message1: [
                {
                    name: "MessageId",
                    type: "felt",
                },
                {
                    name: "From_Name",
                    type: "string",
                },
                {
                    name: "From_address",
                    type: "felt",
                },
                {
                    name: "To_Name",
                    type: "string",
                },
                {
                    name: "To_address",
                    type: "felt",
                },
                {
                    name: "Message_content1",
                    type: "string",
                },
                {
                    name: "Message_content2",
                    type: "string",
                },
                {
                    name: "Message_content3",
                    type: "string",
                },
                {
                    name: "Message_content4",
                    type: "string",
                },
            ],
            StarkNetDomain: [
                {
                    name: "name",
                    type: "string",
                },
                {
                    name: "chainId",
                    type: "felt",
                },
                {
                    name: "version",
                    type: "string",
                },
            ],
        },
    };
    const signature = await account0.signMessage(typedDataValidate) as WeierstrassSignatureType;
    const res = await account0.verifyMessage(typedDataValidate, signature);
    console.log(" :>> ", res);
    console.log("Signature:", signature);

    console.log('✅ Test completed.');

}
main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });

