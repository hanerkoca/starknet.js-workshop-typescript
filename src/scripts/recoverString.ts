// recover a long string.
// launch with npx ts-node src/scripts/recoverString.ts

import { Provider, Contract, json, uint256, shortString, number } from "starknet";
import BN from "bn.js";

async function main() {
    const provider = new Provider({ sequencer: { baseUrl: "https://alpha4.starknet.io" } });
    const contractAddress = "0x05ccc4359dfb9ade47e3ee0e90709143504831327e34f8c547ecddd05be6310c";
    const { abi: contractABI } = await provider.getClassAt(contractAddress);
    if (contractABI === undefined) { throw new Error("no abi at this address.") };
    const myContract = new Contract(contractABI, contractAddress, provider);
    //console.log('Test Contract connected at =', myContract.address);
    const id256 = uint256.bnToUint256(35);
    const result = await myContract.call("tokenURI", [id256]);
    const stringsCoded: BN[] = result.token_uri;
    //console.log("Result =", result);
    const myShortStringsDecoded = stringsCoded.map((shortStr: BN) => { return shortString.decodeShortString(number.toHex(shortStr)) });
    //console.log("myShortStringsDecoded =", myShortStringsDecoded);
    const finalString = myShortStringsDecoded.join("");
    console.log("finalString =", finalString);
}
main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });