// Recover the compiled contracts of ArgentX 0.2.3.1 in Mainnet
// using a local pathfinder node.
// launch with npx ts-node src/scripts/mainnet/2.recoverCompiledContract_5_5.ts
// Coded using Starknet.js v5.5.0

import { RpcProvider,Provider, Account, Contract, ec, json, constants, CallData, hash, uint256 } from "starknet";
import { accountTestnet2ArgentX1Address, accountTestnet2ArgentX1privateKey } from "../../A2priv/Testnet2Priv"
import fs from "fs";
async function main() {
    //initialize Provider with mainnet
    const provider = new RpcProvider({ nodeUrl:"http://192.168.1.99:9545" } );
    console.log("Connected to mainnet.");

    // recover & save compiled contract
    const compiledContractProxy=await provider.getClass("0x025ec026985a3bf9d0cc1fe17326b245dfdc3ff89b8fde106542a3ea56c5a918");
    fs.writeFileSync('./compiledContracts/ArgentXproxy_0_2_3_1.json', JSON.stringify(compiledContractProxy));
    console.log("abiproxy =",compiledContractProxy.abi);

    const compiledContractImplementation=await provider.getClass("0x33434ad846cdd5f23eb73ff09fe6fddd568284a0fb7d1be20ee482f044dabe2");
   fs.writeFileSync('./compiledContracts/ArgentXimplementation_0_2_3_1.json', JSON.stringify(compiledContractImplementation));
    console.log("\nabiproxy =",compiledContractImplementation.abi);

}
main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
    