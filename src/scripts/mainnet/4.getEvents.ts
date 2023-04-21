import { GetBlockResponse, RpcProvider } from 'starknet'
import { Provider, Account, Contract, ec, json, number, stark, Calldata } from "starknet";
import fs from "fs";
import { RawCalldata } from "starknet/dist/types/lib";
import * as dotenv from "dotenv";
dotenv.config();

async function main() {
    //...
    //initialize Provider with DEVNET, reading .env file
    if (process.env.STARKNET_PROVIDER_BASE_URL != "http://127.0.0.1:5050") {
        console.log("This script work only on local devnet.");
        process.exit(1);
    }
    const provider = new Provider({ sequencer: { baseUrl: process.env.STARKNET_PROVIDER_BASE_URL } });

    console.log('STARKNET_PROVIDER_BASE_URL=', process.env.STARKNET_PROVIDER_BASE_URL);

    // connect existing predeployed account 0 of Devnet
    console.log('OZ_ACCOUNT0_ADDRESS=', process.env.OZ_ACCOUNT0_DEVNET_ADDRESS);
    console.log('OZ_ACCOUNT0_PRIVATE_KEY=', process.env.OZ_ACCOUNT0_DEVNET_PRIVATE_KEY);
    const privateKey0 = process.env.OZ_ACCOUNT0_DEVNET_PRIVATE_KEY ?? "";
    const account0Address: string = process.env.OZ_ACCOUNT0_DEVNET_ADDRESS ?? "";
    const account0 = new Account(provider, account0Address, privateKey0);
    console.log('existing OZ account0 connected.\n');


    //let old_block: GetBlockResponse;
    const providerRPC = new RpcProvider({ nodeUrl: "http://192.168.1.99:9545" });
    let block = await providerRPC.getBlock('latest');
    console.log(block.block_number);
    let events = await providerRPC.getEvents({
        //address: account0Address,
        from_block: {
            block_number: block.block_number
        },
        to_block: {
            block_number: block.block_number
        },
        chunk_size: 1000
    });
    //console.log(events);
    const datas=events.events.map(ev=>{ev.keys});
    console.log(datas);
    //setInterval(function () { callFunction() }, 10000)
}
main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });

// async function callFunction() {
//     let block = await providerRPC.getBlock('latest');
//     console.log(block)

//     if (block == old_block) {
//         return;
//     }

//     let events = await provider.getEvents({
//         address: process.env.CONTRACT_ADDRESS,
//         from_block: {
//             block_number: block.block_number
//         },
//         to_block: {
//             block_number: block.block_number
//         },
//         chunk_size: 1000
//     })

//     console.log(events)

//     old_block = block
// }