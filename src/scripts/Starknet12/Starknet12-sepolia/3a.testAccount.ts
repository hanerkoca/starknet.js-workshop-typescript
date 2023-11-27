// Check if public key is valid.
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
    const OZ080b1ClassHash = "0x00903752516de5c04fe91600ca6891e325278b2dfc54880ae11a809abb364844";
    const starkKeyPub = ec.starkCurve.getStarkKey(account0OZSepoliaPrivateKey);
    console.log("Calculated public key =", starkKeyPub);
    //const chId=await provider.getChainId();
    //console.log("chainId =",chId);
    const compiledOZcontract = await provider.getClassAt(account0OZSepoliaAddress);
    const contractOZ = new Contract(compiledOZcontract.abi, account0OZSepoliaAddress, OZaccount0);
    const pubK=await contractOZ.getPublicKey();
    console.log("recovered PubK =", "0x"+pubK.toString(16));
    console.log("✅ Test completed.");

}
main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });