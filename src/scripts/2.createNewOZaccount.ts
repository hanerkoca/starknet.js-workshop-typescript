// marche pas (encore).
// create a new OZ account in devnet
import { Account, Contract, defaultProvider, ec, json, stark, Provider, number, hash } from "starknet";
import { ec as EC } from "elliptic";
import fs from "fs";
import readline from "readline";
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
    console.log('OZ_ACCOUNT0_ADDRESS=', process.env.OZ_ACCOUNT_ADDRESS);
    console.log('OZ_ACCOUNT0_PRIVATE_KEY=', process.env.OZ_ACCOUNT_PRIVATE_KEY);
    const privateKey0 = process.env.OZ_ACCOUNT_PRIVATE_KEY ?? "";
    const starkKeyPair0 = ec.getKeyPair(privateKey0);
    const account0Address: string = process.env.OZ_ACCOUNT_ADDRESS ?? "";
    const account0 = new Account(provider, account0Address, starkKeyPair0);
    console.log('OZ account0 connected.');


    // new Open Zeppelin account :

    // Generate public and private key pair.
    const privateKey: EC.GenKeyPairOptions = { entropy: stark.randomAddress() };
    console.log('privateKey=', privateKey.entropy);
    const starkKeyPair = ec.genKeyPair(privateKey);
    const starkKeyPub = ec.getStarkKey(starkKeyPair);
    console.log('publicKey=', starkKeyPub);
    //declare OZ wallet contract
    const compiledOZAccount = json.parse(
        fs.readFileSync("./compiledContracts/Account.json").toString("ascii")
    );
    // Calculate Class Hash (calculated manually outside this script)
    const OZaccountClashHass = "0x22356f2d6d2eca698c2255bdb3ac6357c6c82ba5cfd04f00f426009c11a1325";
    const { transaction_hash: declTH, class_hash: decCH } = await account0.declare({ classHash: OZaccountClashHass, contract: compiledOZAccount });

    console.log('OpenZeppelin account class hash =', OZaccountClashHass, " ", decCH);
    // Calculate future address of the account
    //const OZaccountConstructorCallData = stark.compileCalldata({ implementation: OZaccountClashHass, selector: hash.getSelectorFromName("initialize"), calldata: stark.compileCalldata({ publicKey: starkKeyPub }) });
    const OZaccountConstructorCallData = stark.compileCalldata({ publicKey: starkKeyPub });
    const OZcontractAddress = hash.calculateContractAddressFromHash(starkKeyPub, OZaccountClashHass, OZaccountConstructorCallData, 0);
    const OZcontractAddress2 = hash.calculateContractAddressFromHash(starkKeyPub, OZaccountClashHass, [starkKeyPub], 0);
    console.log('Precalculated account address=', OZcontractAddress, " ", OZcontractAddress2);
    // fund account address before account creation
    const { data: answer } = await axios.post('http://127.0.0.1:5050/mint', { "address": OZcontractAddress, "amount": 50_000_000_000_000_000_000, "lite": true }, { headers: { "Content-Type": "application/json" } });
    console.log('Answer mint =', answer);
    // deploy account
    const OZaccount = new Account(provider, OZcontractAddress, starkKeyPair);
    const { transaction_hash, contract_address } = await OZaccount.deployAccount({ classHash: OZaccountClashHass, constructorCalldata: OZaccountConstructorCallData, contractAddress: OZcontractAddress, addressSalt: starkKeyPub });
    console.log('OpenZeppelin account final address =', contract_address);



}
main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });