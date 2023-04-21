// Read a Swap function in mainnet.
// Launch with npx ts-node src/scripts/mainnet/3.readSwap_4_22.ts
// Coded with Starknet.js v4.22.0

import { Provider, Contract, uint256 } from "starknet";
import fs from "fs";
import BN from "bn.js";

async function main() {
    //initialize the Provider in mainnet
    const provider = new Provider({ sequencer: { network: "mainnet-alpha" } });

    const chainId = await provider.getChainId();
    console.log('Connected to the  network  (Mainnet)=', chainId);

    const contractAddress = "0x07a6f98c03379b9513ca84cca1373ff452a7462a3b61598f0af5bb27ad7f76d1";
    const compressedContract = await provider.getClassAt(contractAddress);
    if (compressedContract.abi === undefined) { throw new Error("No Abi.") }
    console.log(JSON.stringify(compressedContract.abi[6], undefined, 2));
    const routerSwap = new Contract(compressedContract.abi, contractAddress, provider);
    console.log("routerSwap.address =", routerSwap.address);
    const amountToSwap = new BN("123456");
    const amountIn = uint256.bnToUint256(amountToSwap);
    const path = ["0x049d36570d4e46f48e99674bd3fcc84644ddd6b96f7c741b1562b82f9e004dc7",
    "0x053c91253bc9682c04929ca02ed00b3e423f6710d2ee7e0d5ebb06f3ecf368a8",];
    const callParams = [
        amountIn,
        path
    ]
    const result = await routerSwap.getAmountsOut(...callParams);
    const result2 = await routerSwap.call("getAmountsOut", callParams);
    console.log("res =", result);
    console.log("res2 =", result2);
    console.log('✅ Test completed.');

}
main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
