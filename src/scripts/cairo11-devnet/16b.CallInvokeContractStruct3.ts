// Test Cairo 1 v0.6.0 tuple types.
// use Starknet.js v5.6.0, starknet-devnet 0.5.0
// launch with npx ts-node src/scripts/cairo11-devnet/16b.CallInvokeContractStruct3.ts

import { CallData, Provider, Contract, Account, json, uint256, num } from "starknet";
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


    // Connect the deployed Test instance in devnet
    const testAddress = "0x52458c69df2a8a69b22cf33afa55f3ddb7986dbacbbd88d5501b43e86fb589c";
    const compiledTest = json.parse(fs.readFileSync("./compiledContracts/structs3.sierra").toString("ascii"));
    const myTestContract = new Contract(compiledTest.abi, testAddress, provider);
    myTestContract.connect(account0);

    console.log('Test Contract connected at =', myTestContract.address);

    // Interactions with the contract with call & invoke
    const res1 = await myTestContract.get_order2();
    const res1b = await myTestContract.get_order2({ parseResponse: false, });
    console.log("res of struct (get_order2) =", res1, typeof (res1), res1.p1, res1.p2);
    console.log("res1b =", res1b);

    const res2 = await myTestContract.render_tuple();
    console.log("res of complex struct (render_tuple) =", res2, num.toHex(res2[1]));

    console.log('✅ Test completed.');
    // result :                                    👇
    // res of struct (get_order2) = { p1: 34n, p2: 3n } object 34n 3n
    // res1b = [ '0x22', '0x3', '0x11', '0x12', '0x13' ]
    // res of complex struct (render_tuple) = { '0': 1n, '1': 5784800237655953878877368326340059594753n, '2': 3456n }
}
main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });