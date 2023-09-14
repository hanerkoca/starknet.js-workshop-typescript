// recover ABIs of ArgentX account.
// use Starknet.js v5.19.5, starknet-devnet 0.6.2
// launch with npx ts-node src/scripts/devnet-forked/1.interact-forked.ts

import { Provider, Contract, Account, json,  num,  SequencerProvider, constants } from "starknet";
// import { account2DevnetArgentXAddress, account2DevnetArgentXPrivateKey } from "../../A2priv/A2priv";
import {account2MainnetAddress , account2MainnetPrivateKey } from "../../A-MainPriv/mainPriv";

import fs from "fs";
import * as dotenv from "dotenv";
dotenv.config();


async function main() {
    //initialize Provider 
    
    const provider = new SequencerProvider({ network: constants.NetworkName.SN_MAIN });
    console.log('✅ Connected to Mainnet.');

    const accountAddress=account2MainnetAddress;
    const accountClassHash = await provider.getClassHashAt(accountAddress);
    console.log("Account class hash =",accountClassHash);
    const proxyClass = await provider.getClassAt(accountAddress);
    fs.writeFileSync('./compiledContracts/cairo210/argentXaccount.sierra.json', json.stringify(proxyClass, undefined, 2));
    const proxyArgentX = new Contract(proxyClass.abi, accountAddress, provider);
    console.log(proxyArgentX.functions);
    
    console.log('✅ Test completed.');
}
main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });