// Test an EIP712 message. 
// launch with npx ts-node src/scripts/Starknet12/Starknet12-sepolia/5.signEIP712Nested.ts
// coded with Starknet.js v5.24.3 + sepolia

import { Account, ec, hash, RpcProvider, json, Contract, encode, shortString, typedData, WeierstrassSignatureType, constants, Signature, stark, CallData, num } from "starknet";
import { account0OZSepoliaAddress, account0OZSepoliaPrivateKey, account7TestnetAddress, account7TestnetPrivateKey} from "../../../A1priv/A1priv";

import * as dotenv from "dotenv";
import fs from "fs";
import { SignatureType } from "@noble/curves/abstract/weierstrass";
import { sign } from "crypto";
import { ethAddress } from "../../utils/constants";
dotenv.config();

//    👇👇👇
// 🚨 launch in 'starknet-devnet-rs' the command 'cargo run --release -- --seed 0' before using this script
//    👆👆👆
async function main() {
    //initialize Provider with local Pathfinder Sepolia
    const provider = new RpcProvider({ nodeUrl: "http://192.168.1.44:9545/rpc/v0.5" });
    console.log('STARKNET provider connected.');

    // initialize existing predeployed account 0
    const privateKey0 =  account0OZSepoliaPrivateKey;
    const accountAddress0 = account0OZSepoliaAddress;
    console.log('OZ_ACCOUNT_ADDRESS=', accountAddress0);
    console.log('OZ_ACCOUNT_PRIVATE_KEY=', privateKey0);
    const account0 = new Account(provider, accountAddress0, privateKey0);
    console.log('✅deployed account 0 connected.');

    // creation of message signature
    // const privateKey = stark.randomAddress();
    const privateKey = privateKey0;
    const fullPubKey = encode.buf2hex(ec.starkCurve.getPublicKey(privateKey, false)); // complete public key
    const starknetPublicKey = ec.starkCurve.getStarkKey(privateKey);
    console.log("publicKey calculated =", starknetPublicKey, typeof (starknetPublicKey));
    console.log('fullpubKey =', fullPubKey);

    const typedMessage: typedData.TypedData = {
        domain: {
            chainId: "Starknet Mainnet",
            name: "Dappland",
            version: "1.0",
            hashing_function:"pedersen"
        },
        message: {
            MessageId: 345,
            From: {
                Name: "Edmund",
                Address: "0x7e00d496e324876bbc8531f2d9a82bf154d1a04a50218ee74cdd372f75a551a",
            },
            To: {
                Name: "Alice",
                Address: "0x69b49c2cc8b16e80e86bfc5b0614a59aa8c9b601569c7b80dde04d3f3151b79",
            },
            Nft_to_transfer: {
                Collection: "Stupid monkeys",
                Address: "0x69b49c2cc8b16e80e86bfc5b0614a59aa8c9b601569c7b80dde04d3f3151b79",
                Nft_id: 112,
                Negociated_for: {
                    Qty: "18.4569325643",
                    Unit: "ETH",
                    Token_address: "0x69b49c2cc8b16e80e86bfc5b0614a59aa8c9b601569c7b80dde04d3f3151b79",
                    Amount: 18456932564300000000n,
                }
            },
            Comment1: "Monkey with banana, sunglasses,",
            Comment2: "and red hat.",
            Comment3: "",
        },
        primaryType: "TransferERC721",
        types: {
            Account1: [
                {
                    name: "Name",
                    type: "string",
                },
                {
                    name: "Address",
                    type: "felt",
                },
            ],
            Nft: [
                {
                    name: "Collection",
                    type: "string",
                },
                {
                    name: "Address",
                    type: "felt",
                },
                {
                    name: "Nft_id",
                    type: "felt",
                },
                {
                    name: "Negociated_for",
                    type: "Transaction",
                },
            ],
            Transaction: [
                {
                    name: "Qty",
                    type: "string",
                },
                {
                    name: "Unit",
                    type: "string",
                },
                {
                    name: "Token_address",
                    type: "felt",
                },
                {
                    name: "Amount",
                    type: "felt",
                },
            ],
            TransferERC721: [
                {
                    name: "MessageId",
                    type: "felt",
                },
                {
                    name: "From",
                    type: "Account1",
                },
                {
                    name: "To",
                    type: "Account1",
                },
                {
                    name: "Nft_to_transfer",
                    type: "Nft",
                },
                {
                    name: "Comment1",
                    type: "string",
                },
                {
                    name: "Comment2",
                    type: "string",
                },
                {
                    name: "Comment3",
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
                {
                    name: "hashing_function",
                    type: "string",
                },
            ],
        },
    };
    const msgHash=typedData.getMessageHash(typedMessage,account0.address);
    const msgHashAcc=await account0.hashMessage(typedMessage);
    console.log("msgHash=",msgHash);
    console.log("msgHashAcc=",msgHashAcc);

    const signature  = await account0.signMessage(typedMessage);
    const sigArray=stark.formatSignature(signature);
    console.log("Signature =", signature,sigArray);
    const res = await account0.verifyMessage(typedMessage, sigArray);
    console.log("bool response >> ", res);
    const res2 = await account0.verifyMessageHash(msgHash, sigArray);
    console.log("bool response >> ", res2);
   const resp=await account0.callContract({
        contractAddress: account0.address,
        entrypoint: 'isValidSignature',
        calldata: CallData.compile({
          hash: num.toBigInt(msgHash).toString(),
          signature: sigArray,
        }),
      });
      console.log("resp=", shortString.decodeShortString(resp.result[0]));

    const isVerified=ec.starkCurve.verify(signature as SignatureType, msgHash, fullPubKey);
    console.log("verified by Noble (boolean) =",isVerified);

    console.log('✅ Test completed.');

}
main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });

