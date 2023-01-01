// Deploy and use an ERC20, monetized by a new account
// Launch with : npx ts-node src/starknet_jsNewAccount.ts

import fs from "fs";
import { Account, Contract, defaultProvider, ec, json, stark, Provider, shortString, uint256, hash } from "starknet";
import * as dotenv from "dotenv";
import axios from "axios";
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
    console.log('OZ_ACCOUNT0_ADDRESS=', process.env.OZ_ACCOUNT_ADDRESS);
    console.log('OZ_ACCOUNT0_PRIVATE_KEY=', process.env.OZ_ACCOUNT_PRIVATE_KEY);
    const privateKey0 = process.env.OZ_ACCOUNT_PRIVATE_KEY ?? "";
    const starkKeyPair0 = ec.getKeyPair(privateKey0);
    const account0Address: string = process.env.OZ_ACCOUNT_ADDRESS ?? "";
    const account0 = new Account(provider, account0Address, starkKeyPair0);
    console.log('OZ account0 connected.\n');

    // creation of new OZaccount in Devnet
    console.log('OZ_NEW_ACCOUNT_PRIVATE_KEY=', process.env.OZ_NEW_ACCOUNT_PRIVKEY);
    const privateKeyOZ = process.env.OZ_NEW_ACCOUNT_PRIVKEY ?? "";
    const starkKeyPairOZ = ec.getKeyPair(privateKeyOZ);
    const starkKeyPubOZ = ec.getStarkKey(starkKeyPairOZ);
    console.log('OZ new account publicKey =', starkKeyPubOZ);
    //declare OZ wallet contract
    const compiledOZAccount = json.parse(
        fs.readFileSync("./compiledContracts/Account_0_5_1.json").toString("ascii")
    );
    // Calculate Class Hash (calculated manually outside of this script)
    const OZaccountClashHass = "0x2794ce20e5f2ff0d40e632cb53845b9f4e526ebd8471983f7dbd355b721d5a";
    const { transaction_hash: declTH, class_hash: decCH } = await account0.declare({ classHash: OZaccountClashHass, contract: compiledOZAccount });
    console.log('OpenZeppelin account class hash =', decCH);
    await provider.waitForTransaction(declTH);

    // Calculate future address of the account
    const OZaccountConstructorCallData = stark.compileCalldata({ publicKey: starkKeyPubOZ });
    const OZcontractAddress = hash.calculateContractAddressFromHash(starkKeyPubOZ, OZaccountClashHass, OZaccountConstructorCallData, 0);
    console.log('Precalculated account address=', OZcontractAddress);
    // fund account address before account creation
    const { data: answer } = await axios.post('http://127.0.0.1:5050/mint', { "address": OZcontractAddress, "amount": 50_000_000_000_000_000_000, "lite": true }, { headers: { "Content-Type": "application/json" } });
    console.log('Answer mint =', answer);
    // deploy account
    const accountOZ = new Account(provider, OZcontractAddress, starkKeyPairOZ);
    const { transaction_hash, contract_address } = await accountOZ.deployAccount({ classHash: OZaccountClashHass, constructorCalldata: OZaccountConstructorCallData, addressSalt: starkKeyPubOZ });
    console.log('New OpenZeppelin account created.\n   final address =', contract_address);
    await provider.waitForTransaction(transaction_hash);
    console.log('new OZ account connected.\n');

    // Deploy an ERC20 contract 
    console.log("Deployment Tx - ERC20 Contract to StarkNet...");
    const compiledErc20mintable = json.parse(fs.readFileSync("compiledContracts/ERC20Mintable.json").toString("ascii"));
    const ERC20mintableClassHash = "0x795be772eab12ee65d5f3d9e8922d509d6672039978acc98697c0a563669e8";
    const initialTk: uint256.Uint256 = { low: 100, high: 0 };
    const ERC20ConstructorCallData = stark.compileCalldata({ name: shortString.encodeShortString('MyToken'), symbol: shortString.encodeShortString('MTK'), decimals: "18", initial_supply: { type: 'struct', low: initialTk.low, high: initialTk.high }, recipient: accountOZ.address, owner: accountOZ.address });
    const deployERC20Response = await accountOZ.declareDeploy({ classHash: ERC20mintableClassHash, contract: compiledErc20mintable, constructorCalldata: ERC20ConstructorCallData, salt: "0" });
    console.log("ERC20 deployed at address: ", deployERC20Response.deploy.contract_address);

    // Get the erc20 contract address
    const erc20Address = deployERC20Response.deploy.contract_address;
    // Create a new erc20 contract object
    const erc20 = new Contract(compiledErc20mintable.abi, erc20Address, provider);
    erc20.connect(accountOZ);

    // Check balance - should be 100
    console.log(`Calling StarkNet for account balance...`);
    const balanceInitial = await erc20.balanceOf(accountOZ.address);
    console.log("account0 has a balance of :", uint256.uint256ToBN(balanceInitial.balance).toString());

    // Mint 1000 tokens to account address
    const amountToMint = uint256.bnToUint256(1000);
    console.log("Invoke Tx - Minting 1000 tokens to account0...");
    const { transaction_hash: mintTxHash } = await erc20.mint(accountOZ.address, amountToMint, { maxFee: 900_000_000_000_000 });
    // Wait for the invoke transaction to be accepted on StarkNet
    console.log(`Waiting for Tx to be Accepted on Starknet - Minting...`);
    await provider.waitForTransaction(mintTxHash);
    // Check balance - should be 1100
    console.log(`Calling StarkNet for account balance...`);
    const balanceBeforeTransfer = await erc20.balanceOf(accountOZ.address);
    console.log("account0 has a balance of :", uint256.uint256ToBN(balanceBeforeTransfer.balance).toString());

    // Execute tx transfer of 10 tokens
    console.log(`Invoke Tx - Transfer 10 tokens back to erc20 contract...`);
    const toTransferTk: uint256.Uint256 = uint256.bnToUint256(10);
    const transferCallData = stark.compileCalldata({ recipient: erc20Address, initial_supply: { type: 'struct', low: toTransferTk.low, high: toTransferTk.high } });
    const { transaction_hash: transferTxHash } = await accountOZ.execute({ contractAddress: erc20Address, entrypoint: "transfer", calldata: transferCallData, }, undefined, { maxFee: 900_000_000_000_000 });
    // Wait for the invoke transaction to be accepted on StarkNet
    console.log(`Waiting for Tx to be Accepted on Starknet - Transfer...`);
    await provider.waitForTransaction(transferTxHash);
    // Check balance after transfer - should be 1090
    console.log(`Calling StarkNet for account balance...`);
    const balanceAfterTransfer = await erc20.balanceOf(accountOZ.address);
    console.log("account0 has a balance of :", uint256.uint256ToBN(balanceAfterTransfer.balance).toString());
    console.log("✅ Test completed.");
}
main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });