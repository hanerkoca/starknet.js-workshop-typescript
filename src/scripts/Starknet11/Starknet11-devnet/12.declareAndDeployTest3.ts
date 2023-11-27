// declare & deploy a Cairo 1 contract.
// use Starknet.js v5.9.0, starknet-devnet 0.5.1
// launch with npx ts-node src/scripts/cairo11-devnet/12.declareAndDeployTest3.ts

import { Provider, Account, Contract, json, RpcProvider } from "starknet";
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

    // Declare & deploy Test contract in devnet
    const compiledHelloSierra = json.parse(fs.readFileSync("./compiledContracts/cairo100/test_type3.sierra").toString("ascii"));
    const compiledHelloCasm = json.parse(fs.readFileSync("./compiledContracts//cairo100/test_type3.casm").toString("ascii"));
    const deployResponse = await account0.declareAndDeploy({ contract: compiledHelloSierra, casm: compiledHelloCasm, salt: "0" });
    const contractClassHash = deployResponse.declare.class_hash;
    console.log('✅ Test Contract declared with classHash =', contractClassHash);

    console.log("contract_address =", deployResponse.deploy.contract_address);
    await provider.waitForTransaction(deployResponse.deploy.transaction_hash);

    // Connect the new contract instance :
    const myTestContract = new Contract(compiledHelloSierra.abi, deployResponse.deploy.contract_address, provider);
    console.log('✅ Test Contract connected at =', myTestContract.address);

}
main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });