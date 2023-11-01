// test casm format
// launch with : npx ts-node .ts
// Coded with Starknet.js v5.21.1

import { Provider, RpcProvider, Account, ec, json, stark, hash, CallData, Contract, CompiledSierraCasm } from "starknet";
import { infuraKey } from "../../A-MainPriv/mainPriv";
import { account7TestnetPrivateKey } from "../../A1priv/A1priv";
import { importedContractCasm } from "./hello.casm.json";
import { importedContractCasmString } from "./hello.casm.string.json";

import fs from "fs";
import axios from "axios";
import * as dotenv from "dotenv";
dotenv.config();


async function main() {

    const contractCasm: CompiledSierraCasm = json.parse(fs.readFileSync("./compiledContracts/cairo210/hello.casm.json").toString("ascii"));
    // fs.writeFileSync("./test.json", json.stringify(contractCasm));
    const chCasm = hash.computeCompiledClassHash(contractCasm);
    // const ch=hash.computeContractClassHash(contractSierra);
    console.log("Class Hash of contract =", chCasm);


    const afterImport:CompiledSierraCasm=json.parse(importedContractCasmString);
    const importedCasmStringCH = hash.computeCompiledClassHash(afterImport);
    console.log("Class Hash of contract =", importedCasmStringCH);

    

    console.log('✅ Script ended.');

}
main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });