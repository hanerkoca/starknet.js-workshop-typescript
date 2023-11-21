
// recover events of devnet
// use Starknet.js v5.17.0, Devnet 0.5.5
// launch with npx ts-node src/scripts/cairo13-devnet/4.Events.ts

import { Account,Contract, RpcProvider, json } from 'starknet'
import fs from "fs";

//          👇👇👇
// 🚨🚨🚨   Launch 'starknet-devnet --seed 0
// launch script 1 before this script.
//          👆👆👆
async function main() {

    // Devnet rpc :
    const providerDevnetRpc = new RpcProvider({ nodeUrl: "http://127.0.0.1:5050/rpc" });
    const providerRPC = providerDevnetRpc;

    // initialize existing predeployed account 0 of Devnet
    const privateKey = "0xe3e70682c2094cac629f6fbed82c07cd";
    const accountAddress: string = "0x7e00d496e324876bbc8531f2d9a82bf154d1a04a50218ee74cdd372f75a551a";
    const account0 = new Account(providerRPC, accountAddress, privateKey);
    console.log('✅ Predeployed account connected\nOZ_ACCOUNT_ADDRESS=', account0.address);

    // Connect the  contract instance :
    //          👇👇👇 update address in accordance with result of script 1
    const address = "0x45b73ec5c290f6a5ed780bcde055ba5d914e1931ac3f04be9c51d091bbe2094";
    const compiledTest = json.parse(fs.readFileSync("./compiledContracts/cairo210/PhilTest2.sierra.json").toString("ascii"));
    const myTestContract = new Contract(compiledTest.abi, address, providerRPC);
    myTestContract.connect(account0);
    console.log('✅ Test Contract connected at =', myTestContract.address);


    let block = await providerRPC.getBlock('latest');
    console.log("bloc #", block.block_number);
    let eventsRes = await providerRPC.getEvents({
        from_block: {
            block_number: block.block_number - 2
        },
        to_block: {
            block_number: block.block_number
        },
        // address: account0Address,
        // keys:[],
        chunk_size: 400
    });
    const nbEvents = eventsRes.events.length;
    console.log(nbEvents, 'events recovered.');
    if (nbEvents >= 3) {
        for (let i = 0; i < 3; i++) {
            const event = eventsRes.events[i];
            console.log("event #", i, "data length =", event.data.length, "key length =", event.keys.length, ":");
            console.log("data =", event.data, "\nkeys =", event.keys)
        }
    }

    const {transaction_hash:txh}=await myTestContract.increase_counter(10);
    const txR= await providerRPC.waitForTransaction(txh);
    console.log("receipt events =",txR.events.length,txR.events);
}
main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });

