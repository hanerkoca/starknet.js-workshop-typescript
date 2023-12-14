// declare in Starknet Sepolia Integration. Step 1/3
// launch with npx ts-node src/scripts/Starknet12/Starknet12-integration/4a.declareOZaccount.ts
// Coded with Starknet.js v5.24.3

import { ec, json, hash, CallData, RpcProvider, stark, Account } from "starknet";
import { account2IntegrationAXaddress, account2IntegrationAXprivateKey } from "../../../A2priv/A2priv";

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

    const privateKey0 = account2IntegrationAXprivateKey;
    const address0 = account2IntegrationAXaddress;
    const account0 = new Account(provider, address0, privateKey0);
    //declare OZ wallet contract
    const compiledOZAccount = json.parse(
        fs.readFileSync("./compiledContracts/cairo231/openzeppelin080Account.sierra.json").toString("ascii")
    );
    const casmOZAccount = json.parse(
        fs.readFileSync("./compiledContracts/cairo231/openzeppelin080Account.casm.json").toString("ascii")
    );

    const resp = await account0.declareIfNot({ contract: compiledOZAccount, casm: casmOZAccount });
    console.log(resp);
    const OZ080ClassHash = "0x5400e90f7e0ae78bd02c77cd75527280470e2fe19c54970dd79dc37a9d3645c";

    console.log('OpenZeppelin account class hash =', OZ080ClassHash);
    await provider.waitForTransaction(resp.transaction_hash);

    console.log("✅ end of script.");

}
main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
