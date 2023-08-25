// Try to read a contract in a network, and to redeploy on an other nerwork.
// Launch with npx ts-node src/scripts/mainnet/7.testgetClass.ts
// Coded with Starknet.js v5.14.1

import { Provider, RpcProvider, Contract, Account, json, uint256, Abi, constants, shortString, CompiledContract, ContractClass, RPC, SequencerProvider, ContractClassResponse, stark, contractClassResponseToLegacyCompiledContract, LegacyCompiledContract, hash ,num} from "starknet";
import { alchemyKey,infuraKey  } from "../../A-MainPriv/mainPriv";
import { account4MainnetAddress, account4MainnetPrivateKey } from "../../A-MainPriv/mainPriv";
import { resetDevnetNow } from "../resetDevnetFunc";
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
    const providerMainnetRpcLocNetwork = new RpcProvider({ nodeUrl: 'http://192.168.1.99:9545' });
    // with your own node in the same computer : 
    const providerMainnetRpcLocComputer = new RpcProvider({ nodeUrl: 'http://127.0.0.1:9545' });
    // mainnet sequencer :
    const providerMainnetSequencer = new SequencerProvider({ network: constants.NetworkName.SN_MAIN });
    const providerMainnetSequencer2 = new Provider({ sequencer: { network: constants.NetworkName.SN_MAIN }});
    // Testnet 1 sequencer :
    const providerTestnet = new Provider({ sequencer: { network: constants.NetworkName.SN_GOERLI } });
    // Alchemy node rpc for Testnet :
    const providerAlchemyTestnet = new RpcProvider({ nodeUrl: 'https://starknet-testnet.g.alchemy.com/v2/' + alchemyKey });
    // Infura node rpc for Testnet :
    const providerInfuraTestnet = new RpcProvider({ nodeUrl: 'https://starknet-goerli.infura.io/v3/' + infuraKey });
    // Testnet 2 sequencer :
    const providerTestnet2 = new Provider({ sequencer: { network: constants.NetworkName.SN_GOERLI2 } });
    // Infura node rpc for Testnet2 :
    const providerInfuraTestnet2 = new RpcProvider({ nodeUrl: 'https://starknet-goerli2.infura.io/v3/' + infuraKey });
    // Starknet-devnet sequencer (same for Katana devnet, but needs maxFee parameter) :
    const providerDevnetSequencer = new SequencerProvider({ baseUrl: "http://127.0.0.1:5050" });
    // Devnet rpc :
    const providerDevnetRpc = new RpcProvider({ nodeUrl: "http://127.0.0.1:5050/rpc" });

    // connect account 0 
    const provider=providerMainnetSequencer2;
    const account= new Account(provider, account4MainnetAddress, account4MainnetPrivateKey);
    console.log('address',account.address);

    //test
    const usdcProxyAddress = "0x053c91253bc9682c04929ca02ed00b3e423f6710d2ee7e0d5ebb06f3ecf368a8";
    const { abi: usdcProxyAbi } = await provider.getClassAt(usdcProxyAddress);
    if (usdcProxyAbi === undefined) { throw new Error("no abi.") };
    // console.log(usdcAbi);
    const usdcProxyContract = new Contract(usdcProxyAbi, usdcProxyAddress, provider);
    console.log("abi proxy =",usdcProxyContract.functions);
    // usdcContract.connect(account);
const {implementation_hash_:usdcErcCH} = await usdcProxyContract.implementation();
    console.log("implementation =",num.toHex(usdcErcCH) );
    const {abi:usdcErc20Abi}=await provider.getClassByHash(num.toHex(usdcErcCH));
    const usdcContract=new Contract(usdcErc20Abi,usdcProxyAddress,provider);
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
