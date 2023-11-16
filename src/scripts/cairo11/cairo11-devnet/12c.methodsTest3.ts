// Test Cairo 1 v0.6.0 integrated types.
// use Starknet.js v5.11.1, starknet-devnet 0.5.0
// launch with npx ts-node src/scripts/cairo11-devnet/13.CallInvokeContractTest3.ts

import { CallData, Provider, Contract, Account, json, uint256, Calldata, RawArgsArray, RawArgsObject, Call, RpcProvider } from "starknet";
import fs from "fs";
import * as dotenv from "dotenv";
dotenv.config();


//          👇👇👇
// 🚨🚨🚨   Launch 'starknet-devnet --seed 0' before using this script.
//          👆👆👆
async function main() {
    //initialize Provider 
    const provider = new RpcProvider({ nodeUrl: "http://127.0.0.1:5050/rpc" });
    console.log('✅ Connected to devnet.');

    // initialize existing predeployed account 0 of Devnet
    console.log('OZ_ACCOUNT_ADDRESS=', process.env.OZ_ACCOUNT0_DEVNET_ADDRESS);
    console.log('OZ_ACCOUNT_PRIVATE_KEY=', process.env.OZ_ACCOUNT0_DEVNET_PRIVATE_KEY);
    const privateKey0 = process.env.OZ_ACCOUNT0_DEVNET_PRIVATE_KEY ?? "";
    const accountAddress0: string = process.env.OZ_ACCOUNT0_DEVNET_ADDRESS ?? "";
    const account0 = new Account(provider, accountAddress0, privateKey0);
    console.log("Account 0 connected.\n");

    // Connect the deployed Test instance in devnet
    const testAddress = "0x653986731719809d5d854ead57efbb59fe668500ac2804637166f23f730f610";
    const compiledTest = json.parse(fs.readFileSync("./compiledContracts/test_type3.sierra").toString("ascii"));
    const myTestContract = new Contract(compiledTest.abi, testAddress, provider);
    myTestContract.connect(account0);

    console.log('Test Contract connected at =', myTestContract.address);

    // Interactions with the contract with call & invoke


    const res1 = await myTestContract.test_felt252(100);
    console.log("res felt252 =", res1);
    const res1a = await myTestContract['test_felt252'](100);
    console.log("res a felt252 =", res1a);

    const myUint256: uint256.Uint256 = uint256.bnToUint256(10257415n);
    const par1: Calldata = CallData.compile({
        p1: myUint256,
    })
    const res2 = await myTestContract.test_u256(myUint256);
    console.log("res u256 =", res2);
    const res2a = await myTestContract.test_u256(10n);
    console.log("res a u256 =", res2a);
    const res2b = await myTestContract.test_u256(par1, {
        parseRequest: false,
        parseResponse: false,
    }); // succeed in v5.9.0
    console.log("res b u256 =", res2b);
    const res2c = await myTestContract.test_u256(par1, {
        parseRequest: false
    });
    console.log("res c u256 =", res2c);
    const res2d = await myTestContract.test_u256(10n, {
        parseResponse: false,
    });
    console.log("res d u256 =", res2d);

    // tests of preparation of calldata
    const calldata1: RawArgsArray = [200, 234567897n, "865423"];
    const calldata3: Calldata = CallData.compile({ p1: 200, p2: myUint256, p3: 464657 });
    const calldata4: RawArgsObject = { p1: 200, p2: myUint256, p3: 464657 };
    const contractCallData: CallData = new CallData(compiledTest.abi);
    const calldata5: Calldata = contractCallData.compile("test_multi1", [
        200, 234567897n, "865423"]);
    const calldata6: Call = myTestContract.populate("test_multi1", [200, 234567897n, "865423"]);
    const calldata7: Call = myTestContract.populate("test_multi1", {
        p1: 200,
        p2: 234567897n,
        p3: "865423"
    });
    // fail : const calldata6a: Call = myTestContract.populate("test_multi1",[{ p1: 200, p2: myUint256, p3: 464657 } ]);

    // tests of calls
    const res11 = await myTestContract.test_multi1(200, 234567897n, 865423);
    console.log("res multi1 =", res11);
    const res11a = await myTestContract["test_multi1"](200, 234567897n, 865423);
    const res11b = await myTestContract.test_multi1(...calldata1);
    // fail : const res11c = await myTestContract.test_multi1(...calldata3);
    // fail : const res11d = await myTestContract.test_multi1(calldata4);
    // fail : const res11e = await myTestContract.test_multi1(...calldata5);
    // fail : const res11f = await myTestContract.test_multi1(calldata6);

    const res14 = await myTestContract.call("test_multi1", calldata1);
    // fail : const res14a=await myTestContract.call("test_multi1",[calldata4]);
    // fail : const res14b=await myTestContract.call("test_multi1",calldata5);

    //    account0.execute()

    const res12 = await myTestContract.test_multi2(200, 5678, 865423);
    console.log("res multi2 =", res12);
    const par12 = CallData.compile({
        p1: 200,
        p2: 45678875n,
        p3: 464657
    })
    console.log("par12b=", par12);
    const res12b = await myTestContract.test_multi2(...par12);
    console.log("res b multi2 =", res12b);

    console.log('✅ Test completed.');
}
main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });