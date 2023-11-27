// deploy in testnet2 a contract for events.
// launch with npx ts-node src/scripts/cairo11-testnet2/5.deployEvents.ts
// Coded with Starknet.js v5.19.0

import { constants, Provider, Contract, Account, json, shortString, RpcProvider } from "starknet";
import fs from "fs";
import { accountTestnet2ArgentX1Address, accountTestnet2ArgentX1privateKey, TonyNode } from "../../A2priv/A2priv";
import { accountTestnet4privateKey, accountTestnet4Address } from "../../A1priv/A1priv";
import { infuraKey } from "../../A-MainPriv/mainPriv";
import { alchemyTestnetKey } from "../../A1priv/A1priv";



async function main() {
    //initialize Provider 
    const provider = new RpcProvider({ nodeUrl: TonyNode });

    // initialize existing Argent X account
    const account0Address = accountTestnet2ArgentX1Address;
    console.log('existing_ACCOUNT_ADDRESS=', account0Address);
    const account0 = new Account(provider, account0Address, accountTestnet2ArgentX1privateKey);
    console.log('existing account connected.\n');

    const compiledSierra = json.parse(fs.readFileSync("./compiledContracts/cairo210/hello_events.sierra.json").toString("ascii"));
    const compiledCasm = json.parse(fs.readFileSync("./compiledContracts/cairo210/hello_events.casm.json").toString("ascii"));

    const bl = provider.getBlock("latest");
    console.log("Bloc =", (await bl).block_number);
    // const declareResponse = await account0.declare({ contract: compiledSierra, casm: compiledCasm });
    // const contractClassHash = declareResponse.class_hash;
    const contractClassHash = "0x493436d1242637e694edd5d1e3c0f56d43e7213d3a1369087d02f2aca6858ee";
    console.log('✅ Test Contract declared with classHash =', contractClassHash);

    //await provider.waitForTransaction(declareResponse.transaction_hash);
    console.log("transaction ended")
    const { transaction_hash: th2, address } = await account0.deployContract({ classHash: contractClassHash });
    console.log("contract_address =", address);
    await provider.waitForTransaction(th2);

    // address = 0x0047cb13bf174043adde61f7bea49ab2d9ebc575b0431f85bcbfa113a6f93fc4

    console.log("✅ Test completed.");

}
main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });