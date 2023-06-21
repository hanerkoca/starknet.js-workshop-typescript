// decode a string from Starknet
// use Starknet.js v5.13.1, starknet-devnet 0.5.3
// launch with npx ts-node src/scripts/decodeError.tsdeclareAndDeployConstructor2.ts

import { shortString } from "starknet";


function main() {
    console.log("Decoded message =", shortString.decodeShortString("96231036770510887785732922765483205921"));
}
main();
