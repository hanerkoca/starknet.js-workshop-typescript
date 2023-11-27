// Create a new OpenZeppelin account in Starknet Sepolia testnet. Step 1/3
// launch with npx ts-node src/scripts/Starknet12/Starknet12-sepolia/3.deployOZaccount.ts
// Coded with Starknet.js v5.24.3
import { Account, ec, json, Provider, hash, CallData, RpcProvider, Contract, cairo, stark } from "starknet";
import fs from "fs";
import axios from "axios";
import * as dotenv from "dotenv";
dotenv.config();
import { account0OZSepoliaAddress, account0OZSepoliaPrivateKey, account2TestnetAddress, account2TestnetPrivateKey } from "../../../A1priv/A1priv";
import { infuraKey, account4MainnetAddress, account4MainnetPrivateKey } from "../../../A-MainPriv/mainPriv";
import { addrETH } from "../../../A2priv/A2priv";
import { junoNMtestnet } from "../../../A1priv/A1priv";


async function main() {
    const provider = new RpcProvider({ nodeUrl: "http://192.168.1.99:9545/rpc/v0.5" }); // local pathfinder sepolia testnet node


    // new Open Zeppelin account v0.8.0b1 :


    // deploy account
    const OZaccount0 = new Account(provider, account0OZSepoliaAddress, account0OZSepoliaPrivateKey);
    const OZ080b1ClassHash="0x00903752516de5c04fe91600ca6891e325278b2dfc54880ae11a809abb364844";
    const starkKeyPub = ec.starkCurve.getStarkKey(account0OZSepoliaPrivateKey);
    //const chId=await provider.getChainId();
    //console.log("chainId =",chId);

    const OZaccountConstructorCallData = CallData.compile({ publicKey: starkKeyPub });
    const resDeplAccount = await OZaccount0.deployAccount({
        classHash: OZ080b1ClassHash,
        constructorCalldata: OZaccountConstructorCallData,
        addressSalt: starkKeyPub
    });
    console.log("res =", resDeplAccount);
    const { transaction_hash, contract_address } = await OZaccount0.deployAccount({ classHash: OZ080b1ClassHash, constructorCalldata: OZaccountConstructorCallData, addressSalt: starkKeyPub }); 
    console.log("✅ New OpenZeppelin account created.txH =", resDeplAccount.transaction_hash, "\n   final address =", resDeplAccount.contract_address);
    await provider.waitForTransaction(resDeplAccount.transaction_hash);

}
main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });