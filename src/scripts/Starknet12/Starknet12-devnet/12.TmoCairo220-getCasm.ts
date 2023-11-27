// Test a contract for Discord.
// Launch with npx ts-node src/scripts/cairo12-devnet/10.testContract.ts
// Coded with Starknet.js v5.17.0

import { Provider, RpcProvider, Contract, Account, json, uint256, Abi, constants, shortString, CompiledContract, ContractClass, RPC, SequencerProvider, ContractClassResponse, stark, contractClassResponseToLegacyCompiledContract, LegacyCompiledContract, hash, num, CallData, cairo } from "starknet";
import { alchemyKey, infuraKey } from "../../../A-MainPriv/mainPriv";
//import { accountTestnet3Address, accountTestnet3privateKey } from "../../A1priv/A1priv";
import { account4MainnetAddress, account4MainnetPrivateKey } from "../../../A-MainPriv/mainPriv";

import { resetDevnetNow } from "../../resetDevnetFunc";
import fs from "fs";
import axios from 'axios';
import * as dotenv from "dotenv";
dotenv.config();

async function main() {
    function getAbiVersion(abi: Abi) {
        if (abi.find((it) => it.type === 'interface')) return 2;
        if (cairo.isCairo1Abi(abi)) return 1;
        return 0;
      }

    // initialize the Provider, with a rpc node Amchemy 
    // const providerAlchemyMainnet = new RpcProvider({ nodeUrl: 'https://starknet-mainnet.g.alchemy.com/v2/' + alchemyKey });
    // Mainnet RPC infura node
    // const providerInfuraMainnet = new RpcProvider({ nodeUrl: 'https://starknet-mainnet.infura.io/v3/' + infuraKey });

    // with your own node in your local network : 
    // const providerMainnetRpcLocNetwork = new RpcProvider({ nodeUrl: 'http://192.168.1.99:9545' });
    // // with your own node in the same computer : 
    // const providerMainnetRpcLocComputer = new RpcProvider({ nodeUrl: 'http://127.0.0.1:9545' });
    // // mainnet sequencer :
    // const providerMainnetSequencer = new SequencerProvider({ network: constants.NetworkName.SN_MAIN });
    // const providerMainnetSequencer2 = new Provider({ sequencer: { network: constants.NetworkName.SN_MAIN } });
    // Testnet 1 sequencer :
    const providerTestnet = new SequencerProvider({network: constants.NetworkName.SN_GOERLI}  );
    // // Alchemy node rpc for Testnet :
    // const providerAlchemyTestnet = new RpcProvider({ nodeUrl: 'https://starknet-goerli.g.alchemy.com/v2/' + alchemyKey });
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


    const provider = providerTestnet;
    const contractClassHash = "0x077ddf272479f55dd022e925e0f53aa31f3cab2afc1491edf700babed6befa80";

    // connect account 0 
    // console.log("chainid =", await provider.getChainId());
    // const account = new Account(provider, accountTestnet3Address, accountTestnet3privateKey);
    // console.log('address', account.address);



    // test
    const testContract = await provider.getClassByHash(contractClassHash);
    fs.writeFileSync('./accountContract.json', json.stringify(testContract, undefined, 2));
    if (testContract.abi === undefined) { throw new Error("no abi.") };
    console.log("abi recovered.");
    const casm= await provider.getCompiledClassByClassHash(contractClassHash); // only with Sequencer
    fs.writeFileSync('./C222.casm.json', json.stringify(casm, undefined, 2));


    const abiVersion=getAbiVersion(testContract.abi);
    console.log("abiversion =",abiVersion);

    console.log("✅ Test completed.");

}
main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
