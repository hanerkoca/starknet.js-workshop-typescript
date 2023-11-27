// Read a Cairo 0 program
// Launch with npx ts-node src/scripts/mainnet/8.getClassFromDevnet.ts
// Coded with Starknet.js v5.14.1

import { Provider, RpcProvider, Contract, Account, json, uint256, Abi, constants, shortString, CompiledContract, ContractClass, RPC, SequencerProvider, ContractClassResponse, stark, contractClassResponseToLegacyCompiledContract, LegacyCompiledContract, hash } from "starknet";
import { alchemyKey } from "../../../A-MainPriv/mainPriv";
import { resetDevnetNow } from "../../resetDevnetFunc";
import fs from "fs";
import axios from 'axios';
import * as dotenv from "dotenv";
dotenv.config();

//          👇👇👇
// 🚨🚨🚨   Launch 'starknet-devnet --seed 0' before using this script.
//          Launch also the script 7.
//          👆👆👆


async function main() {
    //initialize the Provider, with a rpc node Alchemy 
    const providerAlchemyMainnet = new RpcProvider({ nodeUrl: 'https://starknet-mainnet.g.alchemy.com/v2/' + alchemyKey });
    // with rpc in local network : 
    const providerMainnetRpcLocNetwork = new RpcProvider({ nodeUrl: 'http://192.168.1.99:9545' });
    // on the same computer : 
    //const providerMainnetRpcLocComputer = new RpcProvider({ nodeUrl: 'http://127.0.0.1:9545' });
    // mainnet sequencer :
    const providerMainnetSequencer = new SequencerProvider({ network: constants.NetworkName.SN_MAIN });
    // Testnet 1 sequencer :
    const providerTestnet = new Provider({ sequencer: { network: constants.NetworkName.SN_GOERLI } });
    // Devnet sequencer :
    const providerDevnetSequencer = new SequencerProvider({ baseUrl: "http://127.0.0.1:5050" });
    // Devnet rpc :
    const providerDevnetRpc = new RpcProvider({ nodeUrl: "http://127.0.0.1:5050/rpc" });

    // connect account 0 in devnet
    const privateKey0 = "0xe3e70682c2094cac629f6fbed82c07cd";
    const accountAddress0: string = "0x7e00d496e324876bbc8531f2d9a82bf154d1a04a50218ee74cdd372f75a551a";
    const account0 = new Account(providerDevnetSequencer, accountAddress0, privateKey0);

    // **************** Cairo 0 **************
    const classHashErc20Cairo0 = "0x01cb96b938da26c060d5fd807eef8b580c49490926393a5eeb408a89f84b9b46";

    const addrErc20Cairo0Devnet = "0x2005d66fbc0aca309c4fc0f8300e783e4ab3b76e1fe4e978f9bc1a33382c0d"; // 🚨🚨🚨 to modify in accordance with script 7 results

    const compressedContract0: ContractClassResponse = await providerDevnetSequencer.getClassAt(addrErc20Cairo0Devnet); // do not work properly with devnet rpc. Sequencer mandatory.
    const compiledContract0: LegacyCompiledContract = contractClassResponseToLegacyCompiledContract(compressedContract0);

    const classHash = hash.computeContractClassHash(compiledContract0);
    console.log("Cairo 0 classHash calculated =", classHash,"\nShould be =",classHashErc20Cairo0);

    fs.writeFileSync("./c0ContractDevnetSequencer.json", json.stringify(compiledContract0, undefined, 2));

    console.log("✅ Test completed.");
}
main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
