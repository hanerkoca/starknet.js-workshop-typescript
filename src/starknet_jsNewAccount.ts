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

    const provider = process.env.STARKNET_PROVIDER_BASE_URL === undefined ?
        defaultProvider :
        new Provider({ sequencer: { baseUrl: process.env.STARKNET_PROVIDER_BASE_URL } });

    console.log('STARKNET_PROVIDER_BASE_URL=', process.env.STARKNET_PROVIDER_BASE_URL)
    console.log("Reading OpenZeppelin Account Contract...");
    const compiledOZAccount = json.parse(
        fs.readFileSync("./OZAccount.json").toString("ascii")
    );

    // Since there are no Externally Owned Accounts (EOA) in StarkNet,
    // all Accounts in StarkNet are contracts.

    // Unlike in Ethereum where a account is created with a public and private key pair,
    // StarkNet Accounts are the only way to sign transactions and messages, and verify signatures.
    // Therefore a Account - Contract interface is needed.

    // Generate public and private key pair.
    const privateKey: EC.GenKeyPairOptions = { entropy: stark.randomAddress() };
    console.log('privateKey=', privateKey);
    const starkKeyPair = ec.genKeyPair(privateKey);
    const starkKeyPub = ec.getStarkKey(starkKeyPair);

    // // Deploy the Account contract and wait for it to be verified on StarkNet.
    console.log("Deployment Tx - Account Contract to StarkNet...");
    const accountResponse = await provider.deployContract({
        contract: compiledOZAccount,
        constructorCalldata: [starkKeyPub],
        addressSalt: starkKeyPub,
    });
    //DeployContractResponse
    // You can also check this address on https://goerli.voyager.online/
    console.log("Account address ", accountResponse.contract_address);

    // Wait for the deployment transaction to be accepted on StarkNet
    console.log("Waiting for Tx to be Accepted on Starknet - OpenZeppelin Account Deployment...\n\n");
    await provider.waitForTransaction(accountResponse.transaction_hash);

    function askQuestion(query: string) {
        const rl = readline.createInterface({
            input: process.stdin,
            output: process.stdout,
        });
        return new Promise(resolve => rl.question(query, ans => {
            rl.close();
            resolve(ans);
        }))
    }

    ////////////////////////////////////////////////////////////////////////////////
    // IMPORTANT: you need to fund your newly created account before you use it. 
    // For Testnet : you can do so by using a faucet:
    // https://faucet.goerli.starknet.io/
    // For Devnet : use /mint  (see README.md)
    ////////////////////////////////////////////////////////////////////////////////

    const ans = await askQuestion("Did you add funds to your Account? Hit enter if yes");

    ////////////////
    //// PART 2 ////
    ////////////////

    //Use your new account address
    const accountAddress: string = accountResponse.contract_address ?? "";
    const account = new Account(
        provider,
        accountAddress,
        starkKeyPair
    );


    // console.log('OZ_ACCOUNT_ADDRESS=', process.env.OZ_ACCOUNT_ADDRESS);
    // console.log('OZ_ACCOUNT_PRIVATE_KEY=', process.env.OZ_ACCOUNT_PRIVATE_KEY);


    // let privateKey2 = process.env.OZ_ACCOUNT_PRIVATE_KEY ?? "";
    // const starkKeyPair2 = ec.getKeyPair(privateKey2);
    // const accountAddress2: string = process.env.OZ_ACCOUNT_ADDRESS ?? "";
    // const account = new Account(
    //     provider,
    //     accountAddress2,
    //     starkKeyPair2
    // );



    console.log("Reading ERC20 Contract...");
    const compiledErc20 = json.parse(
        fs.readFileSync("./ERC20.json").toString("ascii")
    );

    // Deploy an ERC20 contract and wait for it to be verified on StarkNet.
    console.log("Deployment Tx - ERC20 Contract to StarkNet...");
    // const erc20decl = await account.declareContract({
    //     contract: compiledErc20
    // });
    // console.log("ERC20 deploy class hash: ", erc20decl.class_hash);
    // console.log("ERC20 deploy transaction Hash: ", erc20decl.transaction_hash);
    // console.log("Waiting for Tx to be Accepted on Starknet - ERC20 Deployment...");
    // await provider.waitForTransaction(erc20decl.transaction_hash);


    const erc20Response = await provider.deployContract({
        contract: compiledErc20,
    });
    console.log("ERC20 deploy Address: ", erc20Response.contract_address);
    console.log("ERC20 deploy Hash: ", erc20Response.transaction_hash);
    // Wait for the deployment transaction to be accepted on StarkNet
    console.log("Waiting for Tx to be Accepted on Starknet - ERC20 Deployment...\n\n");
    await provider.waitForTransaction(erc20Response.transaction_hash);
    // Get the erc20 contract address
    const erc20Address = erc20Response.contract_address;
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