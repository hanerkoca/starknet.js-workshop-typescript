// deploy in testnet a contracgt.
// launch with npx ts-node src/scripts/Starknet12/Starknet-testnet/2a.deployTestERC721.ts
// Coded with Starknet.js v5.24.3

import { constants, Provider, Contract, Account, json, shortString, RpcProvider, hash, CallData, Call, stark, InvokeFunctionResponse, Calldata, ec } from "starknet";
import fs from "fs";
import { account5TestnetAddress, account5TestnetPrivateKey } from "../../../A1priv/A1priv";
import { infuraKey, account4MainnetAddress, account4MainnetPrivateKey } from "../../../A-MainPriv/mainPriv";



async function main() {
    // initialize Provider
    //const provider = new RpcProvider({ nodeUrl: "http://127.0.0.1:5050/rpc" } ); // only starknet-devnet-rs
    // const provider = new RpcProvider({ nodeUrl: "https://json-rpc.starknet-testnet.public.lavanet.xyz" }); // testnet
    //const provider = new RpcProvider({ nodeUrl: "http://192.168.1.44:9545/rpc/v0.5" }); // local pathfinder testnet node
    const provider = new RpcProvider({ nodeUrl: "https://starknet-testnet.public.blastapi.io/rpc/v0.5" });

    // Check that communication with provider is OK
    const ci = await provider.getChainId();
    console.log("chain Id =", ci);

    // //devnet-rs
    //const accountAddress: string = "0x64b48806902a367c8598f4f95c305e8c1a1acba5f082d294a43793113115691";
    //const privateKey = "0x71d7bb07b9a64f6f78ac4c816aff4da9";

    // initialize existing Argent X testnet  account
    const accountAddress = account5TestnetAddress
    const privateKey = account5TestnetPrivateKey;

    // // initialize existing Argent X mainnet  account
    // const privateKey = account4MainnetPrivateKey;
    // const accountAddress = account4MainnetAddress
    const account0 = new Account(provider, accountAddress, privateKey);
    console.log('existing_ACCOUNT_ADDRESS=', accountAddress);
    console.log('existing account connected.\n');


    const contractClassHash = "0x028215c70c3a7ee45fc620cdc4ed8821b0d692f868e07b0e530465432934789d";
    const compiledContract = await provider.getClassByHash(contractClassHash);
    const myCallData = new CallData(compiledContract.abi);
    const constructor: Calldata = myCallData.compile(
        "constructor",
        {
            name: "Zorg is here2",
            symbol: "Zorg2",
            recipient: account0.address,
            token_ids: [1, 2, 3],
            token_uris: ["https://example.com/nft/1.json", "https://example.com/nft/2.json", "https://example.com/nft/3.json"],
        });
    const salt = stark.randomAddress();
    const addressDepl = hash.calculateContractAddressFromHash(ec.starkCurve.pedersen(account0.address, salt), contractClassHash, constructor, constants.UDC.ADDRESS);
    console.log("address=", addressDepl);
    const myCall: Call = {

        contractAddress: constants.UDC.ADDRESS,
        entrypoint: constants.UDC.ENTRYPOINT,
        calldata: CallData.compile({
            classHash: contractClassHash,
            salt: salt,
            unique: "1",
            calldata: constructor,
        }),
    };
    console.log("constructor =", constructor);
    console.log("Deploy of contract in progress...");
    // with account.deployContract()
    // const { transaction_hash: th2, address } = await account0.deployContract({ classHash: contractClassHash, constructorCalldata: constructor });
    // with account.execute()
    const { transaction_hash: txHDepl }: InvokeFunctionResponse = await account0.execute([myCall]); // you can add other txs here

    console.log("TxH =", txHDepl);
    await provider.waitForTransaction(txHDepl);
    console.log("✅ Test completed.");

}
main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
