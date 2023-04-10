// connect a contract that is already deployed on devnet.
// use Starknet.js v5.5.0, starknet-devnet 0.5.0.a1
// launch with npx ts-node src/scripts/cairo11-devnet/11.CallInvokeContract.ts

import { CallData, Provider, Contract, Account, json } from "starknet";
import fs from "fs";
import * as dotenv from "dotenv";
dotenv.config();


//          👇👇👇
// 🚨🚨🚨   Launch 'starknet-devnet --seed 0' before using this script.
//          Launch also the script for deployement of Test (script4).
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
    const testAddress = "0x2321a88f22375650ebd214283d5f8d0db3494c2d127af9e063204a6c9fc4f9c"; 
    const compiledTest = json.parse(fs.readFileSync("./compiledContracts/test_type1.sierra").toString("ascii"));
    const myTestContract = new Contract(compiledTest.abi, testAddress, provider);
    myTestContract.connect(account0);

    console.log('Test Contract connected at =', myTestContract.address);

    // Interactions with the contract with call & invoke
    const par1 = CallData.compile({
        balance: 100,
    })
    const res1 = await myTestContract.test1(par1, { parseRequest: false, parseResponse: false, });
    const res2 = await myTestContract.test2(par1, { parseRequest: false, parseResponse: false, });
    const res3 = await myTestContract.test3({ parseRequest: false, parseResponse: false, });
    const tx = await myTestContract.increase_balance(
        CallData.compile({
            amount: 100,
        })
    );
    console.log("res1 =", res1[0]);
    console.log("res2 =", res2[0]);
    console.log("res3 =", res3[0]);
    await provider.waitForTransaction(tx.transaction_hash);

    const balance = await myTestContract.get_balance({
        parseRequest: false,
        parseResponse: false,
    });
    console.log("balance =", balance[0]);
   console.log('✅ Test completed.');

}
main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });