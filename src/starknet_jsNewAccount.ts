// Deploy and use an ERC20, monetized by a new account
// Launch with : npx ts-node src/starknet_jsNewAccount.ts
// Coded with Starknet.js v5.21.0, Starknet-devnet-rs v0.1.0

import fs from "fs";
import { Account, Contract, ec, json, uint256, hash, CallData, Call, Calldata, cairo, Uint256, RpcProvider } from "starknet";
import axios from "axios";
import * as dotenv from "dotenv";
import { resetDevnetNow } from "./scripts/resetDevnetFunc";
dotenv.config();

//        👇👇👇
// 🚨🚨🚨 launch 'cargo run --release -- --seed 0' in devnet-rs directory before using this script
//        👆👆👆

function formatBalance(qty: bigint, decimals: number): string {
    const balance = String("0").repeat(decimals) + qty.toString();
    const rightCleaned = balance.slice(-decimals).replace(/(\d)0+$/gm, '$1');
    const leftCleaned = BigInt(balance.slice(0, balance.length - decimals)).toString();
    return leftCleaned + "." + rightCleaned;
}

async function main() {
    const provider = new RpcProvider({ nodeUrl: "http://127.0.0.1:5050/rpc" }); // only for starknet-devnet-rs
    console.log("Provider connected to Starknet-devnet-rs");

    // initialize existing predeployed account 0 of Devnet
    console.log('OZ_ACCOUNT_ADDRESS=', process.env.OZ_ACCOUNT0_DEVNET_ADDRESS);
    console.log('OZ_ACCOUNT_PRIVATE_KEY=', process.env.OZ_ACCOUNT0_DEVNET_PRIVATE_KEY);
    const privateKey = process.env.OZ_ACCOUNT0_DEVNET_PRIVATE_KEY ?? "";
    const accountAddress: string = process.env.OZ_ACCOUNT0_DEVNET_ADDRESS ?? "";
    const account0 = new Account(provider, accountAddress, privateKey);
    console.log("Account 0 connected.\n");

    // creation of new Cairo 2.0.0 Starkware account in Devnet
    console.log('C20_NEW_ACCOUNT_PRIVATE_KEY=', process.env.C20_NEW_ACCOUNT_PRIVKEY);
    const privateKeyC20 = process.env.C20_NEW_ACCOUNT_PRIVKEY ?? "";
    const starkKeyPubC20 = ec.starkCurve.getStarkKey(privateKeyC20);
    console.log('C20 new account publicKey =', starkKeyPubC20);
    // declare  Cairo 2.0.0 account contract
    const compiledC20SierraAccount = json.parse(
        fs.readFileSync("./compiledContracts/cairo200/account200.sierra.json").toString("ascii")
    );
    const compiledC20CasmAccount = json.parse(
        fs.readFileSync("./compiledContracts/cairo200/account200.casm.json").toString("ascii")
    );
    const { transaction_hash: declTH, class_hash: decCH } = await account0.declare({ contract: compiledC20SierraAccount, casm: compiledC20CasmAccount });
    console.log('Cairo 2.0.0 Starkware account class hash =', decCH);
    await provider.waitForTransaction(declTH);

    // Calculate future address of the account
    const accountCallData: CallData = new CallData(compiledC20SierraAccount.abi);
    const accountConstructorCallData: Calldata = accountCallData.compile("constructor", [starkKeyPubC20]);
    const C20contractAddress = hash.calculateContractAddressFromHash(starkKeyPubC20, decCH, accountConstructorCallData, 0);
    console.log('Precalculated account address=', C20contractAddress);
    // fund account address before account creation
    const { data: answer } = await axios.post('http://127.0.0.1:5050/mint', { "address": C20contractAddress, "amount": 50_000_000_000_000_000_000, "lite": true }, { headers: { "Content-Type": "application/json" } });
    console.log('Answer mint =', answer);
    // deploy account
    const accountC20 = new Account(provider, C20contractAddress, privateKeyC20); // with Starknet.js v5.21.0, automatic recognize of the Cairo version of the account
    const { transaction_hash, contract_address } = await accountC20.deployAccount({ classHash: decCH, constructorCalldata: accountConstructorCallData, addressSalt: starkKeyPubC20 });
    console.log('New Cairo 2.0.0 Starkware account created.\n   final address =', contract_address);
    await provider.waitForTransaction(transaction_hash);
    console.log('new Cairo 2.0.0 Starkware account connected.\n');

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

    const compiledErc20mintable = json.parse(fs.readFileSync("compiledContracts/cairo060/ERC20MintableOZ_0_6_1.json").toString("ascii"));
    const DECIMALS = 18;
    const initialTk: Uint256 = cairo.uint256(100);

    // define the constructor :

    const erc20CallData: CallData = new CallData(compiledErc20mintable.abi);
    const ERC20ConstructorCallData4: Calldata = erc20CallData.compile("constructor", [
        "niceToken",
        "NIT",
        DECIMALS,
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

    // Check balance - should be 100 wei
    console.log(`Calling StarkNet for account balance...`);
    const balanceInitial = await erc20.balanceOf(account0.address);
    console.log("account0 has a balance of :", uint256.uint256ToBN(balanceInitial.balance).toString());

    // Mint 1000 tokens to account address
    const amountToMint = cairo.uint256(1000);
    console.log("Invoke Tx - Minting 1000 tokens to account0...");
    //const { transaction_hash: mintTxHash } = await erc20.mint(account0.address, amountToMint, { maxFee: 900_000_000_000_000 }); // with Cairo 1 contract, 'amountToMint' can be replaced by '1000n'
    // Wait for the invoke transaction to be accepted on StarkNet
    console.log(`Waiting for Tx to be Accepted on Starknet - Minting...`);
    //await provider.waitForTransaction(mintTxHash);
    // Check balance - should be 1100 wei
    console.log(`Calling StarkNet for account balance...`);
    const balanceBeforeTransfer = await erc20.balanceOf(account0.address);
    console.log("account0 has a balance of :", uint256.uint256ToBN(balanceBeforeTransfer.balance).toString());

    // Execute tx transfer of 2x10 tokens, showing 2 ways to write data in Starknet
    console.log(`Invoke Tx - Transfer 2x10 tokens back to erc20 contract...`);
    const toTransferTk: Uint256 = cairo.uint256(10);
    const transferCallData: Call = erc20.populate("transfer", [
        erc20Address,
        toTransferTk // with Cairo 1 contract, 'toTransferTk' can be replaced by '10n'
    ]);
    const { transaction_hash: transferTxHash } = await account0.execute(transferCallData, undefined, { maxFee: 900_000_000_000_000 });
    await provider.waitForTransaction(transferTxHash);

    const { transaction_hash: transferTxHash2 } = await erc20.transfer(erc20Address, cairo.uint256(10));
    await provider.waitForTransaction(transferTxHash2);

    const { transaction_hash: transferTxHash3 } = await erc20.transfer(...transferCallData.calldata as string[], { parseRequest: false });
    // Wait for the invoke transactions to be accepted on StarkNet
    console.log(`Waiting for Tx to be Accepted on Starknet - Transfer...`);
    await provider.waitForTransaction(transferTxHash3);

    // Check balance after transfer - should be 1070 wei
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