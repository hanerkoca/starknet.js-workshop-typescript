// declare & deploy a Cairo 1 contract with complex constructor.
// use Starknet.js v5.9.1, starknet-devnet 0.5.1
// launch with npx ts-node src/scripts/cairo11-devnet/15b.declareAndDeployConstructor2.ts

import { Provider, Account, Contract, json, RawArgsArray, cairo, Calldata, CallData, RawArgsObject, uint256, shortString } from "starknet";
import fs from "fs";
import * as dotenv from "dotenv";
dotenv.config();

//          👇👇👇
// 🚨🚨🚨   Launch 'starknet-devnet --seed 0' before using this script.
//          👆👆👆


async function main() {
    //initialize Provider 
    const provider = new Provider({ sequencer: { baseUrl: "http://127.0.0.1:5050" } });
    console.log('Connected to devnet.');

    // initialize existing predeployed account 0 of Devnet
    const privateKey = "0xe3e70682c2094cac629f6fbed82c07cd";
    const accountAddress: string = "0x7e00d496e324876bbc8531f2d9a82bf154d1a04a50218ee74cdd372f75a551a";
    const account0 = new Account(provider, accountAddress, privateKey);
    console.log('Predeployed account connected\nOZ_ACCOUNT_ADDRESS=', account0.address);
    console.log('OZ_ACCOUNT_PRIVATE_KEY=', privateKey);

    // Declare & deploy Test contract in devnet
    const compiledContractSierra = json.parse(fs.readFileSync("./compiledContracts/test_constructor2.sierra").toString("ascii"));
    const compiledContractCasm = json.parse(fs.readFileSync("./compiledContracts/test_constructor2.casm").toString("ascii"));

    const declareResponse = await account0.declare({ contract: compiledContractSierra, casm: compiledContractCasm, });
    const contractClassHash = declareResponse.class_hash;
    console.log('Test Contract declared with classHash =', contractClassHash);



    // Constructor of the contract Cairo 1 contract :
    //    "inputs": [
    //     {
    //       "name": "text",
    //       "type": "core::felt252"
    //     },
    //     {
    //       "name": "longText",
    //       "type": "core::array::Array::<core::felt252>"
    //     }
    //   ],


    // define the constructor :

    // method 1 : lowest raw data : an array of numbers. Only for specific cases (ex : max performance needed) :
    console.log(shortString.splitLongString("http://addressOfMyERC721pictures/image1.jpg").map(str => shortString.encodeShortString(str)));
    const contractConstructorCallData1: RawArgsArray = [ // accept only flatten objects
        'niceToken',
        shortString.splitLongString("http://addressOfMyERC721pictures/image1.jpg").map(str => shortString.encodeShortString(str)),
    ];

    // method 2 : with CallData.compile (to use in the rare case of no abi available). Each parameter has to be constructed properly, without starknet.js verification of conformity to abi :
    const contractConstructorCallData2: Calldata = CallData.compile({
        text: 'niceToken',
        longText: "http://addressOfMyERC721pictures/image1.jpg",
    });

    // method 3 : with RawArgsObject. Similar to method 2 :
    const contractConstructorCallData3: RawArgsObject = {
        text: "niceToken",
        longText: shortString.splitLongString("http://addressOfMyERC721pictures/image1.jpg").map(str => shortString.encodeShortString(str)),
    }

    // method 4: recommended method : send an array of parameters. With the abi, starknet.js converts automatically the parameters to the types defined in the abi, and checks the conformity to the abi :
    const contractCallData: CallData = new CallData(compiledContractSierra.abi);
    const contractConstructorCallData4: Calldata = contractCallData.compile("constructor", [
        "niceToken",
        "http://addressOfMyERC721pictures/image1.jpg",
    ]);

    const deployResponse1 = await account0.deployContract({ classHash: contractClassHash, constructorCalldata: contractConstructorCallData1 });
    console.log("contract_address1 =", deployResponse1.contract_address);

    const deployResponse2 = await account0.deployContract({ classHash: contractClassHash, constructorCalldata: contractConstructorCallData2 });
    console.log("contract_address2 =", deployResponse2.contract_address);

    const deployResponse3 = await account0.deployContract({ classHash: contractClassHash, constructorCalldata: contractConstructorCallData3 });
    console.log("contract_address3 =", deployResponse3.contract_address);

    const deployResponse4 = await account0.deployContract({ classHash: contractClassHash, constructorCalldata: contractConstructorCallData4 });
    console.log("contract_address4 =", deployResponse4.contract_address);

    // Connect the new contract instance :
    const myTestContract = new Contract(compiledContractSierra.abi, deployResponse4.contract_address, provider);
    console.log('Contract4 connected at =', myTestContract.address);
    await provider.waitForTransaction(deployResponse4.transaction_hash);

    const resp=await myTestContract.test1();
    console.log("1st felt of longText =",shortString.decodeShortString(resp) );

    console.log('✅ Test completed.');
}
main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });