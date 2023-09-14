// Deploy a new ArgentX wallet (Cairo1 0.3.0).
// launch with : npx ts-node src/scripts/.ts
// Coded with Starknet.js v5.19.5


import { Provider, RpcProvider, Account, ec, json, stark, hash, CallData, Contract } from "starknet";
import { infuraKey } from "../A-MainPriv/mainPriv";
import { account7TestnetPrivateKey } from "../A1priv/A1priv";

import fs from "fs";
import axios from "axios";
import * as dotenv from "dotenv";
dotenv.config();


//          👇👇👇
// 🚨🚨🚨   Launch 'starknet-devnet --seed 0 --fork-network alpha-goerli -p 5100' before using this script.
//          👆👆👆
async function main() {

    const provider = new Provider({ sequencer: { baseUrl: "http://127.0.0.1:5100" } });

    // connect existing predeployed account 0 of Devnet
    console.log('OZ_ACCOUNT0_ADDRESS=', process.env.OZ_ACCOUNT0_DEVNET_ADDRESS);
    console.log('OZ_ACCOUNT0_PRIVATE_KEY=', process.env.OZ_ACCOUNT0_DEVNET_PRIVATE_KEY);
    const privateKey0 = process.env.OZ_ACCOUNT0_DEVNET_PRIVATE_KEY ?? "";
    const account0Address: string = process.env.OZ_ACCOUNT0_DEVNET_ADDRESS ?? "";
    const account0 = new Account(provider, account0Address, privateKey0);
    console.log('existing OZ account0 connected.\n');

    const contractAXclassHash = "0x1a736d6ed154502257f02b1ccdf4d9d1089f80811cd6acad48e6b6a9d1f2003";

    const accountAXcompiled = json.parse(fs.readFileSync("./compiledContracts/cairo210/argentXaccount030.sierra.json").toString("ascii"));


    // Calculate future address of the ArgentX account
    const privateKeyAX = account7TestnetPrivateKey;
    console.log('AX account Private Key =', privateKeyAX);
    const starkKeyPubAX = ec.starkCurve.getStarkKey(privateKeyAX);
    console.log('AX account Public Key  =', starkKeyPubAX);
    const calldataAX = new CallData(accountAXcompiled.abi);
    const ConstructorAXCallData = calldataAX.compile("constructor", {
        owner: starkKeyPubAX,
        guardian: "0"
    });
    const accountAXAddress = hash.calculateContractAddressFromHash(starkKeyPubAX, contractAXclassHash, ConstructorAXCallData, 0);
    console.log('Precalculated account address=', accountAXAddress);

    // fund account address before account creation
    const { data: answer } = await axios.post('http://127.0.0.1:5100/mint', { "address": accountAXAddress, "amount": 10_000_000_000_000_000_000, "lite": true }, { headers: { "Content-Type": "application/json" } });
    console.log('Answer mint =', answer);

    // deploy ArgentX account
    const accountAX = new Account(provider, accountAXAddress, privateKeyAX, "1");
    const deployAccountPayload = {
        classHash: contractAXclassHash,
        constructorCalldata: ConstructorAXCallData,
        contractAddress: accountAXAddress,
        addressSalt: starkKeyPubAX
    };
    const { transaction_hash: AXdAth, contract_address: accountAXFinalAdress } = await accountAX.deployAccount(deployAccountPayload);
    console.log('Transaction hash =', AXdAth);
    await provider.waitForTransaction(AXdAth);
    console.log('✅ ArgentX wallet deployed.');

}
main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });