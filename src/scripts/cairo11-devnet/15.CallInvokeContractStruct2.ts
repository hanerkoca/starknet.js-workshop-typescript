// Test Cairo 1 v0.6.0 tuple types.
// use Starknet.js v5.6.0, starknet-devnet 0.5.0
// launch with npx ts-node src/scripts/cairo11-devnet/14.CallInvokeContractTest4.ts

import { CallData, Provider, Contract, Account, json, uint256 } from "starknet";
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
    console.log('✅ Predeployed account deployed\nOZ_ACCOUNT_ADDRESS=', account0.address);
    console.log('OZ_ACCOUNT_PRIVATE_KEY=', privateKey);


    // Connect the deployed Test instance in devnet
    const testAddress = "0x2e65d4e848e36f3d09cbd02b05b33b30cab6e4ac1e9a6632be0084eafa0add1";
    const compiledTest = json.parse(fs.readFileSync("./compiledContracts/structs2.sierra").toString("ascii"));
    const myTestContract = new Contract(compiledTest.abi, testAddress, provider);
    myTestContract.connect(account0);

    console.log('Test Contract connected at =', myTestContract.address);

    // Interactions with the contract with call & invoke

    const res1 = await myTestContract.create_order_template();
    console.log("res of struct =", res1, typeof (res1),res1.p1,res1.p2);
    // console.log("keys list =", Object.keys(res1));
    // console.log("keys qty =", Object.keys(res1).length);
    // console.log("key 0 =", res1["0"]);
    // const values = Object.keys(res1).map(key => res1[key]);
    // console.log("values =", values,"\n");

    const res2 = await myTestContract.create_order_complex();
    console.log("res of complex struct =", res2, );

    
    console.log('✅ Test completed.');
}
main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });