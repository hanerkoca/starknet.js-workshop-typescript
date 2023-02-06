// recover a long string.
// launch with npx ts-node src/scripts/recoverString.ts

import { Provider, Contract, json, uint256, shortString, number } from "starknet";
import BN from "bn.js";

async function main() {
    const myText = "hello";
    console.log("myText =", myText);
    const encodedText: string = shortString.encodeShortString(myText);
    console.log("encodedText =", encodedText);
    const myTextDecoded = shortString.decodeShortString(encodedText);
    console.log("finalString =", myTextDecoded);
    const decimalEncoded: string = BigInt(encodedText).toString(10);
    console.log("decimalEncoded =", decimalEncoded);
    const wrongTextDecoded: string = shortString.decodeShortString(decimalEncoded);
    console.log("wrongTextDecoded =", wrongTextDecoded);
}
main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });