// decode a string from Starknet
// use Starknet.js v5.13.1, starknet-devnet 0.5.3
// launch with npx ts-node src/scripts/decodeError.tsdeclareAndDeployConstructor2.ts

import { shortString } from "starknet";


function main() {
    console.log("Decoded message =", shortString.decodeShortString("0x496e70757420746f6f206c6f6e6720666f7220617267756d656e7473"));
}
main();
