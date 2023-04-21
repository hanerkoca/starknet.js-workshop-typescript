// Recover the compiled contracts of ArgentX 0.2.3.1 in Mainnet
// using a local pathfinder node.
// launch with npx ts-node src/scripts/mainnet/2b.recoverCompiledContract_5_5.ts
// Coded using Starknet.js v5.5.0

import { RpcProvider, Provider, Account, Contract, ec, json, constants, hash, uint256 } from "starknet";
import { accountTestnet2ArgentX1Address, accountTestnet2ArgentX1privateKey } from "../../A2priv/A2priv"
import fs from "fs";
import * as dotenv from "dotenv";
import { error } from "console";
dotenv.config();

async function main() {
    //initialize Provider with mainnet
    const providerRpcMain = new RpcProvider({ nodeUrl: "http://192.168.1.99:9545" });
    console.log("Connected to mainnet.");

    //initialize Provider with testnet2
    const providerTestnet2 = new Provider({ sequencer: { network: "goerli-alpha-2" } });
    console.log("Connected to testnet2.");

    //initialize Provider with devnet
    const providerDevnet = new Provider({ sequencer: { baseUrl: "http://127.0.0.1:5050" } });
    console.log('Connected to devnet.');


    // initialize existing predeployed account 0 of Devnet
    console.log('OZ_ACCOUNT_ADDRESS=', process.env.OZ_ACCOUNT0_DEVNET_ADDRESS);
    console.log('OZ_ACCOUNT_PRIVATE_KEY=', process.env.OZ_ACCOUNT0_DEVNET_PRIVATE_KEY);
    const privateKey0 = process.env.OZ_ACCOUNT0_DEVNET_PRIVATE_KEY ?? "";
    const starkKeyPair0 = ec.getKeyPair(privateKey0);
    const accountAddress: string = process.env.OZ_ACCOUNT0_DEVNET_ADDRESS ?? "";
    const account0 = new Account(providerDevnet, accountAddress, starkKeyPair0);
    console.log('✅ OZ predeployed account 0 connected in devnet.');


    // recover & save compiled contract
    const proxyClassHash = "0x025ec026985a3bf9d0cc1fe17326b245dfdc3ff89b8fde106542a3ea56c5a918";
    const compressedContractProxy = await providerTestnet2.getClassByHash(proxyClassHash);
    // declare in devnet
    const progCompressed = compressedContractProxy.program;
    // fail in 4.22.0 :
    const declareResponse = await account0.declare({ classHash: proxyClassHash, contract: progCompressed });
    console.log("clashHash =", declareResponse.class_hash);

}
main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });

