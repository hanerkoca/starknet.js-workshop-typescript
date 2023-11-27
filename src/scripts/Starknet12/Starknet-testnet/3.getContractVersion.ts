// test getContractVersion.
// launch with npx ts-node src/scripts/cairo12-testnet/3.getContractVersion.ts
// Coded with Starknet.js v5.22.0

import { constants, Provider, Contract, Account, json, shortString, RpcProvider, hash } from "starknet";
import fs from "fs";
import { account5TestnetAddress, account5TestnetPrivateKey } from "../../../A1priv/A1priv";
import { infuraKey, account4MainnetAddress, account4MainnetPrivateKey } from "../../../A-MainPriv/mainPriv";


async function main() {
    // initialize Provider 
    //const provider = new RpcProvider({ nodeUrl: "http://127.0.0.1:5050/rpc" } ); // only starknet-devnet-rs
    // const provider = new RpcProvider({ nodeUrl: "https://json-rpc.starknet-testnet.public.lavanet.xyz" }); // testnet
    const provider = new RpcProvider({ nodeUrl: "https://goerli1-juno.rpc.nethermind.io:443" }); // testnet
    //const provider = new RpcProvider({ nodeUrl: "http://192.168.1.99:9545/rpc/v0.4" }); // local pathfinder testnet node

    // Check that communication with provider is OK
    const ci = await provider.getChainId();
    console.log("chain Id =", ci);

    // initialize existing Argent X testnet  account
     const accountAddress = account5TestnetAddress
     const privateKey = account5TestnetPrivateKey;

    // // initialize existing Argent X mainnet  account
    // const privateKey = account4MainnetPrivateKey;
    // const accountAddress = account4MainnetAddress
    const account0 = new Account(provider, accountAddress, privateKey);
    console.log('existing_ACCOUNT_ADDRESS=', accountAddress);
    console.log('existing account connected.\n');


    const contractAddress="0x026323fcf6baB7B20Cf853364DFCE2cb595Ceca04e890416Fb3FED54c54fc42d";
    const contractClassHash="0x05ac6d31b144cf3ba85e62f63d26f7b0dd931525f8e2eb0f5aa33ba3c4e37614";
    const res=await provider.getContractVersion(contractAddress);
    console.log(res);
    const res2=await provider.getContractVersion(undefined, contractClassHash);
    console.log(res2);


    console.log("✅ Test completed.");

}
main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });