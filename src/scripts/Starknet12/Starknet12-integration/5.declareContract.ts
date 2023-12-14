// declare in Starknet Sepolia Integration. 
// src/scripts/Starknet12/Starknet12-integration/5.declareContract.ts
// Coded with Starknet.js v5.24.3

import { ec, json, hash, CallData, RpcProvider, stark, Account, shortString } from "starknet";
import { account2IntegrationAXaddress, account2IntegrationAXprivateKey } from "../../../A2priv/A2priv";

import fs from "fs";
import axios from "axios";
import * as dotenv from "dotenv";
dotenv.config();


async function main() {
    // const provider = new RpcProvider({ nodeUrl: "http://127.0.0.1:5050/rpc" } ); // only starknet-devnet-rs
    const provider = new RpcProvider({ nodeUrl: "http://192.168.1.44:9550/rpc/v0.5" }); // local pathfinder testnet node
    // const provider = new RpcProvider({ nodeUrl: junoNMtestnet }); // local pathfinder testnet node
    const chId=await provider.getChainId();

    console.log("Provider connected at",shortString.decodeShortString(chId));

    // new Open Zeppelin account v0.8.0 :

    const privateKey0 = account2IntegrationAXprivateKey;
    const address0 = account2IntegrationAXaddress;
    const account0 = new Account(provider, address0, privateKey0);
    //declare OZ wallet contract
    const compiledContract = json.parse(
        fs.readFileSync("./compiledContracts/cairo240/string.sierra.json").toString("ascii")
    );
    const casmContract = json.parse(
        fs.readFileSync("./compiledContracts/cairo240/string.casm.json").toString("ascii")
    );

    const resp = await account0.declareIfNot({ contract: compiledContract, casm: casmContract });

    console.log('OpenZeppelin account class hash =', resp.class_hash);
    await provider.waitForTransaction(resp.transaction_hash);

    console.log("✅ end of script.");

}
main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
