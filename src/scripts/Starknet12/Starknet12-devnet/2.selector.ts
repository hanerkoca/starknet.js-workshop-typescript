// Calculate selector from function name.
// use Starknet.js v5.14.1, starknet-devnet 0.5.3
// launch with npx ts-node x

import { selector } from "starknet";
import fs from "fs";
import * as dotenv from "dotenv";
dotenv.config();

//          👇👇👇
// 🚨🚨🚨   Launch 'starknet-devnet --seed 0 --cairo-compiler-manifest /D/Cairo1-dev/cairo/Cargo.toml --compiler-args "--add-pythonic-hints " ' before using this script.
//          👆👆👆


async function main() {
 const res1=selector.getSelectorFromName("constructor");
 console.log("res1 =",res1);
 const res2=selector.getSelectorFromName("init");
 console.log("res2 =",res2);
}
main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });