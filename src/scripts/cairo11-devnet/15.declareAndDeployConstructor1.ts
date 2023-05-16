// declare & deploy a Cairo 1 contract with complex constructor.
// use Starknet.js v5.9.1, starknet-devnet 0.5.1
// launch with npx ts-node src/scripts/cairo11-devnet/15.declareAndDeployConstructor2.ts

import { Provider, Account, Contract, json, RawArgsArray, cairo, Calldata,CallData,  RawArgsObject, uint256, hash, encode, shortString } from "starknet";

import fs from "fs";
import * as dotenv from "dotenv";
dotenv.config();

//          👇👇👇
// 🚨🚨🚨   Launch 'starknet-devnet --seed 0' before using this script.
//          👆👆👆


async function main() {
    //initialize Provider 
    const provider = new Provider({ sequencer: { baseUrl: "http://127.0.0.1:5050" } });
    console.log('✅ Connected to devnet.');

    // initialize existing predeployed account 0 of Devnet
    const privateKey = "0xe3e70682c2094cac629f6fbed82c07cd";
    const accountAddress: string = "0x7e00d496e324876bbc8531f2d9a82bf154d1a04a50218ee74cdd372f75a551a";
    const account0 = new Account(provider, accountAddress, privateKey);
    console.log('✅ Predeployed account connected\nOZ_ACCOUNT_ADDRESS=', account0.address);
    console.log('OZ_ACCOUNT_PRIVATE_KEY=', privateKey);

    // Declare & deploy Test contract in devnet
    const compiledContractSierra = json.parse(fs.readFileSync("./compiledContracts/test_constructor1.sierra").toString("ascii"));
    const compiledContractCasm = json.parse(fs.readFileSync("./compiledContracts/test_constructor1.casm").toString("ascii"));

    const declareResponse = await account0.declare({ contract: compiledContractSierra, casm: compiledContractCasm, });
    const contractClassHash = declareResponse.class_hash;
    console.log('✅ Test Contract declared with classHash =', contractClassHash);

    console.log("error was =", shortString.decodeShortString("0x496e70757420746f6f2073686f727420666f7220617267756d656e7473"));

    // Constructor of the contract Cairo 1 contract :
    //    "name": "constructor",
    //    "inputs": [
    //      {
    //        "name": "name",
    //        "type": "core::felt252"
    //      },
    //      {
    //        "name": "symbol",
    //        "type": "core::felt252"
    //      },
    //      {
    //        "name": "decimals",
    //        "type": "core::integer::u8"
    //      },
    //      {
    //        "name": "initial_supply",
    //        "type": "core::integer::u256"
    //      },
    //      {
    //        "name": "recipient",
    //        "type": "core::starknet::contract_address::ContractAddress"
    //      },
    //      {
    //        "name": "active",
    //        "type": "core::bool"
    //      },
    //      {
    //        "name": "coord",
    //        "type": "(core::felt252, core::integer::u16)"
    //      }
    //    ],

    // define the constructor :

    const myUint256: uint256.Uint256 = cairo.uint256(50000n);
    // or const myUint256: uint256.Uint256 = uint256.bnToUint256(50000n);

    // method 1 : lowest raw data : an array of BigNumberish (numbers). No transformation of data, no ABI conformity check. Only for specific cases (ex : max performance needed) :
    const contractConstructorCallData1: RawArgsArray = [
        '2036735872918048433518',
        '5130580',
        '18',
        '50000',
        0,
        '3562055384976875123115280411327378123839557441680670463096306030682092229914',
        1n,
        '0x0a',
        '200'
    ]

    // method 2 : low raw data : an array of numbers or shortStrings (<32 chars). No ABI conformity check. Only for specific cases :

    const contractConstructorCallData2: RawArgsArray = [ // accept only flatten objects
        'niceToken',
        'NIT',
        18,
        myUint256.low, myUint256.high, // 🚨 Uint256 and BigNumberish do not work in RawArgsArray (are not a flatten object of 2 elements)
        account0.address,
        true,
        10, 200, // tuple has to be flatten in RawArgsArray. Same for struct & array (for array, add manually prefix for _len)
    ];

    // method 3 : with CallData.compile (to use in case of no abi available). No ABI conformity check.  Each parameter has to be constructed properly :

    const contractConstructorCallData3: Calldata = CallData.compile({
        name: 'niceToken',
        symbol: 'NIT',
        decimals: 18,
        initial_supply: myUint256, // needs a Uint256 type. '100n' is not accepted because no abi 
        recipient: account0.address,
        active: true,
        coord: cairo.tuple('0x0a', 200),
    });
    console.log("type3=", contractConstructorCallData3);

    // method 4 : with RawArgsObject. Similar to method 3 :

    const contractConstructorCallData4: RawArgsObject = {
        name: "niceToken",
        symbol: "NIT",
        decimals: 18,
        initial_supply: myUint256, // needs a Uint256 type. '100n' is not accepted because no abi
        recipient: account0.address,
        active: true,
        coord: cairo.tuple('0x0a', 200),
    }

    // method 5: recommended method : send an array of parameters. With the abi, starknet.js converts automatically the parameters to the types defined in the abi, and checks the conformity to the abi :

    const contractCallData: CallData = new CallData(compiledContractSierra.abi);
    const contractConstructorCallData5: Calldata = contractCallData.compile("constructor", [
        "niceToken",
        "NIT",
        18,
        5_000n, //  Uint256 and BigNumberish are authorized (BigNumberish only for Cairo 1 contract)
        account0.address,
        true,
        cairo.tuple('0x0a', 200),
    ]);

    const addr1 = hash.calculateContractAddressFromHash(200n, "0x345435734573567", contractConstructorCallData5, 0);
    const addr2 = hash.calculateContractAddressFromHash(200n, "0x345435734573567", contractConstructorCallData3, 0);

    console.log(contractConstructorCallData4);

    const deployResponse1 = await account0.deployContract({ classHash: contractClassHash, constructorCalldata: contractConstructorCallData1 });
    console.log("contract_address1 =", deployResponse1.contract_address);

    const deployResponse2 = await account0.deployContract({ classHash: contractClassHash, constructorCalldata: contractConstructorCallData2 });
    console.log("contract_address2 =", deployResponse2.contract_address);

    const deployResponse3 = await account0.deployContract({ classHash: contractClassHash, constructorCalldata: contractConstructorCallData3 });
    console.log("contract_address3 =", deployResponse3.contract_address);

    const deployResponse4 = await account0.deployContract({ classHash: contractClassHash, constructorCalldata: contractConstructorCallData4 });
    console.log("contract_address4 =", deployResponse4.contract_address);

    const deployResponse5 = await account0.deployContract({ classHash: contractClassHash, constructorCalldata: contractConstructorCallData5 });
    console.log("contract_address5 =", deployResponse5.contract_address);

    // Connect the new contract instance :
    const myTestContract = new Contract(compiledContractSierra.abi, deployResponse4.contract_address, provider);
    console.log('✅ Test Contract4 connected at =', myTestContract.address);
    // await provider.waitForTransaction(deployResponse4.transaction_hash);
}
main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });