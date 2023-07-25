// declare & deploy a Cairov2.0.0 contract with storage.
// use Starknet.js v5.16.0, starknet-devnet 0.5.5
// launch with npx ts-node src/scripts/cairo12-devnet/6.declareThenDeployStorage.ts

import { Provider, Account, Contract, json, constants, GetTransactionReceiptResponse, InvokeFunctionResponse, cairo, CallData, RpcProvider, SequencerProvider, hash, ec } from "starknet";
import fs from "fs";
import { accountTestnet4privateKey, accountTestnet4Address } from "../../A1priv/A1priv"
import * as dotenv from "dotenv";
import { resetDevnetNow } from "../resetDevnetFunc";
dotenv.config();

//          👇👇👇
// 🚨🚨🚨   Launch 'starknet-devnet --seed 0' before using this script.
//          👆👆👆


async function main() {
    //initialize Provider 
    // Devnet sequencer :
    const providerDevnetSequencer = new SequencerProvider({ baseUrl: "http://127.0.0.1:5050" });
    // Devnet rpc :
    const providerDevnetRpc = new RpcProvider({ nodeUrl: "http://127.0.0.1:5050/rpc" });
    const provider = providerDevnetRpc;
    console.log('✅ Connected to devnet.');
    // const provider = new Provider({ sequencer: { network: constants.NetworkName.SN_GOERLI } });

    // initialize existing predeployed account 0 of Devnet
    const privateKey = "0xe3e70682c2094cac629f6fbed82c07cd";
    const accountAddress: string = "0x7e00d496e324876bbc8531f2d9a82bf154d1a04a50218ee74cdd372f75a551a";
    // const privateKey=accountTestnet4privateKey;
    // const accountAddress=accountTestnet4Address;
    const account0 = new Account(provider, accountAddress, privateKey);
    console.log('✅ Predeployed account connected\nOZ_ACCOUNT_ADDRESS=', account0.address);
    //console.log('OZ_ACCOUNT_PRIVATE_KEY=', privateKey);




    // Connect the  contract  :
    const compiledTest = json.parse(fs.readFileSync("./compiledContracts/cairo200/storage.sierra.json").toString("ascii"));
    const address = "0x51d7a1693b48aadfeb182aa3d1aca50c4df6f42d9eb7ec1b24bab08156f4a06"
    const myTestContract = new Contract(compiledTest.abi, address, provider);
    myTestContract.connect(account0);
    console.log('✅ Test Contract connected at =', myTestContract.address);

    // litteral
    const counter = await myTestContract.get_counter();
    console.log("counter init =", counter);
    const storageAddressCounter = hash.starknetKeccak("counter");
    const storageCounter = await provider.getStorageAt(myTestContract.address, storageAddressCounter);
    console.log("Counter =", storageCounter);
    console.log("addr calculateds counter =", storageAddressCounter);
    const addrCounter = await myTestContract.get_addr_counter();
    console.log("addr counter =", addrCounter);

    // u256
    const storageAddressAmount = hash.starknetKeccak("amount");
    const storageAmountLow = await provider.getStorageAt(myTestContract.address, storageAddressAmount);
    const storageAmountHigh = await provider.getStorageAt(myTestContract.address, storageAddressAmount + 1n);
    console.log("Amount =", storageAmountLow, storageAmountHigh);

    // legacyMap
    const storageAddressBalances0 = hash.starknetKeccak("balances");
    const storageAddressBalances = BigInt(ec.starkCurve.pedersen(storageAddressBalances0, "0x1234567890"));
    const storageBalancesLow = await provider.getStorageAt(myTestContract.address, storageAddressBalances);
    const storageBalancesHigh = await provider.getStorageAt(myTestContract.address, storageAddressBalances+1n);
    console.log("balances =", storageBalancesLow, storageBalancesHigh);

    // struct
    const storageAddressOrder = hash.starknetKeccak("my_order");
    const storageOrderP1 = await provider.getStorageAt(myTestContract.address, storageAddressOrder);
    const storageOrderP2 = await provider.getStorageAt(myTestContract.address, storageAddressOrder+1n);
    console.log("Order =", storageOrderP1, storageOrderP2);

 
    console.log("✅ Test completed.");
}
main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });