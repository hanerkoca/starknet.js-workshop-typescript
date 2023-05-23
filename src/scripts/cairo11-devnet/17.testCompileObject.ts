// Test compile of Calldata.
// use Starknet.js v5.10.0, starknet-devnet 0.5.0
// launch with npx ts-node src/scripts/cairo11-devnet/17.testCompileObject.ts

import { CallData, Provider, Contract, Account, json, uint256, num, Calldata, cairo, RawArgsObject, RawCalldata, RawArgsArray } from "starknet";
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


    // contract for struct test
    const compiledContractSierra1 = json.parse(fs.readFileSync("./compiledContracts/test_constructor1.sierra").toString("ascii"));
    const compiledContractCasm1 = json.parse(fs.readFileSync("./compiledContracts/test_constructor1.casm").toString("ascii"));

    // const declareResponse1 = await account0.declare({ contract: compiledContractSierra1, casm: compiledContractCasm1, });
    // const contractClassHash1 = declareResponse1.class_hash;
    // console.log('Test Contract declared with classHash =', contractClassHash1);

    // contract for array test
    const compiledContractSierra2 = json.parse(fs.readFileSync("./compiledContracts/test_constructor2.sierra").toString("ascii"));
    const compiledContractCasm2 = json.parse(fs.readFileSync("./compiledContracts/test_constructor2.casm").toString("ascii"));

    // const declareResponse2 = await account0.declare({ contract: compiledContractSierra2, casm: compiledContractCasm2, });
    // const contractClassHash2 = declareResponse2.class_hash;
    // console.log('Test Contract declared with classHash =', contractClassHash2);

    // Order2
    const compiledContractSierra3 = json.parse(fs.readFileSync("./compiledContracts/structs3.sierra").toString("ascii"));
    const compiledContractCasm3 = json.parse(fs.readFileSync("./compiledContracts/structs3.casm").toString("ascii"));

    // constructor with order2
    const compiledContractSierra4 = json.parse(fs.readFileSync("./compiledContracts/test_constructor3.sierra").toString("ascii"));
    const compiledContractCasm4 = json.parse(fs.readFileSync("./compiledContracts/test_constructor3.casm").toString("ascii"));

    // constructor with nested data
    const compiledContractSierra5 = json.parse(fs.readFileSync("./compiledContracts/test_constructor4.sierra").toString("ascii"));
    const compiledContractCasm5 = json.parse(fs.readFileSync("./compiledContracts/test_constructor4.casm").toString("ascii"));

       // constructor with nested tuple
       const compiledContractSierra6 = json.parse(fs.readFileSync("./compiledContracts/test_constructor5tuple.sierra").toString("ascii"));
 
    // // test calldata.compile

    // // ***************** constructor1, with uint256 & tuple ****************

    // // Constructor of the contract Cairo 1 contract :
    // //    "name": "constructor",
    // //    "inputs": [
    // //      {
    // //        "name": "name",
    // //        "type": "core::felt252"
    // //      },
    // //      {
    // //        "name": "symbol",
    // //        "type": "core::felt252"
    // //      },
    // //      {
    // //        "name": "decimals",
    // //        "type": "core::integer::u8"
    // //      },
    // //      {
    // //        "name": "initial_supply",
    // //        "type": "core::integer::u256"
    // //      },
    // //      {
    // //        "name": "recipient",
    // //        "type": "core::starknet::contract_address::ContractAddress"
    // //      },
    // //      {
    // //        "name": "active",
    // //        "type": "core::bool"
    // //      },
    // //      {
    // //        "name": "coord",
    // //        "type": "(core::felt252, core::integer::u16)"
    // //      }
    // //    ],

    // // test with an array
    // const contractArrayCallData: CallData = new CallData(compiledContractSierra1.abi);
    // const myCalldata1: Calldata = contractArrayCallData.compile("constructor", [
    //     "niceToken",
    //     "NIT",
    //     18,
    //     5_000n, //  Uint256 and BigNumberish are authorized (BigNumberish only for Cairo 1 contract)
    //     account0.address,
    //     true,
    //     cairo.tuple('0x0a', 200),
    // ]);
    // console.log("with array input =", myCalldata1);

    // // struct with ordered property
    // const contractStructCallData: CallData = new CallData(compiledContractSierra2.abi);
    // const myUint256: uint256.Uint256 = cairo.uint256(50000n);
    // const contractConstructor: RawArgsObject = {
    //     name: "niceToken",
    //     symbol: "NIT",
    //     decimals: 18,
    //     initial_supply: myUint256,
    //     recipient: account0.address,
    //     active: true,
    //     coord: cairo.tuple('0x0a', 200),
    // }
    // console.log("ordered struct before compile =", contractConstructor);
    // const myCalldata2: Calldata = contractArrayCallData.compile("constructor", contractConstructor);
    // console.log("result with ordered struct =", myCalldata2);

    // // struct with not ordered property
    // const falseUint256 = { high: 1, low: 23456 }; // wrong order
    // const contractConstructor2: RawArgsObject = {
    //     active: true,
    //     symbol: "NIT",
    //     initial_supply: falseUint256,
    //     recipient: account0.address,
    //     decimals: 18,
    //     coord: cairo.tuple('0x0a', 200),
    //     name: "niceToken",
    // }
    // console.log("with struct disordered (before compile) =", contractConstructor2);
    // const myCalldata3: Calldata = contractArrayCallData.compile("constructor", contractConstructor2);
    // console.log("with struct disordered (including uint256 & tuple) =", myCalldata3);

    // // ************  constructor 2, with arrays ******************

    // // Constructor of the contract Cairo 1 contract :
    // // "name": "constructor",
    // // "inputs": [
    // //   {
    // //     "name": "text",
    // //     "type": "core::felt252"
    // //   },
    // //   {
    // //     "name": "longText",
    // //     "type": "core::array::Array::<core::felt252>"
    // //   },
    // //   {
    // //     "name": "array1",
    // //     "type": "core::array::Array::<core::felt252>"
    // //   }
    // // ],

    // const myArray: RawCalldata = ["0x0a", 24, 36n]; // array of BN (string|number|bigint)
    // const contractCallData: CallData = new CallData(compiledContractSierra2.abi);
    // const myCalldata4: Calldata = contractCallData.compile("constructor", {
    //     array1: myArray,
    //     text: "niceToken",
    //     longText: "http://addressOfMyERC721pictures/image1.jpg",
    // }
    // );
    // console.log("with struct disordered (including arrays) =", myCalldata4);

    // // ************  function call, with struct ******************
    // // {
    // //     "type": "function",
    // //         "name": "get_order4",
    // //             "inputs": [
    // //                 {
    // //                     "name": "obj",
    // //                     "type": "structs3::structs3::HelloStarknet::Order2"
    // //                 }
    // //             ],
    // //                 "outputs": [
    // //                     {
    // //                         "type": "core::felt252"
    // //                     }
    // //                 ],
    // //                     "state_mutability": "view"
    // // },

    // // {
    // //     "type": "struct",
    // //         "name": "structs3::structs3::HelloStarknet::Order2",
    // //             "members": [
    // //                 {
    // //                     "name": "p1",
    // //                     "type": "core::felt252"
    // //                 },
    // //                 {
    // //                     "name": "p2",
    // //                     "type": "core::array::Array::<core::felt252>"
    // //                 }
    // //             ]
    // // },


    // const contractCallData2: CallData = new CallData(compiledContractSierra3.abi);
    type Order2 = {
        p1: num.BigNumberish,
        p2: num.BigNumberish[]
    }
    // const myOrder2: Order2 = {
    //     p1: "17",
    //     p2: [234, 467456745457n, "0x56ec"]
    // }
    // const myCalldata5: Calldata = contractCallData2.compile("get_order4", {
    //     obj: myOrder2
    // }
    // );
    // console.log("with struct disordered (including arrays) =", myCalldata5);

    // // ************  constructor3, with struct *****************
    // // {
    // //     "type": "function",
    // //     "name": "constructor",
    // //     "inputs": [
    // //       {
    // //         "name": "name",
    // //         "type": "core::felt252"
    // //       },
    // //       {
    // //         "name": "symbol",
    // //         "type": "core::felt252"
    // //       },
    // //       {
    // //         "name": "decimals",
    // //         "type": "core::integer::u8"
    // //       },
    // //       {
    // //         "name": "initial_supply",
    // //         "type": "core::integer::u256"
    // //       },
    // //       {
    // //         "name": "card",
    // //         "type": "test_constructor3::test_constructor3::TestConstructor3::Order2"
    // //       },
    // //       {
    // //         "name": "recipient",
    // //         "type": "core::starknet::contract_address::ContractAddress"
    // //       },
    // //       {
    // //         "name": "active",
    // //         "type": "core::bool"
    // //       },
    // //       {
    // //         "name": "coord",
    // //         "type": "(core::felt252, core::integer::u16)"
    // //       }
    // //     ],
    // //     "outputs": [],
    // //     "state_mutability": "external"
    // //   },

    // const myFalseUint256 = { high: 1, low: 23456 }; // wrong order
    // const myOrder2bis: Order2 = {// wrong order
    //     p2: [234, 467456745457n, "0x56ec"],
    //     p1: "17"
    // }
    // const contractCallData3: CallData = new CallData(compiledContractSierra4.abi);
    // const contractConstructor3: RawArgsObject = {//wrong order
    //     active: true,
    //     symbol: "NIT",
    //     initial_supply: myFalseUint256,
    //     recipient: account0.address,
    //     decimals: 18,
    //     coord: cairo.tuple('0x0a', 200),
    //     card: myOrder2bis,
    //     name: "niceToken",
    // }
    // const myCalldata6: Calldata = contractCallData3.compile("constructor", contractConstructor3
    // );
    // console.log("with struct disordered (including struct) =", myCalldata6);

    // // nested
    // const myFalseUint256 = { high: 1, low: 23456 }; // wrong order
    // const myOrder2bis: Order2 = {// wrong order
    //     p2: [234, 467456745457n, "0x56ec"],
    //     p1: "17"
    // }
    // const contractCallData4: CallData = new CallData(compiledContractSierra5.abi);
    // const contractConstructor4: RawArgsObject = {//wrong order
    //     active: true,
    //     symbol: "NIT",
    //     initial_supply: myFalseUint256,
    //     recipient: account0.address,
    //     decimals: 18,
    //     coord: cairo.tuple('0x0a', 200),
    //     card: myOrder2bis,
    //     longText: "Zorg is back, for ever, here and everywhere",
    //     array1: [100, 101, 102],
    //     array2: [[200, 201], [202, 203], [204, 205]],
    //     array3: [myOrder2bis, myOrder2bis],
    //     array4: [myFalseUint256,myFalseUint256],
    //     tuple1: cairo.tuple(400, "0c5aa", 24n, "texte"),
    //     name: "niceToken",
    //     array5: [cairo.tuple(251,40000n),cairo.tuple(252,40001n)],
    // }
    // const myCalldata7: Calldata = contractCallData4.compile("constructor", contractConstructor4);
    // console.log("with object not ordered (including nested) =", myCalldata7);

//     const myUint256: uint256.Uint256 = cairo.uint256(50000n);
//     type Order2 = {
//             p1: num.BigNumberish,
//             p2: num.BigNumberish[]
//         }   
//         const myOrder2: Order2 = {
//         p1: "17",
//         p2: [234, 467456745457n, "0x56ec"]
//     }
//     const contractCallData5: CallData = new CallData(compiledContractSierra5.abi);
//     const contractConstructor5: RawArgsArray = [
//         "niceToken",
//         "NIT",
//         18,
//         myUint256,
//         myOrder2,
//         account0.address,
//         true,
//         cairo.tuple('0x0a', 200),
//         "Zorg is back, for ever, here and everywhere",
//         [100, 101, 102],
//         [[200, 201], [202, 203], [204, 205]],
//         [myOrder2, myOrder2],
//         [myUint256,myUint256],
//         cairo.tuple(400, "0c5aa", 24n, "texte"),
//     ]

//    const myCalldata8: Calldata = contractCallData5.compile("constructor", contractConstructor5);
//     const myCalldata8b=CallData.compile(contractConstructor5);
//     console.log("with array ordered (including nested) =", myCalldata8);

const myFalseUint256 = { high: 1, low: 23456 }; // wrong order
const myOrder2bis: Order2 = {// wrong order
    p2: [234, 467456745457n, "0x56ec"],
    p1: "17"
}
const contractCallData9: CallData = new CallData(compiledContractSierra6.abi);
const contractConstructor9: RawArgsObject = {//wrong order
    active: true,
    symbol: "NIT",
    initial_supply: myFalseUint256,
    recipient: account0.address,
    decimals: 18,
    tupoftup: cairo.tuple(cairo.tuple(34,"0x5e") ,myFalseUint256),
    card: myOrder2bis,
    longText: "Zorg is back, for ever, here and everywhere",
    array1: [100, 101, 102],
    array2: [[200, 201], [202, 203], [204, 205]],
    array3: [myOrder2bis, myOrder2bis],
    array4: [myFalseUint256,myFalseUint256],
    tuple1: cairo.tuple(40000n, myOrder2bis, [54,55n,"0xae"], "texte"),
    name: "niceToken",
    array5: [cairo.tuple(251,40000n),cairo.tuple(252,40001n)],
}
const myCalldata9: Calldata = contractCallData9.compile("constructor", contractConstructor9);
console.log("with object not ordered (including nested) =", myCalldata9);


}
main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });