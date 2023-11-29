// test in testnet/rpc0.5.0 a contract that can be rejected.
// launch with npx ts-node src/scripts/cairo12/cairo12-testnet/6.testTxResponse.ts
// Coded with Starknet.js v5.23.0

import { constants, Contract, Account, json, shortString, RpcProvider } from "starknet";
import { account2TestnetAddress, account2TestnetPrivateKey } from "../../../A1priv/A1priv";

import fs from "fs";
import * as dotenv from "dotenv";
import { alchemyKey, blastKey, infuraKey, lavaMainnetKey } from "../../../A-MainPriv/mainPriv";
dotenv.config();

declare enum StarknetChainId {
    SN_MAIN = "0x534e5f4d41494e",
    SN_GOERLI = "0x534e5f474f45524c49",
    SN_SEPOLIA = "0x534e5f5345504f4c4941",
}

async function testProvider(providerUrl: string): Promise<string> {
    const provider = new RpcProvider({ nodeUrl: providerUrl });
    let chId: StarknetChainId;
    let result: string = "*** " + providerUrl;

    try {
        chId = await provider.getChainId();
        if (chId) {
            result = result + "\nProvider is working fine.";
            try {
                const resp = await provider.getSpecVersion();
                result = result + "\nThis provider use a rpc version " + resp;
            } catch {
                result = result + "\nThis provider use a rpc version 0.4.0 or older.";
            }
        } else {
            result = result + "\nThis provider is not working properly.";
        }
    } catch {
        result = result + "\nThis provider is not working properly.";
    }
    return result;
}

async function main() {

    const listProvider = [
        "https://starknet-goerli.g.alchemy.com/v2/" + alchemyKey,
        "https://starknet-goerli.g.alchemy.com/starknet/version/rpc/v0.5/" + alchemyKey,
        'https://starknet-goerli.infura.io/v3/' + infuraKey,
        'https://starknet-goerli.infura.io/rpc/v0.5/' + infuraKey,
        'https://starknet-testnet.blastapi.io/' + blastKey + "/rpc/v0.5",
        "https://starknet-testnet.public.blastapi.io/rpc/v0.4",
        "https://starknet-testnet.public.blastapi.io/rpc/v0.5",
        "https://limited-rpc.nethermind.io/goerli-juno",
        "https://json-rpc.starknet-testnet.public.lavanet.xyz",
        'http://192.168.1.99:9545/rpc/v0.4',
        'http://192.168.1.99:9545/rpc/v0.5',
        'http://192.168.1.99:9545/rpc/v0_5',
        "https://starknet-mainnet.g.alchemy.com/starknet/version/rpc/v0.5/" + alchemyKey,
        "https://starknet-mainnet.infura.io/v3/" + infuraKey,
        "https://starknet-mainnet.blastapi.io/" + blastKey + "/rpc/v0.5",
        "https://starknet-testnet.public.blastapi.io/rpc/v0.5",
        "https://limited-rpc.nethermind.io/mainnet-juno/v0_5",
        "https://g.w.lavanet.xyz:443/gateway/strk/rpc-http/" + lavaMainnetKey,
        "https://json-rpc.starknet-mainnet.public.lavanet.xyz",
        "http://192.168.1.99:6060/v0_5",
    ]

    for (const url of listProvider) {
        console.log(await testProvider(url) + "\n");
    }

    console.log("✅ Test completed.");

}
main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });