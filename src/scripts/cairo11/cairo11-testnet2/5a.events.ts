// Test events in testnet2 with RPC
// use Starknet.js v5.19.0
// launch with npx ts-node src/scripts/cairo11-testnet2/5a.events.ts

import { Provider, Account, Contract, json, constants, GetTransactionReceiptResponse, cairo, CallData, RpcProvider, SequencerProvider, hash, ec, Calldata, Call, num } from "starknet";
import fs from "fs";
import { accountTestnet4privateKey, accountTestnet4Address } from "../../A1priv/A1priv";
import { accountTestnet2ArgentX1Address, accountTestnet2ArgentX1privateKey, TonyNode } from "../../A2priv/A2priv";

import * as dotenv from "dotenv";
import { resetDevnetNow } from "../resetDevnetFunc";
dotenv.config();


async function main() {
    //initialize Provider 
    // Devnet sequencer :
    const providerDevnetSequencer = new SequencerProvider({ baseUrl: "http://127.0.0.1:5050" });
    // Devnet rpc :
    const providerDevnetRpc = new RpcProvider({ nodeUrl: "http://127.0.0.1:5050/rpc" });
    // remote Tesnet2 pathfinder node
    const provider = new RpcProvider({ nodeUrl: TonyNode });;
    console.log('✅ Connected to Testnet 2.');
    // const provider = new Provider({ sequencer: { network: constants.NetworkName.SN_GOERLI } });

    // initialize existing predeployed account 0 of Devnet
    const privateKey = "0xe3e70682c2094cac629f6fbed82c07cd";
    const accountAddress: string = "0x7e00d496e324876bbc8531f2d9a82bf154d1a04a50218ee74cdd372f75a551a";
    // const privateKey=accountTestnet4privateKey;
    // const accountAddress=accountTestnet4Address;
    const account0 = new Account(provider, accountTestnet2ArgentX1Address, accountTestnet2ArgentX1privateKey);
    console.log('✅ Deployed account connected\nACCOUNT_ADDRESS=', account0.address);




    // Connect the  contract  :
    const compiledTest = json.parse(fs.readFileSync("./compiledContracts/cairo210/hello_events.sierra.json").toString("ascii"));
    const address = "0x0047cb13bf174043adde61f7bea49ab2d9ebc575b0431f85bcbfa113a6f93fc4"
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

    const myCall1 = myTestContract.populate("emitEventRegular", [
        simpleKeyVariable,
        simpleKeyStruct,
        simpleKeyArray,
        simpleDataVariable,
        simpleDataStruct,
        simpleDataArray]);
    const myCall2 = myTestContract.populate("emitEventRegular", [
        100,
        simpleKeyStruct,
        simpleKeyArray,
        simpleDataVariable,
        simpleDataStruct,
        simpleDataArray]);
    const myCall3 = myTestContract.populate("emitEventPanic", [8, "Mega Panic."]);
    const myCall4 = myTestContract.populate("emitEventNested", [
        {
            simpleStruct: { first: 4, second: 5 },
            simpleArray: [6, 7]
        }
        , {
            simpleStruct: { first: 8, second: 9 },
            simpleArray: [10, 11]
        }
    ]);
    // console.log(myCall4)

    // const { transaction_hash } = await account0.execute([myCall1, myCall2, myCall3, myCall4]);
    // const txReceipt = await provider.waitForTransaction(transaction_hash);
    // console.log("TxReceipt.events =",txReceipt.events);
    // const events = myTestContract.parseEvents(txReceipt);
    // console.log("events =", events);
    // console.log("hash of name :", num.toHex(hash.starknetKeccak("EventPanic")));
    const keyFilter = [num.toHex(hash.starknetKeccak("EventPanic")), "0x8"]
    let block = await provider.getBlock('latest');
    console.log("bloc #", block.block_number);

    let continuationToken: string | undefined = "0";
    let chunkNum: number = 1;
    while (continuationToken) {
        const eventsRes = await provider.getEvents({
            from_block: {
                block_number: block.block_number - 30
            },
            to_block: {
                block_number: block.block_number
            },
            address: address,
            keys: [keyFilter],

            chunk_size: 5,
            continuation_token: continuationToken
        });
        const nbEvents = eventsRes.events.length;
        continuationToken = eventsRes.continuation_token;
        console.log("chunk nb =", chunkNum, ".", nbEvents, "events recovered.");
        console.log("continuation_token =", continuationToken);
        for (let i = 0; i < nbEvents; i++) {
            const event = eventsRes.events[i];
            console.log("event #", i, "data length =", event.data.length, "key length =", event.keys.length, ":");
            console.log("\nkeys =", event.keys, "data =", event.data)
        }
        chunkNum++;
    }

    const pendingTx = await provider.getPendingTransactions();
    console.log("pending", pendingTx);

    console.log("✅ Test completed.");
}
main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });

//keys:[['0x3ba972537cb2f8e811809bba7623a2119f4f1133ac9e955a53d5a605af72bf2','0x8']],