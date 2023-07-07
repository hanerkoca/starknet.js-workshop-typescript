// Try to read a contract in a network, and to redeploy on an other nerwork.
// Launch with npx ts-node src/scripts/mainnet/7.testgetClass.ts
// Coded with Starknet.js v5.14.1

import { Provider, RpcProvider, Contract, Account, json, uint256, Abi, constants, shortString, CompiledContract, ContractClass, RPC, SequencerProvider, ContractClassResponse, stark, contractClassResponseToLegacyCompiledContract, LegacyCompiledContract, hash } from "starknet";
import { alchemyKey } from "../../A-MainPriv/mainPriv";
import { resetDevnetNow } from "../resetDevnetFunc";
import fs from "fs";
import axios from 'axios';
import * as dotenv from "dotenv";
dotenv.config();

async function main() {
    //initialize the Provider, with a rpc node Amchemy 
    const providerAlchemyMainnet = new RpcProvider({ nodeUrl: 'https://starknet-mainnet.g.alchemy.com/v2/' + alchemyKey });
    // with rpc in local network : 
    const providerMainnetRpcLocNetwork = new RpcProvider({ nodeUrl: 'http://192.168.1.99:9545' });
    // rpc on the same computer : 
    //const providerMainnetRpcLocComputer = new RpcProvider({ nodeUrl: 'http://127.0.0.1:9545' });
    // mainnet sequencer :
    const providerMainnetSequencer = new SequencerProvider({ network: constants.NetworkName.SN_MAIN });
    // Testnet 1 sequencer :
    const providerTestnet = new Provider({ sequencer: { network: constants.NetworkName.SN_GOERLI } });
    // Testnet 2 sequencer :
    const providerTestnet2 = new Provider({ sequencer: { network: constants.NetworkName.SN_GOERLI2 } });
    // Devnet sequencer :
    const providerDevnetSequencer = new SequencerProvider({ baseUrl: "http://127.0.0.1:5050" });
    // Devnet rpc :
    const providerDevnetRpc = new RpcProvider({ nodeUrl: "http://127.0.0.1:5050/rpc" });

    // connect account 0 in devnet
    const privateKey0 = "0xe3e70682c2094cac629f6fbed82c07cd";
    const accountAddress0: string = "0x7e00d496e324876bbc8531f2d9a82bf154d1a04a50218ee74cdd372f75a551a";
    const account0 = new Account(providerDevnetRpc, accountAddress0, privateKey0);

    // console.log("text =", shortString.decodeShortString("0x6d696e74206c696d69742072656163686564"));

    // re-initialization of devnet
    await resetDevnetNow();

    // ***************Cairo 1 
    const addrErc20Cairo1 = "0x060cf64cf9edfc1b16ec903cee31a2c21680ee02fc778225dacee578c303806a";
    const classHashErc20Cairo1 = "0x021b9a01b8f17682f92c18ac4fa08ea90b371f07e27cd08de8451892546d341f";

    const compiledSierra1: ContractClassResponse = await providerMainnetRpcLocNetwork.getClassAt(addrErc20Cairo1); // with sequencer or rpc
    fs.writeFileSync("./c1.sierra.json", json.stringify(compiledSierra1, undefined, 2));
    const compiledCasm1 = await providerMainnetSequencer.getCompiledClassByClassHash(classHashErc20Cairo1); // only with a sequencer
    fs.writeFileSync("./c1.casm.json", json.stringify(compiledCasm1, undefined, 2));

    // const compiledC1 = json.parse(fs.readFileSync("./c1.sierra.json").toString("ascii"));
    // const abi1: Abi = compiledSierra1.abi as Abi;
    //console.log("abi =", compiledSierra1.abi, "===")
    const compiledC12 = compiledSierra1 as CompiledContract;
    const deployResponse1 = await account0.declare({ contract: compiledC12, casm: compiledCasm1 });

    const contractClassHash1 = deployResponse1.class_hash;
    console.log('✅ Contract1 declared with classHash =', contractClassHash1);
    //console.log("contract1_address =", deployResponse1.deploy.contract_address);
    await providerDevnetSequencer.waitForTransaction(deployResponse1.transaction_hash);

    // **************** Cairo 0 **************
    const classHashErc20Cairo0 = "0x01cb96b938da26c060d5fd807eef8b580c49490926393a5eeb408a89f84b9b46";
    const addrErc20Cairo0Mainnet = "0x00da114221cb83fa859dbdb4c44beeaa0bb37c7537ad5ae66fe5e0efd20e6eb3";
    const addrErc20Cairo0Testnet = "0x03e85bfbb8e2a42b7bead9e88e9a1b19dbccf661471061807292120462396ec9";

    const compressedContract0: ContractClassResponse = await providerMainnetSequencer.getClassAt(addrErc20Cairo0Mainnet);
    const compiledContract0: LegacyCompiledContract = contractClassResponseToLegacyCompiledContract(compressedContract0);
    const classHash = hash.computeContractClassHash(compiledContract0);
    console.log("Cairo 0 classHash calculated =", classHash);
    // const compiledC0 = json.parse(fs.readFileSync("./c0contract.json").toString("ascii"));

    const deployResponse0 = await account0.declareAndDeploy({ contract: compiledContract0, classHash: classHashErc20Cairo0, constructorCalldata: [0] });

    const contractClassHash0 = deployResponse0.declare.class_hash;
    console.log('✅ Contract0 declared with classHash =', contractClassHash0);
    console.log("contract0_address =", deployResponse0.deploy.contract_address);
    providerDevnetRpc.waitForTransaction(deployResponse0.deploy.transaction_hash);

    fs.writeFileSync("./c0ContractDevnetSequencer.json", json.stringify(compiledContract0, undefined, 2));

    console.log("✅ Test completed.");

}
main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
