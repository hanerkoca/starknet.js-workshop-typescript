// recover a long string.
// launch with npx ts-node src/scripts/recoverString.ts
// coded with Starknet.js v5.11.1

import { Provider, Contract, json, uint256, shortString, num } from "starknet";

async function main() {
    const provider = new Provider({ sequencer: { baseUrl: "https://alpha4.starknet.io" } });
    const contractAddress = "0x05ccc4359dfb9ade47e3ee0e90709143504831327e34f8c547ecddd05be6310c";
    const { abi: contractABI } = await provider.getClassAt(contractAddress);
    if (contractABI === undefined) { throw new Error("no abi at this address.") };
    const myContract = new Contract(contractABI, contractAddress, provider);
    //console.log('Test Contract connected at =', myContract.address);
    const id256 = uint256.bnToUint256(35);
    const stringsCoded : bigint[]= await myContract.tokenURI(id256);
    const myShortStringsDecoded = stringsCoded.map((shortStr: bigint) => { return shortString.decodeShortString(num.toHex(shortStr)) });
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