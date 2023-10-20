// create a new OZ account in devnet
// launch with npx ts-node src/scripts/2.createNewOZaccount.ts
// Coded with Starknet.js v5.21.0, Starknet-devnet v0.6.3


import { Account, ec, json, Provider, hash, CallData, RpcProvider } from "starknet";
import fs from "fs";
import axios from "axios";
import * as dotenv from "dotenv";
dotenv.config();


//        👇👇👇
// 🚨🚨🚨 launch 'starknet-devnet --seed 0' before using this script
//        👆👆👆
async function main() {
    const provider = new RpcProvider({ nodeUrl: "http://127.0.0.1:5050/rpc" } ); // only starknet-devnet-rs
    console.log("Provider connected.");

    // Connect existing predeployed account 0 of Devnet
    const privateKey0 = "0x71d7bb07b9a64f6f78ac4c816aff4da9";
    const account0Address: string = "0x64b48806902a367c8598f4f95c305e8c1a1acba5f082d294a43793113115691";    
    const account0 = new Account(provider, account0Address, privateKey0);
    console.log('OZ account0 connected.\n');


    // new Open Zeppelin account v0.7.0 (Cairo 1) :

    // Generate public and private key pair.
    const privateKey = process.env.C20_NEW_ACCOUNT_PRIVKEY!;
    // or for random private key :
    //const privateKey = stark.randomAddress();
    console.log('New account :\nprivateKey=', privateKey);
    const starkKeyPub = ec.starkCurve.getStarkKey(privateKey);
    console.log('publicKey=', starkKeyPub);
    //declare OZ wallet contract
    const compiledOZAccount = json.parse(
        fs.readFileSync("./compiledContracts/cairo210/openzeppelin070Account.sierra.json").toString("ascii")
    );
    const casmOZAccount = json.parse(
        fs.readFileSync("./compiledContracts/cairo210/openzeppelin070Account.casm.json").toString("ascii")
    );
    const { transaction_hash: declTH, class_hash: decClassHash } = await account0.declare({ contract: compiledOZAccount, casm: casmOZAccount });
    console.log('OpenZeppelin account class hash =', decClassHash);
    await provider.waitForTransaction(declTH);

    // Calculate future address of the account
    const OZaccountConstructorCallData = CallData.compile({ publicKey: starkKeyPub });
    const OZcontractAddress = hash.calculateContractAddressFromHash( starkKeyPub,decClassHash, OZaccountConstructorCallData, 0);
    console.log('Precalculated account address=', OZcontractAddress);
    
    // fund account address before account creation
    const { data: answer } = await axios.post('http://127.0.0.1:5050/mint', { "address": OZcontractAddress, "amount": 10_000_000_000_000_000_000, "lite": true }, { headers: { "Content-Type": "application/json" } });
    console.log('Answer mint =', answer); // 10 ETH
    
    // deploy account
    const OZaccount = new Account(provider, OZcontractAddress, privateKey);
    const { suggestedMaxFee: estimatedFee1 } = await OZaccount.estimateAccountDeployFee({ 
        classHash: decClassHash, 
        addressSalt: starkKeyPub, 
        constructorCalldata: OZaccountConstructorCallData });
    const { transaction_hash, contract_address } = await OZaccount.deployAccount({ 
        classHash: decClassHash, 
        constructorCalldata: OZaccountConstructorCallData, 
        addressSalt: starkKeyPub 
    }, { maxFee: estimatedFee1*11n/10n });
    //const { transaction_hash, contract_address } = await OZaccount.deployAccount({ classHash: OZaccountClashHass, constructorCalldata: OZaccountConstructorCallData, addressSalt: starkKeyPub }); // without estimateFee
    console.log('✅ New OpenZeppelin account created.\n   final address =', contract_address);
    await provider.waitForTransaction(transaction_hash);

}
main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });