// connect a contract that is already deployed on testnet.
// launch with npx ts-node src/scriptsA1/11.CallInvokeContract.ts

import { Provider, Contract, Account, json, ec } from "starknet";
import fs from "fs";
import * as dotenv from "dotenv";
dotenv.config();
async function main() {
    //initialize Provider 
    const provider = new Provider({ sequencer: { network: "goerli-alpha" } });

    //const privateKey0 = process.env.OZ_ACCOUNT_PRIVATE_KEY ?? "";
    const privateKey0 = "1202422677688430114213521431078907413426836022101021128058478935525263950730";
    const starkKeyPair0 = ec.getKeyPair(privateKey0);
    const account0Address = "0x065A822fBeE1Ae79e898688b5A4282Dc79E0042cbEd12F6169937FdDb4c26641";
    const account0 = new Account(provider, account0Address, starkKeyPair0);
    console.log('existing AX account4 connected.\n');


    // Connect the deployed Test instance in testnet
    const testAddress = "0x5f7cd1fd465baff2ba9d2d1501ad0a2eb5337d9a885be319366b5205a414fdd";
    //const compiledTest = json.parse(fs.readFileSync("./compiledContracts/test.json").toString("ascii"));
    const { abi: testAbi } = await provider.getClassAt(testAddress);
    console.log("abi=", testAbi);
    if (testAbi === undefined) { throw new Error("no abi.") };
    const myTestContract = new Contract(testAbi, testAddress, provider);
    console.log('Test Contract connected at =', myTestContract.address);

    // Intractions with the contract with call & invoke
    myTestContract.connect(account0);
    const bal1 = await myTestContract.get_balance();
    console.log("Initial balance =", bal1.res.toString());
    const resu = await myTestContract.increase_balance(10, 30);
    await provider.waitForTransaction(resu.transaction_hash);
    const bal2 = await myTestContract.get_balance();
    console.log("Initial balance =", bal2.res.toString());
    console.log('✅ Test completed.');

}
main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });