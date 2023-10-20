// Connect to a Mainnet node, located in a remote computer in the local network.
// Launch with npx ts-node src/scripts/webSocket/1.balanceMainnetWebSocket.ts
// Coded with Starknet.js v5.21.0

import { Provider, RpcProvider, Contract, Account, json, uint256, shortString } from "starknet";
import { account4MainnetAddress, account4MainnetPrivateKey } from "../../A-MainPriv/mainPriv";
import fs from "fs";
import { formatBalance } from "../formatBalance";
import WebSocket from 'ws';
// import * as dotenv from "dotenv";
// dotenv.config();
function wait(delay: number) {
    return new Promise((res) => {
        setTimeout(res, delay);
    });
}

async function waitFor(f: Function) {
    while (!f()) await wait(200);
    return f();
}

async function main() {
    //initialize the Provider, with a rpc node located in the local network
    //const provider = new RpcProvider({ nodeUrl: 'wss://192.168.1.99:6061' });
    // with a Provider object : const provider = new Provider({ rpc: { nodeUrl: 'http://192.168.1.99:9545' } });
    // on the same computer : const provider = new Provider({ rpc: { nodeUrl: 'http://127.0.0.1:9545' } });
    let wsOpen: boolean = false;
    const start0 = new Date().getTime();
    let end0: number=0;
    const ws = new WebSocket("ws://192.168.1.99:6061");
    console.log("A");
    ws.on('open', function open() { end0 = new Date().getTime();wsOpen = true; });
    await waitFor(() => wsOpen);
    console.log("ws opened in",end0-start0,"ms.");
    //ws.on('open', function open() { ws.send('{"jsonrpc" : "2.0", "method" : "Starknet_chainId", "params" : [ "abc123" ], "id" : 1}'); });
    const start = new Date().getTime();
    let end: number;
    ws.send('{"jsonrpc" : "2.0", "method" : "starknet_chainId","params" : [],  "id" : 1}');
    console.log("B");

    ws.on('message', function message(data) {
        end = new Date().getTime();
        console.log('received: %s', data, ". Duration =", end - start, "ms.");
    });
    console.log("C");
    await wait(10 * 1000); // 10 sec
    ws.close();
    console.log("D");

    console.log('✅ Test completed.');

}
main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
