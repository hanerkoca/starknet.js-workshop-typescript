// mint ECU token.
// launch with npx ts-node src/scripts/mintECU.ts

import { Provider, Contract, Account, json, ec, uint256 } from "starknet";
import fs from "fs";
import * as dotenv from "dotenv";
dotenv.config();


//          👇👇👇
// 🚨🚨🚨   Launch 'starknet-devnet --seed 0' before using this script.
//          Launch also the ECU ERC20.
//          👆👆👆
async function main() {
    //initialize Provider with DEVNET, reading .env file
    if (process.env.STARKNET_PROVIDER_BASE_URL != "http://127.0.0.1:5050") {
        console.log("This script work only on local devnet.");
        process.exit(1);
    }
    const provider = new Provider({ sequencer: { baseUrl: process.env.STARKNET_PROVIDER_BASE_URL } });
    console.log('STARKNET_PROVIDER_BASE_URL=', process.env.STARKNET_PROVIDER_BASE_URL);

    // connect existing predeployed account 0 of Devnet
    console.log('OZ_ACCOUNT0_ADDRESS=', process.env.OZ_ACCOUNT0_DEVNET_ADDRESS);
    console.log('OZ_ACCOUNT0_PRIVATE_KEY=', process.env.OZ_ACCOUNT0_DEVNET_PRIVATE_KEY);
    const privateKey0 = process.env.OZ_ACCOUNT0_DEVNET_PRIVATE_KEY ?? "";
    const account0Address: string = process.env.OZ_ACCOUNT0_DEVNET_ADDRESS ?? "";
    const account0 = new Account(provider, account0Address, privateKey0);
    console.log('existing OZ account0 connected.\n');

    const addrETH = "0x049d36570d4e46f48e99674bd3fcc84644ddd6b96f7c741b1562b82f9e004dc7";
    // Address of ECU ERC20 in devnet 👇👇👇
    const addrECUdevnet: string = "0x77dcf954011175d60820091534dbef39a58a7a94bd75cb182c4270193b04a19"; // modify in accordance with result of deployement

    //
    // address of account to mint 👇👇👇
    const addrDest = "0x7e9581744cdcc49f9a75facb083c7c76cac48eb13ba6773fbb653cd5a8a5f71";
    //
    //

    const compiledERC20 = json.parse(fs.readFileSync("./compiledContracts/ERC20MintableOZ051.json").toString("ascii"));
    const ERC20Contract = new Contract(compiledERC20.abi, addrECUdevnet, provider);
    console.log('ERC20 Contract connected at =', ERC20Contract.address);

    // Interactions with the contract with call & invoke
    ERC20Contract.connect(account0);
    const bal1 = await ERC20Contract.balanceOf(addrDest);
    console.log("Initial balance =", uint256.uint256ToBN(bal1.balance).toString());

    // Mint 1000 tokens to account address
    const amountToMint = uint256.bnToUint256(10000);
    console.log("Invoke Tx - Minting 10000 tokens to account...");
    const { transaction_hash: mintTxHash } = await ERC20Contract.mint(
        addrDest,
        amountToMint,
        { maxFee: 900_000_000_000_000 }
    );
    await provider.waitForTransaction(mintTxHash);
    const bal2 = await ERC20Contract.balanceOf(addrDest);
    console.log("Final balance =", uint256.uint256ToBN(bal2.balance).toString());
    console.log('✅ Mint completed.');

}
main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });