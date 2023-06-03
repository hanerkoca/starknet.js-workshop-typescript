// Deploy a new braavos wallet.
// use Starknet.js v5.11.1, starknet-devnet 0.5.2
// launch with npx ts-node src/scripts/braavos/3.interactBraavos.ts

import { Provider, Account, Contract, json, num } from "starknet";
import { calculateAddressBraavos, deployBraavosAccount, estimateBraavosAccountDeployFee } from "./deployBraavos";
import { accountBraavosDevnet6Address, accountBraavosDevnet6privateKey } from "../../A1priv/A1priv";

import fs from "fs";
import axios from "axios";
import * as dotenv from "dotenv";
dotenv.config();


async function main() {
    //          👇👇👇
    // 🚨🚨🚨   Launch 'starknet-devnet --seed 0 --fork-network alpha-goerli' before using this script.
    //          Also script 2.
    //          👆👆👆

    //initialize Provider 
    const providerDevnet = new Provider({ sequencer: { baseUrl: "http://127.0.0.1:5050" } });

    // initialize predeployed account 0
    const privateKeyAccount0 = "0xe3e70682c2094cac629f6fbed82c07cd";
    const account0Address: string = "0x7e00d496e324876bbc8531f2d9a82bf154d1a04a50218ee74cdd372f75a551a";
    const account0 = new Account(providerDevnet, account0Address, privateKeyAccount0);
    console.log('predeployed devnet account0 connected.\n');

    // initialize contract
    const testAddress = "0x5f7cd1fd465baff2ba9d2d1501ad0a2eb5337d9a885be319366b5205a414fdd";
    const compiledTest = json.parse(fs.readFileSync("./compiledContracts/test.json").toString("ascii"));
    const myTestContract = new Contract(compiledTest.abi, testAddress, providerDevnet);
    console.log('Test Contract connected at =', myTestContract.address);

    // initialize account
    const accountBraavos = new Account(providerDevnet, accountBraavosDevnet6Address, accountBraavosDevnet6privateKey);

    // interact
    myTestContract.connect(accountBraavos);
    const res = await myTestContract.get_balance();
    console.log("initial balance =", res.res);
    console.log("Add 4 to balance.");
    const resu = await myTestContract.invoke("increase_balance", [1, 3]);
    await providerDevnet.waitForTransaction(resu.transaction_hash);
    const bal2 = await myTestContract.get_balance();
    console.log("Final balance =", bal2.res);

    console.log('✅ Test completed.');
}
main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
