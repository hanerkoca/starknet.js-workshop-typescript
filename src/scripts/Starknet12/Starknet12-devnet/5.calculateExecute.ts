// EstimateMessageFee
// Launch with npx ts-node src/scripts/cairo12-devnet/5.calculateExecute.ts
// Coded with Starknet.js v5.16.0, devnet v0.5.5

import { Provider, RpcProvider, Contract, Account, json, uint256, Abi, constants, shortString, CompiledContract, ContractClass, RPC, SequencerProvider, ContractClassResponse, stark, contractClassResponseToLegacyCompiledContract, LegacyCompiledContract, hash, num, transaction, Call, cairo, Calldata } from "starknet";
import { alchemyKey, infuraKey } from "../../../A-MainPriv/mainPriv";
import { resetDevnetNow } from "../../resetDevnetFunc";
import fs from "fs";
import * as dotenv from "dotenv";
import { CallData } from "starknet";
dotenv.config();




async function main() {
    //initialize the Provider, with a mainnet rpc node Alchemy 
    //const providerAlchemyMainnet = new RpcProvider({ nodeUrl: 'https://starknet-mainnet.g.alchemy.com/v2/' + alchemyKey });
    //initialize the Provider, with a tesnet2 rpc node Alchemy 
    // const providerInfuraTesnet2 = new RpcProvider({ nodeUrl: 'https://starknet-goerli2.infura.io/v3/' + infuraKey });
    // with rpc in local network : 
    //const providerMainnetRpcLocNetwork = new RpcProvider({ nodeUrl: 'http://192.168.1.99:9545' });
    // on the same computer : 
    // const providerMainnetRpcLocComputer = new RpcProvider({ nodeUrl: 'http://127.0.0.1:9545' });
    // mainnet sequencer :
    //const providerMainnetSequencer = new SequencerProvider({ network: constants.NetworkName.SN_MAIN });
    // Testnet 1 sequencer :
    //const providerTestnetSequencer = new SequencerProvider({ network: constants.NetworkName.SN_GOERLI });
    // Devnet sequencer :
    const providerDevnetSequencer = new SequencerProvider({ baseUrl: "http://127.0.0.1:5050" });
    // Devnet rpc :
    //const providerDevnetRpc = new RpcProvider({ nodeUrl: "http://127.0.0.1:5050/rpc" });

    // resetDevnetNow();

    // connect account 0 in devnet
    const privateKey0 = "0xe3e70682c2094cac629f6fbed82c07cd";
    const accountAddress0: string = "0x7e00d496e324876bbc8531f2d9a82bf154d1a04a50218ee74cdd372f75a551a";
    const account0 = new Account(providerDevnetSequencer, accountAddress0, privateKey0);


    const provider = providerDevnetSequencer;

    const cd1=CallData.compile([cairo.uint256(100), cairo.tuple(10, 11)]);
    const exec1: Call = { contractAddress: "0x123", entrypoint: "ert1", calldata:  cd1};
    const cd2=CallData.compile([17n]);
    const exec2: Call = { contractAddress: "0x124", entrypoint: "ert2", calldata:cd2  };
    const cd3=CallData.compile({ pot: 7, pat: 8 ,pit:9});
    const exec3: Call = { contractAddress: "0x125", entrypoint: "ert3", calldata: cd3 };
    const myCallArray: Call[] = [exec1, exec2, exec3];
    const a: Calldata = transaction.getExecuteCalldata(myCallArray, "1");
    console.log("a =", a);


    console.log("✅ Test completed.");
}
main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });

