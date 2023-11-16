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


    // constructor with nested tuple
    const compiledComplexSierra = json.parse(fs.readFileSync("./compiledContracts/test_constructor5tuple.sierra").toString("ascii"));


    const myFalseUint256 = { high: 1, low: 23456 }; // wrong order
    type Order2 = {
        p1: num.BigNumberish;
        p2: num.BigNumberish[];
    };

    const myOrder2bis: Order2 = {
        // wrong order
        p2: [234, 467456745457n, '0x56ec'],
        p1: '17',
    };
    const myRawArgsObject: RawArgsObject = {
        // wrong order
        active: true,
        symbol: 'NIT',
        initial_supply: myFalseUint256,
        recipient: '0x7e00d496e324876bbc8531f2d9a82bf154d1a04a50218ee74cdd372f75a551a',
        decimals: 18,
        tupoftup: cairo.tuple(cairo.tuple(34, '0x5e'), myFalseUint256),
        card: myOrder2bis,
        longText: 'Bug is back, for ever, here and everywhere',
        array1: [100, 101, 102],
        array2: [
            [200, 201],
            [202, 203],
            [204, 205],
        ],
        array3: [myOrder2bis, myOrder2bis],
        array4: [myFalseUint256, myFalseUint256],
        tuple1: cairo.tuple(40000n, myOrder2bis, [54, 55n, '0xae'], 'texte'),
        name: 'niceToken',
        array5: [cairo.tuple(251, 40000n), cairo.tuple(252, 40001n)],
    };
    const myRawArgsArray: RawArgsArray = [
        'niceToken',
        'NIT',
        18,
        { low: 23456, high: 1 },
        { p1: '17', p2: [234, 467456745457n, '0x56ec'] },
        '0x7e00d496e324876bbc8531f2d9a82bf154d1a04a50218ee74cdd372f75a551a',
        true,
        { '0': { '0': 34, '1': '0x5e' }, '1': { low: 23456, high: 1 } },
        'Bug is back, for ever, here and everywhere',
        [100, 101, 102],
        [
            [200, 201],
            [202, 203],
            [204, 205],
        ],
        [
            { p1: '17', p2: [234, 467456745457n, '0x56ec'] },
            { p1: '17', p2: [234, 467456745457n, '0x56ec'] },
        ],
        [
            { low: 23456, high: 1 },
            { low: 23456, high: 1 },
        ],
        {
            '0': 40000n,
            '1': { p1: '17', p2: [234, 467456745457n, '0x56ec'] },
            '2': [54, 55n, '0xae'],
            '3': 'texte',
        },
        [
            { '0': 251, '1': 40000n },
            { '0': 252, '1': 40001n },
        ],
    ];
    console.log('arrayInit=', myRawArgsArray);

    const contractCallData: CallData = new CallData(compiledComplexSierra.abi);
    const callDataFromObject: Calldata = contractCallData.compile('constructor', myRawArgsObject);
    const callDataFromArray: Calldata = contractCallData.compile('constructor', myRawArgsArray);
    // console.log('array=', callDataFromArray);
    const expectedResult = [
        '2036735872918048433518',
        '5130580',
        '18',
        '23456',
        '1',
        '17',
        '3',
        '234',
        '467456745457',
        '22252',
        '3562055384976875123115280411327378123839557441680670463096306030682092229914',
        '1',
        '34',
        '94',
        '23456',
        '1',
        '2',
        '159785413968967926891205956097616717696131837023540747069075117448835916142',
        '30987665751402784236897661541',
        '3',
        '100',
        '101',
        '102',
        '3',
        '2',
        '200',
        '201',
        '2',
        '202',
        '203',
        '2',
        '204',
        '205',
        '2',
        '17',
        '3',
        '234',
        '467456745457',
        '22252',
        '17',
        '3',
        '234',
        '467456745457',
        '22252',
        '2',
        '23456',
        '1',
        '23456',
        '1',
        '40000',
        '0',
        '17',
        '3',
        '234',
        '467456745457',
        '22252',
        '3',
        '54',
        '55',
        '174',
        '499918599269',
        '2',
        '251',
        '40000',
        '252',
        '40001',
    ];



}
main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });