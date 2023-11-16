// Test Devnet.
// launch with npx ts-node src/scripts/cairo12-devnet/8.deployRejected.ts
// Coded with Starknet.js v5.17.0

import {  RpcProvider,Provider,json } from "starknet";




async function main() {
    // initialize Provider 
     const provider = new RpcProvider({ nodeUrl: "http://127.0.0.1:5050/rpc" });
    // const provider = new Provider({ sequencer: { baseUrl: "http://127.0.0.1:5050" } });
    // const provider = new RpcProvider({ nodeUrl: "http://192.168.1.99:9545/rpc/v0.4" });

    // Check that communication with provider is OK
    const bl = await provider.getBlock('latest');
    console.log("Block =", bl.block_number);
    const chId = await provider.getChainId();
    console.log("Chain Id =", chId);

    

    console.log("✅ Test completed.");

}
main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });