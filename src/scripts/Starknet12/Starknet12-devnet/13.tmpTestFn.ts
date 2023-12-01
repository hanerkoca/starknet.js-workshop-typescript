// Test a contract 
// Launch with npx ts-node src/scripts/cairo12-devnet/10.testContract.ts
// Coded with Starknet.js v5.19.5

import { Provider, RpcProvider, Contract, Account, json, uint256, Abi, constants, shortString, CompiledContract, ContractClass, RPC, SequencerProvider, ContractClassResponse, stark, contractClassResponseToLegacyCompiledContract, LegacyCompiledContract, hash, num, CallData, cairo } from "starknet";
import { alchemyKey, infuraKey } from "../../../A-MainPriv/mainPriv";
//import { accountTestnet3Address, accountTestnet3privateKey } from "../../A1priv/A1priv";
import { account4MainnetAddress, account4MainnetPrivateKey } from "../../../A-MainPriv/mainPriv";

import { resetDevnetNow } from "../../utils/resetDevnetFunc";
import fs from "fs";
import axios from 'axios';
import * as dotenv from "dotenv";
dotenv.config();

type MyFunction = (a: number) => string;

async function main() {

    function test1(a1: number): string { return "Perfect!"; }

    function go(a1: string, myF: MyFunction): string {
        return a1 + myF(200);
    }

    const res = go("Ah. ", test1);
    console.log(res);




    console.log("✅ Test completed.");

}
main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
