// Deploy and use an ERC20, monetized by an existing account
// use Starknet.js v5.6.0, starknet-devnet 0.5.0
// Launch with : npx ts-node src/starknet_jsExistingAccount.ts

import fs from "fs";
import { Account, Contract, defaultProvider, json, stark, Provider, shortString, uint256, CallData } from "starknet";
import * as dotenv from "dotenv";
dotenv.config();

//        👇👇👇
// 🚨🚨🚨 launch 'starknet-devnet --seed 0' before using this script
//        👆👆👆
async function main() {
    //initialize Provider with DEVNET, reading .env file
    if (process.env.STARKNET_PROVIDER_BASE_URL != "http://127.0.0.1:5050") {
        console.log("This script work only on local devnet.");
        process.exit(1);
    }
    const provider = process.env.STARKNET_PROVIDER_BASE_URL === undefined ?
        defaultProvider :
        new Provider({ sequencer: { baseUrl: process.env.STARKNET_PROVIDER_BASE_URL } });

    console.log('STARKNET_PROVIDER_BASE_URL=', process.env.STARKNET_PROVIDER_BASE_URL);

    // initialize existing predeployed account 0 of Devnet
    console.log('OZ_ACCOUNT_ADDRESS=', process.env.OZ_ACCOUNT0_DEVNET_ADDRESS);
    console.log('OZ_ACCOUNT_PRIVATE_KEY=', process.env.OZ_ACCOUNT0_DEVNET_PRIVATE_KEY);
    const privateKey = process.env.OZ_ACCOUNT0_DEVNET_PRIVATE_KEY ?? "";
    const accountAddress: string = process.env.OZ_ACCOUNT0_DEVNET_ADDRESS ?? "";
    const account0 = new Account(provider, accountAddress, privateKey);
    console.log('OZ account 0 connected.\n');

    // Deploy an ERC20 contract 
    console.log("Deployment Tx - ERC20 Contract to StarkNet...");
    const compiledErc20mintable = json.parse(fs.readFileSync("compiledContracts/ERC20MintableOZ_0_6_1.json").toString("ascii"));
    const initialTk: uint256.Uint256 = { low: 100, high: 0 };
    const ERC20ConstructorCallData = CallData.compile({
        name: shortString.encodeShortString('MyToken'),
        symbol: shortString.encodeShortString('MTK'),
        decimals: "18",
        initial_supply: initialTk,
        recipient: account0.address,
        owner: account0.address
    });
    // console.log("constructor=", ERC20ConstructorCallData);
    const deployERC20Response = await account0.declareAndDeploy({
        contract: compiledErc20mintable,
        constructorCalldata: ERC20ConstructorCallData
    });
    console.log("ERC20 deployed at address: ", deployERC20Response.deploy.contract_address);

    // Get the erc20 contract address
    const erc20Address = deployERC20Response.deploy.contract_address;
    // Create a new erc20 contract object
    const erc20 = new Contract(compiledErc20mintable.abi, erc20Address, provider);
    erc20.connect(account0);

    // Check balance - should be 100
    console.log(`Calling StarkNet for account balance...`);
    const balanceInitial = await erc20.balanceOf(account0.address);
    console.log("account0 has a balance of :", uint256.uint256ToBN(balanceInitial.balance).toString());

    // Mint 1000 tokens to account address
    const amountToMint = uint256.bnToUint256(1000);
    console.log("Invoke Tx - Minting 1000 tokens to account0...");
    const { transaction_hash: mintTxHash } = await erc20.mint(account0.address, amountToMint, { maxFee: 900_000_000_000_000 });
    // Wait for the invoke transaction to be accepted on StarkNet
    console.log(`Waiting for Tx to be Accepted on Starknet - Minting...`);
    await provider.waitForTransaction(mintTxHash);
    // Check balance - should be 1100
    console.log(`Calling StarkNet for account balance...`);
    const balanceBeforeTransfer = await erc20.balanceOf(account0.address);
    console.log("account0 has a balance of :", uint256.uint256ToBN(balanceBeforeTransfer.balance).toString());

    // Execute tx transfer of 10 tokens
    console.log(`Invoke Tx - Transfer 10 tokens back to erc20 contract...`);
    const toTransferTk: uint256.Uint256 = uint256.bnToUint256(10);
    const transferCallData = CallData.compile({
        recipient: erc20Address,
        initial_supply: toTransferTk
    });
    const { transaction_hash: transferTxHash } = await account0.execute({ contractAddress: erc20Address, entrypoint: "transfer", calldata: transferCallData, }, undefined, { maxFee: 900_000_000_000_000 });
    // Wait for the invoke transaction to be accepted on StarkNet
    console.log(`Waiting for Tx to be Accepted on Starknet - Transfer...`);
    await provider.waitForTransaction(transferTxHash);
    // Check balance after transfer - should be 1090
    console.log(`Calling StarkNet for account balance...`);
    const balanceAfterTransfer = await erc20.balanceOf(account0.address);
    console.log("account0 has a balance of :", uint256.uint256ToBN(balanceAfterTransfer.balance).toString());
    console.log("✅ Test completed.");
}
main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });