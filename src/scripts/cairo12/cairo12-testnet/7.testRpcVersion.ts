// test in testnet/rpc0.5.0 a contract that can be rejected.
// launch with npx ts-node src/scripts/cairo12/cairo12-testnet/6.testTxResponse.ts
// Coded with Starknet.js v5.24.3+modif

import { constants, Contract, Account, json, shortString, RpcProvider, transactionResponse } from "starknet";
import { account2TestnetAddress, account2TestnetPrivateKey } from "../../../A1priv/A1priv";

import fs from "fs";
import * as dotenv from "dotenv";
import { alchemyKey } from "../../../A-MainPriv/mainPriv";
import { StarknetChainId } from "starknet/src/constants";
dotenv.config();

async function testProvider(providerUrl: string): Promise<string> {
    const provider = new RpcProvider({ nodeUrl: providerUrl });
    let chId: StarknetChainId;
    // console.log("***", providerUrl);
    let result: string = "*** " + providerUrl;
    try {
        chId = await provider.getChainId();
        if (chId) {
            result=result+"\nProvider is working fine.";
            // console.log("provider is working fine.");
            try {
                const resp = await provider.getSpecVersion();
                result=result+"\nThis provider use a rpc version" + resp;
                // console.log("This provider use a rpc version", resp);
            } catch {
                result=result+"\nThis provider use a rpc version 0.4.0 or older.";
                //console.log("This provider use a rpc version 0.4.0 or older.")
            }
        }
    } catch {
        result=result+"\nThis provider is not working properly.";
        //console.log("Provider is not working properly.")
    }
    return result;
}

async function main() {
    // const provider = new RpcProvider({ nodeUrl: 'https://starknet-goerli.g.alchemy.com/v2/' + alchemyKey });
    //const provider = new RpcProvider({ nodeUrl: "https://starknet-testnet.public.blastapi.io/rpc/v0.5" });
    // const provider = new RpcProvider({ nodeUrl: "http://127.0.0.1:5050/rpc" } ); // only starknet-devnet-rs

    const listProvider = [
        "https://starknet-goerli.g.alchemy.com/v2/" + alchemyKey,
        "https://starknet-goerli.g.alchemy.com/v3/" + alchemyKey,
        "https://starknet-goerli.g.alchemy.com/v2/" + alchemyKey+"/rpc/v0.5",
    ]
    // console.log(await testProvider(listProvider[0]));
    // listProvider.forEach(async function (url: string)  {
    //     console.log(await testProvider(url));
    // });
    for (const url of listProvider){
        
                console.log(await testProvider(url));
    }

    console.log("✅ Test completed.");

}
main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });