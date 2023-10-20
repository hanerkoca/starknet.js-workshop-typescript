// create a new OZ account in testnet
// launch with npx ts-node src/scripts/cairo12-testnet/1. deployOZaccount.ts
// Coded with Starknet.js v5.21.0, Starknet-devnet v0.6.3

import { Account, ec, json, Provider, hash, CallData, RpcProvider, Contract, cairo, stark } from "starknet";
import fs from "fs";
import axios from "axios";
import * as dotenv from "dotenv";
dotenv.config();
import { account5TestnetAddress, account5TestnetPrivateKey } from "../../A1priv/A1priv";
import { infuraKey, account4MainnetAddress, account4MainnetPrivateKey } from "../../A-MainPriv/mainPriv";
import { addrETH } from "../../A2priv/A2priv";
import { junoNMtestnet } from "../../A1priv/A1priv";


async function main() {
    // const provider = new RpcProvider({ nodeUrl: "http://127.0.0.1:5050/rpc" } ); // only starknet-devnet-rs
    const provider = new RpcProvider({ nodeUrl: "http://192.168.1.99:9545/rpc/v0.4" }); // local pathfinder testnet node
    // const provider = new RpcProvider({ nodeUrl: junoNMtestnet }); // local pathfinder testnet node
    console.log("Provider connected.");

    // // Connect existing predeployed account 0 of Devnet
    // const privateKey0 = "0x71d7bb07b9a64f6f78ac4c816aff4da9";
    // const account0Address: string = "0x64b48806902a367c8598f4f95c305e8c1a1acba5f082d294a43793113115691";

    // testnet
    const privateKey0 = account5TestnetPrivateKey;
    const account0Address = account5TestnetAddress;

    const account0 = new Account(provider, account0Address, privateKey0);
    console.log('AX account3 connected.\n');


    // new Open Zeppelin account v0.7.0 (Cairo v2.1.0) :

    // Generate public and private key pair.
    //const privateKey = process.env.C20_NEW_ACCOUNT_PRIVKEY!;
    // or for random private key :
    const privateKey = stark.randomAddress();
    console.log('New account :\nprivateKey=', privateKey);
    const starkKeyPub = ec.starkCurve.getStarkKey(privateKey);
    console.log('publicKey=', starkKeyPub);
    //declare OZ wallet contract
    const compiledOZAccount = json.parse(
        fs.readFileSync("./compiledContracts/cairo230/openzeppelin070Account.sierra.json").toString("ascii")
    );
    const casmOZAccount = json.parse(
        fs.readFileSync("./compiledContracts/cairo230/openzeppelin070Account.casm.json").toString("ascii")
    );
    // class hash Cairo 2.1.0 : 0xd582780834aefc0a0bf84909d9be00cda0b657d607c7a856a142ce652c23c3
    // class hash Cairo 2.2.0 : 0x2bfd9564754d9b4a326da62b2f22b8fea7bbeffd62da4fcaea986c323b7aeb

    const calculatedClassHash = hash.computeSierraContractClassHash(compiledOZAccount);
    console.log("calculated class hash =", calculatedClassHash);
    const { transaction_hash: declTH, class_hash: decClassHash } = await account0.declare({ contract: compiledOZAccount, casm: casmOZAccount });
    //const decClassHash = "0x2bfd9564754d9b4a326da62b2f22b8fea7bbeffd62da4fcaea986c323b7aeb"; // cairo v2.1.0
    console.log('OpenZeppelin account class hash =', decClassHash);
    const txR=await provider.waitForTransaction(declTH);
    console.log("txR =",txR);

    // Calculate future address of the account
    const OZaccountConstructorCallData = CallData.compile({ publicKey: starkKeyPub });
    const OZcontractAddress = hash.calculateContractAddressFromHash(starkKeyPub, decClassHash, OZaccountConstructorCallData, 0);
    console.log('Precalculated account address=', OZcontractAddress);

    // fund account address before account creation

    const ethSierra = json.parse(fs.readFileSync("./compiledContracts/cairo060/erc20ETH.json").toString("ascii"));
    const ethContract = new Contract(ethSierra.abi, addrETH, provider);
    const call1 = ethContract.populate("transfer", {
        recipient: OZcontractAddress,
        amount: cairo.uint256(5 * 10 ** 15)
    })
    console.log("call1 =", call1);
    //process.exit(2);
    const res = await account0.execute(call1);
    await provider.waitForTransaction(res.transaction_hash);
    console.log("transfered 0.005 ETH");

    // deploy account
    const OZaccount = new Account(provider, OZcontractAddress, privateKey);
    const { suggestedMaxFee: estimatedFee1 } = await OZaccount.estimateAccountDeployFee({
        classHash: decClassHash,
        addressSalt: starkKeyPub,
        constructorCalldata: OZaccountConstructorCallData
    });
    const resDeplAccount = await OZaccount.deployAccount({
        classHash: decClassHash,
        constructorCalldata: OZaccountConstructorCallData,
        addressSalt: starkKeyPub
    }, { maxFee: estimatedFee1 * 11n / 10n });
    console.log("res =", resDeplAccount);
    //const { transaction_hash, contract_address } = await OZaccount.deployAccount({ classHash: OZaccountClashHass, constructorCalldata: OZaccountConstructorCallData, addressSalt: starkKeyPub }); // without estimateFee
    console.log("✅ New OpenZeppelin account created.txH =", resDeplAccount.transaction_hash, "\n   final address =", resDeplAccount.contract_address);
    await provider.waitForTransaction(resDeplAccount.transaction_hash);

}
main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });