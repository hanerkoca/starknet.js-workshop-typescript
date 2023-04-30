// Test Cairo 1 v0.6.0 integrated types.
// use Starknet.js v5.6.1, starknet-devnet 0.5.0
// launch with npx ts-node src/scripts/cairo11-devnet/13.CallInvokeContractTest3.ts

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
   console.log('✅ Predeployed account connected\nOZ_ACCOUNT_ADDRESS=', account0.address);
   console.log('OZ_ACCOUNT_PRIVATE_KEY=', privateKey);


    // Connect the deployed Test instance in devnet
    const testAddress = "0x653986731719809d5d854ead57efbb59fe668500ac2804637166f23f730f610"; 
    const compiledTest = json.parse(fs.readFileSync("./compiledContracts/test_type3.sierra").toString("ascii"));
    const myTestContract = new Contract(compiledTest.abi, testAddress, provider);
    myTestContract.connect(account0);

    console.log('Test Contract connected at =', myTestContract.address);

    // Interactions with the contract with call & invoke


    const res1 = await myTestContract.test_felt252(100);
    console.log("res felt252 =", res1);

    const p1= uint256.bnToUint256(10n); 
    const par1 = CallData.compile({
        p1: uint256.bnToUint256(10n),
    })
    //const res2 = await myTestContract.test_u256(par1); // succeed ... but should not !!!
    //const res2 = await myTestContract.test_u256(p1); // fail
    const res2 = await myTestContract.test_u256(10n); 
    console.log("res u256 =", res2);

    const res3= await myTestContract.test_u128(100);
    console.log("res u128 =", res3);

    const res4 = await myTestContract.test_u64(100);
    console.log("res u64 =", res4);

    const res5 = await myTestContract.test_u32(100);
    console.log("res u32 =", res5);

    const res6 = await myTestContract.test_usize(100);
    console.log("res usize =", res6);

    const res7 = await myTestContract.test_u16(100);
    console.log("res u16 =", res7);

    const res8 = await myTestContract.test_u8(100);
    console.log("res u8 =", res8);

    const res9 = await myTestContract.test_bool(true);
    console.log("res bool =", res9);

    const res10 = await myTestContract.test_address(testAddress);
    console.log("res address =", res10);

    // const res11 = await myTestContract.test_multi1(200,par1,865423);
    // console.log("res address =", res11);
 
    const res12 = await myTestContract.test_multi2(200,5678,865423);
    console.log("res address =", res12);
    const par12 = CallData.compile({
        p1: 200,
        p2: 'test',
        p3: 464657
    })
    console.log("par12b=",par12);
    const res12b = await myTestContract.test_multi2(...par12);
    console.log("res address =", res12b);
 
    console.log('✅ Test completed.');
}
main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });