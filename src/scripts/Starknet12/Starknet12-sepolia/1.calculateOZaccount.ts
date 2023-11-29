// Create a new OpenZeppelin account in Starknet Sepolia testnet. Step 1/3
// launch with npx ts-node src/scripts/Starknet12/Starknet12-sepolia/1.calculateOZaccount.ts
// Coded with Starknet.js v5.24.3

import { ec, json, hash, CallData, RpcProvider, stark } from "starknet";
import fs from "fs";
import axios from "axios";
import * as dotenv from "dotenv";
dotenv.config();


async function main() {
    // const provider = new RpcProvider({ nodeUrl: "http://127.0.0.1:5050/rpc" } ); // only starknet-devnet-rs
    const provider = new RpcProvider({ nodeUrl: "http://192.168.1.44:9545/rpc/v0.5" }); // local pathfinder testnet node
    // const provider = new RpcProvider({ nodeUrl: junoNMtestnet }); // local pathfinder testnet node
    console.log("Provider connected.");

    // new Open Zeppelin account v0.8.0b1 :

    // Generate public and private key pair.
    //const privateKey = process.env.C20_NEW_ACCOUNT_PRIVKEY!;
    // or for random private key :
    const privateKey = stark.randomAddress();
    console.log('New account :\nprivateKey=', privateKey);
    const starkKeyPub = ec.starkCurve.getStarkKey(privateKey);
    console.log('publicKey=', starkKeyPub);
    //declare OZ wallet contract
    const compiledOZAccount = json.parse(
        fs.readFileSync("./compiledContracts/cairo210/openzeppelin070Account.sierra.json").toString("ascii")
    );
    const casmOZAccount = json.parse(
        fs.readFileSync("./compiledContracts/cairo210/openzeppelin070Account.casm.json").toString("ascii")
    );

    const OZ080b1ClassHash = "0x00903752516de5c04fe91600ca6891e325278b2dfc54880ae11a809abb364844";

    console.log('OpenZeppelin account class hash =', OZ080b1ClassHash);

    const OZaccountConstructorCallData = CallData.compile({ publicKey: starkKeyPub });
    const OZcontractAddress = hash.calculateContractAddressFromHash(starkKeyPub, OZ080b1ClassHash, OZaccountConstructorCallData, 0);
    console.log('Precalculated account address=', OZcontractAddress);

    // fund account address before account creation


    console.log("✅ end of script.");

}
main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
