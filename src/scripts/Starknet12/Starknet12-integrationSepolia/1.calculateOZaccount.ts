// Create a new OpenZeppelin account in Starknet Sepolia Integration. Step 1/3
// launch with npx ts-node src/scripts/Starknet12/Starknet12-integration/1.calculateOZaccount.ts
// Coded with Starknet.js v5.24.3

import { ec, json, hash, CallData, RpcProvider, stark } from "starknet";
import fs from "fs";
import axios from "axios";
import * as dotenv from "dotenv";
dotenv.config();


async function main() {
    // const provider = new RpcProvider({ nodeUrl: "http://127.0.0.1:5050/rpc" } ); // only starknet-devnet-rs
    const provider = new RpcProvider({ nodeUrl: "http://192.168.1.44:9550/rpc/v0.5" }); // local pathfinder testnet node
    // const provider = new RpcProvider({ nodeUrl: junoNMtestnet }); // local pathfinder testnet node
    console.log("Provider connected.");

    // new Open Zeppelin account v0.8.0 :

    // Generate public and private key pair.
    //const privateKey = process.env.C20_NEW_ACCOUNT_PRIVKEY!;
    // or for random private key :
    const privateKey = stark.randomAddress();
    console.log('New account :\nprivateKey=', privateKey);
    const starkKeyPub = ec.starkCurve.getStarkKey(privateKey);
    console.log('publicKey=', starkKeyPub);

    const compiledOZAccount = json.parse(
        fs.readFileSync("./compiledContracts/cairo231/openzeppelin080Account.sierra.json").toString("ascii")
    );
    const casmOZAccount = json.parse(
        fs.readFileSync("./compiledContracts/cairo231/openzeppelin080Account.casm.json").toString("ascii")
    );

    const OZ080ClassHash = "0x5400e90f7e0ae78bd02c77cd75527280470e2fe19c54970dd79dc37a9d3645c";

    console.log('OpenZeppelin account class hash =', OZ080ClassHash);

    const OZaccountConstructorCallData = CallData.compile({ publicKey: starkKeyPub });
    const OZcontractAddress = hash.calculateContractAddressFromHash(starkKeyPub, OZ080ClassHash, OZaccountConstructorCallData, 0);
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
