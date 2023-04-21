// create a new OZ account in devnet
// launch with npx ts-node src/scripts/2.createNewOZaccount.ts
// Coded with Starknet.js v5.1.0


import { Account, ec,encode, json, stark, Provider, hash } from "starknet";
import fs from "fs";
import BN from "bn.js";
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
    const provider = new Provider({ sequencer: { baseUrl: process.env.STARKNET_PROVIDER_BASE_URL } });

    console.log('STARKNET_PROVIDER_BASE_URL=', process.env.STARKNET_PROVIDER_BASE_URL);

    // Connect existing predeployed account 0 of Devnet
    console.log('OZ_ACCOUNT_DEVNET_ADDRESS=', process.env.OZ_ACCOUNT0_DEVNET_ADDRESS);
    console.log('OZ_ACCOUNT_DEVNET_PRIVATE_KEY=', process.env.OZ_ACCOUNT0_DEVNET_PRIVATE_KEY);
    const privateKey0 = process.env.OZ_ACCOUNT0_DEVNET_PRIVATE_KEY ?? "";
    const account0Address: string = process.env.OZ_ACCOUNT0_DEVNET_ADDRESS ?? "";
    const account0 = new Account(provider, account0Address, privateKey0);
    console.log('OZ account0 connected.\n');


    // new Open Zeppelin account v0.6.1 :

    // Generate public and private key pair.
    const privateKey = process.env.OZ_NEW_ACCOUNT_PRIVKEY ?? "";
    // or for random private key :
    //const privateKey = stark.randomAddress();
    console.log('New account :\nprivateKey=', privateKey);
    const starkKeyPub = ec.starkCurve.getStarkKey(privateKey);
    console.log('publicKey=', starkKeyPub);
    //declare OZ wallet contract
    const compiledOZAccount = json.parse(
        fs.readFileSync("./compiledContracts/Account_0_6_1.json").toString("ascii")
    );
    const { transaction_hash: declTH, class_hash: decClassHash } = await account0.declare({ contract: compiledOZAccount });
    console.log('OpenZeppelin account class hash =', decClassHash);
    await provider.waitForTransaction(declTH);

    // Calculate future address of the account
    const OZaccountConstructorCallData = stark.compileCalldata({ publicKey: starkKeyPub });
    const OZcontractAddress = hash.calculateContractAddressFromHash( starkKeyPub,decClassHash, OZaccountConstructorCallData, 0);
    console.log('Precalculated account address=', OZcontractAddress);
    // fund account address before account creation
    // 🚨🚨🚨 following line has a bug 🚨🚨🚨
    
    const { data: answer } = await axios.post('http://127.0.0.1:5050/mint', { "address": OZcontractAddress, "amount": 50_000_000_000_000_000_000, "lite": true }, { headers: { "Content-Type": "application/json" } });
    console.log('Answer mint =', answer); //50 ETH
    // deploy account
    const OZaccount = new Account(provider, OZcontractAddress, privateKey);
    const { suggestedMaxFee: estimatedFee1 } = await OZaccount.estimateAccountDeployFee({ classHash: decClassHash, addressSalt: starkKeyPub, constructorCalldata: OZaccountConstructorCallData });const { transaction_hash, contract_address } = await OZaccount.deployAccount({ classHash: decClassHash, constructorCalldata: OZaccountConstructorCallData, addressSalt: starkKeyPub }, { maxFee: estimatedFee1*11n/10n });
    //const { transaction_hash, contract_address } = await OZaccount.deployAccount({ classHash: OZaccountClashHass, constructorCalldata: OZaccountConstructorCallData, addressSalt: starkKeyPub });
    console.log('✅ New OpenZeppelin account created.\n   final address =', contract_address);
    await provider.waitForTransaction(transaction_hash);

}
main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });