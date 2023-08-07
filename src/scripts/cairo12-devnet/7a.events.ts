// declare & deploy a Cairov2.0.0 contract with storage.
// use Starknet.js v5.16.0, starknet-devnet 0.5.5
// launch with npx ts-node src/scripts/cairo12-devnet/6.declareThenDeployStorage.ts

import { Provider, Account, Contract, json, constants, GetTransactionReceiptResponse, InvokeFunctionResponse, cairo, CallData, RpcProvider, SequencerProvider, hash, ec, Calldata, Call } from "starknet";
import fs from "fs";
import { accountTestnet4privateKey, accountTestnet4Address } from "../../A1priv/A1priv"
import * as dotenv from "dotenv";
import { resetDevnetNow } from "../resetDevnetFunc";
dotenv.config();

//          👇👇👇
// 🚨🚨🚨   Launch 'starknet-devnet --seed 0' before using this script.
//          👆👆👆


async function main() {
    //initialize Provider 
    // Devnet sequencer :
    const providerDevnetSequencer = new SequencerProvider({ baseUrl: "http://127.0.0.1:5050" });
    // Devnet rpc :
    const providerDevnetRpc = new RpcProvider({ nodeUrl: "http://127.0.0.1:5050/rpc" });
    const provider = providerDevnetRpc;
    console.log('✅ Connected to devnet.');
    // const provider = new Provider({ sequencer: { network: constants.NetworkName.SN_GOERLI } });

    // initialize existing predeployed account 0 of Devnet
    const privateKey = "0xe3e70682c2094cac629f6fbed82c07cd";
    const accountAddress: string = "0x7e00d496e324876bbc8531f2d9a82bf154d1a04a50218ee74cdd372f75a551a";
    // const privateKey=accountTestnet4privateKey;
    // const accountAddress=accountTestnet4Address;
    const account0 = new Account(provider, accountAddress, privateKey);
    console.log('✅ Predeployed account connected\nOZ_ACCOUNT_ADDRESS=', account0.address);




    // Connect the  contract  :
    const compiledTest = json.parse(fs.readFileSync("./compiledContracts/cairo200/event.sierra.json").toString("ascii"));
    //          👇👇👇 update address in accordance with result of script 7
    const address = "0x5bb1e9e8fcb87582ad60fb418181607c85168fcc858c30c9a0f0f889dee71ca"
    const myTestContract = new Contract(compiledTest.abi, address, provider);
    myTestContract.connect(account0);
    console.log('✅ Test Contract connected at =', myTestContract.address);

    // test events
    const simpleKeyVariable = 0n;
    const simpleKeyStruct = {
        first: 1n,
        second: 2n,
    };
    const simpleKeyArray = [3n, 4n, 5n];
    const simpleDataVariable = 6n;
    const simpleDataStruct = {
        first: 7n,
        second: 8n,
    };
    const simpleDataArray = [9n, 10n, 11n];

    const myCalldata1 = myTestContract.populate("emitEventRegular", [
        simpleKeyVariable,
        simpleKeyStruct,
        simpleKeyArray,
        simpleDataVariable,
        simpleDataStruct,
        simpleDataArray]);
    const myCalldata2 = myTestContract.populate("emitEventRegular", [
        100,
        simpleKeyStruct,
        simpleKeyArray,
        simpleDataVariable,
        simpleDataStruct,
        simpleDataArray]);
    console.log(myCalldata2)

    const { transaction_hash } = await account0.execute([myCalldata1, myCalldata2]);
    const tx = await provider.waitForTransaction(transaction_hash);
    const events = myTestContract.parseEvents(tx);
    console.log("events =", events);

    let block = await provider.getBlock('latest');
    console.log("bloc #", block.block_number);
    let eventsRes = await provider.getEvents({
        from_block: {
            block_number: block.block_number
        },
        to_block: {
            block_number: block.block_number
        },
        address: address,
        chunk_size: 400
    });
    const nbEvents = eventsRes.events.length;
    console.log(nbEvents, 'events recovered.');
    for (let i = 0; i < nbEvents; i++) {
        const event = eventsRes.events[i];
        console.log("event #", i, "data length =", event.data.length, "key length =", event.keys.length, ":");
        console.log("data =", event.data, "\nkeys =", event.keys)
    }


    console.log("✅ Test completed.");
}
main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });