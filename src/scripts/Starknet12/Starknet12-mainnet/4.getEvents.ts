// recover events on a mainnet node, located in the local network
// use Starknet.js v5.9.1
// launch with npx ts-node src/scripts/mainnet/4.getEvents.ts

import { RpcProvider } from 'starknet'

async function main() {

    const providerRPC = new RpcProvider({ nodeUrl: "http://192.168.1.99:9545" });
    let block = await providerRPC.getBlock('latest');
    console.log("bloc #", block.block_number);
    let eventsRes = await providerRPC.getEvents({
        from_block: {
            block_number: block.block_number-10
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
}
main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });

