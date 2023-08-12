// connect a contract that is already deployed on devnet.
// launch with npx ts-node src/scripts/cairo11-testnet/5.CallERC20.ts
// Coded with Starknet.js v5.17.0

import { constants, Provider, Contract, Account, json, shortString, RpcProvider } from "starknet";
import fs from "fs";
import { accountTestnet4Address, accountTestnet4privateKey } from "../../A1priv/A1priv";
import { infuraKey } from "../../A-MainPriv/mainPriv";


async function main() {
    //initialize Provider 
    const provider = new RpcProvider({ nodeUrl: 'https://starknet-goerli.infura.io/v3/' + infuraKey });

    // initialize existing Argent X account
    const account0Address = accountTestnet4Address;
    console.log('Braavos1_ACCOUNT_ADDRESS=', account0Address);
    const account0 = new Account(provider, account0Address, accountTestnet4privateKey);
    console.log('existing account connected.\n');

    const compiledSierra = json.parse(fs.readFileSync("./compiledContracts/cairo210/hello_events.sierra.json").toString("ascii"));
    const compiledCasm = json.parse(fs.readFileSync("./compiledContracts/cairo210/hello_events.casm.json").toString("ascii"));

    const declareResponse = await account0.declare({ contract: compiledSierra, casm: compiledCasm });
    const contractClassHash = declareResponse.class_hash;
    console.log('✅ Test Contract declared with classHash =', contractClassHash);

    await provider.waitForTransaction(declareResponse.transaction_hash);
    
    const { transaction_hash: th2, address } = await account0.deployContract({ classHash: contractClassHash});
    console.log("contract_address =", address);
    await provider.waitForTransaction(th2);

    console.log("✅ Test completed.");

    console.log('✅ Test completed.');

}
main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });