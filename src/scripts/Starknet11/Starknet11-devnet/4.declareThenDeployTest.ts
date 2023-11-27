// declare & deploy a Cairo 1 contract.
// use Starknet.js v5.8.0, starknet-devnet 0.5.1
// launch with npx ts-node src/scripts/cairo11-devnet/4.declareThenDeployHello.ts

import { Provider, Account, Contract, json } from "starknet";
import fs from "fs";
import * as dotenv from "dotenv";
dotenv.config();

//          👇👇👇
// 🚨🚨🚨   Launch 'starknet-devnet --seed 0 --timeout 500' before using this script.
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

    // Declare & deploy Test contract in devnet
    const compiledHelloSierra = json.parse(fs.readFileSync("./compiledContracts/cairo200/PhilTest2.sierra.json").toString("ascii"));
    const compiledHelloCasm = json.parse(fs.readFileSync("./compiledContracts/cairo200/PhilTest2.casm.json").toString("ascii"));
    const deployResponse = await account0.declare({ contract: compiledHelloSierra, casm: compiledHelloCasm });
    const contractClassHash = deployResponse.class_hash;
    console.log('✅ Test Contract declared with classHash =', contractClassHash);
    await provider.waitForTransaction(deployResponse.transaction_hash);
    const { transaction_hash: th2, address } = await account0.deployContract({ classHash: contractClassHash, salt: "0" });
    console.log("contract_address =", address);
    await provider.waitForTransaction(th2);

    // Connect the new contract instance :
    if (address) {
        const myTestContract = new Contract(compiledHelloSierra.abi, address, provider);
        console.log('✅ Test Contract connected at =', myTestContract.address);
    }
}
main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });