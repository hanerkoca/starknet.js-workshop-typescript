// connect a contract that is already deployed on devnet.
// launch with npx ts-node src/scripts/11.CallInvokeContract.ts
// Coded with Starknet.js v5.1.0

import { CallData, constants, Provider, Contract, Account, json, ec } from "starknet";
import fs from "fs";
import { privateKey1} from "../../A2priv/A2priv";
import * as dotenv from "dotenv";
dotenv.config();

async function main() {
    //initialize Provider 
    const provider = new Provider({ sequencer: { network: constants.NetworkName.SN_GOERLI2 } });

    // initialize existing Argent X account
    const account0Address: string = "0x04b497639c3348AbF6E5761094c1C8a28616A273598e38Fd5ab41C3d4277c295";
    console.log('AX1_ACCOUNT_ADDRESS=', account0Address);
    const account0 = new Account(provider, account0Address, privateKey1);
    console.log('existing AX account1 connected.\n');


    // Connect the deployed Test instance in devnet
    const testAddress = "0x299d68d537a860025749248411d69eff49d7b4b121ef7ec69e7fc470851b4ae"; // modify in accordance with result of script 4
    const compiledTest = json.parse(fs.readFileSync("./compiledContracts/test_type1.sierra").toString("ascii"));
    const myTestContract = new Contract(compiledTest.abi, testAddress, provider);
    console.log('Test Contract connected at =', myTestContract.address);

    // Interactions with the contract with call & invoke
    myTestContract.connect(account0);
    const par1 = CallData.compile({
        balance: 100,
    })
    const res1 = await myTestContract.test1(par1, { parseRequest: false, parseResponse: false, });
    const res2 = await myTestContract.test2(par1, { parseRequest: false, parseResponse: false, });
    const res3 = await myTestContract.test3({ parseRequest: false, parseResponse: false, });
    // const tx = await myTestContract.increase_balance(
    //     CallData.compile({
    //         amount: 100,
    //     })
    // );
    // 🚨 do not work in V5.1.0
    //const bal1b = await myTestContract.call("get_balance");
    console.log("res1 =", res1);
    console.log("res2 =", res2);
    console.log("res3 =", res3);
    // await provider.waitForTransaction(tx.transaction_hash);

    const balance = await myTestContract.get_balance({
        parseRequest: false,
        parseResponse: false,
    });
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