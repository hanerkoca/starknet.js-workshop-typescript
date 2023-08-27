// declare & deploy a Cairov2.0.0 contract with storage.
// use Starknet.js v5.16.0, starknet-devnet 0.5.5
// launch with npx ts-node src/scripts/cairo12-devnet/6.declareThenDeployStorage.ts

import { Provider, Account, Contract, json, constants, GetTransactionReceiptResponse, InvokeFunctionResponse, cairo, CallData, RpcProvider, SequencerProvider, hash, BigNumberish } from "starknet";
import fs from "fs";
import * as dotenv from "dotenv";
import { resetDevnetNow } from "../resetDevnetFunc";
dotenv.config();

//          👇👇👇
// 🚨🚨🚨   Launch 'starknet-devnet --seed 0' before using this script.
//          👆👆👆
type Order = {
    p1: BigNumberish,
    p2: BigNumberish,
}

async function main() {
    //initialize Provider 
    // Devnet sequencer :
    const providerDevnetSequencer = new SequencerProvider({ baseUrl: "http://127.0.0.1:5050" });
    // Devnet rpc :
    const providerDevnetRpc = new RpcProvider({ nodeUrl: "http://127.0.0.1:5050/rpc" });
    const provider = providerDevnetRpc;
    console.log('✅ Connected to devnet.');
    // const provider = new Provider({ sequencer: { network: constants.NetworkName.SN_GOERLI } });

    resetDevnetNow();
    // initialize existing predeployed account 0 of Devnet
    const privateKey = "0xe3e70682c2094cac629f6fbed82c07cd";
    const accountAddress: string = "0x7e00d496e324876bbc8531f2d9a82bf154d1a04a50218ee74cdd372f75a551a";
    // const privateKey=accountTestnet4privateKey;
    // const accountAddress=accountTestnet4Address;
    const account0 = new Account(provider, accountAddress, privateKey);
    console.log('✅ Predeployed account connected\nOZ_ACCOUNT_ADDRESS=', account0.address);
    //console.log('OZ_ACCOUNT_PRIVATE_KEY=', privateKey);

    // Declare & deploy Test contract in devnet
    const compiledSierra = json.parse(fs.readFileSync("./compiledContracts/cairo200/storage.sierra.json").toString("ascii"));
    const compiledCasm = json.parse(fs.readFileSync("./compiledContracts/cairo200/storage.casm.json").toString("ascii"));

    const declareResponse = await account0.declare({ contract: compiledSierra, casm: compiledCasm });
    const contractClassHash = declareResponse.class_hash;
    console.log('✅ Test Contract declared with classHash =', contractClassHash);
    // class hash = 

    await provider.waitForTransaction(declareResponse.transaction_hash);
    const myOrder: Order = { p1: "0x300", p2: "0x400" };
    const constructor = CallData.compile({
        counter: 10,
        amount: cairo.uint256("0x008800000000000000000000000000000060"),
        my_order0: myOrder,
        addr: "0x1234567890"
    })
    const { transaction_hash: th2, address } = await account0.deployContract({ classHash: contractClassHash, constructorCalldata: constructor, salt: "0x0" });
    console.log("contract_address =", address);
    await provider.waitForTransaction(th2);

    console.log("✅ Test completed.");
}
main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });