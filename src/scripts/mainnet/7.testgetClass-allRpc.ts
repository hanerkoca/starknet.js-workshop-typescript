// Try to read a contract in a network, and to redeploy on an other nerwork.
// Launch with npx ts-node src/scripts/mainnet/7.testgetClass.ts
// Coded with Starknet.js v5.14.1

import { Provider, RpcProvider, Contract, Account, json, uint256, Abi, constants, shortString, CompiledContract, ContractClass, RPC, SequencerProvider, ContractClassResponse, stark, contractClassResponseToLegacyCompiledContract, LegacyCompiledContract, hash, num } from "starknet";
import { alchemyKey, infuraKey, blastKey, lavaMainnetKey } from "../../A-MainPriv/mainPriv";
import { account4MainnetAddress, account4MainnetPrivateKey, junoNMmainnet } from "../../A-MainPriv/mainPriv";
import { account2TestnetAddress, account2TestnetPrivateKey, junoNMtestnet } from "../../A1priv/A1priv";
import { junoNMtestnet2 } from "../../A2priv/A2priv";
import { resetDevnetNow } from "../resetDevnetFunc";
import fs from "fs";
import axios from 'axios';
import * as dotenv from "dotenv";
dotenv.config();

async function main() {
    // ******* MAINNET ************
    // Alchemy node rpc for Mainnet (do not work today) :
    const providerAlchemyMainnet = new RpcProvider({ nodeUrl: 'https://starknet-mainnet.g.alchemy.com/v2/' + alchemyKey });
    // Infura node rpc for Mainnet :
    const providerInfuraMainnet = new RpcProvider({ nodeUrl: 'https://starknet-mainnet.infura.io/v3/' + infuraKey });
    // Blast node rpc for mainnet :
    const providerBlastMainnet = new RpcProvider({ nodeUrl: 'https://starknet-mainnet.blastapi.io/' + blastKey + "/rpc/v0.4" });
    // Nethermind Juno node rpc for Mainnet (only whitelisted access) :
    const providerNethermindMainnet = new RpcProvider({ nodeUrl: junoNMmainnet });
    // Lava node rpc for Mainnet : 
    const providerMainnetLavaPublic = new RpcProvider({ nodeUrl: "https://json-rpc.starknet-mainnet.public.lavanet.xyz" });
    const providerMainnetLava = new RpcProvider({ nodeUrl: "https://g.w.lavanet.xyz:443/gateway/strk/rpc-http/" + lavaMainnetKey });
    // with your own local Pathfinder node, in your local network : 
    const providerPathfinderMainnetRpcLocNetwork = new RpcProvider({ nodeUrl: 'http://192.168.1.99:9545/rpc/v0.4' });
    // with your own local Pathfinder node, in the same computer : 
    const providerPathfinderMainnetRpcLocComputer = new RpcProvider({ nodeUrl: 'http://127.0.0.1:9545/rpc/v0.4' });
    // with your own local Juno node, in the same computer : 
    const providerJunoMainnetRpcLocComputer = new RpcProvider({ nodeUrl: 'http://127.0.0.1:6060' });
    // with your own local Juno node, in your local network : 
    const providerJunoMainnetRpcLocNetwork = new RpcProvider({ nodeUrl: 'http://192.168.1.99:6060' });
    // mainnet sequencer (soon deprecated) :
    const providerMainnetSequencer = new SequencerProvider({ network: constants.NetworkName.SN_MAIN });

    // ******* TESTNET ************
    // Alchemy node rpc for Testnet (do not work today) :
    const providerAlchemyTestnet = new RpcProvider({ nodeUrl: 'https://starknet-goerli.g.alchemy.com/v2/' + alchemyKey });
    // Infura node rpc for Testnet :
    const providerInfuraTestnet = new RpcProvider({ nodeUrl: 'https://starknet-goerli.infura.io/v3/' + infuraKey });
    // Blast node rpc for Testnet :
    const providerBlastTestnet = new RpcProvider({ nodeUrl: 'https://starknet-testnet.blastapi.io/' + blastKey + "/rpc/v0.4" });
    // Nethermind Juno node rpc for Testnet (only whitelisted access) :
    const providerNethermindTestnet = new RpcProvider({ nodeUrl: junoNMtestnet });
    // Lava node rpc for Testnet : 
    const providerTestnetLavaPublic = new RpcProvider({ nodeUrl: "https://json-rpc.starknet-testnet.public.lavanet.xyz" });
    // with your own local Pathfinder node, in your local network : 
    const providerPathfinderTestnetRpcLocNetwork = new RpcProvider({ nodeUrl: 'http://192.168.1.99:9545/rpc/v0.4' });
    // with your own local Pathfinder node, in the same computer : 
    const providerPathfinderTestnetRpcLocComputer = new RpcProvider({ nodeUrl: 'http://127.0.0.1:9545/rpc/v0.4' });
    // Testnet 1 sequencer (soon deprecated):
    const providerTestnet = new SequencerProvider({ network: constants.NetworkName.SN_GOERLI });

    // // ******* TESTNET2 ************
    // // Infura node rpc for Testnet2 :
    // const providerInfuraTestnet2 = new RpcProvider({ nodeUrl: 'https://starknet-goerli2.infura.io/v3/' + infuraKey });
    // // Blast node rpc for Testnet2 :
    // const providerBlastTestnet2 = new RpcProvider({ nodeUrl: 'https://starknet-testnet-2.blastapi.io/' + blastKey + "/rpc/v0.4" });
    // // Nethermind Juno node rpc for Testnet 2 :
    // const providerNethermindTestnet2 = new RpcProvider({ nodeUrl: junoNMtestnet2 });
    // // Testnet 2 sequencer  (soon deprecated) :
    // const providerTestnet2 = new SequencerProvider({ network: constants.NetworkName.SN_GOERLI2 });

    // ******* DEVNETS ************
    // Starknet-devnet sequencer :
    const providerDevnetSequencer = new SequencerProvider({ baseUrl: "http://127.0.0.1:5050" });
    // Starknet-Devnet rpc :
    const providerDevnetRpc = new RpcProvider({ nodeUrl: "http://127.0.0.1:5050/rpc" });
    // Katana devnet, but needs today maxFee parameter as mandatory.
    const providerKatanaRpc = new RpcProvider({ nodeUrl: "http://0.0.0.0:5050" });

    // connect account 0 
    const provider = providerMainnetSequencer;
    const account = new Account(provider, account4MainnetAddress, account4MainnetPrivateKey);
    console.log('address', account.address);

    //test
    const usdcProxyAddress = "0x053c91253bc9682c04929ca02ed00b3e423f6710d2ee7e0d5ebb06f3ecf368a8";
    const { abi: usdcProxyAbi } = await provider.getClassAt(usdcProxyAddress);
    if (usdcProxyAbi === undefined) { throw new Error("no abi.") };
    // console.log(usdcAbi);
    const usdcProxyContract = new Contract(usdcProxyAbi, usdcProxyAddress, provider);
    console.log("abi proxy =", usdcProxyContract.functions);
    // usdcContract.connect(account);
    const { implementation_hash_: usdcErcCH } = await usdcProxyContract.implementation();
    console.log("implementation =", num.toHex(usdcErcCH));
    const { abi: usdcErc20Abi } = await provider.getClassByHash(num.toHex(usdcErcCH));
    const usdcContract = new Contract(usdcErc20Abi, usdcProxyAddress, provider);
    const balance = await usdcContract.balanceOf(account4MainnetAddress);
    console.log(balance);

    console.log("✅ Test completed.");

}
main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
