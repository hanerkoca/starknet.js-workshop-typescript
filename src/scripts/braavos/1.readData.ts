// Recover Braavos compressed programs.
// use Starknet.js v5.11.1, starknet-devnet 0.5.2
// launch with npx ts-node src/scripts/braavos/1.readData.ts

import { shortString, hash, Provider, json } from "starknet";
import { accountBraavosDevnet6Address, accountBraavosDevnet6privateKey } from "../../A1priv/A1priv";
import fs from "fs";

async function main() {
    //          👇👇👇
// 🚨🚨🚨   Launch 'starknet-devnet --seed 0 --fork-network alpha-goerli' before using this script.
//          👆👆👆
    const selector = "0x2dd76e7ad84dbed81c314ffe5e7a7cacfb8f4836f01af4e913f275f89a3de1a";
    const sel2 = hash.getSelectorFromName("initializer");
    console.log("Sel2 =", sel2);
    const providerDevnet = new Provider({ sequencer: { baseUrl: "http://127.0.0.1:5050" } });
    const classHashBraavosProxy = "0x03131fa018d520a037686ce3efddeab8f28895662f019ca3ca18a626650f7d1e";
    const classHashBraavosaccount = "0x2c2b8f559e1221468140ad7b2352b1a5be32660d0bf1a3ae3a054a4ec5254e4";
    const compressedProxyContract = await providerDevnet.getClassByHash(classHashBraavosProxy);
    fs.writeFileSync('./compiledContracts/BraavosProxyCompressed.json', json.stringify(compressedProxyContract, undefined, 2));
    const compressedAccountContract = await providerDevnet.getClassByHash(classHashBraavosaccount);
    fs.writeFileSync('./compiledContracts/BraavosAccountCompressed.json', json.stringify(compressedAccountContract, undefined, 2));


}
main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });