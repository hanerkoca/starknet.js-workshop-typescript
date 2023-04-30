// connect a contract that is already deployed on devnet.
// launch with npx ts-node src/scripts/11.CallInvokeContract.ts
// Coded with Starknet.js v5.8.0

import { CallData, constants, Provider, Contract, Account, json, ec } from "starknet";
import fs from "fs";
import { accountTestnet4Address, accountTestnet4privateKey } from "../../A1priv/A1priv";
import * as dotenv from "dotenv";
dotenv.config();

async function main() {
    //initialize Provider 
    const provider = new Provider({ sequencer: { network: constants.NetworkName.SN_GOERLI } });

    // initialize existing Argent X account
    const account0Address = accountTestnet4Address;
    console.log('Braavos1_ACCOUNT_ADDRESS=', account0Address);
    const account0 = new Account(provider, account0Address, accountTestnet4privateKey);
    console.log('existing Braavos1 connected.\n');


    // Connect the deployed Test instance in devnet
    const testAddress = "0x697d3bc2e38d57752c28be0432771f4312d070174ae54eef67dd29e4afb174"; // modify in accordance with result of script 4
    const compiledTest = json.parse(fs.readFileSync("./compiledContracts/test_type1.sierra").toString("ascii"));
    const myTestContract = new Contract(compiledTest.abi, testAddress, provider);
    console.log('Test Contract connected at =', myTestContract.address);

    // Interactions with the contract with call & invoke
    myTestContract.connect(account0);
    const par1 = CallData.compile({
        balance: 100,
    })
    console.log("a");
    const res1 = await myTestContract.test1(100);
    console.log("b");
    const res2 = await myTestContract.test2(100);
    console.log("c");
    const res3 = await myTestContract.test3();
    console.log("d");
    const tx = await myTestContract.increase_balance(10);
    console.log("res1 =", res1);
    console.log("res2 =", res2);
    console.log("res3 =", res3);
    await provider.waitForTransaction(tx.transaction_hash);

    //const balance = await myTestContract.get_balance();
    const funcName = "get_balance";
    const balance = await myTestContract[funcName]();
    console.log("res4 =", balance);
    // console.log("Initial balance =", bal1b.res.toString());
    // estimate fee
    // const { suggestedMaxFee: estimatedFee1 } = await account0.estimateInvokeFee({ contractAddress: testAddress, entrypoint: "increase_balance", calldata: ["10", "30"] });

    // const resu = await myTestContract.invoke("increase_balance", [10, 30]);
    // await provider.waitForTransaction(resu.transaction_hash);
    // const bal2 = await myTestContract.get_balance();
    // console.log("Initial balance =", bal2.res.toString());
    console.log('✅ Test completed.');

}
main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });