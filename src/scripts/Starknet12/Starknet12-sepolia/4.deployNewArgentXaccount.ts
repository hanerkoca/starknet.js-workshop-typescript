// Deploy in Sepolia a new ArgentX wallet (Cairo1 0.3.0).
// launch with : npx ts-node src/scripts/Starknet12/Starknet12-sepolia/4.DeployNewArgentXaccount.ts
// Coded with Starknet.js v5.24.3

import { RpcProvider, Account, ec, json, stark, hash, CallData, Contract, cairo, Call, num } from "starknet";
import { account7TestnetAddress, account7TestnetPrivateKey, account0OZSepoliaAddress,account0OZSepoliaPrivateKey } from "../../../A1priv/A1priv";
import fs from "fs";
import { ethAddress } from "../../utils/constants";

async function main() {
    const provider = new RpcProvider({ nodeUrl: "http://192.168.1.44:9545/rpc/v0.5" });
    console.log("Provider connected.");
    const chId = await provider.getChainId(); console.log("chId =", chId);
    // initialize existing predeployed account 0 of Devnet
    
    const privateKey0=account0OZSepoliaPrivateKey;
    const accountAddress0 = account0OZSepoliaAddress;
    const account0 = new Account(provider, accountAddress0, privateKey0);
    console.log("Account 0 connected.\n");

    const accountAXsierra = json.parse(fs.readFileSync("./compiledContracts/cairo200/ArgentXaccount030.sierra.json").toString("ascii"));
    const ch = hash.computeContractClassHash(accountAXsierra);
    console.log("Class Hash of ArgentX contract =", ch);

    // Calculate future address of the ArgentX account
    const privateKeyAX: string =num.toHexString (account7TestnetPrivateKey);
    console.log('AX account Private Key =', privateKeyAX);
    console.log("Store safely this private key!!!");
    const starkKeyPubAX = ec.starkCurve.getStarkKey(privateKeyAX);
    console.log('AX account Public Key  =', starkKeyPubAX);


    const contractAXclassHash = "0x1a736d6ed154502257f02b1ccdf4d9d1089f80811cd6acad48e6b6a9d1f2003"; // ArgentX Cairo 1 v0.3.0

    const calldataAX = new CallData(accountAXsierra.abi);
    const ConstructorAXCallData = calldataAX.compile("constructor", {
        owner: starkKeyPubAX,
        guardian: "0"
    });
    const accountAXAddress = hash.calculateContractAddressFromHash(starkKeyPubAX, contractAXclassHash, ConstructorAXCallData, 0);
    console.log('Precalculated account address=', accountAXAddress);

    //process.exit(1);
    // fund account address before account creation
    const transferCall: Call = {
        contractAddress: ethAddress,
        entrypoint: "transfer",
        calldata: CallData.compile([accountAXAddress, cairo.uint256(5 * 10 ** 15)])
    };
    const txHtransfer = await account0.execute(transferCall);
    console.log("new account funded."); // 0.005 ETH
    await provider.waitForTransaction(txHtransfer.transaction_hash);

    // deploy ArgentX account
    const accountAX = new Account(provider, accountAXAddress, privateKeyAX);
    const deployAccountPayload = {
        classHash: contractAXclassHash,
        constructorCalldata: ConstructorAXCallData,
        contractAddress: accountAXAddress,
        addressSalt: starkKeyPubAX
    };
    const { transaction_hash: AXdAth, contract_address: accountAXFinalAdress } = await accountAX.deployAccount(deployAccountPayload);
    console.log("Final address =", accountAXFinalAdress);
    await provider.waitForTransaction(AXdAth);
    console.log('✅ ArgentX wallet deployed.');

}
main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });