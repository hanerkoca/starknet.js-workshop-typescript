// Recover the compiled contracts of ArgentX 0.2.3.1 in Mainnet
// using a local pathfinder node.
// launch with npx ts-node src/scripts/mainnet/2b.recoverCompiledContract_5_5.ts
// Coded using Starknet.js v5.5.0

import { RpcProvider, Provider, Account, Contract, ec, json, constants, CallData, hash, uint256 } from "starknet";
import fs from "fs";
import * as dotenv from "dotenv";
import { error } from "console";
dotenv.config();

async function main() {
    //initialize Provider with mainnet
    const providerRpcMain = new RpcProvider({ nodeUrl: "http://192.168.1.99:9545" });
    console.log("Connected to mainnet.");

    //initialize Provider with testnet2
    const providerTestnet2 = new Provider({ sequencer: { network: constants.NetworkName.SN_GOERLI2 } });
    console.log("Connected to testnet2.");

    //initialize Provider with devnet
    const providerDevnet = new Provider({ sequencer: { baseUrl: "http://127.0.0.1:5050" } });
    console.log('Connected to devnet.');


    // initialize existing predeployed account 0 of Devnet
    console.log('OZ_ACCOUNT_ADDRESS=', process.env.OZ_ACCOUNT0_DEVNET_ADDRESS);
    console.log('OZ_ACCOUNT_PRIVATE_KEY=', process.env.OZ_ACCOUNT0_DEVNET_PRIVATE_KEY);
    const privateKey = process.env.OZ_ACCOUNT0_DEVNET_PRIVATE_KEY ?? "";
    const accountAddress: string = process.env.OZ_ACCOUNT0_DEVNET_ADDRESS ?? "";
    const account0 = new Account(providerDevnet, accountAddress, privateKey);
    console.log('✅ OZ predeployed account 0 connected in devnet.');


    // recover & save compiled contract
    const compressedContractProxy = await providerTestnet2.getClassByHash("0x025ec026985a3bf9d0cc1fe17326b245dfdc3ff89b8fde106542a3ea56c5a918");
    fs.writeFileSync('./compiledContracts/ArgentXproxy_0_2_3_1_compressed.json', JSON.stringify(compressedContractProxy));
    console.log("abiproxy =", compressedContractProxy.abi);

    //     const compiledContractImplementation=await providerMain.getClass("0x33434ad846cdd5f23eb73ff09fe6fddd568284a0fb7d1be20ee482f044dabe2");
    //    fs.writeFileSync('./compiledContracts/ArgentXimplementation_0_2_3_1.json', JSON.stringify(compiledContractImplementation));
    //     console.log("\nabiImplementation =",compiledContractImplementation.abi);

    // declare in devnet
    if ('sierra_program' in compressedContractProxy) { throw new Error("Cairo 1 compressed not authorized in Starknet.js v5.5.0") }
    const progCompressed = compressedContractProxy.program;

    // 🚨🚨🚨 Fail in v5.5.0 ; crash in lossless-json library
    const declareResponse = await account0.declare({ contract: progCompressed });
    console.log("clashHash =", declareResponse.class_hash);

}
main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
