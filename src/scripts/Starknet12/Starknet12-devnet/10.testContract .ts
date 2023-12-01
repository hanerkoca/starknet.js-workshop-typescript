// Test a contract for Discord.
// Launch with npx ts-node src/scripts/cairo12-devnet/10.testContract.ts
// Coded with Starknet.js v5.17.0

import { Provider, RpcProvider, Contract, Account, json, uint256, Abi, constants, shortString, CompiledContract, ContractClass, RPC, SequencerProvider, ContractClassResponse, stark, contractClassResponseToLegacyCompiledContract, LegacyCompiledContract, hash, num } from "starknet";
import { alchemyKey, infuraKey } from "../../../A-MainPriv/mainPriv";
import { account3TestnetAddress, account3TestnetPrivateKey } from "../../../A1priv/A1priv";
import { account4MainnetAddress, account4MainnetPrivateKey } from "../../../A-MainPriv/mainPriv";

import { resetDevnetNow } from "../../utils/resetDevnetFunc";
import fs from "fs";
import axios from 'axios';
import * as dotenv from "dotenv";
dotenv.config();

async function main() {
    // initialize the Provider, with a rpc node Amchemy 
    const providerAlchemyMainnet = new RpcProvider({ nodeUrl: 'https://starknet-mainnet.g.alchemy.com/v2/' + alchemyKey });
    // Mainnet RPC infura node
    const providerInfuraMainnet = new RpcProvider({ nodeUrl: 'https://starknet-mainnet.infura.io/v3/' + infuraKey });

    // with your own node in your local network : 
    // const providerMainnetRpcLocNetwork = new RpcProvider({ nodeUrl: 'http://192.168.1.99:9545' });
    // // with your own node in the same computer : 
    // const providerMainnetRpcLocComputer = new RpcProvider({ nodeUrl: 'http://127.0.0.1:9545' });
    // // mainnet sequencer :
    // const providerMainnetSequencer = new SequencerProvider({ network: constants.NetworkName.SN_MAIN });
    // const providerMainnetSequencer2 = new Provider({ sequencer: { network: constants.NetworkName.SN_MAIN } });
    // Testnet 1 sequencer :
    // const providerTestnet = new Provider({ sequencer: { network: constants.NetworkName.SN_GOERLI } });
    // // Alchemy node rpc for Testnet :
    const providerAlchemyTestnet = new RpcProvider({ nodeUrl: 'https://starknet-goerli.g.alchemy.com/v2/' + alchemyKey });
    // // Infura node rpc for Testnet :
    // const providerInfuraTestnet = new RpcProvider({ nodeUrl: 'https://starknet-goerli.infura.io/v3/' + infuraKey });
    // // Testnet 2 sequencer :
    // const providerTestnet2 = new Provider({ sequencer: { network: constants.NetworkName.SN_GOERLI2 } });
    // // Infura node rpc for Testnet2 :
    // const providerInfuraTestnet2 = new RpcProvider({ nodeUrl: 'https://starknet-goerli2.infura.io/v3/' + infuraKey });
    // // Starknet-devnet sequencer (same for Katana devnet, but needs maxFee parameter) :
    // const providerDevnetSequencer = new SequencerProvider({ baseUrl: "http://127.0.0.1:5050" });
    // // Devnet rpc :
    // const providerDevnetRpc = new RpcProvider({ nodeUrl: "http://127.0.0.1:5050/rpc" });

    // test for JediSwap
    const deadline=Math.floor(Date.now()/1000)+60*10;
    console.log("deadline =",num.toHex(deadline));


    const contractAddress = "0x0229363f62641a4563fe787dc64e9f0332948774316aff755e51a28216d764d8";

    // connect account 0 
    const provider = providerAlchemyTestnet;
    console.log("chainid =", await provider.getChainId());
    const account = new Account(provider, account3TestnetAddress, account3TestnetPrivateKey);
    console.log('address', account.address);



    // test
    const { abi: testContractAbi } = await provider.getClassAt(contractAddress);
    if (testContractAbi === undefined) { throw new Error("no abi.") };
    console.log("abi recovered.");
    const testContract = new Contract(testContractAbi, contractAddress, provider);
    console.log("testContract functions =", testContract.functions);
    testContract.connect(account);
    const command1 = testContract.populate("withdraw", {
        userAddress: "0x015473522fc7c62f03b8a4068edf538982ceb37f8260b3cfd013fb671f5b2912",
        index: 0
    })
    const th1 = await account.execute(command1);


    console.log("✅ Test completed.");

}
main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
