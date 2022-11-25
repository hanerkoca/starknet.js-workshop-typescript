import { ec as EC } from "elliptic";
import fs from "fs";
import readline from "readline";
import * as dotenv from "dotenv";
dotenv.config();

import {
    Account,
    Contract,
    defaultProvider,
    ec,
    json,
    stark,
    Provider,
    number,
    ProviderOptions,
} from "starknet";

// launch 'starknet-devnet --seed 0' before using this script
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
    console.log('OZ_ACCOUNT_ADDRESS=', process.env.OZ_ACCOUNT_ADDRESS);
    console.log('OZ_ACCOUNT_PRIVATE_KEY=', process.env.OZ_ACCOUNT_PRIVATE_KEY);
    const privateKey = process.env.OZ_ACCOUNT_PRIVATE_KEY ?? "";
    const starkKeyPair = ec.getKeyPair(privateKey);
    const accountAddress: string = process.env.OZ_ACCOUNT_ADDRESS ?? "";
    const account = new Account(
        provider,
        accountAddress,
        starkKeyPair
    );
    console.log('OZ account 0 connected.');

    // Deploy an ERC20 contract and wait for it to be verified on StarkNet.
    console.log("Reading ERC20 Contract...");
    const compiledErc20 = json.parse(
        fs.readFileSync("./ERC20.json").toString("ascii")
    );
    console.log("Deployment Tx - ERC20 Contract to StarkNet...");
    const erc20Response = await provider.deployContract({
        contract: compiledErc20,
    });
    console.log("ERC20 deploy Address: ", erc20Response.contract_address);
    console.log("ERC20 deploy Hash: ", erc20Response.transaction_hash);
    console.log("Waiting for Tx to be Accepted on Starknet - ERC20 Deployment...");
    await provider.waitForTransaction(erc20Response.transaction_hash);

    // Get the erc20 contract address
    const erc20Address = erc20Response.contract_address;
    console.log("ERC20 Address: ", erc20Address);
    // Create a new erc20 contract object
    const erc20 = new Contract(compiledErc20.abi, erc20Address, provider);
    erc20.connect(account);

    // Check balance - should be 0
    console.log(`Calling StarkNet for account balance...`);
    const balanceInitial = await erc20.balance_of(account.address);
    console.log(`account Address ${account.address} has a balance of:`, number.toBN(balanceInitial.res, 16).toString());

    // Mint 1000 tokens to account address
    console.log(`Invoke Tx - Minting 1000 tokens to ${account.address}...`);
    const { transaction_hash: mintTxHash } = await erc20.mint(
        account.address,
        "1000",
        {
            // transaction can be rejected if maxFee is lower than actual
            // Error: REJECTED: FEE_TRANSFER_FAILURE
            // Actual fee exceeded max fee.
            maxFee: "999999995330000"
        }
    );

    // Wait for the invoke transaction to be accepted on StarkNet
    console.log(`Waiting for Tx to be Accepted on Starknet - Minting...`);
    await provider.waitForTransaction(mintTxHash);
    // Check balance - should be 1000
    console.log(`Calling StarkNet for account balance...`);
    const balanceBeforeTransfer = await erc20.balance_of(account.address);
    console.log(`account Address ${account.address} has a balance of:`, number.toBN(balanceBeforeTransfer.res, 16).toString());

    // Execute tx transfer of 10 tokens
    console.log(`Invoke Tx - Transfer 10 tokens back to erc20 contract...`);
    const { transaction_hash: transferTxHash } = await account.execute(
        {
            contractAddress: erc20Address,
            entrypoint: "transfer",
            calldata: [erc20Address, "10"],
        },
        undefined,
        {
            maxFee: "999999995330000"
        }
    );

    // Wait for the invoke transaction to be accepted on StarkNet
    console.log(`Waiting for Tx to be Accepted on Starknet - Transfer...`);
    await provider.waitForTransaction(transferTxHash);
    // Check balance after transfer - should be 990
    console.log(`Calling StarkNet for account balance...`);
    const balanceAfterTransfer = await erc20.balance_of(account.address);
    console.log(`account Address ${account.address} has a balance of:`, number.toBN(balanceAfterTransfer.res, 16).toString());
}
main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });