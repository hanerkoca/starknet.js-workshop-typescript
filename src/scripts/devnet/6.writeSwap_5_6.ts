// Read a Swap function in devnet.
// Launch with npx ts-node src/scripts/devnet/6.writeSwap_5_6.ts
// Coded with Starknet.js v5.6.0

import { Provider,  Contract,  Account,uint256, constants ,CallData,hash} from "starknet";
import { ensureEnvVar } from "../../util";

import fs from "fs";
import * as dotenv from "dotenv";
dotenv.config();

//          👇👇👇
// 🚨🚨🚨   Launch 'starknet-devnet --seed 0 --fork-network alpha-mainnet' before using this script.
//          👆👆👆


async function main() {
    //initialize the Provider in mainnet
    const provider = new Provider({ sequencer: { network: constants.NetworkName.SN_MAIN } });

    const chainId = await provider.getChainId();
    console.log('Connected to the  network  (Mainnet)=', chainId);

   // connect existing predeployed account 0 of Devnet
   const privateKey0 = "0x12345789012345678901235";
   const account0Address: string = "0x0378cfcb1c21c508a043fcd1380b3263c718f8ebd47cbd7ffa48c4c76060f989";
   const account0 = new Account(provider, account0Address, privateKey0);
   console.log('existing OZ account0 connected.\n');

// read abi

     const contractAddress = "0x07a6f98c03379b9513ca84cca1373ff452a7462a3b61598f0af5bb27ad7f76d1";
    const compressedContract = await provider.getClassAt(contractAddress);
    fs.writeFileSync('./src/scripts/mainnet/swap.json', JSON.stringify(compressedContract,undefined,2));
    if (compressedContract.abi === undefined) { throw new Error("No Abi.") }
    //console.log(JSON.stringify(compressedContract.abi[6],undefined,2));
    const routerSwap = new Contract(compressedContract.abi, contractAddress, provider);
    routerSwap.connect(account0);
    
    const amountIn = uint256.bnToUint256(1n);
    const amountOutMin = uint256.bnToUint256(1n);
    const path = ["0x049d36570d4e46f48e99674bd3fcc84644ddd6b96f7c741b1562b82f9e004dc7",
    "0x053c91253bc9682c04929ca02ed00b3e423f6710d2ee7e0d5ebb06f3ecf368a8"];


    const callParamsWrite = CallData.compile(
        {
            amountIn: amountIn,
            amountOutMin:amountOutMin,
            path: path,
            to: account0Address,
            deadline : 1234567
        }
    )
    console.log (callParamsWrite);

    //const result=routerSwap.swapExactTokensForTokens(callParamsWrite);
    const result=await account0.execute({
        contractAddress:contractAddress,
        entrypoint:"swapExactTokensForTokens",
        calldata:callParamsWrite
    })
    routerSwap.swapExactTokensForTokens(callParamsWrite);
    //const result = await routerSwap.getAmountsOut(callParams);
    //const result2 = await routerSwap.call("getAmountsOut",[callParams]);
    await provider.waitForTransaction(result.transaction_hash);

    console.log("res =", result);
    console.log('✅ Test completed.');
        // amounts
}
main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
    