// declare & deploy a Cairov2.1.0 contract to check signature.
// use Starknet.js v5.17.0, starknet-devnet 0.5.5
// launch with npx ts-node src/scripts/signature/3.declareThenDeployVerif.ts

import { Provider, Account, Contract, json ,constants, GetTransactionReceiptResponse, InvokeFunctionResponse} from "starknet";
import fs from "fs";
import {accountTestnet4privateKey, accountTestnet4Address} from "../../A1priv/A1priv"
import * as dotenv from "dotenv";
import { resetDevnetNow } from "../resetDevnetFunc";
dotenv.config();

//          👇👇👇
// 🚨🚨🚨   Launch 'starknet-devnet --seed 0 --cairo-compiler-manifest /D/Cairo1-dev/cairo/Cargo.toml' before using this script. cairo directory fetched to v2.1.0 rc4, then cargo build --release.
//          👆👆👆


async function main() {
    //initialize Provider 
    const provider = new Provider({ sequencer: { baseUrl: "http://127.0.0.1:5050" } });
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
    const compiledSierra = json.parse(fs.readFileSync("./compiledContracts/cairo210/test_signature.sierra.json").toString("ascii"));
    const compiledCasm = json.parse(fs.readFileSync("./compiledContracts/cairo210/test_signature.casm.json").toString("ascii"));
    
    const declareResponse = await account0.declare({ contract: compiledSierra, casm: compiledCasm });
    const contractClassHash = declareResponse.class_hash;
    console.log('✅ Test Contract declared with classHash =', contractClassHash);

    await provider.waitForTransaction(declareResponse.transaction_hash);
    
    const { transaction_hash: th2, address } = await account0.deployContract({ classHash: contractClassHash ,constructorCalldata:[]});
    console.log("contract_address =", address);
    await provider.waitForTransaction(th2);

    // Connect the new contract instance :
    
        const myTestContract = new Contract(compiledSierra.abi, address, provider);
        myTestContract.connect(account0);
        console.log('✅ Test Contract connected at =', myTestContract.address);
        
}
main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });