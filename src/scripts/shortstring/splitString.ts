
// split a string in shortstring (32 characters)

import { shortString } from "starknet";

// launch with ts-node src/scripts/splitString.ts
async function main() {
    function splitString(myString: string): string[] {
        const myShortStrings: string[] = [];
        while (myString.length > 0) {
            myShortStrings.push(myString.slice(0, 31));
            myString = myString.slice(31);
        }
        return (myShortStrings);
    }
    let myString = "sdfgER64 56FGHDFGNB dfgdsggfdsd45 65645fhDGHDFGHSS SFDSDFdfg fdghdfgh dfghdfher ert4";
    const myShortStrings = splitString(myString);
    console.log("myString =", myString);
    console.log("result =", myShortStrings);
    const myShortStringsEncoded = myShortStrings.map((shortStr) => { return shortString.encodeShortString(shortStr) })
    console.log("myShortStringsEncoded =", myShortStringsEncoded);
    const myShortStringsDecoded = myShortStringsEncoded.map((shortStr) => { return shortString.decodeShortString(shortStr) })
    console.log("myShortStringsDecoded =", myShortStringsDecoded);
    const finalString = myShortStringsDecoded.join("");
    console.log("finalString =", finalString);

}
main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });