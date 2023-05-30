// Recover Braavos compressed programs.
// use Starknet.js v4.22.0
// launch with npx ts-node src/scripts/shortstring/testStarkCompileV4.ts

import { shortString, hash, Provider, json, stark } from "starknet";
import { accountBraavosDevnet6Address, accountBraavosDevnet6privateKey } from "../../A1priv/A1priv";
import fs from "fs";

async function main() {
    const res = stark.compileCalldata({
        val1: "123",
        tab: ["34", "35"],
        amount: { type: "struct", low: 200, high: 12 },
    });
    console.log("res =", res);
}
main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });