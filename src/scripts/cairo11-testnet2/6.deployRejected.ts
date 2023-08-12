// deploy in testnet2 a contract that can be rejected.
// launch with npx ts-node src/scripts/cairo11-testnet2/6.deployRejected.ts
// Coded with Starknet.js v5.19.0

import { constants, Provider, Contract, Account, json, shortString, RpcProvider } from "starknet";
import fs from "fs";
import { accountTestnet2ArgentX1Address, accountTestnet2ArgentX1privateKey, TonyNode } from "../../A2priv/A2priv";
import { infuraKey } from "../../A-MainPriv/mainPriv";



async function main() {
    //initialize Provider 
    const provider = new Provider({ sequencer: { network: constants.NetworkName.SN_GOERLI2 } });

    // initialize existing Argent X account
    const account0Address = accountTestnet2ArgentX1Address;
    console.log('existing_ACCOUNT_ADDRESS=', account0Address);
    const account0 = new Account(provider, account0Address, accountTestnet2ArgentX1privateKey);
    console.log('existing account connected.\n');

    const compiledSierra = json.parse(fs.readFileSync("./compiledContracts/cairo210/reject.sierra.json").toString("ascii"));
    const compiledCasm = json.parse(fs.readFileSync("./compiledContracts/cairo210/reject.casm.json").toString("ascii"));

     const declareResponse = await account0.declare({ contract: compiledSierra, casm: compiledCasm });
    const contractClassHash = declareResponse.class_hash;
     //const contractClassHash = "0x70e819c9d5fc017e5cee4779dac602b82699e8ddd82a3778923485757540596";
    console.log('✅ Test Contract declared with classHash =', contractClassHash);

    await provider.waitForTransaction(declareResponse.transaction_hash);
    console.log("transaction ended")
    const { transaction_hash: th2, address } = await account0.deployContract({ classHash: contractClassHash});
    console.log("contract_address =", address);
    await provider.waitForTransaction(th2);

    // address = "0x2b8a9002121875e6ce75f3ea30b8df471c93e8466983226473b3b63a355628a"

    console.log("✅ Test completed.");

}
main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });