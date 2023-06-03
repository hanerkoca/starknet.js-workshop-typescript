// Deploy and use an ERC20, monetized by a new account
// use Starknet.js v5.9.1, starknet-devnet 0.5.1
// Launch with : npx ts-node src/starknet_jsNewAccount.ts

import fs from "fs";
import { Account, Contract, defaultProvider, ec, json, stark, Provider, shortString, uint256, hash, CallData, Call, Calldata, RawArgsObject, RawArgsArray } from "starknet";
import axios from "axios";
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

    // Connect existing predeployed account 0 of Devnet
    console.log('OZ_ACCOUNT0_ADDRESS=', process.env.OZ_ACCOUNT0_DEVNET_ADDRESS);
    console.log('OZ_ACCOUNT0_PRIVATE_KEY=', process.env.OZ_ACCOUNT0_DEVNET_PRIVATE_KEY);
    const privateKey0 = process.env.OZ_ACCOUNT0_DEVNET_PRIVATE_KEY ?? "";
    // const starkKeyPair0 = ec.getKeyPair(privateKey0);
    const account0Address: string = process.env.OZ_ACCOUNT0_DEVNET_ADDRESS ?? "";
    const account0 = new Account(provider, account0Address, privateKey0);
    console.log('OZ account0 connected.\n');

    // creation of new OZaccount in Devnet
    console.log('OZ_NEW_ACCOUNT_PRIVATE_KEY=', process.env.OZ_NEW_ACCOUNT_PRIVKEY);
    const privateKeyOZ = process.env.OZ_NEW_ACCOUNT_PRIVKEY ?? "";
    const starkKeyPubOZ = ec.starkCurve.getStarkKey(privateKeyOZ);
    console.log('OZ new account publicKey =', starkKeyPubOZ);
    // declare OZ wallet contract
    const compiledOZAccount = json.parse(
        fs.readFileSync("./compiledContracts/Account_0_6_1.json").toString("ascii")
    );
    const { transaction_hash: declTH, class_hash: decCH } = await account0.declare({ contract: compiledOZAccount });
    console.log('OpenZeppelin account class hash =', decCH);
    await provider.waitForTransaction(declTH);

    // Calculate future address of the account
    const accountCallData: CallData = new CallData(compiledOZAccount.abi);
    const accountConstructorCallData: Calldata = accountCallData.compile("constructor", [starkKeyPubOZ]);
    const OZcontractAddress = hash.calculateContractAddressFromHash(starkKeyPubOZ, decCH, accountConstructorCallData, 0);
    console.log('Precalculated account address=', OZcontractAddress);
    // fund account address before account creation
    const { data: answer } = await axios.post('http://127.0.0.1:5050/mint', { "address": OZcontractAddress, "amount": 50_000_000_000_000_000_000, "lite": true }, { headers: { "Content-Type": "application/json" } });
    console.log('Answer mint =', answer);
    // deploy account
    const accountOZ = new Account(provider, OZcontractAddress, privateKeyOZ);
    const { transaction_hash, contract_address } = await accountOZ.deployAccount({ classHash: decCH, constructorCalldata: accountConstructorCallData, addressSalt: starkKeyPubOZ });
    console.log('New OpenZeppelin account created.\n   final address =', contract_address);
    await provider.waitForTransaction(transaction_hash);
    console.log('new OZ account connected.\n');

    // Deploy an ERC20 contract 
    console.log("Deployment Tx - ERC20 Contract to StarkNet...");

    // Constructor of the ERC20 Cairo 0 contract :
    // {
    //     "inputs": [
    //         {
    //             "name": "name",
    //             "type": "felt"
    //         },
    //         {
    //             "name": "symbol",
    //             "type": "felt"
    //         },
    //         {
    //             "name": "decimals",
    //             "type": "felt"
    //         },
    //         {
    //             "name": "initial_supply",
    //             "type": "Uint256"
    //         },
    //         {
    //             "name": "recipient",
    //             "type": "felt"
    //         },
    //         {
    //             "name": "owner",
    //             "type": "felt"
    //         }
    //     ],
    //     "name": "constructor",
    //     "outputs": [],
    //     "type": "constructor"
    // },

    const compiledErc20mintable = json.parse(fs.readFileSync("compiledContracts/ERC20MintableOZ_0_6_1.json").toString("ascii"));
    const initialTk: uint256.Uint256 = uint256.bnToUint256(100);

    // define the constructor :

    const erc20CallData: CallData = new CallData(compiledErc20mintable.abi);
    const ERC20ConstructorCallData4: Calldata = erc20CallData.compile("constructor", [
        "niceToken",
        "NIT",
        18,
        initialTk, // needs a Uint256 type for Cairo 0 (with Cairo 1, '100n' is accepted)
        account0.address,
        account0.address
    ]);

    const ERC20ConstructorCallData = ERC20ConstructorCallData4;

    console.log("constructor=", ERC20ConstructorCallData);
    const deployERC20Response = await account0.declareAndDeploy({
        contract: compiledErc20mintable,
        constructorCalldata: ERC20ConstructorCallData
    });
    console.log("ERC20 declared hash: ", deployERC20Response.declare.class_hash);
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
    const { transaction_hash: mintTxHash } = await erc20.mint(account0.address, amountToMint, { maxFee: 900_000_000_000_000 }); // with Cairo 1 contract, 'amountToMint' can be replaced by '100n'
    // Wait for the invoke transaction to be accepted on StarkNet
    console.log(`Waiting for Tx to be Accepted on Starknet - Minting...`);
    await provider.waitForTransaction(mintTxHash);
    // Check balance - should be 1100
    console.log(`Calling StarkNet for account balance...`);
    const balanceBeforeTransfer = await erc20.balanceOf(account0.address);
    console.log("account0 has a balance of :", uint256.uint256ToBN(balanceBeforeTransfer.balance).toString());

    // Execute tx transfer of 2x10 tokens, showing 2 ways to write data in Starknet
    console.log(`Invoke Tx - Transfer 2x10 tokens back to erc20 contract...`);
    const toTransferTk: uint256.Uint256 = uint256.bnToUint256(10);
    const transferCallData: Call = erc20.populate("transfer", [
        erc20Address,
        toTransferTk // with Cairo 1 contract, 'toTransferTk' can be replaced by '10n'
    ]);
    const { transaction_hash: transferTxHash } = await account0.execute(transferCallData, undefined, { maxFee: 900_000_000_000_000 });
    const { transaction_hash: transferTxHash2 } = await erc20.transfer(erc20Address, toTransferTk); // with Cairo 1 contract, 'toTransferTk' can be replaced by '10n'
    // Wait for the invoke transaction to be accepted on StarkNet
    console.log(`Waiting for Tx to be Accepted on Starknet - Transfer...`);
    await provider.waitForTransaction(transferTxHash2);
    // Check balance after transfer - should be 1080
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