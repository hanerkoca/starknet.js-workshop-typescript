// EstimateMessageFee
// Launch with npx ts-node src/scripts/cairo12-devnet/4.estimateMessageFee.ts
// Coded with Starknet.js v5.19.0, devnet v0.6.0

import { Provider, RpcProvider, Contract, Account, json, uint256, Abi, constants, shortString, CompiledContract, ContractClass, RPC, SequencerProvider, ContractClassResponse, stark, contractClassResponseToLegacyCompiledContract, LegacyCompiledContract, hash, num } from "starknet";
import { alchemyKey, infuraKey } from "../../A-MainPriv/mainPriv";
import { resetDevnetNow } from "../resetDevnetFunc";
import fs from "fs";
import * as dotenv from "dotenv";
dotenv.config();

//          👇👇👇
// 🚨🚨🚨   Launch 'starknet-devnet --seed 0' before using this script.
//          Launch also the script 7.
//          👆👆👆


async function main() {
    // initialize the Provider, with a mainnet rpc node Alchemy 
    // const providerAlchemyMainnet = new RpcProvider({ nodeUrl: 'https://starknet-mainnet.g.alchemy.com/v2/' + alchemyKey });
    //initialize the Provider, with a mainnet rpc node Infura 
    // const providerInfuraMainnet = new RpcProvider({ nodeUrl: 'https://starknet-mainnet.infura.io/v3/' + infuraKey });
    // mainnnet with rpc in local network : 
    //const providerMainnetRpcLocNetwork = new RpcProvider({ nodeUrl: 'http://192.168.1.99:9545/rpc/v0.4' });
    // mainnet with rpc on the same computer : 
    // const providerMainnetRpcLocComputer = new RpcProvider({ nodeUrl: 'http://127.0.0.1:9545/rpc/v0.4' });
    // mainnet sequencer :
    //const providerMainnetSequencer = new SequencerProvider({ network: constants.NetworkName.SN_MAIN });
    
    // Testnet 1 sequencer :
     //const providerTestnetSequencer = new SequencerProvider({ network: constants.NetworkName.SN_GOERLI });
     // Testnet1 RPC Alchemy
     // const providerAlchemyTestnet = new RpcProvider({ nodeUrl: "https://starknet-goerli.g.alchemy.com/v2/"+alchemyTestnetKey });
     //initialize the Provider, with a tesnet1 rpc node Infura 
    // const providerInfuraTesnet = new RpcProvider({ nodeUrl: 'https://starknet-goerli.infura.io/v3/' + infuraKey });
// testnet with rpc in local network : 
    //const providerTestnetRpcLocNetwork = new RpcProvider({ nodeUrl: 'http://192.168.1.99:9545/rpc/v0.4' });
    // testnet with rpc on the same computer : 
    // const providerTestnetRpcLocComputer = new RpcProvider({ nodeUrl: 'http://127.0.0.1:9545/rpc/v0.4' });

    // Testnet 2 sequencer
    //const providerTestnet2Sequencer = new SequencerProvider({ network: constants.NetworkName.SN_GOERLI2 });
    //initialize the Provider, with a tesnet2 rpc node Infura 
    // const providerInfuraTesnet2 = new RpcProvider({ nodeUrl: 'https://starknet-goerli2.infura.io/v3/' + infuraKey });

     // Devnet sequencer :
    const providerDevnetSequencer = new SequencerProvider({ baseUrl: "http://127.0.0.1:5050" });
    // Devnet rpc :
    //const providerDevnetRpc = new RpcProvider({ nodeUrl: "http://127.0.0.1:5050/rpc" });

    resetDevnetNow();

    // connect account 0 in devnet
     const privateKey0 = "0xe3e70682c2094cac629f6fbed82c07cd";
     const accountAddress0: string = "0x7e00d496e324876bbc8531f2d9a82bf154d1a04a50218ee74cdd372f75a551a";
     const account0 = new Account(providerDevnetSequencer, accountAddress0, privateKey0);


    const provider = providerDevnetSequencer;
    
    // Cairo 0
    const l1l2contract = json.parse(fs.readFileSync("./compiledContracts/l1l2/l1l2_compiled.json").toString("ascii"));
    const deployResponse = await account0.declareAndDeploy({ contract: l1l2contract,  salt: "0" });

    const contractClassHash = deployResponse.declare.class_hash;
    console.log('✅ Test Contract declared with classHash =', contractClassHash);

    console.log("contract_address =", deployResponse.deploy.contract_address);
    await provider.waitForTransaction(deployResponse.deploy.transaction_hash);

    const myTestContract = new Contract(l1l2contract.abi, deployResponse.deploy.contract_address, provider);

    const L1_ADDRESS = '0x8359E4B0152ed5A731162D3c7B0D8D56edB165A0';
    const testnet_contract_address ="0x04d0c1334478c7d6b825c6d2a4bcc2ba6c4a5052eac02e1d99daf8ec2e3f8350";
    const estimation = await provider.estimateMessageFee(
        {
          from_address: L1_ADDRESS,
          to_address: myTestContract.address,
          entry_point_selector: 'deposit',
          payload: ['556', '123'],  // do not include 'from_address'
        },
        'latest'
      );
    console.log("****************** cairo 0 =",estimation);

    // starknet estimate_message_fee --network alpha-goerli --from_address 0x8359E4B0152ed5A731162D3c7B0D8D56edB165A0 --address 0x04d0c1334478c7d6b825c6d2a4bcc2ba6c4a5052eac02e1d99daf8ec2e3f8350 --function deposit --inputs 556 123



    // Cairo 2
    const compiledHelloSierra = json.parse(fs.readFileSync("./compiledContracts/cairo200/PhilTest2.sierra.json").toString("ascii"));
    const compiledHelloCasm = json.parse(fs.readFileSync("./compiledContracts/cairo200/PhilTest2.casm.json").toString("ascii"));
    const deployResponse2 = await account0.declareAndDeploy({ contract: compiledHelloSierra, casm: compiledHelloCasm, salt: "0" });

    const contractClassHash2 = deployResponse2.declare.class_hash;
    console.log('✅ Test Contract declared with classHash =', contractClassHash2);

    console.log("contract_address =", deployResponse2.deploy.contract_address);
    await provider.waitForTransaction(deployResponse2.deploy.transaction_hash);

    const myTestContract2 = new Contract(compiledHelloSierra.abi, deployResponse2.deploy.contract_address, provider);


    const from_address = "0x6b175474e89094c44da98b954Eedeac495271d0f";
    const to_address = "0x1563091b9bbd94cd96cb03f59205ea279aa6f7026f78152ca50570af168deb3";
    
    const payload:string[] = [ "200"];  // do not include 'from_address'
    
    const estimation2 = await provider.estimateMessageFee({
        from_address: from_address,
        to_address: myTestContract2.address,
        entry_point_selector: "increase_bal",
        payload: payload
    },"latest")
    console.log("****************** cairo 2 =",estimation2);

    // starknet estimate_message_fee --network alpha-goerli --from_address 0x6b175474e89094c44da98b954Eedeac495271d0f --address 0x033de869eb1905fe503610527c51e245119bd05c231e7165c95d6fb630fe05ff --function increase_bal --inputs 200 

    console.log("✅ Test completed.");
}
main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });

